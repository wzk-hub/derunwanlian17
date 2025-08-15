import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { AdminCreateTaskRequest } from '@/models/Task';
import { toast } from 'sonner';

const AdminTaskPublish = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdminCreateTaskRequest>({
    title: '',
    description: '',
    subject: '',
    grade: '',
    duration: 1,
    price: 0,
    studentName: '',
    studentSchool: '',
    tags: [],
    isPinned: false,
    pinnedOrder: 0
  });

  // 科目选项
  const subjects = [
    '语文', '数学', '英语', '物理', '化学', '生物', 
    '历史', '地理', '政治', '音乐', '美术', '体育',
    '计算机', '其他'
  ];

  // 年级选项
  const grades = [
    '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
    '初中一年级', '初中二年级', '初中三年级',
    '高中一年级', '高中二年级', '高中三年级'
  ];

  // 常用标签
  const commonTags = ['紧急', '推荐', '优质', '特价', '新老师', '经验丰富'];

  // 处理表单输入变化
  const handleInputChange = (field: keyof AdminCreateTaskRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理标签变化
  const handleTagChange = (tag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tags: checked 
        ? [...(prev.tags || []), tag]
        : (prev.tags || []).filter(t => t !== tag)
    }));
  };

  // 添加自定义标签
  const addCustomTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
  };

  // 移除标签
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  // 验证表单
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('请输入任务标题');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('请输入任务描述');
      return false;
    }
    if (!formData.subject) {
      toast.error('请选择教学科目');
      return false;
    }
    if (!formData.grade) {
      toast.error('请选择学生年级');
      return false;
    }
    if (formData.duration < 1) {
      toast.error('课时数量不能少于1');
      return false;
    }
    if (formData.price < 0) {
      toast.error('价格不能为负数');
      return false;
    }
    if (formData.isPinned && formData.pinnedOrder < 0) {
      toast.error('置顶排序不能为负数');
      return false;
    }
    return true;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // 获取现有任务
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      
      // 创建新任务
      const newTask = {
        id: `task-${Date.now()}`,
        ...formData,
        status: 'approved' as const, // 管理员发布的任务直接审核通过
        publisherId: userId,
        publisherName: '系统管理员',
        source: 'admin' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: new Date(),
        approvedById: userId,
        tags: formData.tags || []
      };
      
      // 添加到任务列表
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      toast.success('任务发布成功！');
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        duration: 1,
        price: 0,
        studentName: '',
        studentSchool: '',
        tags: [],
        isPinned: false,
        pinnedOrder: 0
      });
      
      // 返回任务列表
      navigate('/admin/tasks');
      
    } catch (error) {
      toast.error('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">发布教学任务</h2>
        <p className="text-gray-600 mt-2">作为管理员，您可以发布系统推荐的教学任务</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入任务标题"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教学科目 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择科目</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学生年级 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择年级</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课时数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入课时数量"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                总价格 (元) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入总价格"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学生姓名
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入学生姓名（可选）"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学生学校
              </label>
              <input
                type="text"
                value={formData.studentSchool}
                onChange={(e) => handleInputChange('studentSchool', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入学生学校"
              />
            </div>
          </div>
        </div>

        {/* 任务描述 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">任务描述</h3>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请详细描述教学任务的要求、目标等..."
          />
        </div>

        {/* 置顶设置 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">置顶设置</h3>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => handleInputChange('isPinned', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">置顶此任务</span>
            </label>
            
            {formData.isPinned && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  置顶排序（数字越小越靠前）
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pinnedOrder}
                  onChange={(e) => handleInputChange('pinnedOrder', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* 任务标签 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">任务标签</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">常用标签</label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <label key={tag} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tags?.includes(tag) || false}
                    onChange={(e) => handleTagChange(tag, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">自定义标签</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="输入自定义标签"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag(e.currentTarget.value)}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="输入自定义标签"]') as HTMLInputElement;
                  if (input) {
                    addCustomTag(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
          
          {/* 已选标签 */}
          {formData.tags && formData.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">已选标签</label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/tasks')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '发布中...' : '发布任务'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTaskPublish;