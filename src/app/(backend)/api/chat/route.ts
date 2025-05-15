import { streamText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { auth } from '@clerk/nextjs/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  // const { userId } = await auth();
  // await auth.protect();
  // console.log(userId);

  const { messages } = await req.json();

  const result = streamText({
    model: deepseek('deepseek-chat'),
    messages,
  });

  return result.toDataStreamResponse();
}
