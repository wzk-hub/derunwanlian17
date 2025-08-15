import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';

export default function TeacherTasks() {
	const { userId } = useContext(AuthContext);
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<any[]>([]);

	useEffect(() => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		setTasks(all.filter((t: any) => t.teacherId === userId));
	}, [userId]);

	const update = (id: string, updater: (t: any) => any) => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const next = all.map((t: any) => (t.id === id ? updater(t) : t));
		localStorage.setItem('tasks', JSON.stringify(next));
		setTasks(next.filter((t: any) => t.teacherId === userId));
	};

	const accept = (id: string) => {
		// 更新状态为进行中，并在群聊里发一条消息
		const allChats = JSON.parse(localStorage.getItem('messages') || '{}');
		const task = tasks.find(t => t.id === id);
		if (task?.chatGroupId) {
			allChats[task.chatGroupId] = allChats[task.chatGroupId] || [];
			allChats[task.chatGroupId].push({ id: `msg-${Date.now()}`, senderId: userId, senderRole: 'teacher', content: '老师已接受任务，准备开始教学。', createdAt: new Date() });
			localStorage.setItem('messages', JSON.stringify(allChats));
		}
		update(id, (t) => ({ ...t, status: 'in_progress', updatedAt: new Date() }));
	};

	const complete = (id: string) => {
		const allChats = JSON.parse(localStorage.getItem('messages') || '{}');
		const task = tasks.find(t => t.id === id);
		if (task?.chatGroupId) {
			allChats[task.chatGroupId] = allChats[task.chatGroupId] || [];
			allChats[task.chatGroupId].push({ id: `msg-${Date.now()}`, senderId: userId, senderRole: 'teacher', content: '本次教学任务已完成，请管理员后续结算。', createdAt: new Date() });
			localStorage.setItem('messages', JSON.stringify(allChats));
		}
		update(id, (t) => ({ ...t, status: 'completed', completedAt: new Date(), updatedAt: new Date() }));
	};

	const assigned = tasks.filter(t => t.status === 'assigned');
	const inProgress = tasks.filter(t => t.status === 'in_progress');
	const completed = tasks.filter(t => t.status === 'completed');

	return (
		<div className="space-y-8">
			<section>
				<h3 className="text-xl font-semibold mb-3">待开始</h3>
				{assigned.length === 0 ? (
					<p className="text-gray-500">暂无待开始任务</p>
				) : (
					<div className="space-y-3">
						{assigned.map(t => (
							<div key={t.id} className="border rounded-lg p-4 flex items-center justify-between">
								<div>
									<p className="font-medium">{t.title}</p>
									<p className="text-sm text-gray-500">课时 {t.duration} · 金额 ¥{Number(t.price).toFixed(2)}</p>
								</div>
								<div className="space-x-2">
									<button onClick={() => accept(t.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded">接受任务</button>
									{t.chatGroupId && <button onClick={() => navigate('/teacher/messages')} className="px-3 py-1.5 bg-green-600 text-white rounded">进入群聊</button>}
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			<section>
				<h3 className="text-xl font-semibold mb-3">进行中</h3>
				{inProgress.length === 0 ? (
					<p className="text-gray-500">暂无进行中任务</p>
				) : (
					<div className="space-y-3">
						{inProgress.map(t => (
							<div key={t.id} className="border rounded-lg p-4 flex items-center justify-between">
								<div>
									<p className="font-medium">{t.title}</p>
									<p className="text-sm text-gray-500">课时 {t.duration} · 金额 ¥{Number(t.price).toFixed(2)}</p>
								</div>
								<div className="space-x-2">
									<button onClick={() => complete(t.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded">标记完成</button>
									{t.chatGroupId && <button onClick={() => navigate('/teacher/messages')} className="px-3 py-1.5 bg-green-600 text-white rounded">进入群聊</button>}
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			<section>
				<h3 className="text-xl font-semibold mb-3">已完成</h3>
				{completed.length === 0 ? (
					<p className="text-gray-500">暂无已完成任务</p>
				) : (
					<div className="space-y-3">
						{completed.map(t => (
							<div key={t.id} className="border rounded-lg p-4 flex items-center justify-between">
								<div>
									<p className="font-medium">{t.title}</p>
									<p className="text-sm text-gray-500">课时 {t.duration} · 金额 ¥{Number(t.price).toFixed(2)}</p>
								</div>
								<div className="space-x-2">
									{t.chatGroupId && <button onClick={() => navigate('/teacher/messages')} className="px-3 py-1.5 bg-green-600 text-white rounded">查看群聊</button>}
								</div>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}