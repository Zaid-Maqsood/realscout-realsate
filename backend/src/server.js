require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes       = require('./routes/auth');
const propertyRoutes   = require('./routes/properties');
const leadRoutes       = require('./routes/leads');
const analyticsRoutes  = require('./routes/analytics');
const userRoutes       = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads',      leadRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/users',      userRoutes);

// ─── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── 404 handler ──────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
);

// ─── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 RealScout API running on http://localhost:${PORT}`);
});

module.exports = app;
