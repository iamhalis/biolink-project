import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from './middleware/auth.js';
import {
  initDb,
  getUserByUsername,
  getUserById,
  createUser,
  updateUserProfile,
  activateUserWithKey,
  createRedeemKey,
  getLinksByUserId,
  addLink,
  deleteLink,
  getLinkById,
  incrementLinkClicks
} from './db.js';
import { getIconSvg, detectPlatform, SOCIAL_PRESETS } from './utils/icons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nạp file .env từ thư mục gốc
dotenv.config({ path: path.join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'biolink_super_secret_fallback_key_999';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'hashx_internal_secret_key_99999';

// Khởi tạo database
initDb().catch(err => {
  console.error('Lỗi khởi tạo Database:', err);
});

const app = express();

// Đăng ký helper và presets cho EJS template
app.locals.getIconSvg = getIconSvg;
app.locals.detectPlatform = detectPlatform;
app.locals.SOCIAL_PRESETS = SOCIAL_PRESETS;

// Trust proxy (cần thiết cho Vercel & rate limiter)
app.set('trust proxy', 1);

// Cấu hình Middleware & Views
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Thao tác quá thường xuyên, vui lòng thử lại sau ít phút.' }
});

const RESERVED_USERNAMES = [
  'login', 'register', 'dashboard', 'logout', 'redeem', 'click', 'api', 'admin', 'favicon.ico'
];

// Helper kiểm tra HTTPS
const isRequestSecure = (req) => {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
};

// ==================== ROUTES GIAO DIỆN & AUTH ====================

app.get('/', (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (e) {
      res.clearCookie('token');
    }
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (e) {
      res.clearCookie('token');
    }
  }
  res.render('login');
});

app.get('/register', (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (e) {
      res.clearCookie('token');
    }
  }
  res.render('login');
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Đăng ký
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = (username || '').toLowerCase().trim();

    if (!cleanUsername || !/^[a-zA-Z0-9_-]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({ error: 'Tên người dùng từ 3-30 ký tự, chỉ gồm chữ cái, số, gạch ngang và gạch dưới.' });
    }

    if (RESERVED_USERNAMES.includes(cleanUsername)) {
      return res.status(400).json({ error: 'Tên người dùng này đã được bảo lưu, vui lòng chọn tên khác.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải từ 6 ký tự trở lên.' });
    }

    const existingUser = await getUserByUsername(cleanUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'Tên người dùng đã tồn tại.' });
    }

    const hash = await bcrypt.hash(password, 10);
    await createUser(cleanUsername, hash);
    return res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký.' });
  }
});

// Đăng nhập
app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = (username || '').toLowerCase().trim();

    const user = await getUserByUsername(cleanUsername);
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_activated: user.is_activated },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isRequestSecure(req),
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ message: 'OK', is_activated: Boolean(user.is_activated) });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

// Trang kích hoạt key
app.get('/redeem', authMiddleware, async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) return res.redirect('/logout');
  if (user.is_activated) return res.redirect('/dashboard');
  res.render('redeem', { username: user.username });
});

// Nhập mã Redeem
app.post('/api/redeem', authLimiter, authMiddleware, async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'Chưa nhập mã key.' });

  try {
    await activateUserWithKey(key, req.user.id);

    // Cấp lại cookie token với trạng thái is_activated = 1
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username, is_activated: 1 },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isRequestSecure(req),
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ message: 'Kích hoạt thành công!' });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Mã kích hoạt không hợp lệ.' });
  }
});

// ==================== CỔNG API CHO BOT DISCORD ====================

app.post('/api/admin/generate-key', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const rawKey = `HASHX-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  await createRedeemKey(rawKey);

  return res.json({ key: rawKey });
});

// ==================== DASHBOARD & QUẢN LÝ ====================

app.get('/dashboard', authMiddleware, async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) return res.redirect('/logout');
  if (!user.is_activated) return res.redirect('/redeem');

  const links = await getLinksByUserId(user.id);
  res.render('dashboard', { user, links });
});

// Cập nhật profile (Bio và Avatar URL)
app.post('/api/profile', authMiddleware, async (req, res) => {
  const { bio, avatar_url } = req.body;
  await updateUserProfile(req.user.id, {
    bio: (bio || '').trim(),
    avatar_url: (avatar_url || '').trim()
  });
  res.redirect('/dashboard');
});

// Thêm liên kết mới
app.post('/api/links/add', authMiddleware, async (req, res) => {
  let { title, url, subtitle, icon, type } = req.body;
  if (!url) {
    return res.status(400).send('Vui lòng nhập đường dẫn URL.');
  }

  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  await addLink(
    req.user.id,
    title || 'Liên kết mới',
    url,
    subtitle || '',
    icon || '',
    type || 'link'
  );
  res.redirect('/dashboard');
});

// Xóa liên kết
app.post('/api/links/:id/delete', authMiddleware, async (req, res) => {
  const linkId = parseInt(req.params.id, 10);
  if (!isNaN(linkId)) {
    await deleteLink(linkId, req.user.id);
  }
  res.redirect('/dashboard');
});

// ==================== TRANG BIO CÔNG KHAI & ĐẾM CLICKS ====================

// Click đếm lượt truy cập
app.get('/click/:linkId', async (req, res) => {
  const linkId = parseInt(req.params.linkId, 10);
  if (!isNaN(linkId)) {
    const link = await getLinkById(linkId);
    if (link) {
      await incrementLinkClicks(link.id);
      return res.redirect(link.url);
    }
  }
  res.redirect('/');
});

// Trang cá nhân công khai (vd: localhost:3000/iamhalis)
app.get('/:username', async (req, res) => {
  const cleanUsername = (req.params.username || '').toLowerCase().trim();
  if (RESERVED_USERNAMES.includes(cleanUsername)) {
    return res.redirect('/login');
  }

  const user = await getUserByUsername(cleanUsername);
  if (!user || !user.is_activated) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Không tìm thấy trang cá nhân</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-[#c2b6a6] min-h-screen flex items-center justify-center p-4">
        <div class="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <div class="text-4xl mb-3">🔍</div>
          <h1 class="text-xl font-bold font-mono text-gray-900 mb-2">Không tìm thấy Bio</h1>
          <p class="text-xs text-gray-500 mb-6">Trang cá nhân @${cleanUsername} chưa tồn tại hoặc chưa được kích hoạt.</p>
          <a href="/register" class="block w-full bg-black text-white font-semibold py-2.5 rounded-xl hover:bg-gray-800 transition text-sm">
            Tạo Bio ngay
          </a>
        </div>
      </body>
      </html>
    `);
  }

  const links = await getLinksByUserId(user.id);
  res.render('public_profile', { user, links });
});

// Khởi động server (khi chạy độc lập / local)
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Web đang chạy tại http://localhost:${PORT}`));
}

export default app;