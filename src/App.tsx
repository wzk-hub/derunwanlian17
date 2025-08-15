import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import { Suspense, lazy, useState, useEffect } from "react";
import { AuthContext } from '@/contexts/authContext';
import Navbar from "@/components/Navbar";
import { getLocalStorageItem } from "@/lib/utils";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { cleanupDuplicateAccounts, validateAdminAccount } from "@/utils/adminAccountCleanup";

const ParentDashboard = lazy(() => import("@/pages/ParentDashboard"));
const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const AdminTasks = lazy(() => import("@/pages/admin/Tasks"));
const AdminSettlements = lazy(() => import("@/pages/admin/Settlements"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const TeacherList = lazy(() => import("@/pages/parent/TeacherList"));
const TaskPublish = lazy(() => import("@/pages/parent/TaskPublish"));
const Payment = lazy(() => import("@/pages/parent/Payment"));
const ParentMessages = lazy(() => import("@/pages/parent/Messages"));
const ParentTasks = lazy(() => import("@/pages/parent/Tasks"));
const ParentTaskDetail = lazy(() => import("@/pages/parent/TaskDetail"));
const ParentTaskEdit = lazy(() => import("@/pages/parent/TaskEdit"));
const TasksTrash = lazy(() => import("@/pages/parent/TasksTrash"));
const ParentVerification = lazy(() => import("@/pages/parent/Verification"));
const TeacherMessages = lazy(() => import("@/pages/teacher/Messages"));
const TeacherTasks = lazy(() => import("@/pages/teacher/Tasks"));
const TeacherProfile = lazy(() => import("@/pages/teacher/Profile"));
const TeacherVerification = lazy(() => import("@/pages/teacher/Verification"));

export default function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userRole: null as string | null,
    userId: null as string | null,
    userName: null as string | null
  });

  // 初始化时从本地存储恢复认证状态
  useEffect(() => {
    const currentUser = getLocalStorageItem<any>('currentUser');
    if (currentUser) {
      setAuthState({
        isAuthenticated: true,
        userRole: currentUser.role,
        userId: currentUser.id,
        userName: currentUser.name
      });
    }
  }, []);

  // 确保管理员账号存在（防止首次未访问登录页导致未初始化）
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 使用专门的清理工具
    const result = cleanupDuplicateAccounts('15931319952');
    
    if (result.success) {
      console.log('管理员账号清理完成:', result.message);
    } else {
      console.error('管理员账号清理失败:', result.message);
    }
    
    // 验证管理员账号状态
    const validation = validateAdminAccount();
    if (!validation.isValid) {
      console.warn('管理员账号状态异常:', validation.message);
    }
  }, []);

  const setAuth = (userId: string, role: string, name?: string) => {
    setAuthState({
      isAuthenticated: true,
      userRole: role,
      userId,
      userName: name || null
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userName: null
    });
    localStorage.removeItem('currentUser');
  };

  const clearAuth = () => {
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userName: null
    });
  };

  // 保护路由组件
  const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: string }) => {
     if (!authState.isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
    }
    
     if (requiredRole && authState.userRole !== requiredRole) {
      // 根据用户角色重定向到相应的仪表盘
      const defaultPaths = {
        parent: '/parent/teachers',
        teacher: '/teacher/profile',
        admin: '/admin/statistics'
      };
      
        const defaultPath = defaultPaths[authState.userRole as keyof typeof defaultPaths] || '/';
      return <Navigate to={defaultPath} replace />;
    }
    
    return children;
  };

  const Fallback = (
    <div className="w-full py-16 flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mr-3"></div>
      <span className="text-gray-600">页面加载中...</span>
    </div>
  );

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated: authState.isAuthenticated, 
        userRole: authState.userRole, 
        userId: authState.userId,
        userName: authState.userName,
        setAuth,
        logout,
        clearAuth
      }}
    >
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={Fallback}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={authState.isAuthenticated ? 
                <Navigate to={
                   authState.userRole === 'parent' ? '/parent' : 
                   authState.userRole === 'teacher' ? '/teacher' : 
                   authState.userRole === 'admin' ? '/admin' : '/'
                } replace /> : <Login />} />
             <Route path="/forgot" element={<ForgotPassword />} />
               <Route path="/parent/*" element={
                 <ProtectedRoute requiredRole="parent">
                   <ParentDashboard />
                 </ProtectedRoute>
               }>
                    <Route path="teachers" element={<TeacherList />} />
                    <Route path="tasks" element={<ParentTasks />} />
                    <Route path="tasks/:taskId" element={<ParentTaskDetail />} />
                    <Route path="tasks/:taskId/edit" element={<ParentTaskEdit />} />
                     <Route path="tasks/new" element={<TaskPublish />} />
                    <Route path="tasks/trash" element={<TasksTrash />} />
                   <Route path="payment/:taskId" element={<Payment />} />
                   <Route path="messages" element={<ParentMessages />} />
                   <Route path="verification" element={<ParentVerification />} />
                   <Route index element={<Navigate to="/parent/teachers" replace />} />
                 </Route>
               <Route path="/teacher/*" element={
                 <ProtectedRoute requiredRole="teacher">
                   <TeacherDashboard />
                 </ProtectedRoute>
               }>
                   <Route path="profile" element={<TeacherProfile />} />
                   <Route path="tasks" element={<TeacherTasks />} />
                   <Route path="verification" element={<TeacherVerification />} />
                   <Route path="messages" element={<TeacherMessages />} />
                 <Route index element={<Navigate to="/teacher/profile" replace />} />
               </Route>
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route path="tasks" element={<AdminTasks />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settlements" element={<AdminSettlements />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route index element={<Navigate to="/admin/tasks" replace />} />
              </Route>
              <Route path="*" element={<div className="text-center text-xl py-10">页面未找到</div>} />
            </Routes>
          </Suspense>
        </main>
        
        {/* 性能监控组件 */}
        <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
      </div>
    </AuthContext.Provider>
  );
}
