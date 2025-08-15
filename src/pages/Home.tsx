import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';

export default function Home() {
  const { isAuthenticated, userRole } = useContext(AuthContext);
  
  // 生成德润万联标识图片URL
  const logoUrl = "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=DeRunWanLian+Education+Logo+Chinese+characters+professional+education+institution+blue+color+simple+modern&sign=f2a2726d10afa9a26106ece90fbd02d9";
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 英雄区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* 德润万联标识 */}
            <div className="mb-8">
              <img 
                src={logoUrl} 
                alt="德润万联教育" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain mb-4 rounded-lg shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-blue-800">德润万联教育</h1>
              <p className="text-xl text-blue-600 mt-2">连接优质教育资源，助力孩子成长</p>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 max-w-3xl">
              专业的教育资源匹配平台
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              为家长找到最合适的老师，为老师提供展示才华的平台，共同助力孩子的教育成长
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 items-center">
              {isAuthenticated ? (
                <Link 
                  to={userRole === 'parent' ? '/parent' : 
                      userRole === 'teacher' ? '/teacher' : 
                      userRole === 'admin' ? '/admin' : '/'}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-medium shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  进入我的控制台
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-medium shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    立即注册/登录
                  </Link>
                  <Link 
                    to="/login"
                    className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-full text-lg font-medium shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    了解更多
                  </Link>
                  <Link to="/forgot" className="text-blue-600 hover:underline text-sm">忘记密码？点此找回</Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* 装饰元素 */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute top-20 -right-20 w-60 h-60 bg-yellow-200 rounded-full opacity-50 blur-3xl"></div>
      </section>
      
      {/* 功能特点区域 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">平台特色</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 特点1 */}
            <div className="bg-white rounded-xl shadow-xl p-8 transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i className="fa-solid fa-user-graduate text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">优质师资</h3>
              <p className="text-gray-600 text-center">
                严格筛选的专业教师团队，覆盖各学科各年级，满足不同学习需求
              </p>
            </div>
            
            {/* 特点2 */}
            <div className="bg-white rounded-xl shadow-xl p-8 transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i className="fa-solid fa-briefcase text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">精准匹配</h3>
              <p className="text-gray-600 text-center">
                根据孩子年级和学习需求，智能匹配最合适的老师，提高学习效率
              </p>
            </div>
            
            {/* 特点3 */}
            <div className="bg-white rounded-xl shadow-xl p-8 transform transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <i className="fa-solid fa-comments text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">便捷沟通</h3>
              <p className="text-gray-600 text-center">
                家长、老师、管理员三方即时沟通，随时掌握学习进展和教学情况
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 底部区域 */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">德润万联教育</h3>
              <p className="text-gray-400">专业的教育资源匹配平台</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-gray-400 mb-2">© 2025 德润万联教育科技有限公司</p>
              <p className="text-gray-500 text-sm">保留所有权利</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}