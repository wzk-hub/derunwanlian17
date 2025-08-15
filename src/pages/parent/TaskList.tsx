import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { formatDate } from '@/lib/utils';
import type { Task } from '@/models/Task';

export default function TaskList() {
	const { userId } = useContext(AuthContext);
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		setTimeout(() => {
			const allTasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
			const myTasks = allTasks.filter((t: any) => t.publisherId === userId);
			setTasks(myTasks);
			setLoading(false);
		}, 300);
	}, [userId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[300px] text-gray-500">加载中...</div>
		);
	}

	if (tasks.length === 0) {
		return (
			<div className="text-center text-gray-500 py-12">
				<p>还没有发布任何任务</p>
				<button
					onClick={() => navigate('/parent/tasks/new')}
					className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					去发布任务
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{tasks.map((task) => (
				<div key={task.id} className="border rounded-xl p-4 flex items-start justify-between">
					<div>
						<div className="text-lg font-medium text-gray-800">{task.title}</div>
						<div className="text-sm text-gray-500 mt-1">
							<span className="mr-4">科目：{getSubjectName(task.subject)}</span>
							<span className="mr-4">年级：{getGradeName(task.grade)}</span>
							<span className="mr-4">课时：{task.duration}小时</span>
							<span>价格：¥{Number(task.price).toFixed(2)}</span>
						</div>
						<div className="text-xs text-gray-400 mt-1">创建于 {formatDate(task.createdAt)}</div>
						{(task as any).studentName || (task as any).studentSchool ? (
							<div className="text-sm text-gray-600 mt-2">
								{(task as any).studentName && <span className="mr-4">学生：{(task as any).studentName}</span>}
								{(task as any).studentSchool && <span>学校：{(task as any).studentSchool}</span>}
							</div>
						) : null}
					</div>
					<div className="text-right">
						<div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusClass(task.status)}`}>
							{statusText(task.status)}
						</div>
						{task.status === 'approved' && (
							<button
								onClick={() => navigate(`/parent/payment/${task.id}`)}
								className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
							>
								去支付
							</button>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

function statusText(status: Task['status']) {
	switch (status) {
		case 'pending':
			return '待审核';
		case 'approved':
			return '待支付';
		case 'payment_pending':
			return '支付确认中';
		case 'assigned':
			return '已指派';
		case 'in_progress':
			return '进行中';
		case 'completed':
			return '已完成';
		case 'settled':
			return '已结算';
		default:
			return status;
	}
}

function statusClass(status: Task['status']) {
	switch (status) {
		case 'pending':
			return 'bg-yellow-100 text-yellow-700';
		case 'approved':
			return 'bg-blue-100 text-blue-700';
		case 'payment_pending':
			return 'bg-purple-100 text-purple-700';
		case 'assigned':
			return 'bg-teal-100 text-teal-700';
		case 'in_progress':
			return 'bg-indigo-100 text-indigo-700';
		case 'completed':
			return 'bg-green-100 text-green-700';
		case 'settled':
			return 'bg-gray-100 text-gray-700';
		default:
			return 'bg-gray-100 text-gray-700';
	}
}

function getSubjectName(subjectValue: string): string {
	const subjectMap: Record<string, string> = {
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
	return subjectMap[subjectValue] || subjectValue;
}

function getGradeName(gradeValue: string): string {
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
		'12': '高三',
	};
	return gradeMap[gradeValue] || gradeValue;
}