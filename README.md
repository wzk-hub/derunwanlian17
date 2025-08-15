# 德润万联教育平台

一个现代化的教育管理平台，连接家长、教师和管理员，提供完整的教育资源匹配和管理解决方案。

## 🚀 功能特点

- **多角色支持**：管理员、家长和老师三种用户角色，各自独立的功能模块
- **智能匹配**：根据学科、年级和价格自动匹配合适的教师
- **任务管理**：家长发布教学任务，教师接单管理
- **安全支付**：集成安全的支付系统，确保交易安全
- **实名认证**：完整的用户认证和验证流程
- **消息系统**：用户间的实时沟通功能
- **数据统计**：管理员数据分析和统计功能

## 🛠️ 技术栈

- **前端框架**：React 18.3.1 + TypeScript 5.7.3
- **构建工具**：Vite 6.3.5
- **样式框架**：Tailwind CSS 3.4.17
- **路由管理**：React Router DOM 7.5.3
- **动画库**：Framer Motion 12.10.0
- **图表库**：Recharts 2.15.3
- **通知系统**：Sonner 2.0.3
- **包管理**：pnpm 9.6.0

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Navbar.tsx      # 导航栏组件
│   └── ...
├── contexts/           # React Context
│   └── authContext.tsx # 认证上下文
├── hooks/              # 自定义Hooks
├── lib/                # 工具函数
│   └── utils.ts        # 通用工具函数
├── models/             # 数据模型定义
├── pages/              # 页面组件
│   ├── admin/          # 管理员页面
│   ├── parent/         # 家长页面
│   ├── teacher/        # 教师页面
│   ├── Home.tsx        # 首页
│   ├── Login.tsx       # 登录页
│   └── ...
└── main.tsx            # 应用入口
```

## 🚀 快速开始

### 环境要求

- Node.js 22.18.0 或更高版本
- pnpm 9.6.0 或更高版本

### 安装依赖

```bash
pnpm install
```

### 开发环境

```bash
pnpm dev
```

开发服务器将在 http://localhost:3000 启动

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm start
```

## 🌐 部署到 Netlify

### 自动部署（推荐）

1. 将代码推送到 Git 仓库（GitHub、GitLab 或 Bitbucket）
2. 登录 [Netlify](https://netlify.com)
3. 点击 "New site from Git"
4. 选择你的代码仓库
5. 配置构建设置：
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Node version: `22.18.0`
6. 点击 "Deploy site"

### 手动部署

1. 构建项目：`pnpm build`
2. 将 `dist` 目录拖拽到 Netlify 部署区域

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## ✨ 性能优化

### 已实现的优化

- ✅ **代码分割**：按路由和组件自动分割代码
- ✅ **资源压缩**：CSS、JS、图片自动压缩
- ✅ **缓存策略**：静态资源长期缓存配置
- ✅ **预加载**：关键资源预加载
- ✅ **PWA支持**：渐进式Web应用功能
- ✅ **响应式设计**：移动端友好
- ✅ **SEO优化**：完整的元标签和结构化数据

### 构建优化

- 代码分割：vendor、router、ui 分别打包
- 资源压缩：启用 gzip 压缩
- 缓存优化：静态资源长期缓存
- 安全头：XSS、CSRF 防护

## 🎨 设计系统

### 颜色系统

- **主色调**：蓝色系 (#3B82F6)
- **成功色**：绿色系 (#22C55E)
- **警告色**：橙色系 (#F59E0B)
- **错误色**：红色系 (#EF4444)

### 组件库

- 按钮组件：primary、secondary、success、warning、error
- 卡片组件：带阴影和边框的容器
- 表单组件：输入框、标签、验证
- 加载组件：旋转加载器

## 🔧 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 提交规范

```bash
pnpm lint        # 代码检查
pnpm format      # 代码格式化
```

### 环境变量

创建 `.env.local` 文件：

```env
VITE_API_URL=your_api_url
VITE_APP_TITLE=教育管理平台
```

## 📊 性能指标

- **首屏加载时间**：< 2s
- **包大小**：< 500KB (gzipped)
- **Lighthouse 评分**：> 90

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情参见 [LICENSE](LICENSE) 文件

## 📞 联系我们

- 项目维护者：[Your Name]
- 邮箱：[your.email@example.com]
- 项目地址：[GitHub Repository URL]

---

**注意**：这是一个教育管理平台的演示项目，实际部署时请确保配置正确的环境变量和安全设置。