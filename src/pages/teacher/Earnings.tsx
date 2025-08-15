import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/contexts/authContext';
import type { Task } from '@/models/Task';
import { formatPrice } from '@/lib/utils';

function isInThisMonth(date: Date | string) {
	const d = typeof date === 'string' ? new Date(date) : date;
	if (!(d instanceof Date) || isNaN(d.getTime())) return false;
	const now = new Date();
	return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function Earnings() {
	const { userId } = useContext(AuthContext);
	const [tasks, setTasks] = useState<Task[]>([]);

	useEffect(() => {
		const all: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
		// 老师维度：teacherId 匹配当前老师，计入本月已指派及以上（避免未支付）
		const mine = all.filter((t: any) => t.teacherId === userId && (
			t.status === 'assigned' || t.status === 'in_progress' || t.status === 'completed' || t.status === 'settled'
		));
		setTasks(mine);
	}, [userId]);

	const bySubject = useMemo(() => {
		const stats: Record<string, { count: number; amount: number }> = {};
		for (const t of tasks) {
			// 以支付确认时间或创建时间判定月份，优先 paymentConfirmedAt
			const time = (t as any).paymentConfirmedAt || t.createdAt;
			if (!isInThisMonth(time)) continue;
			const key = t.subject;
			if (!stats[key]) stats[key] = { count: 0, amount: 0 };
			stats[key].count += 1;
			stats[key].amount += Number(t.price) || 0;
		}
		return stats;
	}, [tasks]);

	const total = useMemo(() => Object.values(bySubject).reduce((s, v) => s + v.amount, 0), [bySubject]);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-800">本月收益</h2>
				<p className="text-gray-500 mt-1">按本月所教学科目累加</p>
			</div>
			<div className="bg-white rounded-xl shadow p-6">
				<div className="text-3xl font-bold text-green-600">{formatPrice(total)}</div>
				<p className="text-gray-500 mt-1 text-sm">包含本月已指派及以上状态任务</p>
			</div>
			<div className="space-y-3">
				{Object.keys(bySubject).length === 0 ? (
					<p className="text-gray-500">本月暂无收益</p>
				) : (
					Object.entries(bySubject).map(([subject, v]) => (
						<div key={subject} className="border rounded-lg p-4 flex items-center justify-between">
							<div className="text-gray-800">{getSubjectName(subject)}（{v.count}单）</div>
							<div className="font-medium">{formatPrice(v.amount)}</div>
						</div>
					))
				)}
			</div>
		</div>
	);
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