# 任务管理和老师评分系统功能说明

## 功能概述

本系统为教育平台提供了完整的任务管理和老师评分功能，包括管理端发布任务、任务置顶、老师评分管理等核心功能。

## 主要功能特性

### 1. 管理端任务发布
- **系统推荐任务**: 管理员可以发布系统推荐的教学任务
- **置顶功能**: 支持任务置顶，置顶任务在老师端优先显示
- **标签系统**: 支持任务标签，如"紧急"、"推荐"、"优质"等
- **自动审核**: 管理员发布的任务自动审核通过

### 2. 任务置顶系统
- **置顶标识**: 置顶任务在界面上有明显的视觉标识
- **排序控制**: 支持调整置顶任务的显示顺序
- **多级置顶**: 支持多个任务同时置顶，按顺序排列

### 3. 老师评分系统
- **100分制评分**: 采用100分制评分标准，更加精确
- **评价内容**: 支持文字评价，提供详细的反馈
- **评分历史**: 记录所有评分历史，支持修改和查看
- **平均评分**: 自动计算老师的平均评分和总评价次数

### 4. 管理端老师管理
- **置顶管理**: 管理员可以置顶/取消置顶老师
- **评分管理**: 支持修改任何评分记录
- **排序调整**: 可以调整置顶老师的显示顺序
- **评分统计**: 显示老师的评分统计信息

## 使用方法

### 管理员用户

#### 发布教学任务
1. 登录管理端后，点击"发布任务"标签
2. 填写任务基本信息（标题、科目、年级、课时、价格等）
3. 设置任务描述和标签
4. 选择是否置顶及置顶顺序
5. 点击"发布任务"完成发布

#### 管理老师置顶
1. 在"老师管理"页面查看所有老师
2. 点击"置顶推荐"按钮将老师置顶
3. 使用"调整顺序"按钮调整置顶顺序
4. 点击"取消置顶"取消置顶状态

#### 管理老师评分
1. 在老师管理页面点击"管理评分"
2. 查看该老师的评分历史记录
3. 点击"编辑"按钮修改特定评分
4. 输入新的评分和评价内容
5. 保存修改，系统自动更新平均评分

### 家长用户

#### 为老师评分
1. 在任务完成后，进入任务详情页面
2. 在"为老师评分"区域进行评分
3. 选择评分等级（90分优秀、80分良好等）或自定义评分
4. 填写详细的评价内容
5. 提交评分，系统自动更新老师评分

#### 查看老师评分
1. 在精选老师页面查看老师的平均评分
2. 评分以星星和分数形式显示
3. 显示总评价人数和评分等级

### 老师用户

#### 查看置顶任务
1. 在任务中心页面，置顶任务会优先显示
2. 置顶任务有明显的蓝色边框和标识
3. 系统推荐任务会显示"系统推荐"标签

#### 接受任务
1. 对于置顶的系统推荐任务，可以直接点击"接受任务"
2. 接受后任务状态变为"已分配"
3. 可以开始教学流程

## 技术实现

### 数据模型扩展

#### 任务模型 (Task)
```typescript
interface Task {
  // 原有字段...
  isPinned?: boolean;           // 是否置顶
  pinnedAt?: Date;              // 置顶时间
  pinnedById?: string;          // 置顶管理员ID
  pinnedOrder?: number;         // 置顶排序
  source: 'parent' | 'admin';   // 任务来源
  rating?: number;              // 任务评分
  ratingComment?: string;       // 评分评价
  tags?: string[];              // 任务标签
}
```

#### 用户模型 (User)
```typescript
interface User {
  // 原有字段...
  averageRating?: number;       // 平均评分
  totalRatings?: number;        // 总评分次数
  ratingHistory?: TeacherRating[]; // 评分历史
  isPinned?: boolean;          // 是否置顶
  pinnedAt?: Date;             // 置顶时间
  pinnedOrder?: number;        // 置顶排序
}
```

#### 评分记录模型 (TeacherRating)
```typescript
interface TeacherRating {
  id: string;
  teacherId: string;
  parentId: string;
  parentName: string;
  taskId: string;
  taskTitle: string;
  rating: number;              // 1-100分
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
  updatedById?: string;        // 管理员修改评分时的ID
}
```

### 核心算法

#### 任务排序算法
```typescript
// 置顶任务优先，然后按时间排序
const sortedTasks = tasks.sort((a, b) => {
  if (a.isPinned && !b.isPinned) return -1;
  if (!a.isPinned && b.isPinned) return 1;
  if (a.isPinned && b.isPinned) {
    return (a.pinnedOrder || 0) - (b.pinnedOrder || 0);
  }
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});
```

#### 评分计算算法
```typescript
// 计算平均评分
const updateTeacherAverageRating = (teacherId: string) => {
  const ratings = getTeacherRatings(teacherId);
  if (ratings.length > 0) {
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round(totalRating / ratings.length);
    return { averageRating, totalRatings: ratings.length };
  }
  return { averageRating: 0, totalRatings: 0 };
};
```

## 文件结构

```
src/
├── models/
│   ├── Task.ts                    # 任务数据模型（已扩展）
│   └── User.ts                    # 用户数据模型（已扩展）
├── components/
│   ├── TeacherRating.tsx          # 老师评分组件
│   └── TeacherCard.tsx            # 老师卡片组件（已更新）
├── pages/
│   ├── admin/
│   │   ├── TaskPublish.tsx        # 管理端发布任务
│   │   └── TeacherManagement.tsx  # 管理端老师管理
│   ├── parent/
│   │   └── TaskDetail.tsx         # 家长端任务详情（已更新）
│   └── teacher/
│       └── Tasks.tsx              # 老师端任务中心（已更新）
└── App.tsx                        # 路由配置（已更新）
```

## 界面特性

### 视觉标识
- **置顶任务**: 蓝色边框和背景，置顶图标
- **系统推荐**: 蓝色标签显示"系统推荐"
- **评分显示**: 星星评分系统，100分制显示
- **状态标识**: 不同状态用不同颜色区分

### 交互体验
- **快速评分**: 预设评分选项，支持自定义评分
- **实时更新**: 评分提交后立即更新显示
- **排序控制**: 拖拽或输入方式调整顺序
- **搜索过滤**: 支持多维度搜索和过滤

## 注意事项

1. **数据一致性**: 评分修改后会自动更新相关统计信息
2. **权限控制**: 只有管理员可以置顶任务和修改评分
3. **评分验证**: 评分范围限制在0-100分之间
4. **置顶限制**: 建议置顶数量控制在合理范围内

## 未来扩展

1. **智能推荐**: 基于评分和标签的智能任务推荐
2. **批量操作**: 支持批量置顶和评分管理
3. **评分分析**: 详细的评分统计和分析报告
4. **通知系统**: 评分和置顶变更的通知提醒
5. **API接口**: 提供外部系统集成的API接口

## 总结

这个任务管理和老师评分系统为教育平台提供了完整的任务生命周期管理能力，通过置顶功能提升了重要任务的曝光度，通过评分系统建立了老师质量评价体系，为家长选择老师提供了可靠的参考依据。系统设计灵活，易于扩展，可以根据实际需求进行功能调整和优化。