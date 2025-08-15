import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { VirtualTable } from '@/components/VirtualList';
import { SkeletonTableRow } from '@/components/Skeleton';
import { TaskEmptyState } from '@/components/EmptyState';

function toCSV(rows: any[]): string {
	const headers = ['标题','金额','状态','课时','年级','科目'];
	const lines = rows.map(r => [r.title, r.price, r.status, r.duration, r.grade, r.subject].join(','));
	return [headers.join(','), ...lines].join('\n');
}

export default function AdminTasks() {
	const { userId } = useContext(AuthContext);
	const [tasks, setTasks] = useState<any[]>([]);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');

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
		const chatGroupId = `chat-${Date.now()}`;
		const chatGroups = JSON.parse(localStorage.getItem('chatGroups') || '{}');
		const taskTitle = (tasks.find(t => t.id === id)?.title) || '教学任务';
		const target = tasks.find(t => t.id === id);
		chatGroups[chatGroupId] = {
			id: chatGroupId,
			taskId: id,
			taskTitle,
			members: [
				{ id: target?.publisherId, role: 'parent' },
				{ id: target?.teacherId, role: 'teacher' },
				{ id: userId, role: 'admin' }
			],
			createdAt: new Date()
		};
		localStorage.setItem('chatGroups', JSON.stringify(chatGroups));
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

	const rows = useMemo(() => {
		const s = search.trim().toLowerCase();
		return tasks
			.filter((t) => (statusFilter === 'all' ? true : t.status === statusFilter))
			.filter((t) => (s ? `${t.title} ${t.subject} ${t.grade}`.toLowerCase().includes(s) : true))
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [tasks, search, statusFilter]);

	const stats = useMemo(() => {
		const grouped: Record<string, number> = {};
		tasks.forEach(t => { grouped[t.status] = (grouped[t.status] || 0) + 1; });
		return grouped;
	}, [tasks]);

	const exportCSV = () => {
		const csv = toCSV(rows);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `tasks_${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-800">任务审核与支付确认</h2>

			{/* 快捷统计 */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{['pending','approved','payment_pending','payment_rejected','assigned'].map((k) => (
					<div key={k} className="bg-white rounded-lg border p-3 text-sm text-gray-700 flex items-center justify-between">
						<span>{k}</span>
						<span className="font-semibold">{stats[k] || 0}</span>
					</div>
				))}
			</div>

			{/* 筛选搜索 */}
			<div className="flex flex-col md:flex-row gap-3 items-center">
				<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索标题/科目/年级" className="w-full md:w-72 px-3 py-2 border rounded"/>
				<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded">
					<option value="all">全部状态</option>
					<option value="pending">待审核</option>
					<option value="approved">已审核</option>
					<option value="payment_pending">待管理员确认</option>
					<option value="payment_rejected">支付被驳回</option>
					<option value="assigned">已建群</option>
					<option value="cancelled">已取消</option>
				</select>
				<button onClick={exportCSV} className="px-3 py-2 bg-gray-800 text-white rounded">导出CSV</button>
			</div>

			{/* 任务列表 */}
			{rows.length > 0 ? (
				<div className="h-[600px]">
					<VirtualTable
						items={rows}
						height={600}
						rowHeight={60}
						columns={[
							{ key: 'title', header: '标题', width: '40%' },
							{ key: 'price', header: '金额', width: '20%', render: (item) => `¥${Number(item.price).toFixed(2)}` },
							{ key: 'status', header: '状态', width: '20%', render: (item) => (
								<span className="text-sm text-gray-600">{item.status}</span>
							)},
							{ key: 'actions', header: '操作', width: '20%', render: (item) => (
								<div className="text-right space-x-2">
									{item.status === 'pending' && (
										<button onClick={() => approve(item.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">
											通过
										</button>
									)}
									{item.status === 'payment_pending' && (
										<>
											<button onClick={() => confirmPayment(item.id)} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm">
												确认支付
											</button>
											<button onClick={() => rejectPayment(item.id)} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm">
												驳回
											</button>
										</>
									)}
								</div>
							)}
						]}
					/>
				</div>
			) : (
				<TaskEmptyState type="all" />
			)}
		</div>
	);
}