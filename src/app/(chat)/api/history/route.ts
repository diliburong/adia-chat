import { auth } from '@/app/(auth)/auth';
import type { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/database/server/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Number(searchParams.get('limit')) || 10;
  const startingAfterId = searchParams.get('starting_after');
  const endingBeforeId = searchParams.get('ending_before');

  if (startingAfterId && endingBeforeId) {
    return new ChatSDKError(
      'bad_request:api',
      'Only one of starting_after or ending_before can be provided'
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chats = await getChatsByUserId(session.user.id, limit, startingAfterId, endingBeforeId);

  return Response.json(chats);
}
