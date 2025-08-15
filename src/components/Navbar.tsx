import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';

const Navbar = () => {
  const { isAuthenticated, userRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // 监听滚动事件，用于导航栏样式变化
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 生成德润万联小logo
  const logoUrl = "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=DeRunWanLian+Education+Logo+small+icon+Chinese+characters+professional+education+institution+blue+color&sign=e192a7cb5fd096a0861f59967642376f";
  
  // 复制微信号
  const copyWechatId = () => {
    navigator.clipboard.writeText('Beckham_k7');
    toast.success('微信号已复制到剪贴板');
  };
  
  return (
    <>
      <nav className={`w-full z-10 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logoUrl} 
                alt="德润万联教育" 
                className="h-10 w-10 rounded-md object-contain"
              />
              <span className="text-xl font-bold text-blue-800">德润万联</span>
            </Link>
            
            {/* 桌面导航 */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">首页</Link>
              
              {isAuthenticated ? (
                <>
                  {userRole === 'parent' && (
                    <>
                      <Link to="/parent/teachers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                        老师列表
                      </Link>
                      <Link to="/parent/tasks" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                        发布任务
                      </Link>
                    </>
                  )}
                  
                  {userRole === 'teacher' && (
                    <>
                      <Link to="/teacher/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                        个人资料
                      </Link>
                      <Link to="/teacher/tasks" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                        任务中心
                      </Link>
                    </>
                  )}
                  
                  {userRole === 'admin' && (
                    <>
                      <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                        管理后台
                      </Link>
                    </>
                  )}
                </>
              ) : null}
              
              {/* 客服联系按钮 */}
              <button
                onClick={() => setShowContactModal(true)}
                className="flex items-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-headset mr-2"></i>
                联系客服
              </button>
              
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  退出登录
                </button>
              ) : (
                <Link 
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  登录/注册
                </Link>
              )}
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setShowContactModal(true)}
                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <i className="fa-solid fa-headset"></i>
              </button>
              <button className="text-gray-700 focus:outline-none">
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 客服联系模态框 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">联系客服</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-headset text-green-600 text-2xl"></i>
                </div>
                
                <h4 className="text-lg font-medium text-gray-800 mb-2">微信客服</h4>
                <p className="text-gray-600 mb-4">
                  添加微信客服，获得专业帮助
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-gray-800 mb-1">Beckham_k7</div>
                  <div className="text-sm text-gray-500">微信号</div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={copyWechatId}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <i className="fa-solid fa-copy mr-2"></i>
                    复制微信号
                  </button>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    关闭
                  </button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>服务时间：周一至周日 9:00-21:00</p>
                  <p>响应时间：通常在5分钟内回复</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;