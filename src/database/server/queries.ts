import { dbPool } from './dbPool';
import {
  NewUser,
  usersTable,
  chatTable,
  ChatItem,
  messageTable,
  NewChat,
  DBNewMessage,
  UserItem,
  streamTable,
} from '../schemas';
import { ChatSDKError } from '@/lib/errors';
import { and, asc, count, desc, eq, gt, gte, inArray, lt, type SQL } from 'drizzle-orm';
import { AppUsage } from '@/lib/usage';

export const getUserByEmail = async (email: string): Promise<UserItem | undefined> => {
  try {
    const user = await dbPool.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    return user;
  } catch (error) {
    console.log(error);
    throw new ChatSDKError('bad_request:database', 'Failed to get user by email');
  }
};

export const createUser = async (user: NewUser) => {
  try {
    const newUser = await dbPool.insert(usersTable).values(user).returning();
    return newUser;
  } catch (error) {
    console.log(error);
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
};

export const createChat = async (chat: NewChat) => {
  try {
    const newChat = dbPool.insert(chatTable).values(chat);

    return newChat;
  } catch (error) {
    console.log(error);
    throw new ChatSDKError('bad_request:database', 'Failed to create chat');
  }
};

export const getChatById = async ({ id }: { id: string }) => {
  try {
    // const chat = await dbPool.query.chatTable.findFirst({
    //   where: eq(chatTable.id, id),
    // });

    const [selectedChat] = await dbPool.select().from(chatTable).where(eq(chatTable.id, id));
    return selectedChat;
    // return chat;
  } catch (error) {
    console.log(error);
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
};

export const getChatsByUserId = async (
  userId: string,
  limit: number = 10,
  startingAfterId?: string | null,
  endingBeforeId?: string | null
) => {
  try {
    const extendedLimit = limit + 1;

    let filteredChats: ChatItem[] = [];
    const query = (whereCondition?: SQL<unknown>) =>
      dbPool
        .select()
        .from(chatTable)
        .where(
          whereCondition
            ? and(whereCondition, eq(chatTable.userId, userId))
            : eq(chatTable.userId, userId)
        )
        .orderBy(desc(chatTable.createdAt))
        .limit(extendedLimit);

    if (startingAfterId) {
      const selectedChat = await dbPool.query.chatTable.findFirst({
        where: eq(chatTable.id, startingAfterId),
      });

      if (!selectedChat) {
        throw new ChatSDKError('not_found:database', `Chat with id ${startingAfterId} not found`);
      }

      filteredChats = await query(gt(chatTable.createdAt, selectedChat.createdAt));
    } else if (endingBeforeId) {
      const selectedChat = await dbPool.query.chatTable.findFirst({
        where: eq(chatTable.id, endingBeforeId),
      });

      if (!selectedChat) {
        throw new ChatSDKError('not_found:database', `Chat with id ${endingBeforeId} not found`);
      }

      filteredChats = await query(lt(chatTable.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.log(error);
    throw new ChatSDKError('bad_request:database', 'Failed to get chats by user id');
  }
};

export const getMessageCountByUserId = async ({
  userId,
  differenceInHours = 24,
}: {
  userId: string;
  differenceInHours: number;
}) => {
  try {
    const hoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);

    const [stats] = await dbPool
      .select({ count: count(messageTable.id) })
      .from(messageTable)
      .innerJoin(chatTable, eq(messageTable.chatId, chatTable.id))
      .where(
        and(
          eq(chatTable.userId, userId),
          gte(messageTable.createdAt, hoursAgo),
          eq(messageTable.role, 'user')
        )
      )
      .execute();

    // result.stats

    return stats.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get message count by user id');
  }
};

export const deleteChatById = async (id: string) => {
  try {
    // delete other tables that are related to the chat
    await dbPool.delete(messageTable).where(eq(messageTable.chatId, id));

    const [deletedChat] = await dbPool.delete(chatTable).where(eq(chatTable.id, id)).returning();

    return deletedChat;
  } catch (error) {
    console.log(error);
    throw new ChatSDKError('bad_request:database', 'Failed to delete chat by id');
  }
};

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await dbPool.query.messageTable.findMany({
      where: eq(messageTable.chatId, id),
      orderBy: asc(messageTable.createdAt),
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get messages by chat id');
  }
}

export const saveMessages = async ({ messages }: { messages: DBNewMessage[] }) => {
  try {
    const newMessages = await dbPool.insert(messageTable).values(messages);

    return newMessages;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
};

export const updateChatLastContextById = async ({
  chatId,
  context,
}: {
  chatId: string;
  context: AppUsage;
}) => {
  try {
    return await dbPool.update(chatTable).set({});
  } catch (error) {
    console.warn('Failed to update lastContext for chat', chatId, error);
    return;
  }
};

export const createStreamId = async ({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) => {
  try {
    await dbPool.insert(streamTable).values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create stream id');
  }
};

export const getStreamIdsByChatId = async ({ chatId }: { chatId: string }) => {
  try {
    const streamIds = await dbPool
      .select({ id: streamTable.id })
      .from(streamTable)
      .where(eq(streamTable.chatId, chatId))
      .orderBy(desc(streamTable.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get stream ids by chat id');
  }
};
