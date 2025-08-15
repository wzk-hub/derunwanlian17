# 德润万联教育平台 - Netlify 部署指南

## 🚀 部署步骤

### 1. 准备工作

确保你的项目已经推送到Git仓库（GitHub、GitLab或Bitbucket）。

### 2. 连接到Netlify

1. 登录到 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择你的Git提供商并授权
4. 选择包含此项目的仓库

### 3. 构建配置

Netlify会自动检测到`netlify.toml`配置文件。如果需要手动配置：

- **Build command**: `pnpm install && pnpm build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 4. 环境变量设置

在Netlify控制台的"Site settings" > "Environment variables"中添加以下变量：

```
REACT_APP_ADMIN_PHONE=admin@derunwanlian.com
REACT_APP_ADMIN_PASSWORD=SecureAdminPassword123!
NODE_ENV=production
```

### 5. 部署设置

#### 推荐的部署设置：

- **Branch to deploy**: `main` 或 `master`
- **Build settings**: 使用仓库中的netlify.toml
- **Deploy notifications**: 启用构建失败通知

## 🛠️ 本地开发

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

### 构建项目
```bash
pnpm build
```

### 预览构建结果
```bash
pnpm preview
```

## 📁 项目结构

```
/
├── public/           # 公共资源
├── src/             # 源代码
│   ├── components/  # React组件
│   ├── pages/       # 页面组件
│   ├── contexts/    # React上下文
│   ├── hooks/       # 自定义钩子
│   ├── lib/         # 工具函数
│   └── models/      # 数据模型
├── dist/            # 构建输出（自动生成）
├── netlify.toml     # Netlify配置
├── .nvmrc           # Node版本
└── .env.example     # 环境变量示例
```

## 🔧 技术栈

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Deployment**: Netlify

## 🚨 部署检查清单

- [ ] 代码已推送到Git仓库
- [ ] 环境变量已在Netlify中设置
- [ ] 构建成功完成
- [ ] 路由重定向正常工作
- [ ] 响应式设计在移动设备上正常
- [ ] 所有页面和功能可访问

## 🐛 常见问题

### 构建失败
1. **pnpm锁文件问题**: 如果看到 `ERR_PNPM_OUTDATED_LOCKFILE` 错误
   - ✅ 已通过智能构建脚本修复
   - 参考 `NETLIFY_TROUBLESHOOTING.md` 获取详细信息
2. 检查Node.js版本是否为18+
3. 确认所有依赖已正确安装
4. 查看构建日志中的错误信息

### 路由不工作
- 确认`netlify.toml`中的重定向规则已配置
- 检查`public/_redirects`文件是否存在

### 环境变量不生效
- 确认变量名以`REACT_APP_`开头
- 重新部署站点以应用新的环境变量

## 📞 支持

如有部署问题，请检查：
1. Netlify构建日志
2. 浏览器控制台错误
3. 网络连接状态

## 🔐 安全注意事项

- 不要在代码中硬编码敏感信息
- 使用Netlify环境变量存储密钥
- 定期更新依赖包以修复安全漏洞
- 启用HTTPS（Netlify默认提供）

## 📈 性能优化

项目已包含以下优化：
- 代码分割和懒加载
- 静态资源缓存
- Gzip压缩
- 图像优化（建议）
- SEO元标签

## 🌍 域名配置

部署后，你可以：
1. 使用Netlify提供的免费子域名
2. 配置自定义域名
3. 启用SSL证书（免费）

更多信息请参考 [Netlify文档](https://docs.netlify.com/)。