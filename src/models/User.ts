/**
 * 用户数据模型定义
 */

// 用户角色类型
export type UserRole = 'parent' | 'teacher' | 'admin';

// 实名认证状态
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'unverified';

// 用户接口定义
export interface User {
  id: string;
  phone: string;
  password: string;
  role: UserRole;
  name?: string;
  avatar?: string;
  createdAt: Date;
  
  // 实名认证信息
  verificationStatus: VerificationStatus;
  realName?: string;
  idNumber?: string;
  idCardFront?: string;
  idCardBack?: string;
  verifiedAt?: Date;
  verifiedById?: string;
  
  // 家长特有信息
  childGrade?: string; // 孩子年级
  
  // 老师特有信息
  subjects?: string[]; // 教学科目，支持多个
  grade?: string[]; // 教授年级
  introduction?: string; // 个人简介
  experience?: string; // 教学经验
  price?: number; // 课时费用
  certificates?: string[]; // 资格证书
  paymentQrCode?: string; // 收款二维码
  // 新增：老师评分相关
  averageRating?: number; // 平均评分（1-100分）
  totalRatings?: number; // 总评分次数
  ratingHistory?: TeacherRating[]; // 评分历史记录
  isPinned?: boolean; // 是否在精选老师页面置顶
  pinnedAt?: Date; // 置顶时间
  pinnedById?: string; // 置顶管理员ID
  pinnedOrder?: number; // 置顶排序
}

/**
 * 老师评分记录接口
 */
export interface TeacherRating {
  id: string;
  teacherId: string;
  parentId: string;
  parentName: string;
  taskId: string;
  taskTitle: string;
  rating: number; // 1-100分
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
  updatedById?: string; // 管理员修改评分时的ID
}
}