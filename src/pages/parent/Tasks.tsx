import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { VirtualList } from '@/components/VirtualList';
import { SkeletonListItem } from '@/components/Skeleton';
import { TaskEmptyState } from '@/components/EmptyState';

interface TaskItem {
	id: string;
	title: string;
	description: string;
	subject: string;
	grade: string;
	duration: number;
	price: number;
	status: string;
	teacherId?: string;
	createdAt: string | Date;
	isDeleted?: boolean;
}

const statusText: Record<string, { label: string; color: string }> = {
	pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
	approved: { label: '已审核', color: 'bg-blue-100 text-blue-700' },
	payment_pending: { label: '待管理员确认', color: 'bg-purple-100 text-purple-700' },
	payment_rejected: { label: '支付被驳回', color: 'bg-red-100 text-red-700' },
	assigned: { label: '已建群', color: 'bg-green-100 text-green-700' },
	in_progress: { label: '进行中', color: 'bg-green-100 text-green-700' },
	completed: { label: '已完成', color: 'bg-gray-100 text-gray-700' },
	cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
};

export default function ParentTasks() {
	const { userId } = useContext(AuthContext);
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<TaskItem[]>([]);

	useEffect(() => {
		if (!userId) return;
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const mine = all.filter((t: TaskItem) => t.publisherId === userId && !t.isDeleted);
		setTasks(mine);
	}, [userId]);

	const handlePay = (taskId: string) => {
		navigate(`/parent/payment/${taskId}`);
	};

	const moveToTrash = (taskId: string) => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const next = all.map((t: any) => (t.id === taskId ? { ...t, isDeleted: true, deletedAt: new Date() } : t));
		localStorage.setItem('tasks', JSON.stringify(next));
		setTasks(next.filter((t: TaskItem) => t.publisherId === userId && !t.isDeleted));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-800">我的任务</h2>
					<p className="text-gray-500 mt-1">查看任务状态，继续支付或进入群聊</p>
				</div>
				<button onClick={() => navigate('/parent/tasks/trash')} className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">回收站</button>
			</div>

			{tasks.length === 0 ? (
				<TaskEmptyState 
					type="all"
					onCreateNew={() => navigate('/parent/tasks/new')}
				/>
			) : (
				<div className="h-[600px]">
					<VirtualList
						items={tasks}
						height={600}
						itemHeight={120}
						renderItem={(task) => (
							<div key={task.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-100 mb-4">
								<div className="flex items-start justify-between">
									<div>
										<button onClick={() => navigate(`/parent/tasks/${task.id}`)} className="text-left">
											<h3 className="text-lg font-medium text-gray-800 hover:text-blue-700">{task.title}</h3>
										</button>
										<p className="text-gray-500 text-sm mt-1">课时：{task.duration} 小时 · 金额：¥{Number(task.price).toFixed(2)}</p>
									</div>
									<span className={`px-2 py-1 rounded text-xs font-medium ${statusText[task.status]?.color || 'bg-gray-100 text-gray-700'}`}>
										{statusText[task.status]?.label || task.status}
									</span>
								</div>

								<div className="mt-4 flex items-center gap-3">
									{(task.status === 'pending' || task.status === 'approved' || task.status === 'payment_rejected' || task.status === 'payment_pending') && (
										<button onClick={() => handlePay(task.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
											{task.status === 'payment_pending' ? '已提交，待确认' : '选择并支付'}
										</button>
									)}
									{task.chatGroupId && (
										<button onClick={() => navigate('/parent/messages')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">进入群聊</button>
									)}
									{!task.chatGroupId && (
										<button onClick={() => moveToTrash(task.id)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">删除</button>
									)}
								</div>
							</div>
						)}
					/>
				</div>
			)}
		</div>
	);
}