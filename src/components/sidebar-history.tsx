import useSWRInfinite from 'swr/infinite';
import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { useSession } from 'next-auth/react';

import { fetcher } from '@/lib/utils';
import { ChatItem } from '@/database';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from './ui/sidebar';
import { SidebarHistoryItem } from './ui/sidebar-history-item';
import { Skeleton } from './ui/skeleton';
import { useParams } from 'next/navigation';

export type ChatHistory = {
  hasMore: boolean;
  chats: ChatItem[];
};

type GroupedChats = {
  today: ChatItem[];
  yesterday: ChatItem[];
  lastWeek: ChatItem[];
  lastMonth: ChatItem[];
  older: ChatItem[];
};

const PAGE_SIZE = 20;

const groupChatsByDate = (chats: ChatItem[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats
  );
};

export function getChatHistoryPaginationKey(pageIndex: number, previousPageData: ChatHistory) {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousPageData.chats.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

export const SidebarHistory = () => {
  const { id } = useParams();

  const { data: session, status } = useSession();
  const {
    data: paginatedChatHistories,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
    fallbackData: [],
  });

  const hasReachedEnd = paginatedChatHistories
    ? paginatedChatHistories.some(page => page.hasMore === false)
    : false;

  const hasEmptyChatHistory = paginatedChatHistories
    ? paginatedChatHistories.every(page => page.chats.length === 0)
    : false;

  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">Today</div>
        <SidebarGroupContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full flex-1" />
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (hasEmptyChatHistory) {
    return (
      <SidebarGroup>
        <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">Empty</div>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {paginatedChatHistories &&
              (() => {
                const chatsFromHistory = paginatedChatHistories.flatMap(
                  paginatedChatHistory => paginatedChatHistory.chats
                );

                const groupedChats = groupChatsByDate(chatsFromHistory);

                console.log(chatsFromHistory, 'chatsFromHistory');

                return (
                  <div className="flex flex-col gap-6">
                    {groupedChats.today.length > 0 && (
                      <div>
                        <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">Today</div>
                        {groupedChats.today.map(chat => (
                          <SidebarHistoryItem key={chat.id} chat={chat} isActive={chat.id === id} />
                        ))}
                      </div>
                    )}
                    {groupedChats.yesterday.length > 0 && (
                      <div>
                        <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                          Yesterday
                        </div>
                        {groupedChats.yesterday.map(chat => (
                          <SidebarHistoryItem key={chat.id} chat={chat} isActive={chat.id === id} />
                        ))}
                      </div>
                    )}
                    {groupedChats.lastWeek.length > 0 && (
                      <div>
                        <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                          Last Week
                        </div>
                        {groupedChats.lastWeek.map(chat => (
                          <SidebarHistoryItem key={chat.id} chat={chat} isActive={chat.id === id} />
                        ))}
                      </div>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <div>
                        <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
                          Last Month
                        </div>
                        {groupedChats.lastMonth.map(chat => (
                          <SidebarHistoryItem key={chat.id} chat={chat} isActive={chat.id === id} />
                        ))}
                      </div>
                    )}
                    {groupedChats.older.length > 0 && (
                      <div>
                        <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">Older</div>
                        {groupedChats.older.map(chat => (
                          <SidebarHistoryItem key={chat.id} chat={chat} isActive={chat.id === id} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};
