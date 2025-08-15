import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import TeacherRatingComponent from '@/components/TeacherRating';
import { TeacherRating } from '@/models/User';

export default function ParentTaskDetail() {
	const { userId } = useContext(AuthContext);
	const { taskId } = useParams<{ taskId: string }>();
	const navigate = useNavigate();
	const [task, setTask] = useState<any | null>(null);
	const [existingRating, setExistingRating] = useState<TeacherRating | null>(null);

	useEffect(() => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const t = all.find((x: any) => x.id === taskId && x.publisherId === userId);
		setTask(t || null);
		
		// 检查是否已有评分
		if (t && t.assignedTeacherId) {
			const ratings = JSON.parse(localStorage.getItem('teacherRatings') || '[]');
			const rating = ratings.find((r: TeacherRating) => 
				r.taskId === taskId && r.teacherId === t.assignedTeacherId
			);
			setExistingRating(rating || null);
		}
	}, [taskId, userId]);

	const cancelTask = () => {
		if (!task) return;
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const next = all.map((x: any) => x.id === task.id ? { ...x, status: 'cancelled', cancelledAt: new Date(), cancelledById: userId } : x);
		localStorage.setItem('tasks', JSON.stringify(next));
		navigate('/parent/tasks');
	};

	const repostTask = () => {
		if (!task) return;
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const newTask = {
			...task,
			id: `task-${Date.now()}`,
			status: 'pending',
			createdAt: new Date(),
			updatedAt: new Date(),
			approvedAt: undefined,
			approvedById: undefined,
			paymentConfirmedAt: undefined,
			paymentConfirmedById: undefined,
			chatGroupId: undefined,
			paymentTransactionId: undefined,
			cancelledAt: undefined,
			cancelledById: undefined,
		};
		all.push(newTask);
		localStorage.setItem('tasks', JSON.stringify(all));
		navigate(`/parent/payment/${newTask.id}`);
	};

	if (!task) {
		return <div className="text-gray-500">未找到任务</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-800">任务详情</h2>
					<p className="text-gray-500 mt-1">{task.title}</p>
				</div>
				<button onClick={() => navigate('/parent/tasks')} className="text-blue-600 hover:text-blue-800">返回列表</button>
			</div>

			<div className="bg-white rounded-xl shadow-md p-6 space-y-3">
				<p className="text-gray-700">科目：{task.subject}</p>
				<p className="text-gray-700">年级：{task.grade}</p>
				<p className="text-gray-700">学校：{task.studentSchool || '-'}</p>
				<p className="text-gray-700">课时：{task.duration} 小时</p>
				<p className="text-gray-700">金额：¥{Number(task.price).toFixed(2)}</p>
				<p className="text-gray-700">状态：{task.status}</p>
			</div>

			<div className="flex flex-wrap gap-3">
				<button onClick={() => navigate(`/parent/tasks/${task.id}/edit`)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">编辑</button>
				{(task.status === 'pending' || task.status === 'approved' || task.status === 'payment_rejected' || task.status === 'payment_pending') && (
					<button onClick={() => navigate(`/parent/payment/${task.id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">选择并支付</button>
				)}
				<button onClick={repostTask} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">再次发布</button>
				{task.chatGroupId && (
					<button onClick={() => navigate('/parent/messages')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">进入群聊</button>
				)}
				{task.status !== 'cancelled' && !task.chatGroupId && (
					<button onClick={() => navigate('/parent/tasks')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">返回列表</button>
				)}
			</div>

			{/* 老师评分区域 */}
			{task.status === 'completed' && task.assignedTeacherId && (
				<div className="bg-white rounded-xl shadow-md p-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">为老师评分</h3>
					<TeacherRatingComponent
						teacherId={task.assignedTeacherId}
						teacherName={task.assignedTeacherName || '未知老师'}
						taskId={task.id}
						taskTitle={task.title}
						existingRating={existingRating}
						onRatingSubmit={(rating) => setExistingRating(rating)}
					/>
				</div>
			)}
		</div>
	);
}