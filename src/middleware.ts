// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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

// export default clerkMiddleware(async (auth, req) => {
//   console.log('middleware');
//   if (isProtectedRoute(req)) {
//     await auth.protect();
//   }
// });

export { auth as middleware } from '@/app/(auth)/auth';
