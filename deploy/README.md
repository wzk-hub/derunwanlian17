# 部署指南（ECS + Nginx + PM2）

## 1. 服务器准备
- Ubuntu 22.04 推荐
- 开放 80/443（公网），22 仅白名单
- 安装 Node.js 22 与 pnpm 9、pm2、nginx

## 2. 环境配置
- 后端环境变量：复制 `server/.env.example` 为 `server/.env` 并填写（可选 OSS）
- 推荐将 `server/.env` 保存在服务器，不纳入仓库

## 3. 构建前端
```bash
pnpm install
pnpm build
# 构建产物在 dist/
```

## 4. 后端运行（PM2）
```bash
cd server
pnpm install
pm2 start index.js --name qedu-api
pm2 save
pm2 startup  # 可选，设置开机自启
```

## 5. Nginx 配置
- 将 `deploy/nginx.conf` 放到 `/etc/nginx/sites-available/qedu.conf`
- 软链至 `sites-enabled` 并测试重载
```bash
sudo ln -sf /etc/nginx/sites-available/qedu.conf /etc/nginx/sites-enabled/qedu.conf
sudo nginx -t && sudo systemctl reload nginx
```

## 6. HTTPS（可选）
使用 Certbot 或阿里云证书服务申请证书，将 80 跳转至 443。

## 7. 升级上线
```bash
# 拉新代码
pnpm build
# 重启后端
pm2 restart qedu-api
# 重载 Nginx（如有改动）
sudo systemctl reload nginx
```