'use server';

import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { uuid } from '@/lib/utils';
import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const id = uuid();
  // const cookieStore = await cookies();

  // const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel="chat-model"
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
      />
    </>
  );
}
