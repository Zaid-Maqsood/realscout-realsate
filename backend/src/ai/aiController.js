const openai = require('./openaiClient');
const { query } = require('../config/db');

// ─── Helper ───────────────────────────────────────────────────
const daysSince = (date) =>
  Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));

const chat = (model, messages, temperature = 0.5, max_tokens = 800) =>
  openai.chat.completions.create({ model, messages, temperature, max_tokens });

// ─── 1. Generate Property Description ────────────────────────
const generateDescription = async (req, res) => {
  try {
    const { title, type, location, city, bedrooms, bathrooms, area_sqft, price, status } = req.body;
    if (!title || !type || !city) {
      return res.status(400).json({ message: 'title, type, and city are required' });
    }

    const completion = await chat('gpt-4o-mini', [
      {
        role: 'system',
        content: 'You are a professional real estate copywriter. Write compelling, factual property descriptions. Do not invent details not provided.',
      },
      {
        role: 'user',
        content: `Write a 2-3 paragraph listing description for this property:
- Title: ${title}
- Type: ${type}
- Location: ${location || ''}, ${city}
- Bedrooms: ${bedrooms ?? 'N/A'}, Bathrooms: ${bathrooms ?? 'N/A'}
- Area: ${area_sqft ? area_sqft + ' sqft' : 'N/A'}
- Price: $${price ? Number(price).toLocaleString() : 'N/A'}
- Status: ${status || 'available'}

Tone: warm, professional, lifestyle-focused. Max 180 words. Output the description text only, no headings.`,
      },
    ], 0.7, 400);

    res.json({ description: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('generateDescription error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

// ─── 2. Dashboard AI Summary ──────────────────────────────────
const dashboardSummary = async (req, res) => {
  try {
    const { properties, leads, topCities, leadsOverTime } = req.body;

    const latestMonth = leadsOverTime?.slice(-1)[0];
    const prevMonth = leadsOverTime?.slice(-2, -1)[0];
    const trend = latestMonth && prevMonth && prevMonth.count > 0
      ? Math.round(((latestMonth.count - prevMonth.count) / prevMonth.count) * 100)
      : null;

    const completion = await chat('gpt-4o-mini', [
      {
        role: 'system',
        content: 'You are a real estate analytics assistant. Summarize data concisely for a dashboard card. Be specific with numbers. Professional tone.',
      },
      {
        role: 'user',
        content: `Summarize these real estate platform metrics in 2-3 sentences (max 65 words):
- Properties: ${properties?.total ?? 0} total, ${properties?.available ?? 0} available, ${properties?.sold ?? 0} sold, ${properties?.rented ?? 0} rented
- Leads: ${leads?.total ?? 0} total, ${leads?.new ?? 0} new, conversion rate ${leads?.conversionRate ?? 0}%
- Top city: ${topCities?.[0]?.city ?? 'N/A'}
${trend !== null ? `- Leads this month vs last: ${trend > 0 ? '+' : ''}${trend}%` : ''}

Highlight the most notable insight. Start directly with the insight, no preamble.`,
      },
    ], 0.4, 150);

    res.json({ summary: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('dashboardSummary error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

// ─── 3. Draft Lead Reply ──────────────────────────────────────
const draftReply = async (req, res) => {
  try {
    const { leadName, leadMessage, propertyTitle, propertyPrice, propertyCity, leadStatus } = req.body;
    const agentName = req.user?.name || 'Our Team';

    if (!leadName) return res.status(400).json({ message: 'leadName is required' });

    const completion = await chat('gpt-4o-mini', [
      {
        role: 'system',
        content: 'You are a professional real estate agent. Write polished, warm follow-up emails. Keep them concise and action-oriented.',
      },
      {
        role: 'user',
        content: `Draft a professional follow-up email to this lead:
- Lead name: ${leadName}
- Their inquiry: "${leadMessage || 'general interest'}"
- Property: ${propertyTitle || 'our listing'}${propertyCity ? ` in ${propertyCity}` : ''}${propertyPrice ? ` (priced at $${Number(propertyPrice).toLocaleString()})` : ''}
- Current status: ${leadStatus || 'new'}
- Signing off as: ${agentName}

Requirements: warm but professional tone, under 150 words, include one clear call-to-action (schedule a viewing or call). Output the email body only (no Subject line).`,
      },
    ], 0.5, 300);

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('draftReply error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

// ─── 4. Parse Natural Language Search ────────────────────────
const parseSearch = async (req, res) => {
  try {
    const { query: userQuery } = req.body;
    if (!userQuery?.trim()) return res.json({ filters: {} });

    const completion = await chat('gpt-4o-mini', [
      {
        role: 'system',
        content: `You extract real estate search filters from natural language. Return ONLY valid JSON with no explanation.
Available keys:
- type: "house" | "apartment" | "commercial" | "plot"
- city: string (capitalize properly)
- min_price: number (USD)
- max_price: number (USD)
- bedrooms: number (minimum bedrooms)
- status: "available" | "sold" | "rented" | "all"
Omit any key not mentioned. Never include extra fields or text.`,
      },
      {
        role: 'user',
        content: `Parse: "${userQuery}"`,
      },
    ], 0, 150);

    const raw = completion.choices[0].message.content.trim();
    const filters = JSON.parse(raw);
    res.json({ filters });
  } catch (err) {
    console.error('parseSearch error:', err.message);
    res.json({ filters: {} });
  }
};

// ─── 5. Score Leads (sentiment) ───────────────────────────────
const scoreLeads = async (req, res) => {
  try {
    const { leads } = req.body;
    if (!leads?.length) return res.json({ scores: [] });

    const leadsText = leads
      .map((l) => `ID:${l.id} | Status:${l.status} | Days old:${daysSince(l.created_at)} | Msg:"${(l.message || '').substring(0, 120)}"`)
      .join('\n');

    const completion = await chat('gpt-4o-mini', [
      {
        role: 'system',
        content: `Score real estate leads as hot, warm, or cold.
Rules:
- hot: urgency words (ASAP, urgent, this week, ready to buy), specific questions, multiple follow-ups
- cold: vague/no message, generic browsing intent, very old with no engagement
- warm: genuine interest but no urgency
Return ONLY a JSON array: [{"id":"...","sentiment":"hot"|"warm"|"cold"}]`,
      },
      {
        role: 'user',
        content: `Score these leads:\n${leadsText}`,
      },
    ], 0, 500);

    const raw = completion.choices[0].message.content.trim();
    const scores = JSON.parse(raw);
    res.json({ scores });
  } catch (err) {
    console.error('scoreLeads error:', err.message);
    res.json({ scores: [] });
  }
};

// ─── 6. Stale Lead Follow-up Reminders ───────────────────────
const staleLeads = async (req, res) => {
  try {
    const isAgent = req.user?.role === 'agent';
    const params = isAgent ? [req.user.id] : [];
    const whereClause = isAgent ? 'AND l.assigned_agent_id = $1' : '';

    const { rows } = await query(
      `SELECT l.id, l.name, l.email, l.status, l.message, l.updated_at, l.created_at,
              p.title AS property_title,
              a.name AS agent_name
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users a ON l.assigned_agent_id = a.id
       WHERE l.updated_at < NOW() - INTERVAL '5 days'
         AND l.status NOT IN ('closed', 'lost')
         ${whereClause}
       ORDER BY l.updated_at ASC
       LIMIT 15`,
      params
    );

    if (!rows.length) return res.json({ reminders: [] });

    const leadsText = rows
      .map((l) => `ID:${l.id} | Name:${l.name} | Status:${l.status} | Property:${l.property_title || 'general'} | Idle:${daysSince(l.updated_at)} days | Msg:"${(l.message || '').substring(0, 100)}"`)
      .join('\n');

    const completion = await chat('gpt-4o-mini', [
      {
        role: 'system',
        content: 'Suggest a brief, specific follow-up action for each stale real estate lead. One short sentence per lead. Be practical and direct.',
      },
      {
        role: 'user',
        content: `These leads have had no activity for 5+ days. Suggest follow-up action for each:\n${leadsText}\n\nReturn JSON: [{"id":"...","suggestion":"..."}]`,
      },
    ], 0.3, 600);

    const raw = completion.choices[0].message.content.trim();
    const suggestions = JSON.parse(raw);

    const reminders = rows.map((lead) => ({
      ...lead,
      daysIdle: daysSince(lead.updated_at),
      suggestion: suggestions.find((s) => String(s.id) === String(lead.id))?.suggestion || 'Follow up with this lead.',
    }));

    res.json({ reminders });
  } catch (err) {
    console.error('staleLeads error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

// ─── 7. Property Pricing Suggestion ──────────────────────────
const suggestPrice = async (req, res) => {
  try {
    const { type, city, area_sqft, bedrooms, bathrooms } = req.body;
    if (!type || !city) return res.status(400).json({ message: 'type and city are required' });

    let comparables = [];
    if (area_sqft) {
      const { rows } = await query(
        `SELECT title, price, area_sqft, bedrooms, bathrooms, status
         FROM properties
         WHERE type = $1
           AND LOWER(city) = LOWER($2)
           AND area_sqft BETWEEN $3 AND $4
           AND status IN ('available', 'sold')
         ORDER BY created_at DESC
         LIMIT 8`,
        [type, city, area_sqft * 0.6, area_sqft * 1.4]
      );
      comparables = rows;
    }

    const comparablesText = comparables.length
      ? comparables.map((c) => `- ${c.title}: $${Number(c.price).toLocaleString()}, ${c.area_sqft}sqft, ${c.bedrooms}bd/${c.bathrooms}ba (${c.status})`).join('\n')
      : 'No direct comparables found in database.';

    const completion = await chat('gpt-4o-mini', [
      {
        role: 'system',
        content: 'You are a real estate pricing expert. Suggest fair USD price ranges based on property specs and comparable listings.',
      },
      {
        role: 'user',
        content: `Suggest a price range for:
- Type: ${type}, City: ${city}
- Area: ${area_sqft ? area_sqft + ' sqft' : 'unknown'}
- Bedrooms: ${bedrooms ?? 'unknown'}, Bathrooms: ${bathrooms ?? 'unknown'}

Comparable listings in this area:
${comparablesText}

Return ONLY JSON: {"min": number, "max": number, "suggested": number, "reasoning": "one short sentence"}
All prices in USD integers.`,
      },
    ], 0.2, 200);

    const raw = completion.choices[0].message.content.trim();
    const result = JSON.parse(raw);
    res.json(result);
  } catch (err) {
    console.error('suggestPrice error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

// ─── 8. Listing Quality Check ─────────────────────────────────
const checkQuality = async (req, res) => {
  try {
    const { title, description, imageCount, bedrooms, bathrooms, area_sqft, price, type } = req.body;

    const wordCount = description ? description.trim().split(/\s+/).length : 0;

    const completion = await chat('gpt-4o-mini', [
      {
        role: 'system',
        content: 'You audit real estate listings for quality. Be concise and practical. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Audit this listing:
- Title: "${title || 'MISSING'}" (${title?.length || 0} chars)
- Type: ${type || 'unknown'}
- Description: ${description ? `"${description.substring(0, 200)}..."` : 'MISSING'} (${wordCount} words)
- Images: ${imageCount ?? 0}
- Price: ${price ? '$' + Number(price).toLocaleString() : 'MISSING'}
- Bedrooms: ${bedrooms ?? 'missing'}, Bathrooms: ${bathrooms ?? 'missing'}, Area: ${area_sqft ?? 'missing'} sqft

Rules: warn if description < 40 words, 0 images, title < 10 chars, missing price, missing bedrooms/bathrooms for house/apartment type.
Score 0-100. Approved if score >= 55.

Return JSON: {"score": number, "warnings": ["string"], "suggestions": ["string"], "approved": boolean}`,
      },
    ], 0, 400);

    const raw = completion.choices[0].message.content.trim();
    const result = JSON.parse(raw);
    res.json(result);
  } catch (err) {
    console.error('checkQuality error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

// ─── 9. Property Chat ─────────────────────────────────────────
const chatProperty = async (req, res) => {
  try {
    const { propertyId, messages: history } = req.body;
    if (!propertyId || !history?.length) {
      return res.status(400).json({ message: 'propertyId and messages are required' });
    }

    const { rows } = await query(
      'SELECT title, type, location, city, price, bedrooms, bathrooms, area_sqft, description, status FROM properties WHERE id = $1',
      [propertyId]
    );

    if (!rows.length) return res.status(404).json({ message: 'Property not found' });
    const p = rows[0];

    const systemPrompt = `You are a helpful real estate assistant for RealScout.
Answer questions about this specific property only:
- Name: ${p.title}
- Type: ${p.type}, Status: ${p.status}
- Location: ${p.location}, ${p.city}
- Price: $${Number(p.price).toLocaleString()}
- Bedrooms: ${p.bedrooms ?? 'N/A'}, Bathrooms: ${p.bathrooms ?? 'N/A'}, Area: ${p.area_sqft ? p.area_sqft + ' sqft' : 'N/A'}
- Description: ${p.description || 'No description provided.'}

Rules: Keep responses under 80 words. Do not invent facts not listed above. For scheduling viewings or contacting the agent, direct users to submit the inquiry form on this page.`;

    // Cap history at last 8 exchanges to limit tokens
    const cappedHistory = history.slice(-16);

    const completion = await chat('gpt-4o-mini', [
      { role: 'system', content: systemPrompt },
      ...cappedHistory,
    ], 0.6, 200);

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('chatProperty error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

// ─── 10. Similar Properties ───────────────────────────────────
const similarProperties = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: [target] } = await query(
      'SELECT type, city, price FROM properties WHERE id = $1',
      [id]
    );

    if (!target) return res.json({ properties: [] });

    const { rows } = await query(
      `SELECT id, title, price, city, location, area_sqft, bedrooms, bathrooms, type, status, images
       FROM properties
       WHERE id != $1
         AND type = $2
         AND LOWER(city) = LOWER($3)
         AND price BETWEEN $4 AND $5
         AND status = 'available'
       ORDER BY ABS(price - $6) ASC
       LIMIT 4`,
      [id, target.type, target.city, target.price * 0.5, target.price * 1.5, target.price]
    );

    res.json({ properties: rows });
  } catch (err) {
    console.error('similarProperties error:', err.message);
    res.status(500).json({ message: 'Service error' });
  }
};

// ─── 11. Monthly Report ───────────────────────────────────────
const monthlyReport = async (req, res) => {
  try {
    const { properties, leads, leadsByStatus, topCities, propertiesOverTime, leadsOverTime } = req.body;

    const statusBreakdown = leadsByStatus?.map((l) => `${l.status}: ${l.count}`).join(', ') || 'N/A';
    const topCitiesText = topCities?.slice(0, 5).map((c) => `${c.city} (${c.count})`).join(', ') || 'N/A';

    const completion = await chat('gpt-4o', [
      {
        role: 'system',
        content: 'You are a senior real estate analyst. Write professional monthly performance reports in markdown format. Be specific with numbers. Use ## for section headers.',
      },
      {
        role: 'user',
        content: `Generate a professional monthly performance report for a real estate platform:

PROPERTY OVERVIEW:
- Total listings: ${properties?.total ?? 0}
- Available: ${properties?.available ?? 0}, Sold: ${properties?.sold ?? 0}, Rented: ${properties?.rented ?? 0}

LEAD PIPELINE:
- Total leads: ${leads?.total ?? 0}, New: ${leads?.new ?? 0}, Closed: ${leads?.closed ?? 0}
- Conversion rate: ${leads?.conversionRate ?? 0}%
- Status breakdown: ${statusBreakdown}

MARKET TRENDS (last 6 months):
- Properties listed per month: ${propertiesOverTime?.map((p) => `${p.month}:${p.count}`).join(', ') || 'N/A'}
- Leads per month: ${leadsOverTime?.map((l) => `${l.month}:${l.count}`).join(', ') || 'N/A'}

TOP MARKETS: ${topCitiesText}

Write a 400-500 word report with these sections: ## Executive Summary, ## Property Performance, ## Lead Pipeline Analysis, ## Market Insights, ## Recommendations.`,
      },
    ], 0.5, 1000);

    res.json({ report: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('monthlyReport error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

// ─── 12. Global Page Chat ─────────────────────────────────────
const APP_GUIDE = `
RealScout is a real estate platform. Here is the full navigation and what each area does:

PUBLIC PAGES (no login needed):
- Home (/): Landing page, search bar, featured properties
- Browse (/browse): Search & filter all listings by type, city, price, bedrooms, status
- Property Detail (/property/:id): Full info on a single listing, inquiry form, chat widget

DASHBOARD (login required, /dashboard/*):
- Dashboard (/dashboard): KPI overview — total properties, leads, conversion rate, sold/rented counts
- Properties (/dashboard/properties): View all listings; agents/admins can add, edit, delete properties
- My Properties (/dashboard/my-properties): Only properties the logged-in user owns or created
- Leads (/dashboard/leads): Kanban CRM pipeline — move leads across new → contacted → qualified → negotiation → closed / lost
- Lead Detail (/dashboard/leads/:id): Full lead info, notes, draft AI reply
- Analytics (/dashboard/analytics): Charts for lead trends, top cities, property performance, AI monthly report
- Users (/dashboard/users): Admin only — manage user accounts and roles

ROLES:
- admin: full access to everything
- agent: access to leads (own), properties, analytics (scoped to their data)
- user: can only see My Properties

NAVIGATION TIPS:
- To see your own listings → go to My Properties
- To manage all leads → go to Leads (Kanban board)
- To add a new property → go to Properties, click "Add Property"
- To see performance charts → go to Analytics
- To manage team members → go to Users (admin only)
`.trim();

const chatPage = async (req, res) => {
  try {
    const { page, context, messages: history, role } = req.body;
    if (!history?.length) return res.status(400).json({ message: 'messages are required' });

    const roleGuide = {
      guest: `The user is NOT logged in. They can only access: Home, Browse, Property Detail, Login, Register. Do NOT mention dashboard, leads, analytics, or any protected pages.`,
      user: `The user is logged in with the "user" role. They can access: Home, Browse, Property Detail, and My Properties (/dashboard/my-properties) only. They cannot access Leads, Analytics, or Users pages.`,
      agent: `The user is logged in as an "agent". They can access: Dashboard, Properties, My Properties, Leads (their own leads only), Analytics (scoped to their data). They cannot access the Users management page.`,
      admin: `The user is logged in as an "admin". They have full access to all pages including Users management.`,
    };

    const accessInfo = roleGuide[role] || roleGuide.guest;

    const pageDescriptions = {
      home:                   'The user is currently on the Homepage.',
      browse:                 'The user is currently on the Browse Listings page.',
      login:                  'The user is currently on the Login page.',
      register:               'The user is currently on the Register page.',
      dashboard:              'The user is currently on the Dashboard overview page.',
      'dashboard-properties': 'The user is currently on the Properties management page.',
      'dashboard-my-properties': 'The user is currently on the My Properties page.',
      'dashboard-leads':      'The user is currently on the Leads CRM page.',
      'dashboard-analytics':  'The user is currently on the Analytics page.',
      'dashboard-users':      'The user is currently on the Users management page.',
    };

    const currentPage = pageDescriptions[page] || `The user is currently on the "${page}" page.`;
    const liveData = context ? `\nLive data on this page:\n${context}` : '';

    const systemPrompt = `You are RealScout AI, a helpful assistant embedded in a real estate platform.

${APP_GUIDE}

---
USER ACCESS LEVEL: ${accessInfo}

CURRENT LOCATION: ${currentPage}${liveData}

Answer based on where the user is and what they can access. Never direct users to pages they don't have permission for. Keep responses under 100 words. Be direct and practical.`;

    const cappedHistory = history.slice(-16);

    const completion = await chat('gpt-4o-mini', [
      { role: 'system', content: systemPrompt },
      ...cappedHistory,
    ], 0.6, 250);

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error('chatPage error:', err.message);
    res.status(500).json({ message: 'AI service error' });
  }
};

module.exports = {
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
};
