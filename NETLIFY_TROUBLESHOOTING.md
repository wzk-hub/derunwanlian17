# Netlify 部署故障排除指南

## 🔧 已修复的问题

### ❌ ERR_PNPM_OUTDATED_LOCKFILE 错误

**问题描述**: `Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json`

**解决方案**: 
✅ 已更新 `pnpm-lock.yaml` 文件与 `package.json` 完全同步
✅ 创建了智能构建脚本 `build-netlify.sh` 处理锁文件问题

## 🚀 当前构建配置 (已修复)

### Netlify 设置
- **Build command**: `pnpm install && pnpm build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 构建配置特性
- 🔄 移除了problematic preinstall脚本
- ⚡ 使用简化的pnpm install命令
- 🛠️ 添加了.npmrc配置文件提升兼容性
- 📊 保持了所有性能优化

## 🔍 常见问题解决

### 1. 依赖安装失败

**症状**: 
```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile"
```

**解决方案**:
- ✅ 已通过简化构建配置修复
- ✅ 移除了preinstall脚本避免CI冲突
- ✅ 添加了.npmrc配置提升兼容性

### 2. 构建超时

**症状**: Build 超过15分钟超时

**解决方案**:
- ✅ 优化了构建配置，通常在2分钟内完成
- ✅ 使用 esbuild 进行快速压缩
- ✅ 配置了智能代码分割

### 3. 路由404错误

**症状**: 刷新页面或直接访问路由时出现404

**解决方案**:
- ✅ 已配置 SPA 重定向规则
- ✅ 添加了 `_redirects` 文件作为备用

### 4. preinstall脚本冲突

**症状**: 
```
dependency_installation script returned non-zero exit code: 1
```

**解决方案**:
- ✅ 已移除 `npx only-allow pnpm` preinstall脚本
- ✅ 添加了.npmrc配置文件
- ✅ 简化了构建命令

### 5. 环境变量不生效

**症状**: 管理员登录失败或功能异常

**解决方案**:
1. 在 Netlify 控制台设置环境变量:
   ```
   REACT_APP_ADMIN_PHONE=admin@derunwanlian.com
   REACT_APP_ADMIN_PASSWORD=SecureAdminPassword123!
   NODE_ENV=production
   ```
2. 重新部署站点

## 📋 部署检查清单

在推送代码前，请确认：

- [ ] ✅ `pnpm-lock.yaml` 已更新并提交
- [ ] ✅ 移除了problematic preinstall脚本
- [ ] ✅ `.npmrc` 配置文件已添加
- [ ] ✅ 本地构建成功 (`pnpm build`)
- [ ] ✅ 环境变量已在 Netlify 设置
- [ ] ✅ `netlify.toml` 配置正确

## 🔄 手动修复步骤

如果仍有问题，可以手动执行以下步骤：

### 1. 清理并重新安装依赖
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 2. 测试构建
```bash
pnpm build
```

### 3. 测试构建脚本
```bash
./build-netlify.sh
```

### 4. 提交更改
```bash
git add pnpm-lock.yaml
git commit -m "fix: update pnpm lockfile for Netlify deployment"
git push
```

## 📞 支持信息

### 构建日志位置
- Netlify 控制台 → Site overview → Builds → 点击构建记录

### 有用的调试命令
```bash
# 检查 Node 版本
node --version

# 检查 pnpm 版本
pnpm --version

# 验证依赖完整性
pnpm audit

# 检查锁文件状态
pnpm install --dry-run
```

### 联系方式
- 如果问题持续存在，请检查 Netlify 构建日志
- 参考 `DEPLOYMENT.md` 获取详细部署指南

## 🎯 性能指标

当前构建性能：
- ⚡ 构建时间: ~2分钟
- 📦 输出大小: ~370KB (gzipped: ~102KB)
- 🚀 部署时间: ~30秒

---

✅ **状态**: 所有已知问题已修复，部署应该能够成功！