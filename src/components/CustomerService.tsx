import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CustomerServiceProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'parent' | 'teacher';
  userId: string;
  userName?: string;
}

interface ServiceMessage {
  id: string;
  senderId: string;
  senderRole: 'parent' | 'teacher' | 'customer_service';
  senderName: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

const CustomerService: React.FC<CustomerServiceProps> = ({
  isOpen,
  onClose,
  userRole,
  userId,
  userName
}) => {
  const [messages, setMessages] = useState<ServiceMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = `customer_service_${userId}`;

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载客服对话历史
  useEffect(() => {
    if (isOpen) {
      loadServiceMessages();
    }
  }, [isOpen, chatId]);

  const loadServiceMessages = () => {
    const allServiceMessages = JSON.parse(localStorage.getItem('customerServiceMessages') || '{}');
    const chatMessages = allServiceMessages[chatId] || [];
    
    // 如果没有消息，创建欢迎消息
    if (chatMessages.length === 0) {
      const welcomeMessage: ServiceMessage = {
        id: `welcome-${Date.now()}`,
        senderId: 'customer_service',
        senderRole: 'customer_service',
        senderName: '客服小助手',
        content: `您好！我是客服小助手，很高兴为您服务。请问有什么可以帮助您的吗？

常见问题：
• 如何发布教学任务？
• 如何选择老师？
• 支付相关问题
• 平台使用指南
• 其他问题咨询

请直接输入您的问题，我会尽快为您解答。`,
        createdAt: new Date(),
        isRead: false
      };
      
      chatMessages.push(welcomeMessage);
      saveServiceMessages(chatMessages);
    }
    
    setMessages(chatMessages);
  };

  const saveServiceMessages = (chatMessages: ServiceMessage[]) => {
    const allServiceMessages = JSON.parse(localStorage.getItem('customerServiceMessages') || '{}');
    allServiceMessages[chatId] = chatMessages;
    localStorage.setItem('customerServiceMessages', JSON.stringify(allServiceMessages));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ServiceMessage = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderRole: userRole,
      senderName: userName || `${userRole === 'parent' ? '家长' : '老师'}用户`,
      content: newMessage.trim(),
      createdAt: new Date(),
      isRead: false
    };

    // 添加用户消息
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveServiceMessages(updatedMessages);
    setNewMessage('');

    // 显示客服正在输入状态
    setIsTyping(true);

    // 模拟客服回复延迟
    setTimeout(() => {
      const serviceReply = generateServiceReply(newMessage.trim());
      const serviceMessage: ServiceMessage = {
        id: `service-${Date.now()}`,
        senderId: 'customer_service',
        senderRole: 'customer_service',
        senderName: '客服小助手',
        content: serviceReply,
        createdAt: new Date(),
        isRead: false
      };

      const finalMessages = [...updatedMessages, serviceMessage];
      setMessages(finalMessages);
      saveServiceMessages(finalMessages);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3秒随机延迟
  };

  const generateServiceReply = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // 关键词匹配回复
    if (lowerMessage.includes('任务') || lowerMessage.includes('发布')) {
      return `关于发布教学任务，您可以按照以下步骤操作：

1. 进入"发布教学任务"页面
2. 填写学生信息和辅导需求
3. 选择科目和年级
4. 设置课时和价格
5. 选择老师（可选）
6. 提交并支付

如果遇到问题，请详细描述具体情况，我会进一步协助您。`;
    }
    
    if (lowerMessage.includes('老师') || lowerMessage.includes('选择')) {
      return `选择老师的方法：

1. 在老师列表中浏览老师信息
2. 查看老师的专业领域和评价
3. 可以直接联系老师咨询
4. 或在发布任务时指定老师

您也可以让系统为您推荐合适的老师。需要我帮您查看具体的老师信息吗？`;
    }
    
    if (lowerMessage.includes('支付') || lowerMessage.includes('付款')) {
      return `支付相关问题：

1. 支持微信支付和支付宝
2. 支付成功后等待管理员确认
3. 确认后即可开始教学服务
4. 如有支付问题，请提供订单号

您的支付遇到什么具体问题了吗？`;
    }
    
    if (lowerMessage.includes('价格') || lowerMessage.includes('费用')) {
      return `价格说明：

• 小学（1-6年级）：100元/小时
• 初中（7-9年级）：150元/小时  
• 高中（10-12年级）：200元/小时
• 总价 = 课时数 × 年级基础价格

价格会根据年级和课时自动计算，您可以在发布任务时查看具体价格。`;
    }
    
    if (lowerMessage.includes('联系') || lowerMessage.includes('电话')) {
      return `联系方式：

• 客服热线：400-123-4567
• 工作时间：周一至周日 9:00-21:00
• 在线客服：当前对话
• 邮箱：service@derunwanlian.com

您可以通过以上方式联系我们，我会尽快为您解决问题。`;
    }
    
    if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
      return `不客气！很高兴能帮助到您。

如果还有其他问题，随时可以咨询我。祝您使用愉快！ 😊`;
    }
    
    // 默认回复
    return `感谢您的咨询！我理解您的问题，让我为您提供帮助：

您提到的问题我会认真处理。如果我的回答没有完全解决您的问题，请详细说明一下，我会进一步协助您。

您也可以尝试：
• 查看平台使用指南
• 联系在线客服
• 拨打客服热线

请问还有其他需要帮助的吗？`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* 客服聊天头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <i className="fa-solid fa-headset text-xl"></i>
            </div>
            <div>
              <h3 className="font-semibold">客服小助手</h3>
              <p className="text-sm text-blue-100">在线为您服务</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.senderRole === 'customer_service' ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "max-w-xs px-4 py-2 rounded-lg",
                message.senderRole === 'customer_service'
                  ? "bg-white border border-gray-200 text-gray-800"
                  : "bg-blue-600 text-white"
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
        
        {/* 客服正在输入状态 */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="text-xs text-gray-500 mb-1">客服小助手</div>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">正在输入...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors self-end"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
};

export default CustomerService;