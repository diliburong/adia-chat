import { ChatMessage } from '@/lib/types';
import { equal } from 'assert';
import { memo } from 'react';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';
import { Action, Actions } from './elements/actions';
import { CopyIcon, Edit3Icon } from 'lucide-react';
import { toast } from 'sonner';

export const PureMessageActions = ({
  chatId,
  message,
  isLoading,
  setMode,
}: {
  chatId: string;
  message: ChatMessage;
  isLoading: boolean;
  setMode?: (mode: 'view' | 'edit') => void;
}) => {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();

  const textFromParts = message.parts
    ?.filter(part => part.type === 'text')
    .map(part => part.text)
    .join('\n')
    .trim();

  const handleCopy = async () => {
    if (!textFromParts) {
      toast.error("There's no text to copy!");
      return;
    }

    await copyToClipboard(textFromParts);
    toast.success('Copied to clipboard!');
  };

  if (isLoading) {
    return null;
  }

  if (message.role === 'user') {
    return (
      <Actions className="-mr-0.5 justify-end">
        <div className="relative">
          {setMode && (
            <Action
              className="absolute top-0 -left-10 opacity-0 transition-opacity group-hover/message:opacity-100"
              onClick={() => setMode('edit')}
              tooltip="Edit"
            >
              <Edit3Icon />
            </Action>
          )}
          <Action onClick={handleCopy} tooltip="Copy">
            <CopyIcon />
          </Action>
        </div>
      </Actions>
    );
  }

  return (
    <Actions className="-mr-0.5">
      <Action onClick={handleCopy} tooltip="Copy">
        <CopyIcon />
      </Action>
    </Actions>
  );
};

export const MessageActions = memo(PureMessageActions, (prevProps, nextProps) => {
  // if (!equal(prevProps.vote, nextProps.vote)) {
  //   return false;
  // }
  if (prevProps.isLoading !== nextProps.isLoading) {
    return false;
  }

  return true;
});
