import { ChatItem } from '@/database';
import { memo } from 'react';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import Link from 'next/link';
export interface SidebarHistoryItemProps {
  chat: ChatItem;
  isActive: boolean;
}

const PureSidebarHistoryItem = ({ chat, isActive }: SidebarHistoryItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          href={`/chat/${chat.id}`}
          onClick={() => {
            console.log('clicked');
          }}
        >
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const SidebarHistoryItem = memo(PureSidebarHistoryItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) {
    return false;
  }

  return true;
});
