require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Architecture.md section 7: rate limiting on auth-adjacent endpoints.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use('/api/auth', authLimiter);

// --- Page routes (server-rendered EJS) ---
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/about', (req, res) => res.redirect('/#about'));
app.get('/tracks', (req, res) => res.render('tracks'));
app.get('/dashboard', (req, res) => res.render('dashboard'));
app.get('/register', (req, res) => res.render('register'));
app.get('/payment', (req, res) => res.render('payment'));
app.get('/admin', (req, res) => res.render('admin-dashboard'));
app.get('/submission', (req, res) => res.render('submission'));
app.get('/admin/submissions', (req, res) => res.render('admin-submissions'));

// --- API routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/registration', require('./routes/registrationRoutes'));
app.use('/api/submission', require('./routes/submissionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/submission', require('./routes/submissionRoutes'));

// health check — useful to confirm Render deploy is actually serving traffic
app.get('/health', (req, res) => res.json({ ok: true }));

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NEXORA server running on port ${PORT}`));
