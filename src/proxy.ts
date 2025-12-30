import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };

// const isProtectedRoute = createRouteMatcher([
//   // '/dashboard', // 原有的仪表板路由
//   // '/chat', // 聊天主页
//   // '/chat/:id', // 单个聊天会话
//   // '/history', // 历史记录
//   // '/settings', // 设置页面
// ]);
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  return NextResponse.next();
}

// export { auth as middleware } from '@/app/(auth)/auth';
