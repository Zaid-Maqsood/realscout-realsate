const { query } = require('../config/db');

// GET /api/users  — admin only: list all users
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const params = [];
    let where = '';

    if (role) {
      where = 'WHERE role = $1';
      params.push(role);
    }

    const result = await query(
      `SELECT id, name, email, role, phone, avatar_url, created_at
       FROM users
       ${where}
       ORDER BY created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/:id/role  — admin only
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'agent', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const result = await query(
      `UPDATE users SET role = $1 WHERE id = $2
       RETURNING id, name, email, role, phone, created_at`,
      [role, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/:id  — admin only
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/agents  — admin + agent: returns only agents (for lead assignment dropdown)
const getAgentsList = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, phone
       FROM users
       WHERE role = 'agent'
       ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getAgentsList error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser, getAgentsList };
