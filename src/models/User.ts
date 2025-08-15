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
  grades?: string[]; // 教授年级 (renamed from grade to avoid confusion)
  introduction?: string; // 个人简介
  experience?: string; // 教学经验
  price?: number; // 课时费用
  certificates?: string[]; // 资格证书
  paymentQrCode?: string; // 收款二维码
}