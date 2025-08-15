import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ParentDashboard from "@/pages/ParentDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import AdminTasks from "@/pages/admin/Tasks";
import AdminSettlements from "@/pages/admin/Settlements";
import TeacherList from "@/pages/parent/TeacherList";
import TaskPublish from "@/pages/parent/TaskPublish";
import Payment from "@/pages/parent/Payment";
import ParentMessages from "@/pages/parent/Messages";
import ParentTasks from "@/pages/parent/Tasks";
import ParentTaskDetail from "@/pages/parent/TaskDetail";
import ParentTaskEdit from "@/pages/parent/TaskEdit";
import TasksTrash from "@/pages/parent/TasksTrash";
import ParentVerification from "@/pages/parent/Verification";
import TeacherMessages from "@/pages/teacher/Messages";
import TeacherTasks from "@/pages/teacher/Tasks";
import TeacherProfile from "@/pages/teacher/Profile";
import TeacherVerification from "@/pages/teacher/Verification";
import { useState, useEffect } from "react";
import { AuthContext } from '@/contexts/authContext';
import Navbar from "@/components/Navbar";
import { getLocalStorageItem } from "@/lib/utils";

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
          <Routes>
            <Route path="/" element={<Home />} />
             <Route path="/login" element={authState.isAuthenticated ? 
              <Navigate to={
                 authState.userRole === 'parent' ? '/parent' : 
                 authState.userRole === 'teacher' ? '/teacher' : 
                 authState.userRole === 'admin' ? '/admin' : '/'
              } replace /> : <Login />} />
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
               <Route index element={<Navigate to="/admin/tasks" replace />} />
             </Route>
            <Route path="*" element={<div className="text-center text-xl py-10">页面未找到</div>} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}
