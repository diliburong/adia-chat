'use client';

import { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { useChat } from '@ai-sdk/react';
import { ChatHeader } from './chat-header';
import { PromptInput } from './elements/prompt-input';
import { DefaultChatTransport, UIMessage } from 'ai';
import { fetchWithErrorHandlers, uuid } from '@/lib/utils';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { ChatSDKError } from '@/lib/errors';
import { toast } from 'sonner';
import { Messages } from './messages';
import { ChatMessage } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui';
import { useDataStream } from './data-stream-provider';
import { AppUsage } from '@/lib/usage';
import { VisibilityType } from '@/lib/types';
import { MultimodalInput } from './multimodal-input';
import { useSearchParams } from 'next/navigation';
import { useAutoResume } from '@/hooks/use-auto-resume';

interface IChatProps {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume?: boolean;
  initialLastContext?: AppUsage;
}

export const Chat = ({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType = 'private',
  isReadonly,
  autoResume = false,
  initialLastContext,
}: IChatProps) => {
  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState('');
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const { messages, setMessages, sendMessage, status, stop, regenerate, resumeStream } =
    useChat<ChatMessage>({
      id: id,
      messages: initialMessages,
      experimental_throttle: 100,
      generateId: uuid,
      transport: new DefaultChatTransport({
        api: '/api/chat',
        fetch: fetchWithErrorHandlers,
        prepareSendMessagesRequest(request) {
          console.log(request, 'request');
          return {
            body: {
              id: request.id,
              message: request.messages.at(-1),
              selectedChatModel: 'chat-model',
              // selectedChatModel: currentModelIdRef.current,
              // selectedVisibilityType: visibilityType,
              ...request.body,
            },
          };
        },
      }),
      onData: dataPart => {
        console.log(dataPart);
        setDataStream(ds => (ds ? [...ds, dataPart] : []));
        if (dataPart.type === 'data-usage') {
          setUsage(dataPart.data);
        }
      },

      onFinish: () => {
        const key = unstable_serialize(getChatHistoryPaginationKey);
        mutate(key);
      },
      onError: error => {
        if (error instanceof ChatSDKError) {
          toast.error(error.message);
        }
      },
    });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="bg-background flex h-dvh min-w-0 flex-col">
        <ChatHeader />
        <Messages
          chatId={id}
          // isArtifactVisible={isArtifactVisible}
          isReadonly={isReadonly}
          messages={messages}
          regenerate={regenerate}
          selectedModelId={initialChatModel}
          setMessages={setMessages}
          status={status}
          isArtifactVisible={false}
          // votes={votes}
        />
        <div className="bg-background sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 px-2 pb-3 md:px-4 md:pb-4">
          {!isReadonly && (
            <MultimodalInput
              // attachments={[]}
              chatId={id}
              input={input}
              messages={messages}
              onModelChange={setCurrentModelId}
              selectedModelId={currentModelId}
              selectedVisibilityType={'private'}
              sendMessage={sendMessage}
              // setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
              usage={usage}
            />
          )}
        </div>
      </div>
    </>
  );
};
