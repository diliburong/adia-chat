import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { unstable_cache as cache } from 'next/cache';
import { fetchModels, getUsage, ModelCatalog } from 'tokenlens';

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
import { AppUsage } from '@/lib/usage';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels();
    } catch (err) {
      console.warn('TokenLens: catalog fetch failed, using default catalog', err);
      return; // tokenlens helpers will fall back to defaultCatalog
    }
  },
  ['tokenlens-catalog'],
  { revalidate: 24 * 60 * 60 } // 24 hours
);

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

    // limit
    //  TODO
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

    // const messages = appendClientMessage({
    //   messages: previousMessages,
    //   message,
    // });

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

    const streamId = uuid();
    await createStreamId({ streamId, chatId: id });

    // await createStream({
    //   id: streamId,
    //   chatId: id,
    //   createdAt: new Date(),
    // });

    // const result = streamText({
    //   model: deepseek('deepseek-chat'),
    //   messages: convertToModelMessages(uiMessages),
    //   onFinish: async ({ response }) => {
    //     console.log(response.messages, 'response');

    //     if (session.user?.id) {
    //       try {
    //         // const assistantId = getTrailingMessageId(
    //         //   response.messages.filter(message => message.role === 'assistant')
    //         // );
    //         // if (!assistantId) {
    //         //   throw new Error('No assistant message found!');
    //         // }
    //         // const [, assistantMessage] = appendResponseMessages({
    //         //   messages: [message],
    //         //   responseMessages: response.messages,
    //         // });
    //         // await saveMessages({
    //         //   messages: [
    //         //     {
    //         //       id: assistantId,
    //         //       chatId: id,
    //         //       role: assistantMessage.role,
    //         //       parts: assistantMessage.parts,
    //         //       attachments: assistantMessage.experimental_attachments ?? [],
    //         //       createdAt: new Date(),
    //         //     },
    //         //   ],
    //         // });
    //       } catch (error) {
    //         console.error('Failed to save chat');
    //       }
    //     }
    //   },
    // });
    let finalMergedUsage: AppUsage | undefined;

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: deepseek('deepseek-chat'),
          // system: systemPrompt({
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          // experimental_activeTools:
          //   selectedChatModel === 'chat-model-reasoning'
          //     ? []
          //     : ['getWeather', 'createDocument', 'updateDocument', 'requestSuggestions'],
          experimental_transform: smoothStream({ chunking: 'word' }),
          onFinish: async ({ usage }) => {
            try {
              console.log(usage, 'usage');
              const providers = await getTokenlensCatalog();
              const modelId = deepseek('deepseek-chat').modelId;

              if (!modelId) {
                finalMergedUsage = usage;
                dataStream.write({
                  type: 'data-usage',
                  data: finalMergedUsage,
                });

                return;
              }

              if (!providers) {
                finalMergedUsage = usage;
                dataStream.write({
                  type: 'data-usage',
                  data: finalMergedUsage,
                });

                return;
              }

              const summary = getUsage({ modelId, usage, providers });
              finalMergedUsage = { ...usage, ...summary, modelId } as AppUsage;

              dataStream.write({
                type: 'data-usage',
                data: finalMergedUsage,
              });
            } catch (error) {
              console.warn('TokenLens enrichment failed', error);
              finalMergedUsage = usage;
              dataStream.write({ type: 'data-usage', data: finalMergedUsage });
            }
          },
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

        if (finalMergedUsage) {
          try {
          } catch (err) {
            console.warn('Unable to persist last usage for chat', id, err);
          }
        }
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
