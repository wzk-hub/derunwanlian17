# 项目说明

本项目使用 React + Vite + Tailwind 构建，并通过 Netlify Functions 提供简单的动态能力（健康检查、站点信息、登录演示）。

## 本地开发

- 安装依赖：`pnpm i`
- 启动开发服务器：`pnpm dev`

## 构建与部署

- 构建：`pnpm build`
- 部署到 Netlify：确保 `netlify.toml` 已配置 `functions = "netlify/functions"`，然后连接 Netlify 仓库即可。

## 动态函数

- `/.netlify/functions/health`：健康检查
- `/.netlify/functions/site-info`：站点动态信息（可通过环境变量覆盖）
- `/.netlify/functions/login`：登录演示（读取环境变量 `ADMIN_PHONE`, `ADMIN_PASSWORD`）

前端通过 `src/lib/apiClient.ts` 进行调用，`Home.tsx` 展示 `site-info`，`Login.tsx` 优先调用 `login`，失败时回退到本地逻辑。