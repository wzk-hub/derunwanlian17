import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/authContext';

export default function AdminTasks() {
	const { userId } = useContext(AuthContext);
	const [tasks, setTasks] = useState<any[]>([]);

	useEffect(() => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		setTasks(all);
	}, []);

	const updateTask = (id: string, updater: (t: any) => any) => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const next = all.map((t: any) => (t.id === id ? updater(t) : t));
		localStorage.setItem('tasks', JSON.stringify(next));
		setTasks(next);
	};

	const approve = (id: string) => {
		updateTask(id, (t) => ({ ...t, status: 'approved', approvedAt: new Date(), approvedById: userId }));
	};
	const confirmPayment = (id: string) => {
		// 创建群聊并标记为 assigned
		const chatGroupId = `chat-${Date.now()}`;
		// 保存群聊
		const chatGroups = JSON.parse(localStorage.getItem('chatGroups') || '{}');
		chatGroups[chatGroupId] = {
			id: chatGroupId,
			taskId: id,
			taskTitle: (tasks.find(t => t.id === id)?.title) || '教学任务',
			members: [
				{ id: tasks.find(t => t.id === id)?.publisherId, role: 'parent' },
				{ id: tasks.find(t => t.id === id)?.teacherId, role: 'teacher' },
				{ id: userId, role: 'admin' }
			],
			createdAt: new Date()
		};
		localStorage.setItem('chatGroups', JSON.stringify(chatGroups));
		// 欢迎消息
		const messages = JSON.parse(localStorage.getItem('messages') || '{}');
		messages[chatGroupId] = [
			{
				id: `msg-${Date.now()}`,
				senderId: userId,
				senderRole: 'admin',
				content: '家长支付已确认，老师可以开始准备教学。',
				createdAt: new Date()
			}
		];
		localStorage.setItem('messages', JSON.stringify(messages));
		updateTask(id, (t) => ({ ...t, status: 'assigned', paymentConfirmedAt: new Date(), paymentConfirmedById: userId, chatGroupId }));
	};
	const rejectPayment = (id: string) => {
		updateTask(id, (t) => ({ ...t, status: 'payment_rejected', rejectionReason: '支付未确认', updatedAt: new Date() }));
	};

	const rows = tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-800">任务审核与支付确认</h2>
			<div className="bg-white rounded-xl shadow-md overflow-hidden">
				<table className="min-w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-3 text-left text-sm text-gray-600">标题</th>
							<th className="px-4 py-3 text-left text-sm text-gray-600">金额</th>
							<th className="px-4 py-3 text-left text-sm text-gray-600">状态</th>
							<th className="px-4 py-3 text-right text-sm text-gray-600">操作</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((t: any) => (
							<tr key={t.id} className="border-t">
								<td className="px-4 py-3">{t.title}</td>
								<td className="px-4 py-3">¥{Number(t.price).toFixed(2)}</td>
								<td className="px-4 py-3 text-sm text-gray-600">{t.status}</td>
								<td className="px-4 py-3 text-right space-x-2">
									{t.status === 'pending' && (
										<button onClick={() => approve(t.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded">通过</button>
									)}
									{t.status === 'payment_pending' && (
										<>
											<button onClick={() => confirmPayment(t.id)} className="px-3 py-1.5 bg-green-600 text-white rounded">确认支付</button>
											<button onClick={() => rejectPayment(t.id)} className="px-3 py-1.5 bg-red-600 text-white rounded">驳回</button>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}