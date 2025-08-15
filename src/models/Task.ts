/**
 * 任务数据模型定义
 */

// 任务状态类型
export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'payment_pending' | 'paid' | 'assigned' | 'in_progress' | 'completed' | 'settled' | 'cancelled';

// 任务接口定义
export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
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
  paidAt?: Date; // 家长确认支付时间
  completedAt?: Date; // 完成时间
  settledAt?: Date; // 结算时间
  settledById?: string; // 结算管理员ID
  settledAmount?: number; // 实际结算金额
  paymentMethod?: 'wechat' | 'alipay'; // 支付方式
  paymentTransactionId?: string; // 支付交易ID
  rejectionReason?: string; // 拒绝原因
  chatGroupId?: string; // 关联的群聊ID
  // 新增：学生信息与选定老师
  studentName?: string;
  studentSchool?: string;
  teacherId?: string; // 选定的老师ID（家长在发布时可选）
  // 新增：取消相关
  cancelledAt?: Date;
  cancelledById?: string;
  // 新增：软删除
  deletedAt?: Date;
  isDeleted?: boolean;
  // 新增：置顶相关
  isPinned?: boolean; // 是否置顶
  pinnedAt?: Date; // 置顶时间
  pinnedById?: string; // 置顶管理员ID
  pinnedOrder?: number; // 置顶排序（数字越小越靠前）
  // 新增：任务来源
  source: 'parent' | 'admin'; // 任务来源：家长发布或管理员发布
  // 新增：任务评分
  rating?: number; // 任务完成后的评分（1-100分）
  ratingComment?: string; // 评分评价
  ratedAt?: Date; // 评分时间
  // 新增：任务标签
  tags?: string[]; // 任务标签，如"紧急"、"推荐"等
}

/**
 * 创建任务请求接口
 */
export interface CreateTaskRequest {
  title: string;
  description: string;
  subject: string;
  grade: string;
  duration: number;
  price: number;
  // 新增学生信息
  studentName?: string;
  studentSchool: string;
  // 老师在发布时可选
  teacherId?: string; // 选择老师后可填
  // 新增：任务标签
  tags?: string[];
}

/**
 * 管理员发布任务请求接口
 */
export interface AdminCreateTaskRequest extends CreateTaskRequest {
  isPinned?: boolean;
  pinnedOrder?: number;
}