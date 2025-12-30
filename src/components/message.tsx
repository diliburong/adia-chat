'use client';

import { ChatMessage } from '@/lib/types';
import { cn, sanitizeText } from '@/lib/utils';
import { UseChatHelpers } from '@ai-sdk/react';
import equal from 'fast-deep-equal';
import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { MessageContent } from './elements/message';
import { Response } from './elements/response';
import { useDataStream } from './data-stream-provider';
import { MessageActions } from './message-actions';

export type PreviewMessageProps = {
  chatId: string;
  message: ChatMessage;
  // vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
};

const PureMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: PreviewMessageProps) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const attachmentsFromMessage = message.parts.filter(part => part.type === 'file');

  useDataStream();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0 }}
    >
      <div
        className={cn('flex w-full items-start gap-2 md:gap-3', {
          'justify-end': message.role === 'user' && mode !== 'edit',
          'justify-start': message.role === 'assistant',
        })}
      >
        {message.role === 'assistant' && (
          <div className="bg-background ring-border -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn('flex flex-col', {
            'gap-2 md:gap-4': message.parts?.some(p => p.type === 'text' && p.text?.trim()),
            'min-h-96': message.role === 'assistant' && requiresScrollPadding,
            'w-full':
              (message.role === 'assistant' &&
                message.parts?.some(p => p.type === 'text' && p.text?.trim())) ||
              mode === 'edit',
            'max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]':
              message.role === 'user' && mode !== 'edit',
          })}
        >
          {message.parts.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === 'reasoning' && part.text?.trim().length > 0) {
              return <div key={key}>reasoning</div>;
            }

            if (type === 'text') {
              if (mode === 'view') {
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        'w-fit rounded-2xl px-3 py-2 text-right break-words text-white':
                          message.role === 'user',
                        'bg-transparent px-0 py-0 text-left': message.role === 'assistant',
                      })}
                      data-testid="message-content"
                      style={message.role === 'user' ? { backgroundColor: '#006cff' } : undefined}
                    >
                      <Response>{sanitizeText(part.text)}</Response>
                    </MessageContent>
                  </div>
                );
              }
            }
            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              message={message}
              isLoading={isLoading}
              setMode={setMode}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(PureMessage, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) {
    return false;
  }
  if (prevProps.message.id !== nextProps.message.id) {
    return false;
  }
  if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) {
    return false;
  }
  if (!equal(prevProps.message.parts, nextProps.message.parts)) {
    return false;
  }

  return false;
});

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={role}
      data-testid="message-assistant-loading"
      initial={{ opacity: 0 }}
    >
      <div className="flex items-start justify-start gap-3">
        <div className="bg-background ring-border -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
          <SparklesIcon size={14} />
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="text-muted-foreground p-0 text-sm">
            <LoadingText>Thinking...</LoadingText>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LoadingText = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      animate={{ backgroundPosition: ['100% 50%', '-100% 50%'] }}
      className="flex items-center text-transparent"
      style={{
        background:
          'linear-gradient(90deg, hsl(var(--muted-foreground)) 0%, hsl(var(--muted-foreground)) 35%, hsl(var(--foreground)) 50%, hsl(var(--muted-foreground)) 65%, hsl(var(--muted-foreground)) 100%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }}
      transition={{
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      }}
    >
      {children}
    </motion.div>
  );
};
