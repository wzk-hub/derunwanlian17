export type PaymentQRCodes = { alipay: string | null; wechat: string | null };

const API_BASE = '/api';

async function safeFetch<T>(input: RequestInfo, init?: RequestInit, fallback?: () => Promise<T> | T): Promise<T> {
	try {
		const res = await fetch(input, init);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} catch (e) {
		if (fallback) {
			return await fallback();
		}
		throw e;
	}
}

export const api = {
	getAdminQRCodes(): Promise<PaymentQRCodes> {
		return safeFetch(`${API_BASE}/admin/payment-qrcodes`, undefined, async () => {
			const stored = JSON.parse(localStorage.getItem('paymentQRCodes') || '{}');
			return { alipay: stored.alipay || null, wechat: stored.wechat || null };
		});
	},
	async uploadAdminQRCodes(formData: FormData): Promise<PaymentQRCodes> {
		const res = await fetch(`${API_BASE}/admin/payment-qrcodes`, { method: 'POST', body: formData });
		if (!res.ok) throw new Error('upload failed');
		const data = await res.json();
		return data.paymentQRCodes as PaymentQRCodes;
	},
	async getTeacherProfile(id: string): Promise<any> {
		return safeFetch(`${API_BASE}/teachers/${id}`, undefined, async () => {
			const teacherProfiles = JSON.parse(localStorage.getItem('teacherProfiles') || '{}');
			return { profile: teacherProfiles[id] || null };
		});
	},
	async updateTeacherProfile(id: string, body: Record<string, any> | FormData): Promise<any> {
		const isForm = body instanceof FormData;
		const res = await fetch(`${API_BASE}/teachers/${id}`, {
			method: 'PUT',
			body: isForm ? body : JSON.stringify(body),
			headers: isForm ? undefined : { 'Content-Type': 'application/json' }
		});
		if (!res.ok) throw new Error('update failed');
		return res.json();
	}
};