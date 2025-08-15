import { useContext, useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';

// 老师仪表盘主页组件
const TeacherDashboard = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // 获取当前用户信息
  useEffect(() => {
    if (!userId) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.id === userId);
    
    if (currentUser && currentUser.role === 'teacher') {
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
            {user ? `${getWelcomeMessage()}，${user.name || '老师用户'}` : '老师中心'}
          </h1>
          <p className="text-gray-500 mt-1">
            欢迎使用德润万联教育平台，展示您的专业能力，接收教学任务
          </p>
        </div>
        
        {/* 老师功能导航 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-1 flex overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('profile');
                navigate('/teacher/profile');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'profile' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-user mr-2"></i>
               我的资料
            </button>
             <button
              onClick={() => {
                setActiveTab('messages');
                navigate('/teacher/messages');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'messages' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-briefcase mr-2"></i>
              任务中心
            </button>
            <button
              onClick={() => {
                setActiveTab('messages');
                navigate('/teacher/messages');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'messages' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-comments mr-2"></i>
              消息中心
            </button>
            <button
              onClick={() => {
                setActiveTab('earnings');
                navigate('/teacher/earnings');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'earnings' 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i class="fa-solid fa-wallet mr-2"></i>
              收益管理
            </button>
          </div>
        </div>
        
        {/* 子路由内容 */}
        <div className="bg-white rounded-xl shadow-md p-6 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;