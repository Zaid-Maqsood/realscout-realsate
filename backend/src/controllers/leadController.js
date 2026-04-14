const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// GET /api/leads  — admin/agent only
const getLeads = async (req, res) => {
  try {
    const { status, assigned_agent_id, page = 1, limit = 50 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    // Agents only see their assigned leads
    if (req.user.role === 'agent') {
      conditions.push(`l.assigned_agent_id = $${idx++}`);
      params.push(req.user.id);
    } else if (assigned_agent_id) {
      conditions.push(`l.assigned_agent_id = $${idx++}`);
      params.push(assigned_agent_id);
    }

    if (status) {
      conditions.push(`l.status = $${idx++}`);
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM leads l ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);

    const result = await query(
      `SELECT
         l.*,
         p.title AS property_title, p.city AS property_city, p.price AS property_price,
         a.name AS agent_name, a.email AS agent_email
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users a ON l.assigned_agent_id = a.id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    res.json({ leads: result.rows, total, page: Number(page) });
  } catch (err) {
    console.error('getLeads error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/leads/:id
const getLeadById = async (req, res) => {
  try {
    const result = await query(
      `SELECT
         l.*,
         p.title AS property_title, p.city AS property_city,
         p.price AS property_price, p.type AS property_type,
         a.name AS agent_name, a.email AS agent_email, a.phone AS agent_phone
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users a ON l.assigned_agent_id = a.id
       WHERE l.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Agent can only see their own lead
    const lead = result.rows[0];
    if (
      req.user.role === 'agent' &&
      lead.assigned_agent_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch notes
    const notes = await query(
      `SELECT ln.*, u.name AS author_name
       FROM lead_notes ln
       LEFT JOIN users u ON ln.author_id = u.id
       WHERE ln.lead_id = $1
       ORDER BY ln.created_at ASC`,
      [req.params.id]
    );

    res.json({ ...lead, notes: notes.rows });
  } catch (err) {
    console.error('getLeadById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/leads  — public (inquiry form)
const createLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, message, property_id } = req.body;

    const result = await query(
      `INSERT INTO leads (name, email, phone, message, property_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone || null, message || null, property_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createLead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/leads/:id  — admin/agent
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_agent_id } = req.body;

    const existing = await query('SELECT * FROM leads WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = existing.rows[0];
    if (
      req.user.role === 'agent' &&
      lead.assigned_agent_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (status) { fields.push(`status = $${idx++}`); values.push(status); }

    // Only admins can reassign leads to other agents
    if (assigned_agent_id !== undefined) {
      if (req.user.role === 'agent') {
        return res.status(403).json({ message: 'Agents cannot reassign leads' });
      }
      fields.push(`assigned_agent_id = $${idx++}`);
      values.push(assigned_agent_id || null);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE leads SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateLead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/leads/:id/notes
const addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'Note text required' });
    }

    const result = await query(
      `INSERT INTO lead_notes (lead_id, author_id, note)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, req.user.id, note.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('addNote error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getLeads, getLeadById, createLead, updateLead, addNote };
