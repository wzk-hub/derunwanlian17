import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/utils/api';

// 老师个人资料编辑页面
const TeacherProfile = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [certificatePreviews, setCertificatePreviews] = useState<string[]>([]);
  
  // 老师资料表单状态
  const [formData, setFormData] = useState({
    name: '',
    introduction: '',
    experience: '',
    subject: '',
    grade: [] as string[],
    price: 0,
    avatar: '',
    certificates: [] as string[],
    paymentQrCode: ''
  });
  
  // 收款码预览状态
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  
  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 年级选项
  const gradeOptions = [
    { value: '1', label: '一年级' },
    { value: '2', label: '二年级' },
    { value: '3', label: '三年级' },
    { value: '4', label: '四年级' },
    { value: '5', label: '五年级' },
    { value: '6', label: '六年级' },
    { value: '7', label: '初一' },
    { value: '8', label: '初二' },
    { value: '9', label: '初三' },
    { value: '10', label: '高一' },
    { value: '11', label: '高二' },
    { value: '12', label: '高三' }
  ];
  
  // 科目选项
   const subjectOptions = [
     { value: 'math', label: '数学' },
     { value: 'chinese', label: '语文' },
     { value: 'english', label: '英语' },
     { value: 'physics', label: '物理' },
     { value: 'chemistry', label: '化学' },
     { value: 'biology', label: '生物' },
     { value: 'history', label: '历史' },
     { value: 'geography', label: '地理' },
     { value: 'politics', label: '政治' }
   ];
   
   // 处理科目选择变化
    // 处理科目选择变化
    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const subject = e.target.value;
      setFormData(prev => ({ ...prev, subject }));
      setFormData(prev => ({ ...prev, subject }));
   };
  
  // 加载老师资料
  useEffect(() => {
    const loadTeacherProfile = () => {
      if (!userId) {
        navigate('/login');
        return;
      }
      
      // 获取用户数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: any) => u.id === userId);
      
      if (!currentUser || currentUser.role !== 'teacher') {
        navigate('/login');
        return;
      }
      
      // 获取老师资料
      const teacherProfiles = JSON.parse(localStorage.getItem('teacherProfiles') || '{}');
      const profileData = teacherProfiles[userId] || {};
      
      // 设置表单数据
      setFormData({
        name: profileData.name || currentUser.name || '',
        introduction: profileData.introduction || '',
        experience: profileData.experience || '',
        subject: profileData.subject || '',
        grade: profileData.grade || [],
        price: profileData.price || 100,
        avatar: profileData.avatar || '',
        certificates: profileData.certificates || [],
        paymentQrCode: profileData.paymentQrCode || ''
      });
      
      // 设置头像预览
      if (profileData.avatar) {
        setPreviewImage(profileData.avatar);
      } else {
        // 使用默认头像
        setPreviewImage(`https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Teacher+avatar+${profileData.name || 'teacher'}+professional+education+portrait&sign=3a7f8d9c0e1b2c3d4e5f6a7b8c9d0e1f`);
      }
      
      // 设置证书预览
      setCertificatePreviews(profileData.certificates || []);
      
      // 设置收款码预览
      if (profileData.paymentQrCode) {
        setQrCodePreview(profileData.paymentQrCode);
      }
      
      setLoading(false);
    };
    
    loadTeacherProfile();
  }, [userId, navigate]);
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 处理年级选择变化
  const handleGradeChange = (grade: string) => {
    setFormData(prev => {
      const grades = [...prev.grade];
      const index = grades.indexOf(grade);
      
      if (index > -1) {
        grades.splice(index, 1);
      } else {
        grades.push(grade);
      }
      
      return { ...prev, grade: grades };
    });
  };
  
  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    
    // 检查文件大小
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }
    
    // 读取文件并显示预览
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setPreviewImage(imageUrl);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
    };
    reader.readAsDataURL(file);
  };
  
  // 处理证书上传
  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // 限制最多上传3个证书
    if (formData.certificates.length + files.length > 3) {
      toast.error('最多只能上传3个证书');
      return;
    }
    
    // 处理每个文件
    Array.from(files).forEach(file => {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast.error('请上传图片文件');
        return;
      }
      
      // 检查文件大小
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');
        return;
      }
      
      // 读取文件并显示预览
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          certificates: [...prev.certificates, imageUrl]
        }));
        setCertificatePreviews(prev => [...prev, imageUrl]);
      };
      reader.readAsDataURL(file);
    });
    
    // 清空文件输入
    e.target.value = '';
  };
  
  // 删除证书
  const removeCertificate = (index: number) => {
    const newCertificates = [...formData.certificates];
    newCertificates.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      certificates: newCertificates
    }));
    
    setCertificatePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };
  
  // 处理收款码上传
  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    
    // 检查文件大小
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }
    
    // 读取文件并显示预览
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setQrCodePreview(imageUrl);
      setFormData(prev => ({ ...prev, paymentQrCode: imageUrl }));
    };
    reader.readAsDataURL(file);
  };
  
  // 移除收款码
  const removeQrCode = () => {
    setQrCodePreview(null);
    setFormData(prev => ({ ...prev, paymentQrCode: '' }));
  };
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入您的姓名';
    }
    
      if (!formData.subject) {
        newErrors.subject = '请选择一个教学科目';
      }
      
      if (formData.grade.length === 0) {
        newErrors.grade = '请至少选择一个教授年级';
      }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = '请输入有效的课时费用';
    }
    
    if (!formData.introduction.trim()) {
      newErrors.introduction = '请输入个人简介';
    } else if (formData.introduction.trim().length < 50) {
      newErrors.introduction = '个人简介至少50个字';
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = '请输入教学经验';
    } else if (formData.experience.trim().length < 100) {
      newErrors.experience = '教学经验至少100个字';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 保存老师资料
  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // 同步到后端（如果可用）
      const isDataUrl = formData.paymentQrCode && formData.paymentQrCode.startsWith('data:');
      if (isDataUrl) {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('introduction', formData.introduction);
        fd.append('experience', formData.experience);
        fd.append('subject', formData.subject);
        fd.append('grade', formData.grade.join(','));
        fd.append('price', String(formData.price));
        fd.append('avatar', formData.avatar);
        fd.append('certificates', JSON.stringify(formData.certificates));
        const blob = await (await fetch(formData.paymentQrCode)).blob();
        fd.append('paymentQrCode', blob, 'teacher_qr.png');
        try {
          await api.updateTeacherProfile(userId!, fd);
        } catch (_e) { /* 忽略后端失败，走本地兜底 */ }
      } else {
        try {
          await api.updateTeacherProfile(userId!, {
            ...formData,
            grade: formData.grade,
          });
        } catch (_e) {}
      }

      // 本地存储兜底
      const teacherProfiles = JSON.parse(localStorage.getItem('teacherProfiles') || '{}');
      teacherProfiles[userId!] = formData;
      localStorage.setItem('teacherProfiles', JSON.stringify(teacherProfiles));
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].name = formData.name;
        users[userIndex].paymentQrCode = formData.paymentQrCode;
        localStorage.setItem('users', JSON.stringify(users));
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.name = formData.name;
        if (currentUser && currentUser.id === userId) {
          currentUser.paymentQrCode = formData.paymentQrCode;
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
      
      toast.success('个人资料保存成功！');
    } catch (error) {
      console.error('保存个人资料失败:', error);
      toast.error('保存个人资料失败，请重试');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载个人资料中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">个人资料编辑</h2>
        <p className="text-gray-500 mt-1">
          完善您的个人资料，让家长更好地了解您的教学背景和专长
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左侧：头像上传 */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">个人头像</h3>
            
            <div className="flex flex-col items-center">
              {/* 头像预览 */}
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100 mb-4">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Teacher avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <i class="fa-solid fa-user text-5xl text-gray-400"></i>
                  </div>
                )}
              </div>
              
              {/* 上传按钮 */}
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all cursor-pointer">
                <i class="fa-solid fa-upload mr-2"></i>更换头像
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                支持JPG、PNG格式，大小不超过5MB
              </p>
            </div>
          </div>
        </div>
        
        {/* 右侧：资料表单 */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">基本信息</h3>
            
            <div className="space-y-4">
              {/* 姓名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="请输入您的姓名"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
               {/* 教学科目 */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   教学科目 <span className="text-red-500">*</span>
                 </label>
                 <div className="grid grid-cols-3 gap-2">
                  {subjectOptions.map(option => (
                    <label 
                      key={option.value}
                      className="flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="subject"
                        value={option.value}
                        checked={formData.subject === option.value}
                        onChange={handleSubjectChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                 </div>
                 {errors.subject && (
                   <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                 )}
               </div>
              
              {/* 教授年级 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  教授年级 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {gradeOptions.map(option => (
                    <label 
                      key={option.value}
                      className="flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        name="grade"
                        value={option.value}
                        checked={formData.grade.includes(option.value)}
                        onChange={() => handleGradeChange(option.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.grade && (
                  <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
                )}
              </div>
              
              {/* 课时费用 */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  课时费用（元/小时） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <i class="fa-solid fa-yen-sign"></i>
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="50"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all ${
                      errors.price 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="请输入您的课时费用"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* 自我介绍 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">自我介绍</h3>
            
            <div>
              <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-1">
                个人简介 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="introduction"
                name="introduction"
                value={formData.introduction}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all ${
                  errors.introduction 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="请简要介绍您的教学特色、专长领域等（至少50字）"
              ></textarea>
              <div className="flex justify-between items-center">
                {errors.introduction && (
                  <p className="mt-1 text-sm text-red-600">{errors.introduction}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">{formData.introduction.length}/500字</p>
              </div>
            </div>
          </div>
          
          {/* 教学经验 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">教学经验</h3>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                教学经历与成果 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all ${
                  errors.experience 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="请详细描述您的教学经验、教育背景、获得荣誉等（至少100字）"
              ></textarea>
              <div className="flex justify-between items-center">
                {errors.experience && (
                  <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">{formData.experience.length}/1000字</p>
              </div>
            </div>
          </div>
          
          {/* 证书上传 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">资格证书</h3>
            
            <div>
              <p className="text-sm text-gray-600 mb-4">
                上传您的教师资格证、专业证书等，最多可上传3张
              </p>
              
              {/* 证书预览区域 */}
              {certificatePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {certificatePreviews.map((cert, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                        <img 
                          src={cert} 
                          alt={`Certificate ${index + 1}`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i class="fa-solid fa-times text-red-500 text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 上传按钮 */}
              {certificatePreviews.length < 3 && (
                <label className="inline-block px-4 py-2 border border-dashed border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all cursor-pointer">
                  <i class="fa-solid fa-plus mr-2"></i>上传证书
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleCertificateUpload}
                    className="hidden"
                  />
                </label>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                支持JPG、PNG格式，每张大小不超过5MB，最多上传3张
              </p>
          </div>
        </div>
        
        {/* 收款方式设置 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">收款方式</h3>
          
          <div>
            <p className="text-sm text-gray-600 mb-4">
              请上传您的支付宝收款码，以便课时结束后进行结算
            </p>
            
            {/* 收款码预览 */}
            {qrCodePreview ? (
              <div className="relative w-48 h-48 mx-auto mb-4">
                <img 
                  src={qrCodePreview} 
                  alt="Payment QR Code" 
                  className="w-full h-full object-contain border border-gray-200 rounded-lg p-2"
                />
                <button
                  type="button"
                  onClick={removeQrCode}
                  className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md text-red-500"
                >
                  <i class="fa-solid fa-times text-xs"></i>
                </button>
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <i class="fa-solid fa-qrcode text-4xl text-gray-400"></i>
              </div>
            )}
            
            {/* 上传按钮 */}
            {!qrCodePreview && (
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all cursor-pointer">
                <i class="fa-solid fa-upload mr-2"></i>上传支付宝收款码
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleQrCodeUpload}
                  className="hidden"
                />
              </label>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              支持JPG、PNG格式，大小不超过5MB，请确保收款码清晰可辨
            </p>
          </div>
        </div>
        
        {/* 保存按钮 */}
        <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                  <span>保存中...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <i class="fa-solid fa-save mr-2"></i>
                  <span>保存个人资料</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;