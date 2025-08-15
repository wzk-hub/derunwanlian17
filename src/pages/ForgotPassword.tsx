import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
	const navigate = useNavigate();
	const [phone, setPhone] = useState('');
	const [code, setCode] = useState('');
	const [password, setPassword] = useState('');
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [error, setError] = useState('');
	const [sentCode, setSentCode] = useState('');

	const sendCode = () => {
		setError('');
		if (!/^1[3-9]\d{9}$/.test(phone)) {
			setError('请输入有效的手机号');
			return;
		}
		// 模拟发送验证码
		const code = String(Math.floor(100000 + Math.random() * 900000));
		setSentCode(code);
		setStep(2);
	};

	const verifyCode = () => {
		setError('');
		if (code !== sentCode) {
			setError('验证码不正确');
			return;
		}
		setStep(3);
	};

	const resetPassword = () => {
		setError('');
		if (password.length < 6) {
			setError('密码至少6位');
			return;
		}
		const users = JSON.parse(localStorage.getItem('users') || '[]');
		const idx = users.findIndex((u: any) => u.phone === phone);
		if (idx === -1) {
			setError('未找到该手机号的账户');
			return;
		}
		users[idx].password = password;
		localStorage.setItem('users', JSON.stringify(users));
		navigate('/login');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">找回密码</h2>
				{error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded">{error}</div>}
				{step === 1 && (
					<div className="space-y-4">
						<label className="block text-sm text-gray-700">手机号</label>
						<input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="请输入手机号"/>
						<button onClick={sendCode} className="w-full px-4 py-2 bg-blue-600 text-white rounded">发送验证码</button>
					</div>
				)}
				{step === 2 && (
					<div className="space-y-4">
						<p className="text-sm text-gray-600">验证码已发送至 {phone}</p>
						<input value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="输入6位验证码"/>
						<button onClick={verifyCode} className="w-full px-4 py-2 bg-blue-600 text白 rounded">验证</button>
					</div>
				)}
				{step === 3 && (
					<div className="space-y-4">
						<label className="block text-sm text-gray-700">新密码</label>
						<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="至少6位"/>
						<button onClick={resetPassword} className="w-full px-4 py-2 bg-blue-600 text-white rounded">重置密码并登录</button>
					</div>
				)}
				<button onClick={() => navigate('/login')} className="mt-4 text-blue-600">返回登录</button>
			</div>
		</div>
	);
}