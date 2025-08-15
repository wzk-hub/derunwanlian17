import { CreateTaskRequest } from '@/models/Task';
import { cn } from '@/lib/utils';

interface TaskPreviewProps {
  taskData: CreateTaskRequest;
  onEdit: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

// 科目名称映射
const subjectNames: Record<string, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  physics: '物理',
  chemistry: '化学',
  biology: '生物',
  history: '历史',
  geography: '地理',
  politics: '政治',
};

// 年级名称映射
const gradeNames: Record<string, string> = {
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
  '12': '高三',
};

export default function TaskPreview({ taskData, onEdit, onConfirm, isSubmitting }: TaskPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">任务预览</h3>
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
        >
          <i className="fa-solid fa-edit mr-1"></i>
          编辑
        </button>
      </div>
      
      <div className="space-y-4">
        {/* 任务标题 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">{taskData.title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{taskData.description}</p>
        </div>
        
        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">辅导科目</span>
            <p className="font-medium text-gray-800">{subjectNames[taskData.subject] || taskData.subject}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">辅导年级</span>
            <p className="font-medium text-gray-800">{gradeNames[taskData.grade] || taskData.grade}</p>
          </div>
        </div>
        
        {/* 学校信息 */}
        {taskData.school && (
          <div>
            <span className="text-sm text-gray-500">学生学校</span>
            <p className="font-medium text-gray-800">{taskData.school}</p>
          </div>
        )}
        
        {/* 学生简介 */}
        {taskData.studentProfile && (
          <div>
            <span className="text-sm text-gray-500">学生简介</span>
            <p className="text-gray-800 text-sm leading-relaxed mt-1">{taskData.studentProfile}</p>
          </div>
        )}
        
        {/* 课时和价格 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">课时数量</span>
            <p className="font-medium text-gray-800">{taskData.duration}小时</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">总价格</span>
            <p className="font-bold text-lg text-blue-600">¥{taskData.price}</p>
          </div>
        </div>
        
        {/* 分割线 */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              预计完成时间：{taskData.duration}小时
            </div>
            <div className="text-sm text-gray-500">
              发布时间：{new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* 确认按钮 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className={cn(
            "w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isSubmitting 
              ? "bg-blue-400 cursor-not-allowed" 
              : "hover:bg-blue-700"
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              <span>发布中...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <i className="fa-solid fa-check mr-2"></i>
              <span>确认发布任务</span>
            </div>
          )}
        </button>
        
        <p className="mt-3 text-sm text-gray-500 text-center">
          发布后任务将进入审核流程，审核通过后老师可查看并接单
        </p>
      </div>
    </div>
  );
}