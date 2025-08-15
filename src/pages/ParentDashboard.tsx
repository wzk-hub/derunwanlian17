import { useContext, useState, useEffect } from 'react';
import { Link, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';
import CustomerServiceChatComponent from '@/components/CustomerServiceChat';
import CustomerServiceNotification from '@/components/CustomerServiceNotification';

// 家长仪表盘主页组件
const ParentDashboard = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('teachers');
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  
  // 获取当前用户信息
  useEffect(() => {
    if (!userId) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.id === userId);
    
    if (currentUser && currentUser.role === 'parent') {
      setUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [userId, navigate]);
  
  // 生成欢迎信息
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {user ? `${getWelcomeMessage()}，${user.name || '家长用户'}` : '家长中心'}
          </h1>
          <p className="text-gray-500 mt-1">
            欢迎使用德润万联教育平台，找到最适合您孩子的老师
          </p>
        </div>
        
        {/* 家长功能导航 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-1 flex overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('teachers');
                navigate('/parent/teachers');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'teachers' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-user-graduate mr-2"></i>
               老师列表
            </button>
            <button
              onClick={() => {
                setActiveTab('tasks');
                navigate('/parent/tasks');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'tasks' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-tasks mr-2"></i>
              我的任务
            </button>
            <button
              onClick={() => {
                setActiveTab('publish');
                navigate('/parent/tasks/new');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'publish' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-plus-circle mr-2"></i>
              发布任务
            </button>
             <button
              onClick={() => {
                setActiveTab('profile');
                navigate('/parent/profile');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'profile' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-comments mr-2"></i>
              消息中心
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                navigate('/parent/profile');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'profile' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-user mr-2"></i>
              个人中心
            </button>
          </div>
        </div>
        
        {/* 子路由内容 */}
        <div className="bg-white rounded-xl shadow-md p-6 min-h-[500px]">
          <Outlet />
        </div>
      </div>

      {/* 客服通知组件 */}
      <CustomerServiceNotification onOpenChat={() => setIsCustomerServiceOpen(true)} />

      {/* 客服入口按钮 */}
      <button
        onClick={() => setIsCustomerServiceOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-40"
        title="联系客服"
      >
        <i className="fa-solid fa-headset text-xl"></i>
      </button>

      {/* 客服对话组件 */}
      <CustomerServiceChatComponent
        isOpen={isCustomerServiceOpen}
        onClose={() => setIsCustomerServiceOpen(false)}
      />
    </div>
  );
};

export default ParentDashboard;