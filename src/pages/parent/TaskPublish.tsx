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
  const [showHelpModal, setShowHelpModal] = useState(false);
  
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">发布教学任务</h2>
          <p className="text-gray-500 mt-1">
            填写以下信息发布教学任务需求，我们将帮助您找到合适的老师
          </p>
        </div>
        
        {/* 帮助按钮 */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <i className="fa-solid fa-question-circle mr-2"></i>
          发布帮助
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <TaskForm 
          initialData={initialData}
          onSubmit={handleTaskSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
      
      {/* 客服联系信息 */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-headset text-blue-600"></i>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-800">需要帮助？</h3>
            <p className="text-gray-600 mt-1">
              如果您在发布任务过程中遇到任何问题，或者有特殊需求，请随时联系我们的客服团队
            </p>
            <div className="mt-3 flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <i className="fa-brands fa-weixin mr-2 text-green-600"></i>
                <span className="font-medium">微信客服：</span>
                <span className="ml-1">Beckham_k7</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('Beckham_k7');
                  toast.success('微信号已复制到剪贴板');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                复制微信号
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 帮助模态框 */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">任务发布帮助</h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-4 text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">📝 如何填写任务信息？</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>任务标题：简洁明了地描述您的需求</li>
                    <li>科目和年级：选择孩子需要辅导的科目和年级</li>
                    <li>任务描述：详细说明学习目标、难点、期望效果等</li>
                    <li>课时安排：根据孩子的时间安排合理设置</li>
                    <li>预算范围：设置合理的课时费用预算</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">💰 费用说明</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>课时费用：根据老师资质和科目难度定价</li>
                    <li>支付方式：支持微信、支付宝等多种支付方式</li>
                    <li>退款政策：如对老师不满意，可申请更换或退款</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">👨‍🏫 老师选择</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>系统推荐：根据您的需求智能推荐合适老师</li>
                    <li>自主选择：您也可以浏览老师列表自主选择</li>
                    <li>老师资质：所有老师都经过严格审核和认证</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">📞 联系客服</h4>
                  <p className="text-sm">
                    如有任何疑问或特殊需求，请添加微信客服：<span className="font-medium text-blue-600">Beckham_k7</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}