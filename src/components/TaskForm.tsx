import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CreateTaskRequest } from '@/models/Task';
import { toast } from 'sonner';

// 任务表单组件
interface TaskFormProps {
  initialData?: Partial<CreateTaskRequest>;
  onSubmit: (data: CreateTaskRequest) => void;
  isSubmitting: boolean;
  teachers?: Array<{ id: string; name?: string }>;
}

// 扩展的学生信息接口
interface ExtendedStudentInfo {
  studentName: string;
  studentSchool: string;
  studentGrade: string;
  studentAge?: number;
  studentGender?: 'male' | 'female';
  studentPhone?: string;
  parentName: string;
  parentPhone: string;
  parentRelationship: string;
  address?: string;
  specialNeeds?: string;
  learningGoals: string;
  currentLevel: string;
  weakSubjects?: string[];
  strongSubjects?: string[];
  previousTutoring?: boolean;
  previousTutoringDetails?: string;
}

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
  { value: 'politics', label: '政治' },
  { value: 'art', label: '美术' },
  { value: 'music', label: '音乐' },
  { value: 'pe', label: '体育' },
  { value: 'computer', label: '计算机' },
  { value: 'science', label: '科学' },
  { value: 'social', label: '社会' },
  { value: 'other', label: '其他' },
];

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
  { value: '12', label: '高三' },
];

