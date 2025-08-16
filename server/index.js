import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import OSS from 'ali-oss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Directories
const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(__dirname, '..', 'uploads');
const dbPath = path.join(dataDir, 'db.json');

// Ensure directories
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ paymentQRCodes: {}, teacherProfiles: {}, users: [] }, null, 2));

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// OSS client (optional)
const ossEnabled = !!(process.env.ALI_REGION && process.env.ALI_OSS_BUCKET && process.env.ALI_ACCESS_KEY_ID && process.env.ALI_ACCESS_KEY_SECRET);
let ossClient = null;
if (ossEnabled) {
	ossClient = new OSS({
		region: process.env.ALI_REGION,
		bucket: process.env.ALI_OSS_BUCKET,
		accessKeyId: process.env.ALI_ACCESS_KEY_ID,
		accessKeySecret: process.env.ALI_ACCESS_KEY_SECRET
	});
}

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helpers
function readDb() {
	try {
		const raw = fs.readFileSync(dbPath, 'utf8');
		return JSON.parse(raw || '{}');
	} catch (_e) {
		return { paymentQRCodes: {}, teacherProfiles: {}, users: [] };
	}
}
function writeDb(db) {
	fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

async function saveFile(buffer, originalName, prefix = 'uploads') {
	const ext = path.extname(originalName) || '.png';
	const key = `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
	if (ossEnabled && ossClient) {
		await ossClient.put(key, buffer);
		const bucket = process.env.ALI_OSS_BUCKET;
		const region = process.env.ALI_REGION;
		return `https://${bucket}.oss-${region}.aliyuncs.com/${key}`;
	} else {
		const localPath = path.join(uploadsDir, key.replace(`${prefix}/`, ''));
		await fs.promises.mkdir(path.dirname(localPath), { recursive: true });
		await fs.promises.writeFile(localPath, buffer);
		return `/uploads/${path.basename(localPath)}`;
	}
}

// Health
app.get('/api/health', (_req, res) => {
	res.json({ ok: true, time: new Date().toISOString(), ossEnabled });
});

// Admin payment QR codes
app.get('/api/admin/payment-qrcodes', (_req, res) => {
	const db = readDb();
	const q = db.paymentQRCodes || {};
	res.json({ alipay: q.alipay || null, wechat: q.wechat || null });
});

app.post('/api/admin/payment-qrcodes', upload.fields([{ name: 'alipay', maxCount: 1 }, { name: 'wechat', maxCount: 1 }]), async (req, res) => {
	const db = readDb();
	const next = db.paymentQRCodes || {};
	try {
		if (req.files && req.files['alipay'] && req.files['alipay'][0]) {
			next.alipay = await saveFile(req.files['alipay'][0].buffer, req.files['alipay'][0].originalname, 'admin');
		}
		if (req.files && req.files['wechat'] && req.files['wechat'][0]) {
			next.wechat = await saveFile(req.files['wechat'][0].buffer, req.files['wechat'][0].originalname, 'admin');
		}
		db.paymentQRCodes = next;
		writeDb(db);
		res.json({ success: true, paymentQRCodes: next });
	} catch (e) {
		console.error(e);
		res.status(500).json({ success: false, message: 'upload failed' });
	}
});

// Teachers
app.get('/api/teachers/:id', (req, res) => {
	const { id } = req.params;
	const db = readDb();
	const profile = (db.teacherProfiles && db.teacherProfiles[id]) || null;
	if (!profile) {
		return res.json({ profile: null });
	}
	return res.json({ profile });
});

app.put('/api/teachers/:id', upload.single('paymentQrCode'), async (req, res) => {
	const { id } = req.params;
	const db = readDb();
	const existing = (db.teacherProfiles && db.teacherProfiles[id]) || {};
	const body = req.body || {};

	const profile = {
		...existing,
		name: body.name ?? existing.name ?? '',
		introduction: body.introduction ?? existing.introduction ?? '',
		experience: body.experience ?? existing.experience ?? '',
		subject: body.subject ?? existing.subject ?? '',
		grade: body.grade ? (Array.isArray(body.grade) ? body.grade : String(body.grade).split(',').filter(Boolean)) : (existing.grade || []),
		price: body.price ? Number(body.price) : (existing.price || 0),
		avatar: body.avatar ?? existing.avatar ?? '',
		certificates: existing.certificates || [],
		paymentQrCode: existing.paymentQrCode || ''
	};

	try {
		if (req.file) {
			profile.paymentQrCode = await saveFile(req.file.buffer, req.file.originalname, 'teacher');
		}

		if (body.certificates && typeof body.certificates === 'string') {
			try {
				profile.certificates = JSON.parse(body.certificates);
			} catch (_e) {}
		}

		db.teacherProfiles = db.teacherProfiles || {};
		db.teacherProfiles[id] = profile;
		writeDb(db);
		res.json({ success: true, profile });
	} catch (e) {
		console.error(e);
		res.status(500).json({ success: false, message: 'update failed' });
	}
});

// Start server
app.listen(PORT, () => {
	console.log(`API server listening on http://localhost:${PORT} (OSS: ${ossEnabled ? 'enabled' : 'disabled'})`);
});