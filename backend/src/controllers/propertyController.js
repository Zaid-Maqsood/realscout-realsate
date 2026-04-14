const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// GET /api/properties  — public, search + filter + pagination
const getProperties = async (req, res) => {
  try {
    const {
      type, city, status = 'available', min_price, max_price,
      bedrooms, featured, search, owner_id,
      page = 1, limit = 12,
    } = req.query;

    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (status && status !== 'all') {
      conditions.push(`p.status = $${paramIdx++}`);
      params.push(status);
    }
    if (type) {
      conditions.push(`p.type = $${paramIdx++}`);
      params.push(type);
    }
    if (city) {
      conditions.push(`LOWER(p.city) LIKE $${paramIdx++}`);
      params.push(`%${city.toLowerCase()}%`);
    }
    if (min_price) {
      conditions.push(`p.price >= $${paramIdx++}`);
      params.push(Number(min_price));
    }
    if (max_price) {
      conditions.push(`p.price <= $${paramIdx++}`);
      params.push(Number(max_price));
    }
    if (bedrooms) {
      conditions.push(`p.bedrooms >= $${paramIdx++}`);
      params.push(Number(bedrooms));
    }
    if (featured === 'true') {
      conditions.push(`p.featured = TRUE`);
    }
    if (search) {
      conditions.push(
        `(LOWER(p.title) LIKE $${paramIdx} OR LOWER(p.location) LIKE $${paramIdx} OR LOWER(p.city) LIKE $${paramIdx})`
      );
      params.push(`%${search.toLowerCase()}%`);
      paramIdx++;
    }
    if (owner_id) {
      conditions.push(`p.owner_id = $${paramIdx++}`);
      params.push(owner_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) FROM properties p ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);

    const dataResult = await query(
      `SELECT
         p.id, p.title, p.price, p.location, p.city,
         p.area_sqft, p.bedrooms, p.bathrooms,
         p.type, p.status, p.images, p.featured,
         p.created_at,
         u.name AS owner_name,
         a.name AS agent_name
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       LEFT JOIN users a ON p.agent_id = a.id
       ${where}
       ORDER BY p.featured DESC, p.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      params
    );

    res.json({
      properties: dataResult.rows,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('getProperties error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/properties/:id
const getPropertyById = async (req, res) => {
  try {
    const result = await query(
      `SELECT
         p.*,
         u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone,
         a.name AS agent_name, a.email AS agent_email, a.phone AS agent_phone
       FROM properties p
       LEFT JOIN users u ON p.owner_id = u.id
       LEFT JOIN users a ON p.agent_id = a.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getPropertyById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/properties  — authenticated
const createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      title, description, price, location, city,
      area_sqft, bedrooms, bathrooms, type, status, featured,
    } = req.body;

    // Collect uploaded image paths
    const images = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];

    const result = await query(
      `INSERT INTO properties
         (title, description, price, location, city, area_sqft, bedrooms, bathrooms,
          type, status, images, featured, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        title, description || null, Number(price), location, city,
        area_sqft ? Number(area_sqft) : null,
        bedrooms ? Number(bedrooms) : null,
        bathrooms ? Number(bathrooms) : null,
        type || 'house', status || 'available', images,
        featured === 'true' || featured === true,
        req.user.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createProperty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/properties/:id
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership — only the owner can edit, regardless of role
    const existing = await query('SELECT owner_id FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized — you can only edit your own properties' });
    }

    const {
      title, description, price, location, city,
      area_sqft, bedrooms, bathrooms, type, status, featured, agent_id,
    } = req.body;

    // Handle new images if uploaded
    let images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (req.body.existing_images) {
      // Keep existing images passed as JSON array string
      images = JSON.parse(req.body.existing_images);
    }

    const fields = [];
    const values = [];
    let idx = 1;

    const addField = (col, val) => {
      if (val !== undefined && val !== null && val !== '') {
        fields.push(`${col} = $${idx++}`);
        values.push(val);
      }
    };

    addField('title', title);
    addField('description', description);
    addField('price', price ? Number(price) : undefined);
    addField('location', location);
    addField('city', city);
    addField('area_sqft', area_sqft ? Number(area_sqft) : undefined);
    addField('bedrooms', bedrooms ? Number(bedrooms) : undefined);
    addField('bathrooms', bathrooms ? Number(bathrooms) : undefined);
    addField('type', type);
    addField('status', status);
    addField('featured', featured !== undefined ? (featured === 'true' || featured === true) : undefined);
    addField('agent_id', agent_id);
    if (images !== undefined) {
      fields.push(`images = $${idx++}`);
      values.push(images);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE properties SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateProperty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/properties/:id
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT owner_id FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized — you can only delete your own properties' });
    }

    await query('DELETE FROM properties WHERE id = $1', [id]);
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error('deleteProperty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
