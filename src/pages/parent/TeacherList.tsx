import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherCard from '@/components/TeacherCard';
import GradeFilter from '@/components/GradeFilter';
import { AuthContext } from '@/contexts/authContext';
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
}

// 模拟老师数据
const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: '张老师',
    subject: '数学',
    grade: ['1', '2', '3', '4', '5', '6'],
    introduction: '资深小学数学教师，10年教学经验，擅长启发式教学，让孩子爱上数学，培养逻辑思维能力。曾获市级优秀教师称号，所教学生成绩提升显著。',
    experience: '10年小学数学教学经验，曾任重点小学数学教研组组长，熟悉小学各年级数学知识点和教学大纲，擅长针对不同类型学生制定个性化教学方案。',
    rating: 5,
    price: 120,
    studentsCount: 156
  },
  {
    id: 'teacher-2',
    name: '李老师',
    subject: '英语',
    grade: ['7', '8', '9', '10', '11', '12'],
    introduction: '英语专业八级，8年初高中英语教学经验，擅长语法教学和阅读理解训练，帮助多名学生提高英语成绩，顺利考入理想大学。',
    experience: '英语专业八级，8年初高中英语教学经验，曾在知名培训机构担任英语教研组组长，熟悉中高考英语考点和命题规律，教学方法灵活多样。',
    rating: 4,
    price: 150,
    studentsCount: 128
  },
  {
    id: 'teacher-3',
    name: '王老师',
    subject: '语文',
    grade: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    introduction: '小学语文高级教师，15年教学经验，注重阅读与写作能力培养，善于激发学生学习兴趣，让孩子轻松学好语文。',
    experience: '小学语文高级教师，15年教学经验，曾获省级优秀教师称号，出版多本语文教学辅导书籍，擅长文言文和现代文阅读理解教学。',
    rating: 5,
    price: 130,
    studentsCount: 210
  },
  {
    id: 'teacher-4',
    name: '赵老师',
    subject: '物理',
    grade: ['10', '11', '12'],
    introduction: '物理学科带头人，重点大学物理系毕业，12年高中物理教学经验，擅长将抽象物理概念转化为生动实例，帮助学生理解。',
    experience: '重点大学物理系毕业，12年高中物理教学经验，培养多名学生在物理竞赛中获奖，对高考物理有深入研究，教学风格严谨而不失风趣。',
    rating: 4,
    price: 180,
    studentsCount: 95
  },
  {
    id: 'teacher-5',
    name: '陈老师',
    subject: '化学',
  grade: ['10', '11', '12'],
    introduction: '化学高级教师，10年高中化学教学经验，精通化学实验教学，让学生在实践中掌握化学知识，提高学习兴趣和成绩。',
    experience: '化学高级教师，10年高中化学教学经验，曾任重点高中化学备课组组长，熟悉高考化学考点和命题趋势，善于将复杂化学知识系统化、简单化。',
    rating: 5,
    price: 170,
    studentsCount: 87
  },
  {
    id: 'teacher-6',
    name: '刘老师',
    subject: '英语',
    grade: ['1', '2', '3', '4', '5', '6'],
    introduction: '少儿英语专家，擅长幼儿及小学低年级英语启蒙，采用情景教学法，让孩子在轻松愉快的氛围中学习英语，培养语感和兴趣。',
    experience: '英语教育专业毕业，8年少儿英语教学经验，持有TESOL国际英语教师资格证书，曾在国际幼儿园担任英语教师，擅长通过游戏、歌曲等方式进行英语教学。',
    rating: 4,
    price: 140,
    studentsCount: 143
  }
];

export default function TeacherList() {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 获取用户信息和孩子年级
  const [childGrade, setChildGrade] = useState<string | null>(null);
  
  // 初始化数据
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      
      // 模拟API请求延迟
      setTimeout(() => {
        setTeachers(mockTeachers);
        setFilteredTeachers(mockTeachers);
        
        // 获取当前用户信息，特别是孩子年级
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find((u: any) => u.id === userId);
        
        if (currentUser && currentUser.childGrade) {
          setChildGrade(currentUser.childGrade);
          // 默认按孩子年级筛选
          setSelectedGrades([currentUser.childGrade]);
        }
        
        setLoading(false);
      }, 800);
    };
    
    loadData();
  }, [userId]);
  
  // 应用筛选
  useEffect(() => {
    let result = [...teachers];
    
    // 年级筛选
    if (selectedGrades.length > 0) {
      result = result.filter(teacher => 
        teacher.grade.some(g => selectedGrades.includes(g))
      );
    }
    
    // 搜索筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(teacher => 
        teacher.name.toLowerCase().includes(term) || 
        teacher.subject.toLowerCase().includes(term) ||
        teacher.introduction.toLowerCase().includes(term)
      );
    }
    
    setFilteredTeachers(result);
  }, [teachers, selectedGrades, searchTerm]);
  
  // 处理联系老师
  const handleContactTeacher = (teacherId: string) => {
    // 跳转到发布任务页面，并携带老师ID
    navigate(`/parent/tasks/new?teacherId=${teacherId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">精选老师</h2>
          <p className="text-gray-500 mt-1">
            {childGrade ? `为您推荐适合${getGradeName(childGrade)}的老师` : '找到最适合您孩子的老师'}
          </p>
        </div>
        
        {/* 搜索框 */}
        <div className="w-full md:w-64 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <i class="fa-solid fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="搜索老师或科目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
      
      {/* 年级筛选 */}
      <GradeFilter 
        selectedGrades={selectedGrades} 
        onChange={setSelectedGrades} 
      />
      
      {/* 老师列表 */}
      {loading ? (
        // 加载状态
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mr-4"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="mt-5">
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTeachers.length > 0 ? (
        // 老师列表
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map(teacher => (
            <TeacherCard 
              key={teacher.id} 
              teacher={teacher}
              onContact={handleContactTeacher}
            />
          ))}
        </div>
      ) : (
        // 无结果状态
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <i class="fa-solid fa-search text-2xl text-blue-400"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">未找到符合条件的老师</h3>
          <p className="text-gray-500 mb-6">尝试调整筛选条件或搜索关键词</p>
          <button
            onClick={() => {
              setSelectedGrades([]);
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  );
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