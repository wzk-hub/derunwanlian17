import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { User, TeacherRating } from '@/models/User';
import { toast } from 'sonner';

const AdminTeacherManagement = () => {
  const { userId } = useContext(AuthContext);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [editingRating, setEditingRating] = useState<TeacherRating | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned' | 'highRating'>('all');

  // 加载老师数据
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacherUsers = users.filter((u: User) => u.role === 'teacher');
    setTeachers(teacherUsers);
  };

  // 过滤和排序老师
  const filteredAndSortedTeachers = teachers
    .filter(teacher => {
      const matchesSearch = teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filter === 'all' || 
                           (filter === 'pinned' && teacher.isPinned) ||
                           (filter === 'highRating' && (teacher.averageRating || 0) >= 90);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // 置顶老师优先
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isPinned && b.isPinned) {
        return (a.pinnedOrder || 0) - (b.pinnedOrder || 0);
      }
      // 然后按评分排序
      return (b.averageRating || 0) - (a.averageRating || 0);
    });

  // 置顶/取消置顶老师
  const togglePinTeacher = (teacherId: string, isPinned: boolean) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: User) => {
      if (u.id === teacherId) {
        return {
          ...u,
          isPinned,
          pinnedAt: isPinned ? new Date() : undefined,
          pinnedById: isPinned ? userId : undefined,
          pinnedOrder: isPinned ? (Math.max(...users.filter((t: User) => t.isPinned).map(t => t.pinnedOrder || 0)) + 1) : undefined
        };
      }
      return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadTeachers();
    
    toast.success(isPinned ? '老师已置顶' : '已取消置顶');
  };

  // 修改置顶顺序
  const updatePinOrder = (teacherId: string, newOrder: number) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: User) => {
      if (u.id === teacherId) {
        return { ...u, pinnedOrder: newOrder };
      }
      return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadTeachers();
    
    toast.success('置顶顺序已更新');
  };

  // 打开评分编辑模态框
  const openRatingModal = (teacher: User) => {
    setSelectedTeacher(teacher);
    setShowRatingModal(true);
    setEditingRating(null);
  };

  // 编辑特定评分
  const editSpecificRating = (rating: TeacherRating) => {
    setSelectedTeacher(teachers.find(t => t.id === rating.teacherId) || null);
    setEditingRating(rating);
    setShowRatingModal(true);
  };

  // 保存评分修改
  const saveRatingEdit = (ratingId: string, newRating: number, newComment: string) => {
    const ratings = JSON.parse(localStorage.getItem('teacherRatings') || '[]');
    const updatedRatings = ratings.map((r: TeacherRating) => {
      if (r.id === ratingId) {
        return {
          ...r,
          rating: newRating,
          comment: newComment,
          updatedAt: new Date(),
          updatedById: userId
        };
      }
      return r;
    });
    
    localStorage.setItem('teacherRatings', JSON.stringify(updatedRatings));
    
    // 更新老师的平均评分
    if (selectedTeacher) {
      updateTeacherAverageRating(selectedTeacher.id);
    }
    
    setShowRatingModal(false);
    setEditingRating(null);
    setSelectedTeacher(null);
    
    toast.success('评分已更新');
  };

  // 更新老师的平均评分
  const updateTeacherAverageRating = (teacherId: string) => {
    const ratings = JSON.parse(localStorage.getItem('teacherRatings') || '[]');
    const teacherRatings = ratings.filter((r: TeacherRating) => r.teacherId === teacherId);
    
    if (teacherRatings.length > 0) {
      const totalRating = teacherRatings.reduce((sum: number, r: TeacherRating) => sum + r.rating, 0);
      const averageRating = Math.round(totalRating / teacherRatings.length);
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === teacherId);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          averageRating,
          totalRatings: teacherRatings.length,
          ratingHistory: teacherRatings
        };
        localStorage.setItem('users', JSON.stringify(users));
        loadTeachers();
      }
    }
  };

  // 获取老师的评分历史
  const getTeacherRatings = (teacherId: string) => {
    const ratings = JSON.parse(localStorage.getItem('teacherRatings') || '[]');
    return ratings.filter((r: TeacherRating) => r.teacherId === teacherId);
  };

  // 渲染评分星星
  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 20);
    const hasHalfStar = score % 20 >= 10;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fa-solid fa-star text-yellow-400"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fa-solid fa-star-half-stroke text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star text-gray-300"></i>);
      }
    }
    
    return stars;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">老师管理</h2>
        <div className="text-sm text-gray-500">
          共 {filteredAndSortedTeachers.length} 位老师
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="搜索老师姓名或科目..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部老师</option>
          <option value="pinned">已置顶</option>
          <option value="highRating">高评分(90+)</option>
        </select>
      </div>

      {/* 老师列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedTeachers.map(teacher => (
          <div
            key={teacher.id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 ${
              teacher.isPinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
            }`}
          >
            {/* 置顶标识 */}
            {teacher.isPinned && (
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  <i className="fa-solid fa-thumbtack mr-1"></i>
                  置顶推荐
                </span>
                <span className="text-xs text-gray-500">排序: {teacher.pinnedOrder}</span>
              </div>
            )}

            {/* 老师信息 */}
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                {teacher.name?.charAt(0) || 'T'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                <p className="text-sm text-gray-600">{teacher.subjects?.join(', ')}</p>
                <p className="text-sm text-gray-500">{teacher.grade?.join(', ')}</p>
              </div>
            </div>

            {/* 评分信息 */}
            {teacher.averageRating && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {renderStars(teacher.averageRating)}
                    <span className="font-semibold text-lg text-gray-900">
                      {teacher.averageRating}分
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {teacher.totalRatings}人评价
                  </span>
                </div>
                <p className="text-sm text-gray-600">{teacher.introduction}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => openRatingModal(teacher)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                管理评分
              </button>
              
              {teacher.isPinned ? (
                <button
                  onClick={() => togglePinTeacher(teacher.id, false)}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  取消置顶
                </button>
              ) : (
                <button
                  onClick={() => togglePinTeacher(teacher.id, true)}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                >
                  置顶推荐
                </button>
              )}
              
              {teacher.isPinned && (
                <button
                  onClick={() => {
                    const newOrder = prompt('请输入新的置顶顺序（数字越小越靠前）：', (teacher.pinnedOrder || 0).toString());
                    if (newOrder && !isNaN(parseInt(newOrder))) {
                      updatePinOrder(teacher.id, parseInt(newOrder));
                    }
                  }}
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                >
                  调整顺序
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 评分管理模态框 */}
      {showRatingModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                管理 {selectedTeacher.name} 的评分
              </h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            {/* 评分历史 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">评分历史</h4>
              <div className="space-y-3">
                {getTeacherRatings(selectedTeacher.id).map(rating => (
                  <div key={rating.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {renderStars(rating.rating)}
                        <span className="font-medium">{rating.rating}分</span>
                      </div>
                      <button
                        onClick={() => editSpecificRating(rating)}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        编辑
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{rating.comment}</p>
                    <div className="text-xs text-gray-500">
                      {rating.parentName} · {new Date(rating.createdAt).toLocaleDateString()}
                      {rating.updatedById && ` · 管理员修改`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 编辑评分表单 */}
            {editingRating && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">编辑评分</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      评分 (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editingRating.rating}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      评价内容
                    </label>
                    <textarea
                      defaultValue={editingRating.comment}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditingRating(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        const newRating = parseInt((document.querySelector('input[type="number"]') as HTMLInputElement)?.value || '0');
                        const newComment = (document.querySelector('textarea') as HTMLTextAreaElement)?.value || '';
                        if (newRating >= 0 && newRating <= 100 && newComment.trim()) {
                          saveRatingEdit(editingRating.id, newRating, newComment);
                        } else {
                          toast.error('请输入有效的评分和评价内容');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      保存修改
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeacherManagement;