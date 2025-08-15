import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { CustomerServiceChat, CustomerServiceMessage } from '@/models/CustomerService';
import { toast } from 'sonner';

interface CustomerServiceChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomerServiceChatComponent: React.FC<CustomerServiceChatProps> = ({ isOpen, onClose }) => {
  const auth = useContext(AuthContext);
  const { userId, userRole, userName } = auth;
  const [chat, setChat] = useState<CustomerServiceChat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadOrCreateChat();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // 加载或创建客服对话
  const loadOrCreateChat = () => {
    if (!userId || !userRole) return;

    const chats = JSON.parse(localStorage.getItem('customerServiceChats') || '[]');
    let existingChat = chats.find((c: CustomerServiceChat) => 
      c.userId === userId && c.status !== 'closed'
    );

    if (!existingChat) {
      // 创建新的客服对话
      const chatId = `cs-${Date.now()}`;
      const newChat: CustomerServiceChat = {
        id: chatId,
        userId,
        userRole: userRole as 'parent' | 'teacher',
        userName: userName || '未知用户',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        unreadCount: 0,
        messages: [{
          id: `msg-${Date.now()}`,
          chatId: chatId,
          senderId: 'system',
          senderRole: 'admin',
          senderName: '客服助手',
          content: `您好！欢迎使用德润万联教育平台客服系统。我是您的专属客服助手，有什么可以帮助您的吗？`,
          messageType: 'text',
          createdAt: new Date(),
          isRead: true
        }]
      };

      chats.push(newChat);
      localStorage.setItem('customerServiceChats', JSON.stringify(chats));
      existingChat = newChat;
    }

    setChat(existingChat);
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!chat || !newMessage.trim() || !userId) return;

    setLoading(true);

    try {
      const message: CustomerServiceMessage = {
        id: `msg-${Date.now()}`,
        chatId: chat.id,
        senderId: userId,
        senderRole: userRole as 'parent' | 'teacher',
        senderName: userName || '未知用户',
        content: newMessage.trim(),
        messageType: 'text',
        createdAt: new Date(),
        isRead: false
      };

      // 更新本地存储
      const chats = JSON.parse(localStorage.getItem('customerServiceChats') || '[]');
      const chatIndex = chats.findIndex((c: CustomerServiceChat) => c.id === chat.id);
      
      if (chatIndex !== -1) {
        chats[chatIndex].messages.push(message);
        chats[chatIndex].lastMessageAt = new Date();
        chats[chatIndex].updatedAt = new Date();
        chats[chatIndex].unreadCount = 0; // 用户发送消息后重置未读数
        
        localStorage.setItem('customerServiceChats', JSON.stringify(chats));
        
        // 更新状态
        setChat(chats[chatIndex]);
        setNewMessage('');
        
        toast.success('消息已发送');
      }
    } catch (error) {
      toast.error('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (today.toDateString() === messageDate.toDateString()) {
      return '今天';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) {
      return '昨天';
    }
    
    return messageDate.toLocaleDateString('zh-CN');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* 头部 */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <i className="fa-solid fa-headset mr-2"></i>
          <span className="font-medium">客服助手</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.senderId === userId
                  ? 'bg-blue-600 text-white'
                  : message.senderRole === 'admin'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.senderName}
              </div>
              <div className="text-sm">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.senderId === userId ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.createdAt)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="请输入您的问题..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
          </button>
        </div>
        
        {/* 快捷回复 */}
        <div className="mt-2 flex flex-wrap gap-2">
          {['如何发布任务？', '如何联系老师？', '支付问题', '其他问题'].map((text) => (
            <button
              key={text}
              onClick={() => setNewMessage(text)}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceChatComponent;