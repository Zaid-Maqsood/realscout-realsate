const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Lock every connection to the realestate schema so we never touch other schemas
pool.on('connect', async (client) => {
  await client.query(`SET search_path TO realestate, public`);
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ PostgreSQL connected (schema: realestate)');
  }
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message);
});

/**
 * Execute a parameterized SQL query.
 * @param {string} text   - SQL string with $1, $2 … placeholders
 * @param {Array}  params - parameter values
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
