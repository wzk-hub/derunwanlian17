import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';

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
		const mine = all.filter((t: TaskItem) => t.publisherId === userId);
		setTasks(mine);
	}, [userId]);

	const handlePay = (taskId: string) => {
		navigate(`/parent/payment/${taskId}`);
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-800">我的任务</h2>
				<p className="text-gray-500 mt-1">查看任务状态，继续支付或进入群聊</p>
			</div>

			{tasks.length === 0 ? (
				<div className="bg-white rounded-xl shadow-md p-12 text-center">
					<p className="text-gray-500">暂无任务，去发布一个吧。</p>
					<button onClick={() => navigate('/parent/tasks/new')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">发布任务</button>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4">
					{tasks.map((t) => (
						<div key={t.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
							<div className="flex items-start justify-between">
								<div>
									<button onClick={() => navigate(`/parent/tasks/${t.id}`)} className="text-left">
										<h3 className="text-lg font-medium text-gray-800 hover:text-blue-700">{t.title}</h3>
									</button>
									<p className="text-gray-500 text-sm mt-1">课时：{t.duration} 小时 · 金额：¥{Number(t.price).toFixed(2)}</p>
								</div>
								<span className={`px-2 py-1 rounded text-xs font-medium ${statusText[t.status]?.color || 'bg-gray-100 text-gray-700'}`}>
									{statusText[t.status]?.label || t.status}
								</span>
							</div>

							<div className="mt-4 flex items-center gap-3">
								{(t.status === 'pending' || t.status === 'approved' || t.status === 'payment_rejected' || t.status === 'payment_pending') && (
									<button onClick={() => handlePay(t.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
										{t.status === 'payment_pending' ? '已提交，待确认' : '选择并支付'}
									</button>
								)}
								{t.chatGroupId && (
									<button onClick={() => navigate('/parent/messages')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">进入群聊</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}