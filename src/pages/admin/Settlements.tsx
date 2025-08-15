import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '@/contexts/authContext';

function toCSV(rows: any[]): string {
	const headers = ['标题','金额','老师ID','老师结算','状态','完成时间'];
	const lines = rows.map(r => [r.title, r.price, r.teacherId || '', r.settledAmount || '', r.status, r.completedAt || ''].join(','));
	return [headers.join(','), ...lines].join('\n');
}

export default function AdminSettlements() {
	const { userId } = useContext(AuthContext);
	const [tasks, setTasks] = useState<any[]>([]);
	const [rate, setRate] = useState<number>(0.8); // 默认按 80% 结给老师

	useEffect(() => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		setTasks(all);
	}, []);

	const rows = useMemo(() => tasks.filter((t: any) => t.status === 'completed' || t.status === 'settled'), [tasks]);

	const settle = (id: string) => {
		const all = JSON.parse(localStorage.getItem('tasks') || '[]');
		const next = all.map((t: any) => {
			if (t.id !== id) return t;
			const settledAmount = Math.round((Number(t.price) * rate) * 100) / 100;
			return { ...t, status: 'settled', settledAt: new Date(), settledById: userId, settledAmount };
		});
		localStorage.setItem('tasks', JSON.stringify(next));
		setTasks(next);
	};

	const exportCSV = () => {
		const csv = toCSV(rows);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `settlements_${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-800">结算管理</h2>
			<div className="flex items-center gap-3">
				<label className="text-gray-600">老师结算比例</label>
				<input type="number" value={rate} step={0.05} min={0} max={1} onChange={(e) => setRate(parseFloat(e.target.value) || 0.8)} className="px-3 py-2 border rounded w-28"/>
				<button onClick={exportCSV} className="px-3 py-2 bg-gray-800 text-white rounded">导出支付记录</button>
			</div>
			<div className="bg-white rounded-xl shadow-md overflow-hidden">
				<table className="min-w-full">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-3 text-left text-sm text-gray-600">标题</th>
							<th className="px-4 py-3 text-left text-sm text-gray-600">金额</th>
							<th className="px-4 py-3 text-left text-sm text-gray-600">完成时间</th>
							<th className="px-4 py-3 text-left text-sm text-gray-600">结算给老师</th>
							<th className="px-4 py-3 text-right text-sm text-gray-600">操作</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((t: any) => (
							<tr key={t.id} className="border-t">
								<td className="px-4 py-3">{t.title}</td>
								<td className="px-4 py-3">¥{Number(t.price).toFixed(2)}</td>
								<td className="px-4 py-3 text-sm text-gray-500">{t.completedAt ? new Date(t.completedAt).toLocaleString() : '-'}</td>
								<td className="px-4 py-3">{t.settledAmount ? `¥${Number(t.settledAmount).toFixed(2)}` : `预计 ¥${(Number(t.price) * rate).toFixed(2)}`}</td>
								<td className="px-4 py-3 text-right">
									{t.status === 'completed' ? (
										<button onClick={() => settle(t.id)} className="px-3 py-1.5 bg-green-600 text-white rounded">结算</button>
									) : (
										<span className="text-green-700">已结算</span>
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