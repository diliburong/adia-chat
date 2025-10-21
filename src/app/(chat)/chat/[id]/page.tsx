import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
// import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/database/server/queries';
import { convertToUIMessages } from '@/lib/utils';
import { z } from 'zod';

const idSchema = z.string().uuid();

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  if (!idSchema.safeParse(id).success) {
    notFound(); // 返回 404 页面
  }

  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (chat.visibility === 'private') {
    if (!session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <Chat
      autoResume={true}
      id={id}
      initialChatModel={DEFAULT_CHAT_MODEL}
      initialLastContext={chat.lastContext ?? undefined}
      initialMessages={uiMessages}
      initialVisibilityType={chat.visibility}
      isReadonly={session?.user?.id !== chat.userId}
    ></Chat>
  );
}
