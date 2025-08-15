import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { Task, TaskStatus } from '@/models/Task';
import { toast } from 'sonner';

// 任务状态映射
const statusMap: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待审核', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  approved: { label: '已审核', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: '已拒绝', color: 'text-red-700', bgColor: 'bg-red-100' },
  payment_pending: { label: '待支付', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  paid: { label: '已支付', color: 'text-green-700', bgColor: 'bg-green-100' },
  assigned: { label: '已分配', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  in_progress: { label: '进行中', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  completed: { label: '已完成', color: 'text-green-700', bgColor: 'bg-green-100' },
  settled: { label: '已结算', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

// 科目名称映射
const subjectNames: Record<string, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  physics: '物理',
  chemistry: '化学',
  biology: '生物',
  history: '历史',
  geography: '地理',
  politics: '政治',
};

// 年级名称映射
const gradeNames: Record<string, string> = {
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
  '12': '高三',
};

export default function Tasks() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    try {
      const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const userTasks = allTasks.filter((task: Task) => task.publisherId === userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('加载任务失败:', error);
      toast.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const handleStatusFilter = (status: TaskStatus | 'all') => {
    setFilter(status);
  };

  const handleViewTask = (taskId: string) => {
    // 这里可以导航到任务详情页面
    toast.info('任务详情功能开发中');
  };

  const handleEditTask = (taskId: string) => {
    // 只有待审核状态的任务可以编辑
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status === 'pending') {
      navigate(`/parent/task-edit/${taskId}`);
    } else {
      toast.error('只有待审核状态的任务可以编辑');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      try {
        const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const updatedTasks = allTasks.filter((task: Task) => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        setTasks(updatedTasks.filter((task: Task) => task.publisherId === userId));
        toast.success('任务删除成功');
      } catch (error) {
        console.error('删除任务失败:', error);
        toast.error('删除任务失败');
      }
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">我的任务</h2>
          <p className="text-gray-500 mt-1">管理您发布的教学任务</p>
        </div>
        <button
          onClick={() => navigate('/parent/tasks/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          发布新任务
        </button>
      </div>

      {/* 状态筛选 */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部 ({tasks.length})
          </button>
          {Object.entries(statusMap).map(([status, { label }]) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status as TaskStatus)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label} ({tasks.filter(t => t.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* 任务列表 */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <i className="fa-solid fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {filter === 'all' ? '暂无任务' : `暂无${statusMap[filter as TaskStatus]?.label}的任务`}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? '发布您的第一个教学任务，开始寻找合适的老师' 
              : '当前没有该状态的任务'
            }
          </p>
          {filter === 'all' && (
                         <button
               onClick={() => navigate('/parent/tasks/new')}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
             >
               发布任务
             </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[task.status].bgColor} ${statusMap[task.status].color}`}>
                      {statusMap[task.status].label}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">科目：</span>
                      <span className="font-medium">{subjectNames[task.subject] || task.subject}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">年级：</span>
                      <span className="font-medium">{gradeNames[task.grade] || task.grade}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">课时：</span>
                      <span className="font-medium">{task.duration}小时</span>
                    </div>
                    <div>
                      <span className="text-gray-500">价格：</span>
                      <span className="font-bold text-blue-600">¥{task.price}</span>
                    </div>
                  </div>
                  
                  {task.school && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">学校：</span>
                      <span className="font-medium">{task.school}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500">
                    发布时间：{formatDate(task.createdAt)}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewTask(task.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    查看详情
                  </button>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleEditTask(task.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      编辑
                    </button>
                  )}
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}