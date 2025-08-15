import { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { cn, calculateDisplayPrice } from '@/lib/utils';
import { toast } from 'sonner';

// 老师信息接口定义
interface Teacher {
  id: string;
  name: string;
  avatar?: string;
  subject: string;
  grade: string[];
  introduction: string;
  experience: string;
  rating: number;
  price: number;
  studentsCount: number;
  status: 'approved' | 'pending' | 'rejected';
  verified: boolean;
  responseTime: string;
  successRate: number;
}

// 老师卡片组件
interface TeacherCardProps {
  teacher: Teacher;
  onContact?: (teacherId: string) => void;
  onSelectAndPay?: (teacherId: string) => void;
}

export default function TeacherCard({ teacher, onContact, onSelectAndPay }: TeacherCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // 生成老师头像URL
  const avatarUrl = teacher.avatar || `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Teacher+avatar+${teacher.name}+professional+education+portrait&sign=3a7f8d9c0e1b2c3d4e5f6a7b8c9d0e1f`;
  
  // 处理联系老师按钮点击
  const handleContact = () => {
    if (onContact) {
      onContact(teacher.id);
    } else {
      toast.info(`已发送联系请求给${teacher.name}老师`);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
      {/* 老师基本信息 */}
      <div className="p-6">
        <div className="flex items-start">
          {/* 头像 */}
          <div className="relative mr-4">
            <img 
              src={avatarUrl} 
              alt={teacher.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
            />
            {/* 评分 */}
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
              {teacher.rating}
            </div>
            {/* 认证标识 */}
            {teacher.verified && (
              <div className="absolute -top-1 -left-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-check text-xs"></i>
              </div>
            )}
          </div>
          
          {/* 基本信息 */}
          <div className="flex-1 min-w-0">
           <div className="flex flex-col items-start">
             <div className="flex items-center gap-2">
               <h3 className="text-xl font-bold text-gray-800 truncate">{teacher.name}</h3>
               {teacher.verified && (
                 <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                   已认证
                 </span>
               )}
             </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {teacher.subject ? (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {getSubjectName(teacher.subject)}老师
                </span>
              ) : (
                 <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">
                   未设置科目
                 </span>
               )}
            </div>
           </div>
            
            <div className="mt-1 flex flex-wrap gap-2">
              {teacher.grade.map((grade) => (
                <span key={grade} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {getGradeName(grade)}
                </span>
              ))}
            </div>
            
            <div className="mt-2 flex items-center text-gray-600 text-sm">
              <i className="fa-solid fa-user-graduate mr-1"></i>
              <span>{teacher.studentsCount}名学生</span>
              <span className="mx-2">•</span>
              <i className="fa-solid fa-yen-sign mr-1"></i>
              <span>{calculateDisplayPrice(teacher.price)}元/小时</span>
            </div>
            
            {/* 新增信息显示 */}
            <div className="mt-2 flex items-center text-gray-600 text-sm">
              <i className="fa-solid fa-clock mr-1"></i>
              <span>响应时间：{teacher.responseTime}</span>
              <span className="mx-2">•</span>
              <i className="fa-solid fa-chart-line mr-1"></i>
              <span>成功率：{teacher.successRate}%</span>
            </div>
          </div>
        </div>
        
        {/* 简介 */}
        <div className="mt-4">
          <p className="text-gray-600 text-sm line-clamp-2">
            {teacher.introduction}
          </p>
          
          {/* 展开/收起按钮 */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 flex items-center"
          >
            {showDetails ? '收起详情' : '查看详情'}
            <i className={cn(
              "fa-solid fa-chevron-down ml-1 transition-transform",
              showDetails && "rotate-180"
            )}></i>
          </button>
        </div>
        
        {/* 详细信息 */}
        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">教学经验</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {teacher.experience}
            </p>
            
            {/* 统计信息 */}
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{teacher.rating}</div>
                <div className="text-xs text-gray-500">综合评分</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{teacher.successRate}%</div>
                <div className="text-xs text-gray-500">成功率</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{teacher.studentsCount}</div>
                <div className="text-xs text-gray-500">学生数量</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleContact}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <i className="fa-solid fa-comments mr-2"></i>
            联系老师
          </button>
          
          {onSelectAndPay && (
            <button
              onClick={() => onSelectAndPay(teacher.id)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <i className="fa-solid fa-credit-card mr-2"></i>
              立即预约
            </button>
          )}
        </div>
      </div>
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

// 年级数字转中文名称
function getGradeName(grade: string): string {
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
  
  return gradeMap[grade] || grade;
}