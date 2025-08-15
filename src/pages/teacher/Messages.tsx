import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import CustomerServiceButton from '@/components/CustomerServiceButton';

// 老师消息中心页面
const TeacherMessages = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chatGroups, setChatGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // 加载用户的群聊
  useEffect(() => {
    const loadChatGroups = () => {
      if (!userId) {
        navigate('/login');
        return;
      }

      setLoading(true);
      
      // 获取所有群聊
      const allChatGroups = JSON.parse(localStorage.getItem('chatGroups') || '{}');
      const groupsArray = Object.values(allChatGroups);
      
      // 筛选用户参与的群聊
      const userGroups = groupsArray.filter(group => 
        group.members.some(member => member.id === userId)
      );
      
      setChatGroups(userGroups);
      
      // 如果有群聊，默认选中第一个
      if (userGroups.length > 0) {
        setActiveChatId(userGroups[0].id);
        loadMessages(userGroups[0].id);
      }
      
      setLoading(false);
    };
    
    loadChatGroups();
  }, [userId, navigate]);
  
  // 加载特定群聊的消息
  const loadMessages = (chatId) => {
    const allMessages = JSON.parse(localStorage.getItem('messages') || '{}');
    setMessages(allMessages[chatId] || []);
  };
  
  // 切换群聊
  const handleChatSelection = (chatId) => {
    setActiveChatId(chatId);
    loadMessages(chatId);
  };
  
  // 发送消息
  const handleSendMessage = () => {
    if (!activeChatId || !newMessage.trim()) return;
    
    // 获取现有消息
    const allMessages = JSON.parse(localStorage.getItem('messages') || '{}');
    const chatMessages = allMessages[activeChatId] || [];
    
    // 创建新消息
    const message = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderRole: 'teacher',
      content: newMessage.trim(),
      createdAt: new Date()
    };
    
    // 添加并保存消息
    chatMessages.push(message);
    allMessages[activeChatId] = chatMessages;
    localStorage.setItem('messages', JSON.stringify(allMessages));
    
    // 更新UI
    setMessages(chatMessages);
    setNewMessage('');
  };
  
  // 获取群聊名称
  const getChatGroupName = (group) => {
    // 查找群聊中的家长
    const parentMember = group.members.find(m => m.role === 'parent');
    return parentMember ? `与${getUserName(parentMember.id)}的群聊` : group.taskTitle;
  };
  
  // 获取用户名
  const getUserName = (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    return user ? user.name || '未知用户' : '未知用户';
  };
  
  // 获取发送者名称
  const getSenderName = (senderId, senderRole) => {
    if (senderRole === 'admin') return '客服';
    if (senderId === userId) return '我';
    return getUserName(senderId);
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载消息中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <button 
          onClick={() => navigate('/teacher')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          <span>返回老师中心</span>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800">消息中心</h2>
        <p className="text-gray-500 mt-1">
          与家长和客服的群聊消息
        </p>
      </div>
      
      {chatGroups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <i class="fa-solid fa-comments text-2xl text-blue-400"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">暂无消息</h3>
          <p className="text-gray-500 mb-6">
            当家长选择您并完成支付后，将创建与家长和客服的群聊
          </p>
          <button
            onClick={() => navigate('/teacher/tasks')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <i class="fa-solid fa-briefcase mr-2"></i>查看任务
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 群聊列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-[calc(100vh-240px)] flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-800">群聊列表</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chatGroups.map(group => (
                  <div 
                    key={group.id}
                    onClick={() => handleChatSelection(group.id)}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                      activeChatId === group.id ? "bg-blue-50" : ""
                    )}
                  >
                    <h4 className="font-medium text-gray-800">{getChatGroupName(group)}</h4>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {group.taskTitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 聊天界面 */}
          <div className="lg:col-span-3">
            {activeChatId ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden h-[calc(100vh-240px)] flex flex-col">
                {/* 聊天头部 */}
                <div className="p-4 border-b flex items-center">
                  <i class="fa-solid fa-comments text-blue-600 mr-3"></i>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {getChatGroupName(chatGroups.find(g => g.id === activeChatId))}
                    </h3>
                    <p className="text-sm text-gray-500">
                      群成员：家长、老师、客服
                    </p>
                  </div>
                </div>
                
                {/* 聊天消息区域 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div 
                      key={message.id}
                      className={cn(
                        "flex items-start",
                        message.senderId === userId ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[70%] p-3 rounded-lg",
                        message.senderId === userId 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                      )}>
                        <div className={cn(
                          "text-xs mb-1",
                          message.senderId === userId ? "text-blue-200" : "text-gray-500"
                        )}>
                          {getSenderName(message.senderId, message.senderRole)}
                          <span className="ml-2">{formatDate(message.createdAt)}</span>
                        </div>
                       <p>
                         {message.content.replace(/\[收款二维码\].*\[\/收款二维码\]/g, (match) => {
                           // 老师可以看到自己的收款二维码
                           return match;
                         })}
                       </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 消息输入区域 */}
                <div className="p-4 border-t">
                  <div className="flex space-x-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="输入消息..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"rows={2}
                    ></textarea>
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shrink-0"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center h-[calc(100vh-240px)] flex flex-col items-center justify-center">
                <i class="fa-solid fa-hand-pointer text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-500">请从左侧选择一个群聊</h3>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 客服入口 */}
      <CustomerServiceButton />
    </div>
  );
};

export default TeacherMessages;