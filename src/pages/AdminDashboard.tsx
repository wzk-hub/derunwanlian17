import { useContext, useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';

// 辅助函数：获取用户名
const getUserName = (userId: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u: any) => u.id === userId);
  return user ? user.name || '未知用户' : '未知用户';
};

// 辅助函数：获取老师名
const getTeacherName = (teacherId: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const teacher = users.find((u: any) => u.id === teacherId);
  return teacher ? teacher.name || '未知老师' : '未知老师';
};

// 辅助函数：格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 管理员仪表盘主页组件
const AdminDashboard = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('statistics');
  const [stats, setStats] = useState({
    totalUsers: 0,
    parentUsers: 0,
    teacherUsers: 0,
    pendingTasks: 0,
    approvedTasks: 0,
    completedTasks: 0
  });
  
  // 处理支付确认
  const handlePaymentConfirmation = (taskId: string) => {
    if (!userId) return;
    
    // 获取任务数据
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    // 更新任务状态
    const updatedTask = {
      ...tasks[taskIndex],
      status: 'assigned',
      paymentConfirmedAt: new Date(),
      paymentConfirmedById: userId,
      updatedAt: new Date()
    };
    
    // 创建群聊
    const chatGroupId = `chat-${Date.now()}`;
    updatedTask.chatGroupId = chatGroupId;
    
    // 保存群聊信息
    const chatGroups = JSON.parse(localStorage.getItem('chatGroups') || '{}');
    chatGroups[chatGroupId] = {
      id: chatGroupId,
      taskId: updatedTask.id,
      taskTitle: updatedTask.title,
      members: [
        { id: updatedTask.publisherId, role: 'parent' },
        { id: updatedTask.teacherId, role: 'teacher' },
        { id: userId, role: 'admin' }
      ],
      createdAt: new Date()
    };
    localStorage.setItem('chatGroups', JSON.stringify(chatGroups));
    
    // 创建欢迎消息
    const messages = JSON.parse(localStorage.getItem('messages') || '{}');
    messages[chatGroupId] = [
      {
        id: `msg-${Date.now()}`,
        senderId: userId,
        senderRole: 'admin',
        content: `欢迎加入"${updatedTask.title}"的群聊，我是客服人员。家长已完成支付，老师可以开始准备教学了。`,
        createdAt: new Date()
      }
    ];
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // 更新任务
    tasks[taskIndex] = updatedTask;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // 通知老师
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notify-${Date.now()}`,
      type: 'task_assigned',
      title: '新任务指派',
      message: `您有一个新的教学任务：${updatedTask.title}`,
      relatedTaskId: updatedTask.id,
      relatedChatId: chatGroupId,
      createdAt: new Date(),
      isRead: false,
      targetUserId: updatedTask.teacherId
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // 刷新页面
    window.location.reload();
  };
  
  // 处理支付拒绝
  const handlePaymentRejection = (taskId: string) => {
    // 获取任务数据
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    // 更新任务状态
    const updatedTask = {
      ...tasks[taskIndex],
      status: 'payment_rejected',
      updatedAt: new Date(),
      rejectionReason: '支付未确认'
    };
    
    // 更新任务
    tasks[taskIndex] = updatedTask;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // 通知家长
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notify-${Date.now()}`,
      type: 'payment_rejected',
      title: '支付未确认',
      message: `您的任务"${updatedTask.title}"支付未通过确认，请联系客服`,
      relatedTaskId: updatedTask.id,
      createdAt: new Date(),
      isRead: false,
      targetUserId: updatedTask.publisherId
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // 刷新页面
    window.location.reload();
  };
  
  // 验证管理员身份并加载数据
  useEffect(() => {
    const verifyAdminAndLoadData = () => {
      if (!userId) {
        navigate('/login');
        return;
      }
      
      // 获取用户数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: any) => u.id === userId);
      
      if (!currentUser || currentUser.role !== 'admin') {
        navigate('/login');
        return;
      }
      
      setUser(currentUser);
      
      // 计算统计数据
      const parentUsers = users.filter((u: any) => u.role === 'parent').length;
      const teacherUsers = users.filter((u: any) => u.role === 'teacher').length;
      
      // 获取任务数据
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;
      const approvedTasks = tasks.filter((t: any) => t.status === 'approved').length;
      const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
      
      setStats({
        totalUsers: users.length,
        parentUsers,
        teacherUsers,
        pendingTasks,
        approvedTasks,
        completedTasks
      });
    };
    
    verifyAdminAndLoadData();
  }, [userId, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {user ? `管理员中心 - ${user.name || '系统管理员'}` : '管理员中心'}
          </h1>
          <p className="text-gray-500 mt-1">
            德润万联教育平台管理后台，管理用户、任务和系统设置
          </p>
        </div>
        
        {/* 管理员功能导航 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-1 flex overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('statistics');
                navigate('/admin/statistics');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'statistics' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-chart-bar mr-2"></i>
              数据统计
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                navigate('/admin/users');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'users' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-users mr-2"></i>
              用户管理
            </button>
            <button
              onClick={() => {
                setActiveTab('teachers');
                navigate('/admin/teachers');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'teachers' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-user-graduate mr-2"></i>
              老师管理
            </button>
            <button
              onClick={() => {
                setActiveTab('tasks');
                navigate('/admin/tasks');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'tasks' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-tasks mr-2"></i>
              任务审核
            </button>
            <button
              onClick={() => {
                setActiveTab('taskPublish');
                navigate('/admin/task-publish');
              }}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                activeTab === 'taskPublish' 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <i className="fa-solid fa-plus-circle mr-2"></i>
              发布任务
            </button>
                         <button
               onClick={() => {
                 setActiveTab('customerService');
                 navigate('/admin/customer-service');
               }}
               className={cn(
                 "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                 activeTab === 'customerService' 
                   ? "bg-indigo-600 text-white" 
                   : "text-gray-600 hover:bg-gray-100"
               )}
             >
               <i className="fa-solid fa-headset mr-2"></i>
               客服中心
             </button>
             <button
               onClick={() => {
                 setActiveTab('settings');
                 navigate('/admin/settings');
               }}
               className={cn(
                 "flex-1 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap",
                 activeTab === 'settings' 
                   ? "bg-indigo-600 text-white" 
                   : "text-gray-600 hover:bg-gray-100"
               )}
             >
               <i className="fa-solid fa-gear mr-2"></i>
               系统设置
             </button>
          </div>
        </div>
        
        {/* 数据概览卡片 */}
        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* 用户统计卡片 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">总用户数</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</h3>
                  <p className="text-green-500 text-sm mt-2 flex items-center">
                    <i className="fa-solid fa-arrow-up mr-1"></i>
                    <span>较上月增长 12%</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-users text-blue-600 text-xl"></i>
                </div>
              </div>
            </div>
            
            {/* 家长用户卡片 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">家长用户</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.parentUsers}</h3>
                  <p className="text-gray-500 text-sm mt-2">占总用户 {stats.totalUsers > 0 ? Math.round((stats.parentUsers / stats.totalUsers) * 100) : 0}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-user-friends text-green-600 text-xl"></i>
                </div>
              </div>
            </div>
            
            {/* 老师用户卡片 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">老师用户</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.teacherUsers}</h3>
                  <p className="text-gray-500 text-sm mt-2">占总用户 {stats.totalUsers > 0 ? Math.round((stats.teacherUsers / stats.totalUsers) * 100) : 0}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-user-graduate text-purple-600 text-xl"></i>
                </div>
              </div>
            </div>
            
            {/* 待审核任务卡片 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">待审核任务</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingTasks}</h3>
                  <p className="text-yellow-500 text-sm mt-2 flex items-center">
                    <i className="fa-solid fa-exclamation-circle mr-1"></i>
                    <span>需要及时处理</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-clock text-yellow-600 text-xl"></i>
                </div>
              </div>
            </div>
            
            {/* 已批准任务卡片 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">已批准任务</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.approvedTasks}</h3>
                  <p className="text-gray-500 text-sm mt-2">进行中的教学任务</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-teal-600 text-xl"></i>
                </div>
              </div>
            </div>
            
            {/* 已完成任务卡片 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">已完成任务</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.completedTasks}</h3>
                  <p className="text-gray-500 text-sm mt-2">历史完成的任务</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-flag-checkered text-gray-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 子路由内容 */}
        <div className="bg-white rounded-xl shadow-md p-6 min-h-[500px]">
          {activeTab !== 'statistics' && <Outlet />}
          
          {/* 默认显示统计信息 */}
          {activeTab === 'statistics' && (
            <div className="text-center py-12">
              <i className="fa-solid fa-chart-pie text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-medium text-gray-500">详细统计图表功能即将上线</h3>
              <p className="text-gray-400 mt-2">敬请期待更多数据分析功能</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;