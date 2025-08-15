import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { TeacherRating as TeacherRatingType } from '@/models/User';
import { toast } from 'sonner';

interface TeacherRatingProps {
  teacherId: string;
  teacherName: string;
  taskId: string;
  taskTitle: string;
  onRatingSubmit?: (rating: TeacherRatingType) => void;
  existingRating?: TeacherRatingType;
}

const TeacherRatingComponent: React.FC<TeacherRatingProps> = ({
  teacherId,
  teacherName,
  taskId,
  taskTitle,
  onRatingSubmit,
  existingRating
}) => {
  const { userId, userName } = useContext(AuthContext);
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(!existingRating);

  // 评分选项
  const ratingOptions = [
    { value: 90, label: '优秀 (90-100)', color: 'text-green-600' },
    { value: 80, label: '良好 (80-89)', color: 'text-blue-600' },
    { value: 70, label: '一般 (70-79)', color: 'text-yellow-600' },
    { value: 60, label: '及格 (60-69)', color: 'text-orange-600' },
    { value: 50, label: '不及格 (50-59)', color: 'text-red-600' }
  ];

  // 提交评分
  const handleSubmitRating = async () => {
    if (!userId || !userName) {
      toast.error('请先登录');
      return;
    }

    if (rating === 0) {
      toast.error('请选择评分');
      return;
    }

    if (!comment.trim()) {
      toast.error('请填写评价内容');
      return;
    }

    setIsSubmitting(true);

    try {
      const newRating: TeacherRatingType = {
        id: existingRating?.id || `rating-${Date.now()}`,
        teacherId,
        parentId: userId,
        parentName: userName,
        taskId,
        taskTitle,
        rating,
        comment: comment.trim(),
        createdAt: existingRating?.createdAt || new Date(),
        updatedAt: new Date()
      };

      // 保存评分到本地存储
      const ratings = JSON.parse(localStorage.getItem('teacherRatings') || '[]');
      const existingIndex = ratings.findIndex((r: TeacherRatingType) => r.id === newRating.id);
      
      if (existingIndex !== -1) {
        ratings[existingIndex] = newRating;
      } else {
        ratings.push(newRating);
      }
      
      localStorage.setItem('teacherRatings', JSON.stringify(ratings));

      // 更新老师的平均评分
      updateTeacherAverageRating(teacherId);

      toast.success('评分提交成功！');
      
      if (onRatingSubmit) {
        onRatingSubmit(newRating);
      }
      
      setShowRatingForm(false);
      
    } catch (error) {
      toast.error('评分提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 更新老师的平均评分
  const updateTeacherAverageRating = (teacherId: string) => {
    const ratings = JSON.parse(localStorage.getItem('teacherRatings') || '[]');
    const teacherRatings = ratings.filter((r: TeacherRatingType) => r.teacherId === teacherId);
    
    if (teacherRatings.length > 0) {
      const totalRating = teacherRatings.reduce((sum: number, r: TeacherRatingType) => sum + r.rating, 0);
      const averageRating = Math.round(totalRating / teacherRatings.length);
      
      // 更新用户数据中的老师评分
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === teacherId);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          averageRating,
          totalRatings: teacherRatings.length,
          ratingHistory: teacherRatings
        };
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  // 渲染评分星星
  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 20); // 每20分一颗星
    const hasHalfStar = score % 20 >= 10;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <i key={i} className="fa-solid fa-star text-yellow-400 text-xl"></i>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <i key={i} className="fa-solid fa-star-half-stroke text-yellow-400 text-xl"></i>
        );
      } else {
        stars.push(
          <i key={i} className="fa-regular fa-star text-gray-300 text-xl"></i>
        );
      }
    }
    
    return stars;
  };

  if (!showRatingForm) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-check-circle text-green-600"></i>
            <span className="text-green-800 font-medium">已评分</span>
          </div>
          <button
            onClick={() => setShowRatingForm(true)}
            className="text-green-600 hover:text-green-800 text-sm underline"
          >
            修改评分
          </button>
        </div>
        <div className="mt-2">
          <div className="flex items-center space-x-2 mb-1">
            {renderStars(existingRating?.rating || 0)}
            <span className="text-lg font-bold text-green-600">
              {existingRating?.rating || 0}分
            </span>
          </div>
          <p className="text-green-700 text-sm">{existingRating?.comment}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">为老师评分</h3>
        <p className="text-sm text-gray-600">
          请为 <span className="font-medium text-blue-600">{teacherName}</span> 在任务 
          <span className="font-medium text-blue-600">"{taskTitle}"</span> 中的表现进行评分
        </p>
      </div>

      {/* 评分选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          评分 <span className="text-red-500">*</span>
        </label>
        
        {/* 快速评分选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRating(option.value)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                rating === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`font-medium ${option.color}`}>{option.value}分</div>
              <div className="text-sm text-gray-600">{option.label}</div>
            </button>
          ))}
        </div>

        {/* 自定义评分 */}
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">自定义评分：</label>
          <input
            type="number"
            min="0"
            max="100"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0-100"
          />
          <span className="text-sm text-gray-500">分</span>
        </div>

        {/* 评分显示 */}
        {rating > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {renderStars(rating)}
              <span className="text-lg font-bold text-blue-600">{rating}分</span>
            </div>
            <div className="text-sm text-gray-600">
              {rating >= 90 ? '优秀' : 
               rating >= 80 ? '良好' : 
               rating >= 70 ? '一般' : 
               rating >= 60 ? '及格' : '不及格'}
            </div>
          </div>
        )}
      </div>

      {/* 评价内容 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          评价内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请详细描述老师的教学表现、专业能力、沟通效果等..."
        />
        <p className="text-xs text-gray-500 mt-1">
          请客观公正地评价，您的评价将帮助其他家长选择合适的老师
        </p>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowRatingForm(false)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmitRating}
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '提交中...' : '提交评分'}
        </button>
      </div>
    </div>
  );
};

export default TeacherRatingComponent;