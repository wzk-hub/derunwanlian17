/**
 * 任务数据模型定义
 */

// 任务状态类型
export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'payment_pending' | 'paid' | 'assigned' | 'in_progress' | 'completed' | 'settled';

// 任务接口定义
export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  school?: string; // 学生所在学校
  studentProfile?: string; // 学生简介
  duration: number; // 课时数量
  price: number; // 总价格
  status: TaskStatus;
  publisherId: string; // 发布者ID（家长）
  publisherName?: string; // 发布者姓名
  assignedTeacherId?: string; // 被分配的老师ID
  assignedTeacherName?: string; // 被分配的老师姓名
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date; // 审核通过时间
  approvedById?: string; // 审核管理员ID
  paymentConfirmedAt?: Date; // 支付确认时间
  paymentConfirmedById?: string; // 确认支付的管理员ID
  completedAt?: Date; // 完成时间
  settledAt?: Date; // 结算时间
  settledById?: string; // 结算管理员ID
  paymentMethod?: 'wechat' | 'alipay'; // 支付方式
  paymentTransactionId?: string; // 支付交易ID
  rejectionReason?: string; // 拒绝原因
  chatGroupId?: string; // 关联的群聊ID
}

/**
 * 创建任务请求接口
 */
export interface CreateTaskRequest {
  title: string;
  description: string;
  subject: string;
  grade: string;
  school?: string; // 学生所在学校
  studentProfile?: string; // 学生简介
  duration: number;
  price: number;
  teacherId: string; // 选择老师后必填
}