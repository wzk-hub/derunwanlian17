import { useEffect, useState } from 'react';
import { cleanupDuplicateAccounts, validateAdminAccount, forceResetAdminAccount } from '@/utils/adminAccountCleanup';
import { debugAdminAccount, forceCreateAdminAccount, clearAllData, testLogin } from '@/utils/debugAdminAccount';

interface PaymentQRCodes {
	alipay?: string;
	wechat?: string;
}

export default function AdminSettings() {
	const [codes, setCodes] = useState<PaymentQRCodes>({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const stored = JSON.parse(localStorage.getItem('paymentQRCodes') || '{}');
		setCodes(stored);
	}, []);

	const handleFile = (key: 'alipay' | 'wechat') => async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => setCodes(prev => ({ ...prev, [key]: String(reader.result) }));
		reader.readAsDataURL(file);
	};

	const save = () => {
		setSaving(true);
		setTimeout(() => {
			localStorage.setItem('paymentQRCodes', JSON.stringify(codes));
			setSaving(false);
			alert('收款二维码已保存');
		}, 300);
	};

	const clearOne = (key: 'alipay' | 'wechat') => {
		setCodes(prev => ({ ...prev, [key]: undefined }));
	};

	// 处理清理重复账号
	const handleCleanupAccounts = async () => {
		try {
			const result = await cleanupDuplicateAccounts('15931319952');
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error('清理失败，请重试');
		}
	};

	// 处理重置管理员账号
	const handleResetAdminAccount = async () => {
		if (!confirm('确定要重置管理员账号吗？这将删除所有现有管理员账号并创建新的。')) {
			return;
		}
		
		try {
			const result = await forceResetAdminAccount();
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error('重置失败，请重试');
		}
	};

	// 调试功能处理函数
	const handleDebugAccount = () => {
		const result = debugAdminAccount();
		console.log('调试结果:', result);
		toast.info('调试信息已输出到控制台，请按F12查看');
	};

	const handleForceCreateAdmin = () => {
		if (confirm('确定要强制创建管理员账号吗？')) {
			const result = forceCreateAdminAccount();
			if (result.success) {
				toast.success('管理员账号创建成功');
			} else {
				toast.error('创建失败: ' + result.error);
			}
		}
	};

	const handleTestLogin = () => {
		const result = testLogin('15931319952', 'ljqwzk0103888');
		if (result.success) {
			toast.success('登录测试成功: ' + result.message);
		} else {
			toast.error('登录测试失败: ' + result.message);
		}
	};

	const handleClearAllData = () => {
		if (confirm('警告：这将清除所有数据！确定要继续吗？')) {
			const result = clearAllData();
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error('清除失败: ' + result.error);
			}
		}
	};

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-800">系统设置</h2>
			<div className="bg-white rounded-xl shadow-md p-6">
				<h3 className="text-lg font-medium mb-4">收款二维码</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-3">
						<label className="block text-sm text-gray-700">支付宝收款码</label>
						<input type="file" accept="image/*" onChange={handleFile('alipay')} />
						{codes.alipay ? (
							<div className="space-y-2">
								<img src={codes.alipay} alt="alipay" className="max-w-xs rounded border" />
								<button onClick={() => clearOne('alipay')} className="px-3 py-1.5 bg-gray-100 rounded">移除</button>
							</div>
						) : (
							<p className="text-xs text-gray-500">未上传，支付页将使用本地/备用二维码</p>
						)}
					</div>
					<div className="space-y-3">
						<label className="block text-sm text-gray-700">微信收款码</label>
						<input type="file" accept="image/*" onChange={handleFile('wechat')} />
						{codes.wechat ? (
							<div className="space-y-2">
								<img src={codes.wechat} alt="wechat" className="max-w-xs rounded border" />
								<button onClick={() => clearOne('wechat')} className="px-3 py-1.5 bg-gray-100 rounded">移除</button>
							</div>
						) : (
							<p className="text-xs text-gray-500">未上传，支付页将使用本地/备用二维码</p>
						)}
					</div>
				</div>
				<div className="pt-4">
					<button onClick={save} disabled={saving} className={`px-6 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{saving ? '保存中...' : '保存设置'}</button>
				</div>
			</div>

			{/* 管理员账号管理 */}
			<div className="bg-white rounded-xl shadow-md p-6">
				<h3 className="text-lg font-medium mb-4">管理员账号管理</h3>
				<div className="space-y-4">
					<div className="p-4 bg-gray-50 rounded-lg">
						<h4 className="font-medium text-gray-800 mb-2">当前状态</h4>
						<AdminAccountStatus />
					</div>
					
					<div className="flex flex-wrap gap-3">
						<button 
							onClick={handleCleanupAccounts} 
							className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
						>
							清理重复账号
						</button>
						<button 
							onClick={handleResetAdminAccount} 
							className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
						>
							重置管理员账号
						</button>
					</div>

					{/* 调试功能 */}
					<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
						<h4 className="font-medium text-red-800 mb-3">调试功能（仅开发环境）</h4>
						<div className="flex flex-wrap gap-2">
							<button 
								onClick={handleDebugAccount} 
								className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
							>
								调试账号状态
							</button>
							<button 
								onClick={handleForceCreateAdmin} 
								className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
							>
								强制创建管理员
							</button>
							<button 
								onClick={handleTestLogin} 
								className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
							>
								测试登录
							</button>
							<button 
								onClick={handleClearAllData} 
								className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
							>
								清除所有数据
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// 管理员账号状态组件
function AdminAccountStatus() {
	const [status, setStatus] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkStatus = () => {
			const validation = validateAdminAccount();
			setStatus(validation);
			setLoading(false);
		};
		
		checkStatus();
	}, []);

	if (loading) {
		return <div className="text-gray-500">检查中...</div>;
	}

	if (!status) {
		return <div className="text-red-500">状态检查失败</div>;
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<span className={`w-3 h-3 rounded-full ${status.isValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
				<span className={`font-medium ${status.isValid ? 'text-green-700' : 'text-red-700'}`}>
					{status.isValid ? '状态正常' : '状态异常'}
				</span>
			</div>
			<p className="text-sm text-gray-600">{status.message}</p>
			{status.adminUser && (
				<div className="text-sm text-gray-600">
					<strong>管理员账号:</strong> {status.adminUser.phone} ({status.adminUser.name})
				</div>
			)}
			{status.duplicateAccounts.length > 0 && (
				<div className="text-sm text-red-600">
					<strong>发现重复账号:</strong> {status.duplicateAccounts.length} 个
				</div>
			)}
		</div>
	);
}