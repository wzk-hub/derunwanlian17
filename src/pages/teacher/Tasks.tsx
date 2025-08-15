import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { Task } from '@/models/Task';

export default function TeacherTasks() {
	const { userId } = useContext(AuthContext);
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [filter, setFilter] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all');

	useEffect(() => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		// 获取所有任务，包括分配给该老师的和所有置顶任务
		const userTasks = all.filter((t: Task) => 
			t.teacherId === userId || 
			(t.isPinned && t.status === 'approved' && !t.assignedTeacherId)
		);
		setTasks(userTasks);
	}, [userId]);

	const update = (id: string, updater: (t: any) => any) => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const next = all.map((t: any) => (t.id === id ? updater(t) : t));
		localStorage.setItem('tasks', JSON.stringify(next));
		setTasks(next.filter((t: Task) => 
			t.teacherId === userId || 
			(t.isPinned && t.status === 'approved' && !t.assignedTeacherId)
		));
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

	// 按状态过滤任务
	const filteredTasks = useMemo(() => {
		if (filter === 'all') return tasks;
		return tasks.filter(t => t.status === filter);
	}, [tasks, filter]);

	// 排序任务：置顶任务优先，然后按时间排序
	const sortedTasks = useMemo(() => {
		return [...filteredTasks].sort((a, b) => {
			// 置顶任务优先
			if (a.isPinned && !b.isPinned) return -1;
			if (!a.isPinned && b.isPinned) return 1;
			if (a.isPinned && b.isPinned) {
				// 置顶任务按置顶顺序排序
				return (a.pinnedOrder || 0) - (b.pinnedOrder || 0);
			}
			// 非置顶任务按创建时间排序
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}, [filteredTasks]);

	// 接受任务
	const acceptTask = (taskId: string) => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const next = all.map((t: Task) => {
			if (t.id === taskId) {
				return {
					...t,
					teacherId: userId,
					status: 'assigned' as const,
					updatedAt: new Date()
				};
			}
			return t;
		});
		localStorage.setItem('tasks', JSON.stringify(next));
		setTasks(next.filter((t: Task) => 
			t.teacherId === userId || 
			(t.isPinned && t.status === 'approved' && !t.assignedTeacherId)
		));
	};

	return (
		<div className="space-y-6">
			{/* 过滤标签 */}
			<div className="flex space-x-2 mb-6">
				{(['all', 'assigned', 'in_progress', 'completed'] as const).map((status) => (
					<button
						key={status}
						onClick={() => setFilter(status)}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							filter === status
								? 'bg-blue-600 text-white'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
						}`}
					>
						{status === 'all' ? '全部任务' : 
						 status === 'assigned' ? '待开始' :
						 status === 'in_progress' ? '进行中' : '已完成'}
					</button>
				))}
			</div>

			{/* 任务列表 */}
			<div className="space-y-4">
				{sortedTasks.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<i className="fa-solid fa-tasks text-4xl mb-4"></i>
						<p>暂无任务</p>
					</div>
				) : (
					sortedTasks.map(task => (
						<div 
							key={task.id} 
							className={`border rounded-lg p-4 ${
								task.isPinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
							}`}
						>
							{/* 置顶标识 */}
							{task.isPinned && (
								<div className="flex items-center mb-2">
									<i className="fa-solid fa-thumbtack text-blue-600 mr-2"></i>
									<span className="text-blue-600 text-sm font-medium">置顶任务</span>
									{task.source === 'admin' && (
										<span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
											系统推荐
										</span>
									)}
								</div>
							)}

							<div className="flex items-center justify-between">
								<div className="flex-1">
									<h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
									<p className="text-sm text-gray-600 mb-2">{task.description}</p>
									<div className="flex items-center space-x-4 text-sm text-gray-500">
										<span>科目：{task.subject}</span>
										<span>年级：{task.grade}</span>
										<span>课时：{task.duration}</span>
										<span>金额：¥{Number(task.price).toFixed(2)}</span>
									</div>
									{task.tags && task.tags.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-2">
											{task.tags.map(tag => (
												<span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
													{tag}
												</span>
											))}
										</div>
									)}
								</div>

								<div className="flex flex-col space-y-2 ml-4">
									{task.status === 'approved' && !task.teacherId && (
										<button 
											onClick={() => acceptTask(task.id)}
											className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
										>
											接受任务
										</button>
									)}
									
									{task.status === 'assigned' && task.teacherId === userId && (
										<button 
											onClick={() => accept(task.id)}
											className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
										>
											开始教学
										</button>
									)}
									
									{task.status === 'in_progress' && task.teacherId === userId && (
										<button 
											onClick={() => complete(task.id)}
											className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
										>
											标记完成
										</button>
									)}
									
									{task.chatGroupId && (
										<button 
											onClick={() => navigate('/teacher/messages')}
											className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
										>
											进入群聊
										</button>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}