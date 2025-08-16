import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { User } from '@/models/User';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// 用户管理页面 - 仅管理员可见
export default function UserManagement() {
  const { userId } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 获取所有用户数据
  useEffect(() => {
    const loadUsers = () => {
      setLoading(true);
      
      // 从localStorage获取用户数据
      const usersData = JSON.parse(localStorage.getItem('users') || '[]');
      
      // 过滤掉管理员用户，管理员不应出现在用户管理列表中
      const filteredUsers = usersData.filter((user: User) => user.role !== 'admin');
      
      setUsers(filteredUsers);
      setLoading(false);
    };
    
    loadUsers();
  }, []);
  
  // 根据标签和搜索词筛选用户
  const filteredUsers = users.filter(user => {
    // 标签筛选
    if (activeTab === 'parents' && user.role !== 'parent') return false;
    if (activeTab === 'teachers' && user.role !== 'teacher') return false;
    
    // 搜索词筛选
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = user.name?.toLowerCase().includes(searchLower) || false;
      const phoneMatch = user.phone.toLowerCase().includes(searchLower);
      return nameMatch || phoneMatch;
    }
    
    return true;
  });
  
  // 获取用户角色名称
  const getUserRoleName = (role: string) => {
    switch (role) {
      case 'parent': return '家长';
      case 'teacher': return '老师';
      default: return '未知角色';
    }
  };
  
  // 获取认证状态显示
  const getVerificationStatus = (status: string) => {
    switch (status) {
      case 'verified': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">已认证</span>;
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">待审核</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">已拒绝</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">未认证</span>;
    }
  };
  
  // 获取老师教学科目
  const getTeacherSubjects = (subjects?: string[]) => {
    if (!subjects || subjects.length === 0) return '未设置';
    
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
    
    return subjects.map(s => subjectMap[s] || s).join('、');
  };
  
  // 获取老师教授年级
  const getTeacherGrades = (grades?: string[]) => {
    if (!grades || grades.length === 0) return '未设置';
    
    const gradeMap: Record<string, string> = {
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
      '12': '高三'
    };
    
    return grades.map(g => gradeMap[g] || g).join('、');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
        <p className="text-gray-500 mt-1">
          查看和管理平台所有用户信息，包括家长和老师账户
        </p>
      </div>
      
      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-64 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <i className="fa-solid fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === 'all'
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            所有用户
          </button>
          <button
            onClick={() => setActiveTab('parents')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === 'parents'
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            家长用户
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === 'teachers'
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            老师用户
          </button>
        </div>
      </div>
      
      {/* 用户列表 */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载用户数据中...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <i class="fa-solid fa-users text-2xl text-blue-400"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">暂无用户数据</h3>
          <p className="text-gray-500 mb-6">
            当前没有符合条件的用户数据
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户信息
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色信息
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    认证状态
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={user.avatar} 
                              alt={user.name} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <i class="fa-solid fa-user text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || '未设置姓名'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {getUserRoleName(user.role)}
                      </div>
                      
                      {user.role === 'teacher' && (
                        <div className="mt-1 text-sm text-gray-500 space-y-1">
                          <div>科目: {getTeacherSubjects(user.subjects)}</div>
                          <div>年级: {getTeacherGrades(user.grade)}</div>
                          {user.price && (
                            <div>价格: ¥{user.price}/小时</div>
                          )}
                        </div>
                      )}
                      
                      {user.role === 'parent' && user.childGrade && (
                        <div className="mt-1 text-sm text-gray-500">
                          孩子年级: {getTeacherGrades([user.childGrade])}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationStatus(user.verificationStatus)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => {
                          // 查看用户详情，包括老师的收款方式
                          const userDetails = {
                            ...user,
                            roleName: getUserRoleName(user.role),
                            verificationStatusText: user.verificationStatus
                          };
                          
                          // 兼容从 teacherProfiles 读取老师收款码
                          const teacherProfiles = JSON.parse(localStorage.getItem('teacherProfiles') || '{}');
                          const paymentQrCode = teacherProfiles[user.id]?.paymentQrCode || (user as any).paymentQrCode;
                          
                          // 创建一个临时弹窗显示用户详情
                          const detailsHTML = `
                            <div class="max-w-md">
                              <div class="flex justify-between items-start mb-4">
                                <h3 class="text-lg font-bold">${user.name || '用户详情'}</h3>
                                <button class="text-gray-400 hover:text-gray-500 close-btn">
                                  <i class="fa-solid fa-times"></i>
                                </button>
                              </div>
                              
                              <div class="space-y-4">
                                <div class="flex justify-between">
                                  <span class="text-gray-500">用户ID:</span>
                                  <span>${user.id}</span>
                                </div>
                                <div class="flex justify-between">
                                  <span class="text-gray-500">角色:</span>
                                  <span class="capitalize">${getUserRoleName(user.role)}</span>
                                </div>
                                <div class="flex justify-between">
                                  <span class="text-gray-500">手机号:</span>
                                  <span>${user.phone}</span>
                                </div>
                                <div class="flex justify-between">
                                  <span class="text-gray-500">认证状态:</span>
                                  <span>${user.verificationStatus}</span>
                                </div>
                                
                                ${user.role === 'teacher' ? `
                                  <div class="border-t pt-4 mt-4">
                                    <h4 class="font-medium mb-2">教学信息</h4>
                                    <div class="flex justify-between">
                                      <span class="text-gray-500">教学科目:</span>
                                      <span>${getTeacherSubjects(user.subjects)}</span>
                                    </div>
                                    <div class="flex justify-between">
                                      <span class="text-gray-500">教授年级:</span>
                                      <span>${getTeacherGrades(user.grade)}</span>
                                    </div>
                                    <div class="flex justify-between">
                                      <span class="text-gray-500">课时费用:</span>
                                      <span>¥${user.price || 0}/小时</span>
                                    </div>
                                  </div>
                                  
                                  <div class="border-t pt-4 mt-4">
                                    <h4 class="font-medium mb-2">收款信息</h4>
                                    ${paymentQrCode ? `
                                      <div class="flex justify-center my-2">
                                        <img src="${paymentQrCode}" alt="收款码" class="h-32 w-32 object-contain" />
                                      </div>
                                      <div class="text-center text-sm text-gray-500">支付宝收款码</div>
                                    ` : '<div class="text-gray-500 text-center py-2">未设置收款方式</div>'}
                                  </div>
                                ` : ''}
                              </div>
                            </div>
                          `;
                          
                          toast.custom((t) => (
                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                              <div dangerouslySetInnerHTML={{ __html: detailsHTML }} />
                            </div>
                          ), { duration: Infinity });
                          
                          // 添加关闭按钮事件监听
                          setTimeout(() => {
                            document.querySelector('.close-btn')?.addEventListener('click', () => {
                              toast.dismiss();
                            });
                          }, 0);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}