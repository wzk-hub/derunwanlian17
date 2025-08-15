import { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// 支付页面组件
const Payment = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  // 收款二维码图片地址（用户提供）
  const paymentQRCodes = {
    alipay: "https://lf-code-agent.coze.cn/obj/x-ai-cn/269511283202/attachment/02e6c4502965b0048a69be9d5ea31f66_20250812165429.jpg",
    wechat: "https://lf-code-agent.coze.cn/obj/x-ai-cn/269511283202/attachment/674be7728981bf3bc90c58d61c4e7c5c_20250812165429.jpg"
  };
  
  // 获取任务详情
  useEffect(() => {
    const fetchTaskDetails = () => {
      if (!taskId || !userId) {
        navigate('/parent');
        return;
      }
      
      setLoading(true);
      
      // 从localStorage获取任务数据
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const currentTask = tasks.find((t: any) => t.id === taskId && t.publisherId === userId);
      
      if (!currentTask) {
        toast.error('未找到该任务');
        navigate('/parent');
        return;
      }
      
      // 检查任务状态
      if (currentTask.status !== 'approved') {
        toast.error('该任务尚未通过审核或不处于待支付状态');
        navigate('/parent');
        return;
      }
      
      setTask(currentTask);
      setLoading(false);
    };
    
    fetchTaskDetails();
  }, [taskId, userId, navigate]);
  
  // 处理支付完成确认
  const handlePaymentConfirm = () => {
    if (!taskId) return;
    
    // 更新任务支付状态
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = tasks.map((t: any) => {
      if (t.id === taskId) {
          return {
            ...t,
            status: 'payment_pending',
            paymentMethod,
            paidAt: new Date(),
            updatedAt: new Date(),
            paymentTransactionId: `TRX-${Date.now()}`
          };
      }
      return t;
    });
    
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setPaymentCompleted(true);
    
    toast.success('支付确认成功！');
    
    // 2秒后返回任务列表
    setTimeout(() => {
      navigate('/parent/tasks');
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载支付信息中...</p>
        </div>
      </div>
    );
  }
  
  if (!task) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <button 
          onClick={() => navigate('/parent/tasks')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <i class="fa-solid fa-arrow-left mr-2"></i>
          <span>返回任务列表</span>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800">课时费支付</h2>
        <p className="text-gray-500 mt-1">
          请完成以下课时费用支付，支持支付宝和微信支付
        </p>
      </div>
      
      {/* 任务信息卡片 */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-medium text-gray-800 mb-3">任务信息</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">任务标题：</span>
            <span className="font-medium">{task.title}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">辅导科目：</span>
            <span>{getSubjectName(task.subject)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">辅导年级：</span>
            <span>{getGradeName(task.grade)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">课时数量：</span>
            <span>{task.duration}小时</span>
          </div>
          
          <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between items-center">
            <span className="text-gray-800 font-medium">总费用：</span>
            <span className="text-xl font-bold text-red-600">¥{task.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* 支付方式选择 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">选择支付方式</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div 
            onClick={() => setPaymentMethod('alipay')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              paymentMethod === 'alipay' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentMethod === 'alipay' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <i class="fa-brands fa-alipay text-blue-600 text-xl"></i>
              </div>
              <div className="ml-3">
                <h4 className="font-medium">支付宝支付</h4>
                <p className="text-sm text-gray-500">推荐使用支付宝扫码支付</p>
              </div>
              <div className="ml-auto">
                <i className={`fa-solid ${
                  paymentMethod === 'alipay' ? 'fa-check-circle text-blue-600' : 'fa-circle text-gray-300'
                }`}></i>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setPaymentMethod('wechat')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              paymentMethod === 'wechat' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentMethod === 'wechat' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <i class="fa-brands fa-weixin text-green-600 text-xl"></i>
              </div>
              <div className="ml-3">
                <h4 className="font-medium">微信支付</h4>
                <p className="text-sm text-gray-500">推荐使用微信扫码支付</p>
              </div>
              <div className="ml-auto">
                <i className={`fa-solid ${
                  paymentMethod === 'wechat' ? 'fa-check-circle text-green-600' : 'fa-circle text-gray-300'
                }`}></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* 支付二维码 */}
        <div className="flex flex-col items-center py-6">
          <h4 className="text-lg font-medium mb-4">
            {paymentMethod === 'alipay' ? '支付宝扫码支付' : '微信扫码支付'}
          </h4>
          
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 max-w-xs w-full">
            <img 
              src={paymentQRCodes[paymentMethod]} 
              alt={`${paymentMethod === 'alipay' ? '支付宝' : '微信'}收款码`}
              className="w-full h-auto rounded"
            />
          </div>
          
          <p className="text-gray-500 text-sm mt-4 text-center">
            请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫描上方二维码完成支付<br />
            支付金额：<span className="font-medium text-red-600">¥{task.price.toFixed(2)}</span>
          </p>
        </div>
        
        {/* 支付完成确认按钮 */}
        <div className="text-center">
          <button
            onClick={handlePaymentConfirm}
            disabled={paymentCompleted}
            className={`px-8 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              paymentCompleted
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {paymentCompleted ? (
              <div className="flex items-center justify-center">
                <i class="fa-solid fa-check-circle mr-2"></i>
                <span>支付已确认</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <i class="fa-solid fa-check mr-2"></i>
                <span>确认支付完成</span>
              </div>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            提示：完成支付后请点击上方按钮确认，以便老师及时开始教学任务
          </p>
        </div>
      </div>
    </div>
  );
};

// 辅助函数：获取科目名称
function getSubjectName(subjectValue: string): string {
  const subjectMap: Record<string, string> = {
    'math': '数学',
    'chinese': '语文',
    'english': '英语',
    'physics': '物理',
    'chemistry': '化学',
    'biology': '生物',
    'history': '历史',
    'geography': '地理',
    'politics': '政治'
  };
  
  return subjectMap[subjectValue] || subjectValue;
}

// 辅助函数：获取年级名称
function getGradeName(gradeValue: string): string {
  const gradeMap: Record<string, string> = {
    '1': '一年级',
    '2': '二年级',
    '3': '三年级',
    '4': '四年级',
    '5': '五年级',
    '6': '六年级',
    '7': '初一',
    '8': '初二',
    '9': '初三',
    '10': '高一',
    '11': '高二',
    '12': '高三'
  };
  
  return gradeMap[gradeValue] || gradeValue;
}

export default Payment;