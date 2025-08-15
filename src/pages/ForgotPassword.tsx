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
	const [countdown, setCountdown] = useState(0);
	const [captcha, setCaptcha] = useState('');
	const [captchaInput, setCaptchaInput] = useState('');

	useEffect(() => {
		if (countdown <= 0) return;
		const timer = setInterval(() => setCountdown((s) => s - 1), 1000);
		return () => clearInterval(timer);
	}, [countdown]);

	const generateCaptcha = () => {
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		let s = '';
		for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
		setCaptcha(s);
	};

	useEffect(() => {
		generateCaptcha();
	}, []);

	const sendCode = () => {
		setError('');
		if (!/^1[3-9]\d{9}$/.test(phone)) {
			setError('请输入有效的手机号');
			return;
		}
		if (captchaInput.trim().toUpperCase() !== captcha) {
			setError('图形验证码不正确');
			generateCaptcha();
			return;
		}
		// 模拟发送验证码
		const code = String(Math.floor(100000 + Math.random() * 900000));
		setSentCode(code);
		setStep(2);
		setCountdown(60);
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
						<div>
							<label className="block text-sm text-gray-700 mb-1">图形验证码</label>
							<div className="flex items-center gap-2">
								<input value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className="flex-1 px-3 py-2 border rounded" placeholder="输入右侧字符"/>
								<button type="button" onClick={generateCaptcha} className="px-3 py-2 bg-gray-100 rounded">换一张</button>
								<div className="px-3 py-2 font-mono tracking-widest bg-gray-800 text-white rounded select-none">{captcha}</div>
							</div>
						</div>
						<button onClick={sendCode} disabled={countdown > 0} className={`w-full px-4 py-2 text-white rounded ${countdown > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{countdown > 0 ? `${countdown}s后重发` : '发送验证码'}</button>
					</div>
				)}
				{step === 2 && (
					<div className="space-y-4">
						<p className="text-sm text-gray-600">验证码已发送至 {phone}</p>
						<input value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="输入6位验证码"/>
						<div className="flex gap-2">
							<button onClick={verifyCode} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">验证</button>
							<button onClick={() => setStep(1)} disabled={countdown > 0} className={`px-4 py-2 rounded ${countdown > 0 ? 'bg-gray-200 text-gray-500' : 'bg-gray-100'}`}>{countdown > 0 ? `${countdown}s后可重发` : '重新发送'}</button>
						</div>
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