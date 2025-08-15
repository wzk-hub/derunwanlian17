/**
 * 客服对话数据模型定义
 */

// 客服对话状态
export type CustomerServiceStatus = 'open' | 'closed' | 'pending';

// 消息类型
export type MessageType = 'text' | 'image' | 'file';

// 客服对话接口
export interface CustomerServiceChat {
  id: string;
  userId: string;
  userRole: 'parent' | 'teacher';
  userName: string;
  status: CustomerServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: string;
  lastMessageAt: Date;
  unreadCount: number;
  messages: CustomerServiceMessage[];
}

// 客服消息接口
export interface CustomerServiceMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: 'parent' | 'teacher' | 'admin';
  senderName: string;
  content: string;
  messageType: MessageType;
  createdAt: Date;
  isRead: boolean;
}

// 客服统计信息接口
export interface CustomerServiceStats {
  totalChats: number;
  openChats: number;
  closedChats: number;
  pendingChats: number;
  totalMessages: number;
  averageResponseTime: number; // 平均响应时间（分钟）
}