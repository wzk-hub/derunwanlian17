# 德润万联教育平台

专业的一对一在线教育服务平台，连接家长和优质教师，为孩子提供个性化学习方案。

## ✨ 功能特色

- 🎓 **多角色系统**: 支持家长、教师、管理员三种角色
- 📚 **任务发布**: 家长可发布教学需求，选择合适的老师
- 💬 **实时沟通**: 内置消息系统，支持多方沟通
- 💰 **支付管理**: 安全的支付流程和订单管理
- 📊 **数据统计**: 管理员可查看平台运营数据
- 🔐 **实名认证**: 完善的身份验证系统
- 📱 **响应式设计**: 完美适配桌面和移动设备

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000` 查看应用。

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 📦 部署到Netlify

### 一键部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/your-repo)

### 手动部署

1. 将代码推送到Git仓库
2. 在Netlify中连接仓库
3. 设置构建配置（已在netlify.toml中配置）
4. 添加环境变量
5. 部署！

详细说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **路由**: React Router v7
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **包管理器**: pnpm
- **部署**: Netlify

## 📁 项目结构

```
src/
├── components/       # 可复用组件
│   ├── Navbar.tsx   # 导航栏
│   ├── TaskForm.tsx # 任务表单
│   └── ...
├── pages/           # 页面组件
│   ├── Home.tsx     # 首页
│   ├── Login.tsx    # 登录注册
│   ├── parent/      # 家长相关页面
│   ├── teacher/     # 教师相关页面
│   └── admin/       # 管理员相关页面
├── contexts/        # React上下文
├── hooks/           # 自定义钩子
├── lib/             # 工具函数
├── models/          # 数据模型
└── main.tsx         # 应用入口
```

## 🔧 开发指南

### 默认账户

**管理员账户**:
- 手机号: `admin@system.com`
- 密码: `SecureAdmin123!`

### 添加新功能

1. 在相应的目录下创建组件
2. 更新路由配置（如需要）
3. 添加必要的类型定义
4. 测试功能完整性

### 数据存储

当前使用localStorage进行数据持久化，生产环境建议替换为：
- 后端API + 数据库
- Firebase
- Supabase

## 🎨 自定义主题

项目使用Tailwind CSS，可通过修改 `tailwind.config.js` 来自定义主题：

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // 自定义主色调
      }
    }
  }
}
```

## 🔐 安全考虑

- 密码使用哈希存储
- 环境变量管理敏感信息
- 输入验证和XSS防护
- HTTPS强制（Netlify默认）

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues
- 邮箱: support@derunwanlian.com

---

**德润万联教育平台** - 让每个孩子都能享受优质教育