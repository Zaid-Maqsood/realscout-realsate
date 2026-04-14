const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  generateDescription,
  dashboardSummary,
  draftReply,
  parseSearch,
  scoreLeads,
  staleLeads,
  suggestPrice,
  checkQuality,
  chatProperty,
  similarProperties,
  monthlyReport,
  chatPage,
} = require('../ai/aiController');

// ── Public (no auth) ──────────────────────────────────────────
router.post('/parse-search',          parseSearch);
router.post('/chat-property',         chatProperty);
router.post('/chat-page',             chatPage);
router.get('/similar-properties/:id', similarProperties);

// ── Authenticated (any role) ──────────────────────────────────
router.post('/generate-description', verifyToken, generateDescription);
router.post('/suggest-price',        verifyToken, suggestPrice);
router.post('/check-quality',        verifyToken, checkQuality);

// ── Admin + Agent only ────────────────────────────────────────
router.post('/dashboard-summary', verifyToken, requireRole('admin', 'agent'), dashboardSummary);
router.post('/draft-reply',       verifyToken, requireRole('admin', 'agent'), draftReply);
router.post('/score-leads',       verifyToken, requireRole('admin', 'agent'), scoreLeads);
router.get('/stale-leads',        verifyToken, requireRole('admin', 'agent'), staleLeads);
router.post('/monthly-report',    verifyToken, requireRole('admin', 'agent'), monthlyReport);

module.exports = router;
