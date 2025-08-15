import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { User } from '@/models/User';

// 家长实名认证页面
const Verification = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    realName: '',
    idNumber: '',
    idCardFront: '',
    idCardBack: ''
  });
  
  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 获取当前用户信息
  useEffect(() => {
    const loadUserData = () => {
      if (!userId) {
        navigate('/login');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: User) => u.id === userId);
      
      if (currentUser) {
        setUser(currentUser);
        
        // 如果已认证，跳转到首页
        if (currentUser.verificationStatus === 'verified') {
          navigate('/parent');
          return;
        }
        
        // 如果已有填写的认证信息，加载到表单
        if (currentUser.realName) {
          setFormData({
            realName: currentUser.realName,
            idNumber: currentUser.idNumber || '',
            idCardFront: currentUser.idCardFront || '',
            idCardBack: currentUser.idCardBack || ''
          });
          
          if (currentUser.idCardFront) setIdFrontPreview(currentUser.idCardFront);
          if (currentUser.idCardBack) setIdBackPreview(currentUser.idCardBack);
        }
      } else {
        navigate('/login');
      }
    };
    
    loadUserData();
  }, [userId, navigate]);
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 处理身份证照片上传
  const handleIdPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
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
      
      if (isFront) {
        setIdFrontPreview(imageUrl);
        setFormData(prev => ({ ...prev, idCardFront: imageUrl }));
      } else {
        setIdBackPreview(imageUrl);
        setFormData(prev => ({ ...prev, idCardBack: imageUrl }));
      }
    };
    reader.readAsDataURL(file);
  };
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.realName.trim()) {
      newErrors.realName = '请输入真实姓名';
    }
    
    // 身份证号验证 (简化版)
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = '请输入身份证号';
    } else if (!/^\d{17}[\dXx]$/.test(formData.idNumber.trim())) {
      newErrors.idNumber = '请输入有效的身份证号';
    }
    
    if (!formData.idCardFront) {
      newErrors.idCardFront = '请上传身份证正面照片';
    }
    
    if (!formData.idCardBack) {
      newErrors.idCardBack = '请上传身份证反面照片';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 提交实名认证信息
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      try {
        // 更新用户信息
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map((u: User) => {
          if (u.id === userId) {
            return {
              ...u,
              realName: formData.realName,
              idNumber: formData.idNumber,
              idCardFront: formData.idCardFront,
              idCardBack: formData.idCardBack,
              verificationStatus: 'pending', // 设置为待审核状态
              updatedAt: new Date()
            };
          }
          return u;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // 更新当前用户信息
        const currentUser = updatedUsers.find((u: User) => u.id === userId);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        toast.success('实名认证信息提交成功，请等待管理员审核');
        navigate('/parent');
      } catch (error) {
        console.error('提交实名认证失败:', error);
        toast.error('提交失败，请稍后重试');
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">实名认证</h1>
            <p className="text-gray-500 mt-2">
              为了保障账号安全和服务质量，请完成实名认证
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 真实姓名 */}
                <div>
                  <label htmlFor="realName" className="block text-sm font-medium text-gray-700 mb-1">
                    真实姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="realName"
                    name="realName"
                    value={formData.realName}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                      errors.realName 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    )}
                    placeholder="请输入真实姓名"
                  />
                  {errors.realName && (
                    <p className="mt-1 text-sm text-red-600">{errors.realName}</p>
                  )}
                </div>
                
                {/* 身份证号 */}
                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    身份证号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    maxLength={18}
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                      errors.idNumber 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    )}
                    placeholder="请输入18位身份证号"
                  />
                  {errors.idNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>
                  )}
                </div>
                
                {/* 身份证正面照片 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身份证正面照片 <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    {idFrontPreview ? (
                      <div className="relative">
                        <img 
                          src={idFrontPreview} 
                          alt="ID Card Front" 
                          className="max-w-full h-auto rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIdFrontPreview(null);
                            setFormData(prev => ({ ...prev, idCardFront: '' }));
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md text-red-500"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="idCardFront" className="cursor-pointer">
                        <div className="py-8">
                          <i className="fa-solid fa-cloud-upload text-3xl text-gray-400 mb-2"></i>
                          <p className="text-gray-500">点击上传身份证正面照片</p>
                          <p className="text-xs text-gray-400 mt-1">支持JPG、PNG格式，大小不超过5MB</p>
                        </div>
                        <input 
                          type="file" 
                          id="idCardFront" 
                          accept="image/*" 
                          onChange={(e) => handleIdPhotoUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  {errors.idCardFront && (
                    <p className="mt-1 text-sm text-red-600">{errors.idCardFront}</p>
                  )}
                </div>
                
                {/* 身份证反面照片 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身份证反面照片 <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    {idBackPreview ? (
                      <div className="relative">
                        <img 
                          src={idBackPreview} 
                          alt="ID Card Back" 
                          className="max-w-full h-auto rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIdBackPreview(null);
                            setFormData(prev => ({ ...prev, idCardBack: '' }));
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md text-red-500"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="idCardBack" className="cursor-pointer">
                        <div className="py-8">
                          <i className="fa-solid fa-cloud-upload text-3xl text-gray-400 mb-2"></i>
                          <p className="text-gray-500">点击上传身份证反面照片</p>
                          <p className="text-xs text-gray-400 mt-1">支持JPG、PNG格式，大小不超过5MB</p>
                        </div>
                        <input 
                          type="file" 
                          id="idCardBack" 
                          accept="image/*" 
                          onChange={(e) => handleIdPhotoUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  {errors.idCardBack && (
                    <p className="mt-1 text-sm text-red-600">{errors.idCardBack}</p>
                  )}
                </div>
                
                {/* 提交按钮 */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-3 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                      isSubmitting
                        ? "bg-blue-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                    )}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        <span>提交中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <i className="fa-solid fa-check mr-2"></i>
                        <span>提交实名认证</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>提交即表示您同意我们的<a href="#" className="text-blue-600 hover:underline">服务条款</a>和<a href="#" className="text-blue-600 hover:underline">隐私政策</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;