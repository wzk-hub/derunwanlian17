# 阿里云部署指引（ECS + Nginx）

## 1. 构建前端

```bash
pnpm i
pnpm build
# 生成静态文件在 dist/
```

## 2. Nginx 配置（示例）

将前端静态文件部署到 `/var/www/derunwanlian/dist`，后端 API 假设为 `http://127.0.0.1:8080`。

```nginx
server {
    listen 80;
    server_name your-domain.cn;

    root /var/www/derunwanlian/dist;
    index index.html;

    # 前端静态资源
    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 单页应用回退
    location / {
        try_files $uri /index.html;
    }

    # 后端 API（可与前端同域）
    # 若启用，前端 .env 使用：VITE_API_MODE=aliyun，VITE_API_BASE_URL=http://your-domain.cn，VITE_API_PREFIX=/api
    location /api/ {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:8080/;
    }
}
```

## 3. 前端环境变量

- `.env.production` 示例：

```
VITE_API_MODE=aliyun
VITE_API_BASE_URL=https://your-domain.cn
VITE_API_PREFIX=/api
```

## 4. 运行后端

- 使用 Node/Java/Spring/Go 任意后端均可，确保监听在内网端口并由 Nginx 反代。
- 若需要鉴权，可在前端登录成功后写入 `authToken`，请求自动携带 `Authorization: Bearer <token>`。