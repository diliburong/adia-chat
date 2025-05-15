'use client';
// import { currentUser } from '@clerk/nextjs/server';
import { useChat } from '@ai-sdk/react';
import { Input } from '@/components/ui/input';

export default function ChatPage() {
  // const user = await currentUser();
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="stretch mx-auto flex w-full max-w-md flex-col py-24">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <Input
          className="fixed bottom-0 mb-8 w-full max-w-md"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
        />
      </form>
      {/* <form onSubmit={handleSubmit}> */}
      {/* <input
          className="fixed bottom-0 mb-8 w-full max-w-md rounded border border-zinc-300 p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          value={input}
          onChange={handleInputChange}
        /> */}
      {/* </form> */}
    </div>
  );
}
