# CLAUDE.md

TapeScript（tapescript.app）：把视频、音频和链接（YouTube、TikTok 等）转成可编辑、可导出的文字稿，并生成 AI 总结。对标 videotranscriber.ai。

- 产品与技术方案：`docs/开发方案.md`
- 竞品实测记录：`docs/竞品体验报告.md`

## 已定的产品决策

- **转录必须登录**：不提供匿名额度。未登录可以浏览页面、上传文件、预览链接；点"转录"时弹出登录，登录后自动提交。
- **语言**：先只做 `en`（默认，无前缀）和 `zh`（`/zh/...`）。新页面和文案都要同时出中英两版；中文由项目负责人审核通过后才扩展其他语言。
- **收款**：只用 Dodo Payments（首选）、PayPal、Waffo。代码里目前仍是模板自带的 Creem，待替换。
- **AI 调用**：统一用 AI SDK v6，prompt 放在 `prompts/` 目录。

## 技术栈

Next.js 16（App Router）+ React 19 + TypeScript、Tailwind CSS、next-intl、Better Auth（邮箱 + Google）、PostgreSQL + Drizzle、Resend、S3 兼容存储（Cloudflare R2）。包管理只用 pnpm。

## 目录

```
app/[locale]/(marketing)/   营销页：首页、定价、博客、联系、法律页
app/[locale]/(auth)/        登录、注册、找回密码
app/[locale]/(protected)/   登录后页面：dashboard、credits、profile、settings
app/[locale]/(admin)/       管理后台（user.role = 'admin'）
app/api/                    auth、payments/creem、cron、user、admin
lib/auth.ts                 Better Auth 配置（注册赠送积分）
lib/credits.ts              积分扣减 / 退还（同时写 credit_ledger）
lib/db/schema.ts            数据表定义；迁移在 drizzle/
lib/r2-storage.ts           S3 兼容存储
constants/billing.ts        套餐与积分配置
messages/                   界面文案 en/zh 与 SEO 文案
i18n.config.ts, proxy.ts    语言配置与路由中间件
```

博客文章放在 `app/[locale]/(marketing)/blog/<slug>/{en,zh}.mdx`，构建前运行 `pnpm generate:blog-manifest` 生成清单。MDX 编译依赖 fumadocs-mdx（`source.config.ts`）。

## 常用命令

```bash
pnpm dev                 # 本地开发
pnpm build               # 生产构建（会先生成博客清单）
pnpm lint
pnpm test                # vitest
pnpm db:generate         # 根据 schema 生成迁移
pnpm db:migrate          # 执行迁移
pnpm admin:setup         # 创建管理员
```

## 积分与计费

- `user.credits` 是当前余额，每一笔变动都写进 `credit_ledger`（`delta` 为正表示增加、为负表示扣减；`reason` 说明原因）。
- 修改余额必须在事务里同时更新 `user.credits` 并写入账本，不允许只改其中一个。
- 支付回调要做幂等处理（`payment.providerPaymentId` 唯一）。
