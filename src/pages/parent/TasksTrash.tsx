import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';

export default function TasksTrash() {
	const { userId } = useContext(AuthContext);
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<any[]>([]);

	useEffect(() => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		setTasks(all.filter((t: any) => t.publisherId === userId && t.isDeleted));
	}, [userId]);

	const update = (next: any[]) => {
		localStorage.setItem('tasks', JSON.stringify(next));
		setTasks(next.filter((t: any) => t.publisherId === userId && t.isDeleted));
	};

	const restore = (id: string) => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		update(all.map((t: any) => (t.id === id ? { ...t, isDeleted: false, deletedAt: undefined } : t)));
	};
	const removePermanently = (id: string) => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		update(all.filter((t: any) => t.id !== id));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-800">回收站</h2>
				<button onClick={() => navigate('/parent/tasks')} className="text-blue-600 hover:text-blue-800">返回任务</button>
			</div>
			<div className="bg-white rounded-xl shadow-md p-6">
				{tasks.length === 0 ? (
					<p className="text-gray-500">回收站为空</p>
				) : (
					<div className="space-y-3">
						{tasks.map(t => (
							<div key={t.id} className="border rounded-lg p-4 flex items-center justify-between">
								<div>
									<p className="font-medium">{t.title}</p>
									<p className="text-sm text-gray-500">金额 ¥{Number(t.price).toFixed(2)}</p>
								</div>
								<div className="space-x-2">
									<button onClick={() => restore(t.id)} className="px-3 py-1.5 bg-green-600 text-white rounded">恢复</button>
									<button onClick={() => removePermanently(t.id)} className="px-3 py-1.5 bg-red-600 text-white rounded">彻底删除</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}