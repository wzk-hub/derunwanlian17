import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskForm from '@/components/TaskForm';
import { AuthContext } from '@/contexts/authContext';
import { CreateTaskRequest } from '@/models/Task';
import { toast } from 'sonner';

export default function ParentTaskEdit() {
	const { userId } = useContext(AuthContext);
	const { taskId } = useParams<{ taskId: string }>();
	const navigate = useNavigate();
	const [initialData, setInitialData] = useState<Partial<CreateTaskRequest>>({});
	const [teachers, setTeachers] = useState<Array<{ id: string; name?: string }>>([]);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!taskId || !userId) return;
		const users = JSON.parse(localStorage.getItem('users') || '[]');
		const teachersList = users.filter((u: any) => u.role === 'teacher').map((t: any) => ({ id: t.id, name: t.name }));
		setTeachers(teachersList);
		const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
		const t = tasks.find((x: any) => x.id === taskId && x.publisherId === userId);
		if (!t) {
			toast.error('未找到该任务');
			navigate('/parent/tasks');
			return;
		}
		setInitialData({
			title: t.title,
			description: t.description,
			subject: t.subject,
			grade: t.grade,
			duration: t.duration,
			price: t.price,
			studentName: t.studentName,
			studentSchool: t.studentSchool,
			teacherId: t.teacherId,
		});
		setLoading(false);
	}, [taskId, userId, navigate]);

	const handleUpdate = (data: CreateTaskRequest) => {
		if (!taskId) return;
		setIsSubmitting(true);
		setTimeout(() => {
			const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
			const updated = tasks.map((x: any) => x.id === taskId ? { ...x, ...data, updatedAt: new Date() } : x);
			localStorage.setItem('tasks', JSON.stringify(updated));
			toast.success('任务已更新');
			navigate(`/parent/tasks/${taskId}`);
			setIsSubmitting(false);
		}, 600);
	};

	if (loading) return <div className="text-gray-500">加载中...</div>;

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-800">编辑任务</h2>
			<div className="bg-white rounded-xl shadow-md p-6">
				<TaskForm initialData={initialData} onSubmit={handleUpdate} isSubmitting={isSubmitting} teachers={teachers} />
			</div>
		</div>
	);
}