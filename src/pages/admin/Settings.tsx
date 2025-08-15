import { useEffect, useState } from 'react';

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
		</div>
	);
}