import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TaskForm from '@/components/TaskForm';
import { CreateTaskRequest, Task, TaskStatus } from '@/models/Task';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';

export default function TaskPublish() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<CreateTaskRequest>>({});
  
  // 解析URL参数获取老师ID
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const teacherId = searchParams.get('teacherId');
    
    if (teacherId) {
      setInitialData(prev => ({ ...prev, teacherId }));
    }
    
    // 获取当前用户信息，特别是孩子年级
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.id === userId);
    
    if (currentUser && currentUser.childGrade) {
      setInitialData(prev => ({ ...prev, grade: currentUser.childGrade }));
    }
  }, [userId, location.search]);
  
  // 处理任务提交
  const handleTaskSubmit = (taskData: CreateTaskRequest) => {
    setIsSubmitting(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      try {
        // 获取现有任务
        const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
        // 创建新任务
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...taskData,
          status: 'pending',
          publisherId: userId!,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 如果已选择老师，直接跳转到支付页面
        if (taskData.teacherId) {
          existingTasks.push(newTask);
          localStorage.setItem('tasks', JSON.stringify(existingTasks));
          toast.success('任务创建成功，正在跳转到支付页面');
          navigate(`/parent/payment/${newTask.id}`);
          return;
        }
        
        // 保存新任务
        existingTasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(existingTasks));
        
        toast.success('任务发布成功，等待管理员审核');
        navigate('/parent/tasks');
      } catch (error) {
        console.error('发布任务失败:', error);
        toast.error('发布任务失败，请稍后重试');
      } finally {
        setIsSubmitting(false);
      }
    }, 1200);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">发布教学任务</h2>
        <p className="text-gray-500 mt-1">
          填写以下信息发布教学任务需求，我们将帮助您找到合适的老师
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <TaskForm 
          initialData={initialData}
          onSubmit={handleTaskSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}