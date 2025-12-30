import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { openai } from '@ai-sdk/openai';

import { deepseek } from '@ai-sdk/deepseek';
import { auth } from '@/app/(auth)/auth';
import { ChatSDKError } from '@/lib/errors';
import {
  createChat,
  createStreamId,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveMessages,
} from '@/database/server/queries';
import { type PostRequestBody, postRequestBodySchema } from './schema';
import { convertToUIMessages, getTrailingMessageId, uuid } from '@/lib/utils';
import { generateTitleFromMessages } from '../../action';
import { ChatMessage } from '@/lib/types';
import { systemPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await req.json();

    requestBody = postRequestBodySchema.parse(json);
  } catch (error) {
    console.log(error, 'error');
    return new ChatSDKError('bad_request:api', 'Invalid request body').toResponse();
  }

  const {
    message,
    id,
  }: {
    id: string;
    message: ChatMessage;
  } = requestBody;

  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const messageCount = await getMessageCountByUserId({
      userId: session.user.id,
      differenceInHours: 24,
    });

    const chat = await getChatById({ id });

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    } else {
      const title = await generateTitleFromMessages(message);
      await createChat({
        id,
        userId: session.user.id,
        title,
      });
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    // Only save user messages to the database (not tool approval responses)
    if (message.role === 'user') {
      // save the user message
      await saveMessages({
        messages: [
          {
            chatId: id,
            role: 'user',
            parts: message.parts,
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });
    }

    const streamId = uuid();
    await createStreamId({ streamId, chatId: id });

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const modelMessages = await convertToModelMessages(uiMessages);
        const result = streamText({
          model: deepseek('deepseek-chat'),
          // system: systemPrompt({
          messages: modelMessages,
          stopWhen: stepCountIs(5),
          // experimental_activeTools:
          //   selectedChatModel === 'chat-model-reasoning'
          //     ? []
          //     : ['getWeather', 'createDocument', 'updateDocument', 'requestSuggestions'],
          experimental_transform: smoothStream({ chunking: 'word' }),
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: uuid,
      onFinish: async ({ messages }) => {
        console.log('stream finished');

        await saveMessages({
          messages: messages.map(currentMessage => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: error => {
        console.error('Error in stream', error);
        return 'Oops, an error occurred!';
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.log(error, 'error');
  }
}
