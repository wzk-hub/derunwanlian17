import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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

// Multer setup (disk-based)
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    const base = Date.now() + '_' + Math.random().toString(36).slice(2);
    cb(null, `${base}${ext}`);
  }
});
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

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Admin payment QR codes
app.get('/api/admin/payment-qrcodes', (_req, res) => {
  const db = readDb();
  const q = db.paymentQRCodes || {};
  res.json({ alipay: q.alipay || null, wechat: q.wechat || null });
});

app.post('/api/admin/payment-qrcodes', upload.fields([{ name: 'alipay', maxCount: 1 }, { name: 'wechat', maxCount: 1 }]), (req, res) => {
  const db = readDb();
  const next = db.paymentQRCodes || {};
  try {
    if (req.files && req.files['alipay'] && req.files['alipay'][0]) {
      next.alipay = `/uploads/${req.files['alipay'][0].filename}`;
    }
    if (req.files && req.files['wechat'] && req.files['wechat'][0]) {
      next.wechat = `/uploads/${req.files['wechat'][0].filename}`;
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

app.put('/api/teachers/:id', upload.single('paymentQrCode'), (req, res) => {
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
      profile.paymentQrCode = `/uploads/${req.file.filename}`;
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
  console.log(`API server listening on http://localhost:${PORT}`);
});