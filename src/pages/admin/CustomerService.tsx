import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ServiceMessage {
  id: string;
  senderId: string;
  senderRole: 'parent' | 'teacher' | 'customer_service';
  senderName: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

interface CustomerServiceChat {
  chatId: string;
  userId: string;
  userRole: 'parent' | 'teacher';
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: ServiceMessage[];
}

const AdminCustomerService: React.FC = () => {
  const [serviceChats, setServiceChats] = useState<CustomerServiceChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<CustomerServiceChat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // 加载所有客服对话
  useEffect(() => {
    loadServiceChats();
  }, []);

  const loadServiceChats = () => {
    setLoading(true);
    
    try {
      const allServiceMessages = JSON.parse(localStorage.getItem('customerServiceMessages') || '{}');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      const chats: CustomerServiceChat[] = [];
      
      Object.entries(allServiceMessages).forEach(([chatId, messages]: [string, any]) => {
        if (chatId.startsWith('customer_service_')) {
          const userId = chatId.replace('customer_service_', '');
          const user = users.find((u: any) => u.id === userId);
          
          if (user) {
            const lastMessage = messages[messages.length - 1];
            const unreadCount = messages.filter((m: ServiceMessage) => 
              m.senderRole !== 'customer_service' && !m.isRead
            ).length;
            
            chats.push({
              chatId,
              userId,
              userRole: user.role,
              userName: user.name || `${user.role === 'parent' ? '家长' : '老师'}用户`,
              lastMessage: lastMessage?.content || '暂无消息',
              lastMessageTime: lastMessage?.createdAt || new Date(),
              unreadCount,
              messages: messages || []
            });
          }
        }
      });
      
      // 按最后消息时间排序
      chats.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      
      setServiceChats(chats);
      
      // 默认选中第一个对话
      if (chats.length > 0 && !activeChatId) {
        setActiveChatId(chats[0].chatId);
        setActiveChat(chats[0]);
      }
      
    } catch (error) {
      console.error('加载客服对话失败:', error);
      toast.error('加载客服对话失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择对话
  const handleChatSelection = (chatId: string) => {
    const chat = serviceChats.find(c => c.chatId === chatId);
    if (chat) {
      setActiveChatId(chatId);
      setActiveChat(chat);
      
      // 标记消息为已读
      markMessagesAsRead(chatId);
    }
  };

  // 标记消息为已读
  const markMessagesAsRead = (chatId: string) => {
    const allServiceMessages = JSON.parse(localStorage.getItem('customerServiceMessages') || '{}');
    const chatMessages = allServiceMessages[chatId] || [];
    
    // 标记用户消息为已读
    const updatedMessages = chatMessages.map((msg: ServiceMessage) => ({
      ...msg,
      isRead: msg.senderRole !== 'customer_service' ? true : msg.isRead
    }));
    
    allServiceMessages[chatId] = updatedMessages;
    localStorage.setItem('customerServiceMessages', JSON.stringify(allServiceMessages));
    
    // 更新本地状态
    setServiceChats(prev => prev.map(chat => 
      chat.chatId === chatId 
        ? { ...chat, unreadCount: 0, messages: updatedMessages }
        : chat
    ));
    
    if (activeChat?.chatId === chatId) {
      setActiveChat(prev => prev ? { ...prev, unreadCount: 0, messages: updatedMessages } : null);
    }
  };

  // 发送客服消息
  const handleSendMessage = () => {
    if (!activeChat || !newMessage.trim()) return;

    const serviceMessage: ServiceMessage = {
      id: `service-${Date.now()}`,
      senderId: 'customer_service',
      senderRole: 'customer_service',
      senderName: '客服小助手',
      content: newMessage.trim(),
      createdAt: new Date(),
      isRead: false
    };

    // 保存消息
    const allServiceMessages = JSON.parse(localStorage.getItem('customerServiceMessages') || '{}');
    const chatMessages = allServiceMessages[activeChat.chatId] || [];
    chatMessages.push(serviceMessage);
    allServiceMessages[activeChat.chatId] = chatMessages;
    localStorage.setItem('customerServiceMessages', JSON.stringify(allServiceMessages));

    // 更新本地状态
    const updatedChat = {
      ...activeChat,
      messages: chatMessages,
      lastMessage: newMessage.trim(),
      lastMessageTime: new Date()
    };
    
    setActiveChat(updatedChat);
    setServiceChats(prev => prev.map(chat => 
      chat.chatId === activeChat.chatId ? updatedChat : chat
    ));
    
    setNewMessage('');
    toast.success('消息发送成功');
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return new Date(date).toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return new Date(date).toLocaleDateString('zh-CN');
    }
  };

  // 获取用户角色显示名称
  const getRoleDisplayName = (role: string) => {
    return role === 'parent' ? '家长' : '老师';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载客服对话中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">客服消息中心</h2>
          <p className="text-gray-600 mt-1">
            管理所有家长和老师的客服咨询对话
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            总对话数：<span className="font-semibold text-blue-600">{serviceChats.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            未读消息：<span className="font-semibold text-red-600">
              {serviceChats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-300px)]">
          {/* 对话列表 */}
          <div className="lg:col-span-1 border-r border-gray-200">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-medium text-gray-800">客服对话列表</h3>
            </div>
            <div className="overflow-y-auto h-full">
              {serviceChats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <i className="fa-solid fa-comments text-4xl mb-4"></i>
                  <p>暂无客服对话</p>
                </div>
              ) : (
                serviceChats.map((chat) => (
                  <div
                    key={chat.chatId}
                    onClick={() => handleChatSelection(chat.chatId)}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                      activeChatId === chat.chatId ? "bg-blue-50 border-blue-200" : ""
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800 truncate">
                            {chat.userName}
                          </span>
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            chat.userRole === 'parent' 
                              ? "bg-green-100 text-green-800" 
                              : "bg-blue-100 text-blue-800"
                          )}>
                            {getRoleDisplayName(chat.userRole)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {chat.lastMessage}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(chat.lastMessageTime)}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="ml-2">
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] inline-flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 聊天界面 */}
          <div className="lg:col-span-3">
            {activeChat ? (
              <div className="h-full flex flex-col">
                {/* 聊天头部 */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
                        activeChat.userRole === 'parent' ? "bg-green-500" : "bg-blue-500"
                      )}>
                        {activeChat.userName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {activeChat.userName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getRoleDisplayName(activeChat.userRole)} · 用户ID: {activeChat.userId}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      对话开始于 {formatTime(activeChat.messages[0]?.createdAt || new Date())}
                    </div>
                  </div>
                </div>

                {/* 消息区域 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {activeChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.senderRole === 'customer_service' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs px-4 py-2 rounded-lg",
                          message.senderRole === 'customer_service'
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200 text-gray-800"
                        )}
                      >
                        <div className="text-xs opacity-75 mb-1">
                          {message.senderName}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-75 mt-1 text-right">
                          {message.createdAt.toLocaleTimeString('zh-CN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="p-4 border-t bg-white">
                  <div className="flex space-x-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入客服回复消息..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors self-end"
                    >
                      发送回复
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    按 Enter 发送，Shift + Enter 换行
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fa-solid fa-comments text-4xl mb-4"></i>
                  <p>请选择一个对话开始聊天</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerService;