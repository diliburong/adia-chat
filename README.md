This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

drizzle-kit push
直接将 schema 变更推送到数据库
不生成迁移文件
适用于开发环境
不推荐在生产环境使用，因为没有迁移历史记录
migrate 命令
执行已生成的迁移文件
通常在代码中使用 migrate() 函数
会记录迁移历史
适用于生产环境
最佳实践
开发环境：
可以直接使用 drizzle-kit push 快速同步数据库结构
适合频繁修改数据库结构的开发阶段
生产环境：
使用 drizzle-kit generate:pg 生成迁移文件
然后使用 migrate 功能执行迁移
保持迁移历史记录
更安全可控
所以，如果你使用了 migrate 系统，就不需要再使用 push 命令了。两者选其一即可，而不是需要同时使用。推荐在正式项目中使用 migrate 系统，这样可以更好地管理数据库变更。
