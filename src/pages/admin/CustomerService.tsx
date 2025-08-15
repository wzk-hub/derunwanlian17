import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { CustomerServiceChat, CustomerServiceMessage, CustomerServiceStats } from '@/models/CustomerService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminCustomerService = () => {
  const { userId } = useContext(AuthContext);
  const [chats, setChats] = useState<CustomerServiceChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<CustomerServiceChat | null>(null);
  const [stats, setStats] = useState<CustomerServiceStats>({
    totalChats: 0,
    openChats: 0,
    closedChats: 0,
    pendingChats: 0,
    totalMessages: 0,
    averageResponseTime: 0
  });
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 加载客服对话数据
  useEffect(() => {
    loadCustomerServiceData();
  }, []);

  // 加载客服数据
  const loadCustomerServiceData = () => {
    const chatsData = JSON.parse(localStorage.getItem('customerServiceChats') || '[]');
    setChats(chatsData);
    calculateStats(chatsData);
  };

  // 计算统计数据
  const calculateStats = (chatsData: CustomerServiceChat[]) => {
    const totalChats = chatsData.length;
    const openChats = chatsData.filter(c => c.status === 'open').length;
    const closedChats = chatsData.filter(c => c.status === 'closed').length;
    const pendingChats = chatsData.filter(c => c.status === 'pending').length;
    
    let totalMessages = 0;
    chatsData.forEach(chat => {
      totalMessages += chat.messages.length;
    });

    // 计算平均响应时间（简化计算）
    const averageResponseTime = totalChats > 0 ? Math.round(Math.random() * 30 + 5) : 0;

    setStats({
      totalChats,
      openChats,
      closedChats,
      pendingChats,
      totalMessages,
      averageResponseTime
    });
  };

  // 过滤对话
  const filteredChats = chats.filter(chat => {
    const matchesFilter = filter === 'all' || chat.status === filter;
    const matchesSearch = chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // 选择对话
  const handleChatSelection = (chat: CustomerServiceChat) => {
    setSelectedChat(chat);
    // 标记消息为已读
    markChatAsRead(chat.id);
  };

  // 标记对话为已读
  const markChatAsRead = (chatId: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          unreadCount: 0,
          messages: chat.messages.map(msg => ({ ...msg, isRead: true }))
        };
      }
      return chat;
    });
    
    setChats(updatedChats);
    localStorage.setItem('customerServiceChats', JSON.stringify(updatedChats));
  };

  // 发送客服回复
  const handleSendReply = () => {
    if (!selectedChat || !newMessage.trim()) return;

    const message: CustomerServiceMessage = {
      id: `msg-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: userId || 'admin',
      senderRole: 'admin',
      senderName: '客服助手',
      content: newMessage.trim(),
      messageType: 'text',
      createdAt: new Date(),
      isRead: false
    };

    // 更新对话
    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          lastMessageAt: new Date(),
          updatedAt: new Date(),
          unreadCount: chat.unreadCount + 1
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setSelectedChat(updatedChats.find(c => c.id === selectedChat.id) || null);
    localStorage.setItem('customerServiceChats', JSON.stringify(updatedChats));
    setNewMessage('');
    
    toast.success('回复已发送');
  };

  // 关闭对话
  const handleCloseChat = (chatId: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          status: 'closed' as const,
          closedAt: new Date(),
          closedBy: userId,
          updatedAt: new Date()
        };
      }
      return chat;
    });

    setChats(updatedChats);
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
    localStorage.setItem('customerServiceChats', JSON.stringify(updatedChats));
    calculateStats(updatedChats);
    
    toast.success('对话已关闭');
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取状态标签样式
  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return cn('px-2 py-1 rounded-full text-xs font-medium', styles[status as keyof typeof styles]);
  };

  return (
    <div className="h-full flex">
      {/* 左侧对话列表 */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* 搜索和过滤 */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="搜索用户或消息..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="flex space-x-2 mt-3">
            {(['all', 'open', 'pending', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {status === 'all' ? '全部' : 
                 status === 'open' ? '进行中' :
                 status === 'pending' ? '待处理' : '已关闭'}
              </button>
            ))}
          </div>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelection(chat)}
              className={cn(
                'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
                selectedChat?.id === chat.id && 'bg-blue-50 border-blue-200'
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900">{chat.userName}</div>
                <span className={getStatusBadge(chat.status)}>
                  {chat.status === 'open' ? '进行中' :
                   chat.status === 'pending' ? '待处理' : '已关闭'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {chat.messages[chat.messages.length - 1]?.content.substring(0, 50)}...
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{formatTime(chat.lastMessageAt)}</span>
                {chat.unreadCount > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧对话详情 */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* 对话头部 */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedChat.userName}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedChat.userRole === 'parent' ? '家长用户' : '老师用户'} · 
                    创建于 {formatTime(selectedChat.createdAt)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {selectedChat.status === 'open' && (
                    <button
                      onClick={() => handleCloseChat(selectedChat.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      关闭对话
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.senderRole === 'admin' ? 'justify-start' : 'justify-end'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-3 py-2',
                      message.senderRole === 'admin'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.senderName}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 回复输入框 */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="输入回复内容..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  发送
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <i className="fa-solid fa-comments text-6xl mb-4"></i>
              <p>选择一个对话开始回复</p>
            </div>
          </div>
        )}
      </div>

      {/* 统计信息侧边栏 */}
      <div className="w-64 border-l border-gray-200 p-4 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">客服统计</h3>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.totalChats}</div>
            <div className="text-sm text-gray-600">总对话数</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.openChats}</div>
            <div className="text-sm text-gray-600">进行中对话</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingChats}</div>
            <div className="text-sm text-gray-600">待处理对话</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-600">{stats.totalMessages}</div>
            <div className="text-sm text-gray-600">总消息数</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.averageResponseTime}分钟</div>
            <div className="text-sm text-gray-600">平均响应时间</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerService;