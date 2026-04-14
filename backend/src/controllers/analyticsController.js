const { query } = require('../config/db');

// GET /api/analytics
const getAnalytics = async (req, res) => {
  try {
    const isAgent = req.user.role === 'agent';
    const agentId = req.user.id;

    const [
      propertyStats,
      leadStats,
      leadsByStatus,
      recentProperties,
      recentLeads,
      topCities,
    ] = await Promise.all([
      // Property counts by status
      isAgent
        ? query(`
            SELECT
              COUNT(*) FILTER (WHERE status = 'available') AS available,
              COUNT(*) FILTER (WHERE status = 'sold')      AS sold,
              COUNT(*) FILTER (WHERE status = 'rented')    AS rented,
              COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
              COUNT(*)                                       AS total
            FROM properties
            WHERE owner_id = $1
          `, [agentId])
        : query(`
            SELECT
              COUNT(*) FILTER (WHERE status = 'available') AS available,
              COUNT(*) FILTER (WHERE status = 'sold')      AS sold,
              COUNT(*) FILTER (WHERE status = 'rented')    AS rented,
              COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
              COUNT(*)                                       AS total
            FROM properties
          `),

      // Lead counts + conversion
      isAgent
        ? query(`
            SELECT
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'closed') AS closed,
              COUNT(*) FILTER (WHERE status = 'new')    AS new_leads
            FROM leads
            WHERE assigned_agent_id = $1
          `, [agentId])
        : query(`
            SELECT
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'closed') AS closed,
              COUNT(*) FILTER (WHERE status = 'new')    AS new_leads
            FROM leads
          `),

      // Leads by status
      isAgent
        ? query(`
            SELECT status, COUNT(*) AS count
            FROM leads
            WHERE assigned_agent_id = $1
            GROUP BY status
            ORDER BY count DESC
          `, [agentId])
        : query(`
            SELECT status, COUNT(*) AS count
            FROM leads
            GROUP BY status
            ORDER BY count DESC
          `),

      // Properties per month (last 6 months)
      isAgent
        ? query(`
            SELECT
              TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
              COUNT(*) AS count
            FROM properties
            WHERE owner_id = $1
              AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
          `, [agentId])
        : query(`
            SELECT
              TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
              COUNT(*) AS count
            FROM properties
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
          `),

      // Leads per month (last 6 months)
      isAgent
        ? query(`
            SELECT
              TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
              COUNT(*) AS count
            FROM leads
            WHERE assigned_agent_id = $1
              AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
          `, [agentId])
        : query(`
            SELECT
              TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
              COUNT(*) AS count
            FROM leads
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
          `),

      // Top cities
      isAgent
        ? query(`
            SELECT city, COUNT(*) AS count
            FROM properties
            WHERE owner_id = $1
            GROUP BY city
            ORDER BY count DESC
            LIMIT 5
          `, [agentId])
        : query(`
            SELECT city, COUNT(*) AS count
            FROM properties
            GROUP BY city
            ORDER BY count DESC
            LIMIT 5
          `),
    ]);

    const propRow = propertyStats.rows[0];
    const leadRow = leadStats.rows[0];
    const conversionRate =
      leadRow.total > 0
        ? ((leadRow.closed / leadRow.total) * 100).toFixed(1)
        : '0.0';

    res.json({
      scoped: isAgent, // frontend can use this to adjust labels
      properties: {
        total:     parseInt(propRow.total),
        available: parseInt(propRow.available),
        sold:      parseInt(propRow.sold),
        rented:    parseInt(propRow.rented),
        pending:   parseInt(propRow.pending),
      },
      leads: {
        total:          parseInt(leadRow.total),
        closed:         parseInt(leadRow.closed),
        new:            parseInt(leadRow.new_leads),
        conversionRate: parseFloat(conversionRate),
      },
      leadsByStatus: leadsByStatus.rows.map((r) => ({
        status: r.status,
        count:  parseInt(r.count),
      })),
      propertiesOverTime: recentProperties.rows.map((r) => ({
        month: r.month,
        count: parseInt(r.count),
      })),
      leadsOverTime: recentLeads.rows.map((r) => ({
        month: r.month,
        count: parseInt(r.count),
      })),
      topCities: topCities.rows.map((r) => ({
        city:  r.city,
        count: parseInt(r.count),
      })),
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAnalytics };
