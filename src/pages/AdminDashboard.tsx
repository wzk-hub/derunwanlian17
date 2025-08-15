import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';

// 待审核的老师资料接口
interface PendingTeacherReview {
  teacherId: string;
  teacherName: string;
  subject: string;
  submittedAt: string;
  profileData?: any;
}

// 管理员仪表板
export default function AdminDashboard() {
  const { userId } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingReviews, setPendingReviews] = useState<PendingTeacherReview[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<PendingTeacherReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  // 统计数据
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalTasks: 0,
    pendingReviews: 0,
    completedTasks: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    // 模拟加载数据
    setTimeout(() => {
      try {
        // 加载用户数据
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const teacherProfiles = JSON.parse(localStorage.getItem('teacherProfiles') || '{}');
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const pendingReviews = JSON.parse(localStorage.getItem('pendingTeacherReviews') || '[]');

        // 计算统计数据
        const totalUsers = users.length;
        const totalTeachers = users.filter((u: any) => u.role === 'teacher').length;
        const totalParents = users.filter((u: any) => u.role === 'parent').length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;

        setStats({
          totalUsers,
          totalTeachers,
          totalParents,
          totalTasks,
          pendingReviews: pendingReviews.length,
          completedTasks
        });

        setPendingReviews(pendingReviews);
        setTeacherProfiles(teacherProfiles);
        setLoading(false);
      } catch (error) {
        console.error('加载数据失败:', error);
        setLoading(false);
      }
    }, 1000);
  };

  // 处理审核操作
  const handleReview = (action: 'approve' | 'reject') => {
    if (!selectedReview) return;

    setReviewAction(action);
    setReviewFeedback('');
    setShowReviewModal(true);
  };

  // 提交审核结果
  const submitReview = () => {
    if (!selectedReview) return;

    try {
      // 更新老师资料状态
      const updatedProfiles = { ...teacherProfiles };
      if (updatedProfiles[selectedReview.teacherId]) {
        updatedProfiles[selectedReview.teacherId] = {
          ...updatedProfiles[selectedReview.teacherId],
          status: reviewAction === 'approve' ? 'approved' : 'rejected',
          adminFeedback: reviewAction === 'reject' ? reviewFeedback : '',
          reviewedAt: new Date().toISOString(),
          reviewedBy: userId
        };
      }

      // 保存更新
      localStorage.setItem('teacherProfiles', JSON.stringify(updatedProfiles));

      // 从待审核列表中移除
      const updatedPendingReviews = pendingReviews.filter(
        review => review.teacherId !== selectedReview.teacherId
      );
      localStorage.setItem('pendingTeacherReviews', JSON.stringify(updatedPendingReviews));

      // 更新状态
      setTeacherProfiles(updatedProfiles);
      setPendingReviews(updatedPendingReviews);
      setShowReviewModal(false);
      setSelectedReview(null);

      // 更新统计数据
      setStats(prev => ({
        ...prev,
        pendingReviews: updatedPendingReviews.length
      }));

      toast.success(`已${reviewAction === 'approve' ? '通过' : '拒绝'}该老师的资料`);
    } catch (error) {
      console.error('审核操作失败:', error);
      toast.error('审核操作失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">管理员仪表板</h2>
        <p className="text-gray-500 mt-1">管理系统用户、审核老师资料、监控平台运营</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <i className="fa-solid fa-users text-blue-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
              <div className="text-sm text-gray-500">总用户数</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <i className="fa-solid fa-chalkboard-teacher text-green-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalTeachers}</div>
              <div className="text-sm text-gray-500">注册老师</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <i className="fa-solid fa-user-friends text-purple-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalParents}</div>
              <div className="text-sm text-gray-500">注册家长</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
              <i className="fa-solid fa-tasks text-orange-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalTasks}</div>
              <div className="text-sm text-gray-500">总任务数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              概览
            </button>
            <button
              onClick={() => setActiveTab('teacher-reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teacher-reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              老师审核
              {stats.pendingReviews > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {stats.pendingReviews}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('user-management')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'user-management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              用户管理
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 概览标签页 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">平台统计</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">完成的任务</span>
                      <span className="font-medium">{stats.completedTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">待审核老师</span>
                      <span className="font-medium text-orange-600">{stats.pendingReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">任务完成率</span>
                      <span className="font-medium">
                        {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">快速操作</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('teacher-reviews')}
                      className="w-full text-left p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">审核老师资料</span>
                        <span className="text-sm text-gray-500">
                          {stats.pendingReviews} 个待审核
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('user-management')}
                      className="w-full text-left p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">管理用户</span>
                        <span className="text-sm text-gray-500">
                          {stats.totalUsers} 个用户
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 老师审核标签页 */}
          {activeTab === 'teacher-reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">待审核老师资料</h3>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fa-solid fa-refresh mr-2"></i>
                  刷新
                </button>
              </div>

              {pendingReviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <i className="fa-solid fa-check text-2xl text-green-600"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">暂无待审核资料</h3>
                  <p className="text-gray-500">所有老师资料都已审核完成</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div key={review.teacherId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{review.teacherName}</h4>
                          <p className="text-sm text-gray-500">
                            科目：{getSubjectName(review.subject)} • 
                            提交时间：{new Date(review.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              handleReview('approve');
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              handleReview('reject');
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            拒绝
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 用户管理标签页 */}
          {activeTab === 'user-management' && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">用户管理</h3>
              <p className="text-gray-500">用户管理功能正在开发中...</p>
            </div>
          )}
        </div>
      </div>

      {/* 审核模态框 */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {reviewAction === 'approve' ? '通过审核' : '拒绝审核'}
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  老师：<span className="font-medium">{selectedReview.teacherName}</span>
                </p>
                <p className="text-gray-600">
                  科目：<span className="font-medium">{getSubjectName(selectedReview.subject)}</span>
                </p>
              </div>

              {reviewAction === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    拒绝原因
                  </label>
                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请说明拒绝的原因，帮助老师改进..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={submitReview}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    reviewAction === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {reviewAction === 'approve' ? '确认通过' : '确认拒绝'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 科目代码转中文名称
function getSubjectName(subject: string): string {
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
  
  return subjectMap[subject] || subject;
}