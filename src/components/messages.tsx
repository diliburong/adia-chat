import { ChatMessage } from '@/lib/types';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { memo, useEffect } from 'react';
import { useMessages } from '@/hooks/use-messages';
import { Conversation, ConversationContent } from './conversation';
import { Greeting } from './greeting';
import { ArrowDownIcon } from 'lucide-react';
import { PreviewMessage, ThinkingMessage } from './message';

type MessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>['status'];
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
};

const PureMessages = ({
  chatId,
  status,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  isArtifactVisible,
  selectedModelId,
}: MessagesProps) => {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  useEffect(() => {
    if (status === 'submitted') {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    }
  }, [status, messagesContainerRef]);

  return (
    <div
      style={{ overflowAnchor: 'none' }}
      ref={messagesContainerRef}
      className="overscroll-behavior-contain -webkit-overflow-scrolling-touch flex-1 touch-pan-y overflow-y-scroll"
    >
      <Conversation>
        <ConversationContent>
          {messages.length === 0 && <Greeting />}

          {messages.map((message, index) => (
            <PreviewMessage
              chatId={chatId}
              isLoading={status === 'streaming' && messages.length - 1 === index}
              isReadonly={isReadonly}
              key={message.id}
              message={message}
              regenerate={regenerate}
              requiresScrollPadding={hasSentMessage && index === messages.length - 1}
              setMessages={setMessages}
            />
          ))}
          {status === 'submitted' &&
            messages.length > 0 &&
            messages.at(-1)?.role === 'user' &&
            selectedModelId !== 'chat-model-reasoning' && <ThinkingMessage />}

          <div className="min-h-[24px] min-w-[24px] shrink-0" ref={messagesEndRef} />
        </ConversationContent>
      </Conversation>

      {!isAtBottom && (
        <button
          aria-label="Scroll to bottom"
          className="bg-background hover:bg-muted absolute bottom-40 left-1/2 z-10 -translate-x-1/2 rounded-full border p-2 shadow-lg transition-colors"
          onClick={() => scrollToBottom('smooth')}
          type="button"
        >
          <ArrowDownIcon className="size-4" />
        </button>
      )}
    </div>
  );
};

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.selectedModelId !== nextProps.selectedModelId) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }

  return false;
});