export default function TaskForm({ initialData, onSubmit, isSubmitting, teachers = [] }: TaskFormProps) {
  // 表单状态
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    subject: initialData?.subject || '',
    grade: initialData?.grade || '',
    duration: initialData?.duration || 10,
    price: initialData?.price || 0,
    studentName: initialData?.studentName || '',
    studentSchool: initialData?.studentSchool || '',
    teacherId: initialData?.teacherId
  });

  // 扩展的学生信息状态
  const [studentInfo, setStudentInfo] = useState<ExtendedStudentInfo>({
    studentName: initialData?.studentName || '',
    studentSchool: initialData?.studentSchool || '',
    studentGrade: initialData?.grade || '',
    studentAge: undefined,
    studentGender: undefined,
    studentPhone: '',
    parentName: '',
    parentPhone: '',
    parentRelationship: '父亲',
    address: '',
    specialNeeds: '',
    learningGoals: '',
    currentLevel: '中等',
    weakSubjects: [],
    strongSubjects: [],
    previousTutoring: false,
    previousTutoringDetails: ''
  });
  
  // 表单验证状态
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 当初始数据变化时更新表单
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // 保持已有值，如果初始数据中没有提供
        title: initialData.title || prev.title,
        description: initialData.description || prev.description,
        subject: initialData.subject || prev.subject,
        grade: initialData.grade || prev.grade,
        duration: initialData.duration || prev.duration,
        price: initialData.price || prev.price,
        studentName: initialData.studentName || prev.studentName,
        studentSchool: initialData.studentSchool || prev.studentSchool,
      }));
    }
    
    // 如果提供了年级，尝试自动计算价格
    if (initialData?.grade) {
      calculatePrice();
    }
  }, [initialData]);
  
  // 根据年级和课时计算价格
  const calculatePrice = () => {
    if (!formData.grade || !formData.duration) return;
    
    // 根据年级设置不同基础价格
    let basePrice = 100; // 默认价格
    
    // 初中（7-9年级）加价
    if (['7', '8', '9'].includes(formData.grade)) {
      basePrice = 150;
    } 
    // 高中（10-12年级）加价更多
    else if (['10', '11', '12'].includes(formData.grade)) {
      basePrice = 200;
    }
    
    // 计算总价
    const totalPrice = basePrice * formData.duration;
    setFormData(prev => ({ ...prev, price: totalPrice }));
  };
  
  // 处理表单字段变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
    
    // 同步更新学生信息
    if (name === 'studentName' || name === 'studentSchool' || name === 'grade') {
      setStudentInfo(prev => ({
        ...prev,
        [name === 'grade' ? 'studentGrade' : name]: value
      }));
    }
    
    // 如果修改了年级或课时，重新计算价格
    if (name === 'grade' || name === 'duration') {
      calculatePrice();
    }
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 处理学生信息变化
  const handleStudentInfoChange = (field: keyof ExtendedStudentInfo, value: any) => {
    setStudentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理多选科目变化
  const handleSubjectSelection = (subject: string, isWeak: boolean) => {
    if (isWeak) {
      setStudentInfo(prev => ({
        ...prev,
        weakSubjects: prev.weakSubjects?.includes(subject)
          ? prev.weakSubjects.filter(s => s !== subject)
          : [...(prev.weakSubjects || []), subject]
      }));
    } else {
      setStudentInfo(prev => ({
        ...prev,
        strongSubjects: prev.strongSubjects?.includes(subject)
          ? prev.strongSubjects.filter(s => s !== subject)
          : [...(prev.strongSubjects || []), subject]
      }));
    }
  };
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入任务标题';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入任务描述';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = '任务描述至少20个字';
    }
    
    if (!formData.subject) {
      newErrors.subject = '请选择科目';
    }
    
    if (!formData.grade) {
      newErrors.grade = '请选择年级';
    }

    if (!formData.studentSchool?.trim()) {
      newErrors.studentSchool = '请输入学校名称';
    }

    // 学生信息验证
    if (!studentInfo.studentName?.trim()) {
      newErrors.studentName = '请输入学生姓名';
    }

    if (!studentInfo.parentName?.trim()) {
      newErrors.parentName = '请输入家长姓名';
    }

    if (!studentInfo.parentPhone?.trim()) {
      newErrors.parentPhone = '请输入家长联系电话';
    }

    if (!studentInfo.learningGoals?.trim()) {
      newErrors.learningGoals = '请输入学习目标';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = '请输入有效的课时数量';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = '请输入有效的价格';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 将学生信息合并到任务数据中
      const enrichedTaskData: CreateTaskRequest = {
        ...formData,
        studentName: studentInfo.studentName,
        studentSchool: studentInfo.studentSchool,
        // 将学生信息作为描述的一部分，方便老师了解学生情况
        description: `${formData.description}\n\n学生详细信息：\n姓名：${studentInfo.studentName}\n学校：${studentInfo.studentSchool}\n年级：${studentInfo.studentGrade}\n年龄：${studentInfo.studentAge || '未填写'}\n性别：${studentInfo.studentGender === 'male' ? '男' : studentInfo.studentGender === 'female' ? '女' : '未填写'}\n家长姓名：${studentInfo.parentName}\n家长电话：${studentInfo.parentPhone}\n家长关系：${studentInfo.parentRelationship}\n地址：${studentInfo.address || '未填写'}\n特殊需求：${studentInfo.specialNeeds || '无'}\n学习目标：${studentInfo.learningGoals}\n当前水平：${studentInfo.currentLevel}\n薄弱科目：${studentInfo.weakSubjects?.join('、') || '无'}\n优势科目：${studentInfo.strongSubjects?.join('、') || '无'}\n是否有过辅导：${studentInfo.previousTutoring ? '是' : '否'}\n辅导详情：${studentInfo.previousTutoringDetails || '无'}`
      };
      
      onSubmit(enrichedTaskData);
    } else {
      toast.error('表单填写有误，请检查并修正');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 学生基础信息 */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <i className="fa-solid fa-user-graduate mr-2"></i>
          学生基础信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
              学生姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={studentInfo.studentName}
              onChange={(e) => handleStudentInfoChange('studentName', e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.studentName 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="例如：张三"
            />
            {errors.studentName && (
              <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>
            )}
          </div>
          <div>
            <label htmlFor="studentSchool" className="block text-sm font-medium text-gray-700 mb-1">
              学校 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="studentSchool"
              name="studentSchool"
              value={studentInfo.studentSchool}
              onChange={(e) => handleStudentInfoChange('studentSchool', e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.studentSchool 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="例如：北京市第一中学"
            />
            {errors.studentSchool && (
              <p className="mt-1 text-sm text-red-600">{errors.studentSchool}</p>
            )}
          </div>
          <div>
            <label htmlFor="studentAge" className="block text-sm font-medium text-gray-700 mb-1">
              学生年龄
            </label>
            <input
              type="number"
              id="studentAge"
              value={studentInfo.studentAge || ''}
              onChange={(e) => handleStudentInfoChange('studentAge', parseInt(e.target.value) || undefined)}
              min="3"
              max="25"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="例如：12"
            />
          </div>
          <div>
            <label htmlFor="studentGender" className="block text-sm font-medium text-gray-700 mb-1">
              学生性别
            </label>
            <select
              id="studentGender"
              value={studentInfo.studentGender || ''}
              onChange={(e) => handleStudentInfoChange('studentGender', e.target.value || undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">请选择性别</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
        </div>
      </div>

      {/* 家长联系信息 */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <i className="fa-solid fa-phone mr-2"></i>
          家长联系信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
              家长姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="parentName"
              value={studentInfo.parentName}
              onChange={(e) => handleStudentInfoChange('parentName', e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.parentName 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="例如：张先生"
            />
            {errors.parentName && (
              <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>
            )}
          </div>
          <div>
            <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
              家长电话 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="parentPhone"
              value={studentInfo.parentPhone}
              onChange={(e) => handleStudentInfoChange('parentPhone', e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.parentPhone 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="例如：13800138000"
            />
            {errors.parentPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.parentPhone}</p>
            )}
          </div>
          <div>
            <label htmlFor="parentRelationship" className="block text-sm font-medium text-gray-700 mb-1">
              与孩子关系
            </label>
            <select
              id="parentRelationship"
              value={studentInfo.parentRelationship}
              onChange={(e) => handleStudentInfoChange('parentRelationship', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="父亲">父亲</option>
              <option value="母亲">母亲</option>
              <option value="爷爷">爷爷</option>
              <option value="奶奶">奶奶</option>
              <option value="外公">外公</option>
              <option value="外婆">外婆</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              家庭地址
            </label>
            <input
              type="text"
              id="address"
              value={studentInfo.address}
              onChange={(e) => handleStudentInfoChange('address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="例如：北京市朝阳区xxx街道"
            />
          </div>
        </div>
      </div>

      {/* 学习情况分析 */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
          <i className="fa-solid fa-chart-line mr-2"></i>
          学习情况分析
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-700 mb-1">
              当前学习水平
            </label>
            <select
              id="currentLevel"
              value={studentInfo.currentLevel}
              onChange={(e) => handleStudentInfoChange('currentLevel', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="优秀">优秀</option>
              <option value="良好">良好</option>
              <option value="中等">中等</option>
              <option value="及格">及格</option>
              <option value="不及格">不及格</option>
            </select>
          </div>
          <div>
            <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700 mb-1">
              学习目标 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="learningGoals"
              value={studentInfo.learningGoals}
              onChange={(e) => handleStudentInfoChange('learningGoals', e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.learningGoals 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="例如：提高数学成绩，掌握解题技巧"
            />
            {errors.learningGoals && (
              <p className="mt-1 text-sm text-red-600">{errors.learningGoals}</p>
            )}
          </div>
        </div>
        
        {/* 科目强弱分析 */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                薄弱科目（可多选）
              </label>
              <div className="grid grid-cols-3 gap-2">
                {subjectOptions.slice(0, 9).map(subject => (
                  <label key={subject.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={studentInfo.weakSubjects?.includes(subject.value)}
                      onChange={() => handleSubjectSelection(subject.value, true)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{subject.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                优势科目（可多选）
              </label>
              <div className="grid grid-cols-3 gap-2">
                {subjectOptions.slice(0, 9).map(subject => (
                  <label key={subject.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={studentInfo.strongSubjects?.includes(subject.value)}
                      onChange={() => handleSubjectSelection(subject.value, false)}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{subject.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 特殊需求和辅导历史 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700 mb-1">
              特殊需求
            </label>
            <textarea
              id="specialNeeds"
              value={studentInfo.specialNeeds}
              onChange={(e) => handleStudentInfoChange('specialNeeds', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="例如：注意力不集中、学习困难等"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              是否有过辅导经历
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="previousTutoring"
                  checked={studentInfo.previousTutoring === true}
                  onChange={() => handleStudentInfoChange('previousTutoring', true)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">是</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="previousTutoring"
                  checked={studentInfo.previousTutoring === false}
                  onChange={() => handleStudentInfoChange('previousTutoring', false)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">否</span>
              </label>
            </div>
            {studentInfo.previousTutoring && (
              <textarea
                value={studentInfo.previousTutoringDetails}
                onChange={(e) => handleStudentInfoChange('previousTutoringDetails', e.target.value)}
                rows={2}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="请描述之前的辅导情况"
              />
            )}
          </div>
        </div>
      </div>

      {/* 任务标题 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          任务标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={cn(
            "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
            errors.title 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          )}
          placeholder="例如：数学辅导，提高孩子解题能力"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      {/* 任务描述 */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
          <i className="fa-solid fa-edit mr-2"></i>
          任务详细描述
        </h3>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            具体需求描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
              errors.description 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder="请详细描述您的具体需求，例如：\n• 孩子目前遇到的学习困难\n• 希望老师重点辅导的内容\n• 期望达到的学习目标\n• 对老师教学方式的要求\n• 其他特殊要求或注意事项..."
          />
          <div className="flex justify-between items-center mt-2">
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-sm text-gray-500">{formData.description.length}/800字</p>
          </div>
        </div>
      </div>
      
      {/* 辅导科目和年级 */}
      <div className="bg-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
          <i className="fa-solid fa-book-open mr-2"></i>
          辅导科目和年级
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 科目 */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              辅导科目 <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.subject 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
            >
              <option value="">请选择科目</option>
              {subjectOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>
          
          {/* 年级 */}
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              辅导年级 <span className="text-red-500">*</span>
            </label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.grade 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
            >
              <option value="">请选择年级</option>
              {gradeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 课时和价格 */}
      <div className="bg-orange-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
          <i className="fa-solid fa-clock mr-2"></i>
          课时和价格设置
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 课时数量 */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              课时数量（小时） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              max="200"
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                errors.duration 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="预计需要的辅导课时数量"
            />
            <p className="mt-1 text-sm text-gray-500">
              建议：小学1-2小时/次，中学2-3小时/次
            </p>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>
          
          {/* 总价格 */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              总价格（元） <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <i className="fa-solid fa-yen-sign"></i>
              </span>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="1"
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
                  errors.price 
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                )}
                placeholder="辅导服务的总价格"
                readOnly
              />
            </div>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <i className="fa-solid fa-info-circle mr-1"></i>
                价格说明：
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• 小学（1-6年级）：100元/小时</li>
                <li>• 初中（7-9年级）：150元/小时</li>
                <li>• 高中（10-12年级）：200元/小时</li>
                <li>• 价格 = 课时数 × 年级基础价格</li>
              </ul>
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 老师选择 */}
      <div className="bg-teal-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
          <i className="fa-solid fa-chalkboard-teacher mr-2"></i>
          选择辅导老师
        </h3>
        <div>
          <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
            指定老师（可选）
          </label>
          <select
            id="teacherId"
            name="teacherId"
            value={formData.teacherId || ''}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-all",
              errors.teacherId 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
          >
            <option value="">请选择老师（可选）</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name || `老师${teacher.id}`}
              </option>
            ))}
          </select>
          <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <p className="text-sm text-teal-800">
              <i className="fa-solid fa-lightbulb mr-1"></i>
              选择说明：
            </p>
            <ul className="text-xs text-teal-700 mt-1 space-y-1">
              <li>• 如果指定老师，系统会优先联系该老师</li>
              <li>• 如果不指定，系统会推荐合适的老师</li>
              <li>• 老师确认接受后，可直接进入支付流程</li>
            </ul>
          </div>
          {errors.teacherId && (
            <p className="mt-1 text-sm text-red-600">{errors.teacherId}</p>
          )}
        </div>
      </div>
      
      {/* 提交按钮 */}
      <div className="pt-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">确认发布教学任务</h3>
            <p className="text-sm text-blue-600">
              请仔细检查所有信息，提交后将进入支付流程
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin mr-3 text-xl"></i>
                <span>正在提交...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <i className="fa-solid fa-rocket mr-3 text-xl"></i>
                <span>发布教学任务</span>
              </div>
            )}
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              <i className="fa-solid fa-shield-alt mr-1"></i>
              提交后可直接支付，管理员确认后将开启三方群聊
            </p>
            <p className="text-xs text-gray-500 mt-1">
              您的个人信息将受到严格保护，仅用于教学服务
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}