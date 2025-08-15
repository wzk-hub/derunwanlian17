import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TaskForm from '@/components/TaskForm';
import { CreateTaskRequest, Task } from '@/models/Task';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';

export default function TaskPublish() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<CreateTaskRequest>>({});
  const [teacherOptions, setTeacherOptions] = useState<Array<{ id: string; name?: string }>>([]);
  
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

    // 准备可选老师列表（从用户表中取老师角色）
    const teachers = users
      .filter((u: any) => u.role === 'teacher')
      .map((t: any) => ({ id: t.id, name: t.name }));
    setTeacherOptions(teachers);
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
        } as Task;
        
        // 保存新任务
        existingTasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(existingTasks));
        
        if (taskData.teacherId) {
          toast.success('任务创建成功，正在跳转到支付页面');
          navigate(`/parent/payment/${newTask.id}`);
          return;
        }
        
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
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">发布教学任务</h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
          为您的孩子找到最合适的老师！请详细填写学生信息、学习需求和辅导目标，我们将为您匹配专业的老师，提供个性化的教学服务。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <i className="fa-solid fa-check-circle text-green-500 mr-2"></i>
            <span>专业老师团队</span>
          </div>
          <div className="flex items-center">
            <i className="fa-solid fa-check-circle text-green-500 mr-2"></i>
            <span>个性化教学方案</span>
          </div>
          <div className="flex items-center">
            <i className="fa-solid fa-check-circle text-green-500 mr-2"></i>
            <span>全程质量保障</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <TaskForm 
          initialData={initialData}
          onSubmit={handleTaskSubmit}
          isSubmitting={isSubmitting}
          teachers={teacherOptions}
        />
      </div>
    </div>
  );
}