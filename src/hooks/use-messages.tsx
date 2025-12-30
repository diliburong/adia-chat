import { ChatMessage } from '@/lib/types';
import { UseChatHelpers } from '@ai-sdk/react';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { useEffect, useState } from 'react';

export const useMessages = ({ status }: { status: UseChatHelpers<ChatMessage>['status'] }) => {
  const { containerRef, endRef, isAtBottom, scrollToBottom, onViewportEnter, onViewportLeave } =
    useScrollToBottom();
  const [hasSentMessage, setHasSentMessage] = useState(false);

  useEffect(() => {
    if (status === 'submitted') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSentMessage(true);
    }
  }, [status]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  };
};
