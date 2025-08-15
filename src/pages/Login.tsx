import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';
import AdvancedSliderCaptcha from '@/components/AdvancedSliderCaptcha';

// 模拟用户数据存储
interface User {
  id: string;
  phone: string;
  password: string;
  role: 'parent' | 'teacher' | 'admin';
  name?: string;
  childGrade?: string; // 仅家长
  subject?: string; // 仅老师
  createdAt: Date;
}

const Login = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [childGrade, setChildGrade] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaFailed, setCaptchaFailed] = useState(false);
  
  // 初始化管理员账户（如果不存在）
  useEffect(() => {
    const initAdminUser = () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const hasAdmin = users.some((user: User) => user.role === 'admin');
      
      if (!hasAdmin) {
const adminUser: User = {
  id: 'admin-1',
  phone: 'derunwanlian888',
  password: 'ljqwzk0103888',
  role: 'admin',
  name: '系统管理员',
  createdAt: new Date()
};
        
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
      }
    };
    
    initAdminUser();
  }, []);
  
  // 处理滑块验证成功
  const handleCaptchaSuccess = () => {
    setCaptchaVerified(true);
    setCaptchaFailed(false);
    setError('');
  };
  
  // 处理滑块验证失败
  const handleCaptchaFail = () => {
    setCaptchaVerified(false);
    setCaptchaFailed(true);
    setError('请完成滑块验证');
  };
  
  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 检查滑块验证
    if (!captchaVerified) {
      setError('请先完成滑块验证');
      return;
    }
    
    // 表单验证
    if (!phone || !password) {
      setError('手机号和密码不能为空');
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入有效的手机号');
      return;
    }
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('两次密码输入不一致');
        return;
      }
      
      if (role === 'parent' && !childGrade) {
        setError('请选择孩子年级');
        return;
      }
    }
    
    setLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (isLogin) {
        // 登录逻辑
        const user = users.find((u: User) => u.phone === phone && u.password === password);
        
        if (user) {
       setAuth(user.id, user.role, user.name);
          
          // 保存当前用户信息
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // 根据角色重定向
          if (user.role === 'parent') {
            navigate('/parent');
          } else if (user.role === 'teacher') {
            navigate('/teacher');
          } else if (user.role === 'admin') {
            navigate('/admin');
          }
        } else {
          setError('手机号或密码不正确');
        }
      } else {
        // 注册逻辑
        const userExists = users.some((u: User) => u.phone === phone);
        
        if (userExists) {
          setError('该手机号已注册');
          setLoading(false);
          return;
        }
        
         // 创建新用户
         const newUser: User = {
           id: `${role}-${Date.now()}`,
           phone,
           password,
           role,
           createdAt: new Date(),
          verificationStatus: 'unverified', // 初始状态为未认证
          ...(role === 'parent' && { childGrade })
         };
         
         // 保存新用户
         users.push(newUser);
         localStorage.setItem('users', JSON.stringify(users));
         
          // 自动登录新用户
          setAuth(newUser.id, role);
         localStorage.setItem('currentUser', JSON.stringify(newUser));
         
         // 注册后跳转到实名认证页面
         navigate(role === 'parent' ? '/parent/verification' : '/teacher/verification');
      }
      
      setLoading(false);
    }, 800);
  };
  
  // 重置表单和验证状态
  const resetForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setChildGrade('');
    setCaptchaVerified(false);
    setCaptchaFailed(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? '登录账号' : '注册新账号'}
              </h2>
              <p className="text-gray-500">
                {isLogin ? '欢迎回来，请登录您的账号' : '创建一个新账号，开始使用德润万联教育平台'}
              </p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
                <i className="fa-solid fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 手机号输入 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  手机号
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <i className="fa-solid fa-phone"></i>
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="请输入手机号"
                    required
                  />
                </div>
              </div>
              
              {/* 密码输入 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="请输入密码（至少6位）"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              
              {/* 确认密码（仅注册） */}
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    确认密码
                  </label>
                  <div className="relative">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="请再次输入密码"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* 用户角色选择（仅注册） */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    注册身份
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="parent"
                        checked={role === 'parent'}
                        onChange={() => setRole('parent')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">家长</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="teacher"
                        checked={role === 'teacher'}
                        onChange={() => setRole('teacher')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">老师</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* 孩子年级（仅家长注册） */}
              {!isLogin && role === 'parent' && (
                <div>
                  <label htmlFor="childGrade" className="block text-sm font-medium text-gray-700 mb-1">
                    孩子年级
                  </label>
                  <select
                    id="childGrade"
                    value={childGrade}
                    onChange={(e) => setChildGrade(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="">请选择孩子年级</option>
                    <option value="1">一年级</option>
                    <option value="2">二年级</option>
                    <option value="3">三年级</option>
                    <option value="4">四年级</option>
                    <option value="5">五年级</option>
                    <option value="6">六年级</option>
                    <option value="7">初一</option>
                    <option value="8">初二</option>
                    <option value="9">初三</option>
                    <option value="10">高一</option>
                    <option value="11">高二</option>
                    <option value="12">高三</option>
                  </select>
                </div>
              )}
              
                             {/* 滑块验证 */}
               <AdvancedSliderCaptcha
                 onSuccess={handleCaptchaSuccess}
                 onFail={handleCaptchaFail}
                 disabled={loading}
                 difficulty="medium"
               />
              
              {/* 提交按钮 */}
               <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-medium text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2",
                  loading 
                    ? "bg-blue-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                )}
                aria-label={isLogin ? "登录" : "注册"}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    <span>处理中...</span>
                  </div>
                ) : isLogin ? (
                  "登录"
                ) : (
                  "注册"
                )}
              </button>
              
               {/* 实名认证提示 */}
               {!isLogin && (
                 <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                   <i className="fa-solid fa-info-circle mr-2"></i>
                   <span>注册成功后需完成实名认证才能使用平台功能</span>
                 </div>
               )}
               
               {/* 切换登录/注册 */}
               <div className="mt-6 text-center">
                 <button
                   type="button"
                   onClick={resetForm}
                   className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                 >
                   {isLogin 
                     ? '还没有账号？立即注册' 
                     : '已有账号？返回登录'}
                 </button>
               </div>
               

            </form>
          </div>
        </div>
        
        {/* 装饰元素 */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-30 -left-20 w-80 h-80 bg-yellow-300 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;