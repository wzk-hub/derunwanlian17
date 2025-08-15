# 部署到 Netlify 指南

## 项目概述

这是一个基于 React + TypeScript + Vite 的教育管理平台，支持家长、教师和管理员三种角色的功能。

## 技术栈

- **前端框架**: React 18.3.1
- **构建工具**: Vite 6.3.5
- **语言**: TypeScript 5.7.3
- **样式**: Tailwind CSS 3.4.17
- **路由**: React Router DOM 7.5.3
- **动画**: Framer Motion 12.10.0
- **图表**: Recharts 2.15.3
- **通知**: Sonner 2.0.3
- **包管理**: pnpm 9.6.0

## 本地开发

### 环境要求

- Node.js 22.18.0 或更高版本
- pnpm 9.6.0 或更高版本

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

开发服务器将在 http://localhost:3000 启动

### 构建生产版本

```bash
pnpm build
```

构建产物将生成在 `dist` 目录中

### 预览生产版本

```bash
pnpm start
```

## 部署到 Netlify

### 方法一：通过 Git 仓库部署（推荐）

1. **准备代码仓库**
   - 确保代码已推送到 GitHub、GitLab 或 Bitbucket
   - 确保 `netlify.toml` 文件在项目根目录

2. **连接 Netlify**
   - 登录 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择你的代码仓库
   - 配置构建设置：
     - Build command: `pnpm build`
     - Publish directory: `dist`
     - Node version: `22.18.0`

3. **环境变量配置**
   - 在 Netlify 控制台中，进入 Site settings > Environment variables
   - 添加必要的环境变量（如果有的话）

4. **部署**
   - 点击 "Deploy site"
   - Netlify 将自动构建和部署你的应用

### 方法二：拖拽部署

1. **构建项目**
   ```bash
   pnpm build
   ```

2. **上传 dist 目录**
   - 登录 Netlify
   - 将 `dist` 目录拖拽到 Netlify 的部署区域

### 方法三：Netlify CLI

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **初始化项目**
   ```bash
   netlify init
   ```

4. **部署**
   ```bash
   netlify deploy --prod
   ```

## 配置说明

### netlify.toml

项目已配置了优化的 `netlify.toml` 文件，包含：

- **构建配置**: 指定构建命令和发布目录
- **重定向规则**: 处理 SPA 路由
- **安全头**: 增强安全性
- **缓存策略**: 优化性能
- **压缩设置**: 减小文件大小

### 环境变量

如需配置环境变量，在 Netlify 控制台中添加：

```bash
NODE_VERSION=22.18.0
NPM_FLAGS=--version
```

### 自定义域名

1. 在 Netlify 控制台中进入 Domain settings
2. 添加自定义域名
3. 配置 DNS 记录

## 性能优化

### 已实现的优化

1. **代码分割**: 按路由和组件分割代码
2. **资源压缩**: CSS、JS、图片自动压缩
3. **缓存策略**: 静态资源长期缓存
4. **预加载**: 关键资源预加载
5. **懒加载**: 组件和路由懒加载
6. **PWA 支持**: 渐进式 Web 应用功能

### 进一步优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 实现响应式图片
   - 添加图片懒加载

2. **CDN 配置**
   - 配置 Cloudflare CDN
   - 启用 Brotli 压缩

3. **监控和分析**
   - 集成 Google Analytics
   - 添加性能监控

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 确保所有依赖已安装
   - 查看构建日志

2. **路由问题**
   - 确保 `netlify.toml` 中的重定向规则正确
   - 检查 React Router 配置

3. **样式问题**
   - 确保 Tailwind CSS 配置正确
   - 检查 CSS 文件路径

4. **性能问题**
   - 检查包大小
   - 优化图片和资源
   - 启用代码分割

### 调试技巧

1. **本地测试构建**
   ```bash
   pnpm build
   pnpm start
   ```

2. **检查构建产物**
   ```bash
   ls -la dist/
   ```

3. **查看 Netlify 日志**
   - 在 Netlify 控制台查看构建日志
   - 检查函数日志（如果使用）

## 更新部署

### 自动部署

- 推送到主分支将自动触发部署
- 每次提交都会生成预览部署

### 手动部署

1. 在 Netlify 控制台点击 "Trigger deploy"
2. 选择 "Deploy site"

## 联系支持

如遇到部署问题，请：

1. 检查 Netlify 状态页面
2. 查看 Netlify 文档
3. 联系项目维护者

---

**注意**: 确保在部署前测试所有功能，特别是用户认证和路由功能。