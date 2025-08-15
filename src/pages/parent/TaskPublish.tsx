import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TaskForm from '@/components/TaskForm';
import TaskPreview from '@/components/TaskPreview';
import { CreateTaskRequest, Task, TaskStatus } from '@/models/Task';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';

export default function TaskPublish() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [initialData, setInitialData] = useState<Partial<CreateTaskRequest>>({});
  const [teachers, setTeachers] = useState<Array<{ id: string; name?: string }>>([]);
  const [taskData, setTaskData] = useState<CreateTaskRequest | null>(null);
  
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
    
    // 获取老师列表
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const teacherUsers = allUsers.filter((user: any) => user.role === 'teacher');
    setTeachers(teacherUsers.map((teacher: any) => ({
      id: teacher.id,
      name: teacher.name || teacher.username
    })));
  }, [userId, location.search]);
  
  // 处理任务表单提交
  const handleTaskSubmit = (data: CreateTaskRequest) => {
    setTaskData(data);
    setShowPreview(true);
  };
  
  // 处理任务确认发布
  const handleTaskConfirm = () => {
    if (!taskData) return;
    
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
  
  // 返回编辑模式
  const handleBackToEdit = () => {
    setShowPreview(false);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">发布教学任务</h2>
        <p className="text-gray-500 mt-1">
          {showPreview 
            ? '请确认任务信息无误后发布' 
            : '填写以下信息发布教学任务需求，我们将帮助您找到合适的老师'
          }
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        {showPreview && taskData ? (
          <TaskPreview 
            taskData={taskData}
            onEdit={handleBackToEdit}
            onConfirm={handleTaskConfirm}
            isSubmitting={isSubmitting}
          />
        ) : (
          <TaskForm 
            initialData={initialData}
            onSubmit={handleTaskSubmit}
            isSubmitting={isSubmitting}
            teachers={teachers}
          />
        )}
      </div>
      
      {/* 发布指南 */}
      {!showPreview && (
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <i className="fa-solid fa-lightbulb mr-2"></i>
            发布指南
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• 请详细描述孩子的学习情况和辅导需求，帮助老师更好地了解学生</p>
            <p>• 填写学生简介时，可以包含孩子的学习特点、兴趣爱好等信息</p>
            <p>• 价格会根据年级自动计算，您也可以根据实际情况调整</p>
            <p>• 发布后任务将进入审核流程，审核通过后老师可查看并接单</p>
          </div>
        </div>
      )}
    </div>
  );
}