/**
 * PropVista — Sample Data Seed (United States)
 * Run: node src/sql/seed.js
 * Seeds: 5 users, 20 properties, 15 leads, 8 lead notes
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const q = (text, params) => pool.query(text, params);

// ─── US Users ─────────────────────────────────────────────
const USERS = [
  {
    name: 'Zaid Maqsood',
    email: 'zaid@propvista.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (415) 823-9001',
  },
  {
    name: 'Ashley Carter',
    email: 'ashley.carter@propvista.com',
    password: 'agent123',
    role: 'agent',
    phone: '+1 (310) 554-7820',
  },
  {
    name: 'Marcus Webb',
    email: 'marcus.webb@propvista.com',
    password: 'agent123',
    role: 'agent',
    phone: '+1 (212) 340-6195',
  },
  {
    name: 'Jennifer Nguyen',
    email: 'jennifer.nguyen@gmail.com',
    password: 'user123',
    role: 'user',
    phone: '+1 (512) 778-4432',
  },
  {
    name: 'Daniel Patel',
    email: 'daniel.patel@gmail.com',
    password: 'user123',
    role: 'user',
    phone: '+1 (305) 912-6677',
  },
];

// ─── US Properties ────────────────────────────────────────
const getProperties = (userIds) => {
  const [adminId, agent1Id, agent2Id, user1Id, user2Id] = userIds;
  return [
    {
      title: 'Modern 4-Bed Single Family Home — Beverly Hills',
      description: 'Stunning contemporary home nestled in the prestigious Beverly Hills flats. Features an open-concept floor plan with soaring ceilings, a chef\'s kitchen with quartz countertops, Sub-Zero appliances, and a large island. The primary suite boasts a spa-like bathroom and walk-in closet. The backyard is an entertainer\'s dream with a heated pool, outdoor kitchen, and lush landscaping. Walking distance to world-class shopping on Rodeo Drive.',
      price: 1250000,
      location: '214 N Rexford Dr',
      city: 'Beverly Hills',
      area_sqft: 4200,
      bedrooms: 4,
      bathrooms: 4,
      type: 'house',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6f349a25?w=800&q=80',
      ],
      featured: true,
      owner_id: adminId,
      agent_id: agent1Id,
    },
    {
      title: 'Charming Colonial Revival — Upper East Side, NYC',
      description: 'Impeccably renovated pre-war co-op on one of the Upper East Side\'s most coveted blocks. This 3-bedroom, 2.5-bathroom home retains original architectural details — herringbone hardwood floors, crown molding, and decorative fireplace — while offering modern comforts including a gourmet kitchen, in-unit washer/dryer, and central A/C. White-glove full-service building with doorman, fitness center, and rooftop terrace. Close to Central Park and the Metropolitan Museum of Art.',
      price: 875000,
      location: '1000 Park Ave, Apt 12D',
      city: 'New York',
      area_sqft: 2100,
      bedrooms: 3,
      bathrooms: 3,
      type: 'apartment',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      ],
      featured: true,
      owner_id: user1Id,
      agent_id: agent2Id,
    },
    {
      title: 'Luxury Penthouse with Bay Views — Miami Beach',
      description: 'Breathtaking penthouse perched atop a marquee South Beach tower. Floor-to-ceiling impact glass frames sweeping views of Biscayne Bay and the Atlantic Ocean. The 5,200 sqft layout includes a private rooftop terrace with plunge pool, a gourmet kitchen with Italian cabinetry, a home theater, and a wine cellar. Building amenities include a resort-style pool, private beach club, concierge, and valet parking. Fully furnished with curated contemporary art.',
      price: 1450000,
      location: '1 Collins Ave, PH-01',
      city: 'Miami',
      area_sqft: 5200,
      bedrooms: 4,
      bathrooms: 5,
      type: 'apartment',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
      ],
      featured: true,
      owner_id: adminId,
      agent_id: agent1Id,
    },
    {
      title: 'Stylish 2-Bed Condo for Rent — South Loop, Chicago',
      description: 'Bright and modern 2-bedroom, 2-bathroom condo in Chicago\'s vibrant South Loop neighborhood. Unit features an open floor plan with dark hardwood floors, floor-to-ceiling windows with city views, and a sleek kitchen with stainless steel appliances. Building amenities: rooftop deck, fitness center, co-working lounge, and pet spa. Steps from Grant Park, Museum Campus, Soldier Field, and the L. Heat and water included in rent.',
      price: 3800,
      location: '1620 S Michigan Ave, Unit 1105',
      city: 'Chicago',
      area_sqft: 1150,
      bedrooms: 2,
      bathrooms: 2,
      type: 'apartment',
      status: 'rented',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      ],
      featured: false,
      owner_id: user2Id,
      agent_id: agent2Id,
    },
    {
      title: 'Class-A Office Tower — Downtown Austin',
      description: 'Premier Class-A office building in the heart of downtown Austin, steps from the Texas State Capitol. 28,000 sqft across four floors with floor-to-ceiling glass, a state-of-the-art HVAC system, 1-gigabit fiber connectivity, and a ground-floor lobby café. LEED Gold certified. Currently 80% occupied with long-term anchor tenants including a national law firm. Cap rate 5.8%. Rare opportunity in one of the nation\'s fastest-growing markets.',
      price: 3200000,
      location: '600 Congress Ave',
      city: 'Austin',
      area_sqft: 28000,
      bedrooms: null,
      bathrooms: null,
      type: 'commercial',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      ],
      featured: true,
      owner_id: adminId,
      agent_id: agent2Id,
    },
    {
      title: 'Vacant Residential Lot — Scottsdale, AZ',
      description: 'Exceptional 1.2-acre lot in North Scottsdale\'s gated Pinnacle Peak Estates. Fully entitled with approved plans for a 5,500 sqft custom home. All utilities stubbed to the site — electricity, natural gas, municipal water, and sewer. Mountain and desert preserve views. HOA-managed community with trails and common areas. Surrounded by multi-million dollar estates. A rare canvas for a dream build in one of the country\'s most desirable resort markets.',
      price: 195000,
      location: '8900 E Pinnacle Peak Rd',
      city: 'Scottsdale',
      area_sqft: 52272,
      bedrooms: null,
      bathrooms: null,
      type: 'plot',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
      ],
      featured: false,
      owner_id: user1Id,
      agent_id: null,
    },
    {
      title: 'Craftsman Bungalow — Capitol Hill, Seattle',
      description: 'Quintessential Capitol Hill craftsman lovingly restored with period details intact. Wide front porch, original fir floors, built-in bookcases, and craftsman trim throughout. Updated kitchen with Calacatta marble, farmhouse sink, and Wolf range. Primary suite addition with soaking tub and heated floors. Backyard with raised garden beds, gas fire pit, and a detached studio/ADU with separate entrance. Walk Score 97 — walk to everywhere on the Hill.',
      price: 685000,
      location: '1421 E Pike St',
      city: 'Seattle',
      area_sqft: 2400,
      bedrooms: 3,
      bathrooms: 2,
      type: 'house',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      ],
      featured: false,
      owner_id: user2Id,
      agent_id: agent1Id,
    },
    {
      title: 'Sleek Studio Loft — Midtown Atlanta',
      description: 'Industrial-chic studio loft in a converted 1920s warehouse in Midtown Atlanta. 14-foot exposed concrete ceilings, original brick accent walls, polished concrete floors, and oversized factory windows flood the space with light. Murphy bed with built-in storage maximizes the 680 sqft footprint. Rooftop pool, coworking space, and dog run. Located one block from Piedmont Park and the Atlanta BeltLine. Perfect urban pied-à-terre or investment rental.',
      price: 329000,
      location: '805 Peachtree St NE, Unit 412',
      city: 'Atlanta',
      area_sqft: 680,
      bedrooms: 1,
      bathrooms: 1,
      type: 'apartment',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
      ],
      featured: false,
      owner_id: adminId,
      agent_id: agent2Id,
    },
    {
      title: 'Retail Flagship Space — Michigan Avenue, Chicago',
      description: 'High-visibility retail space on the Magnificent Mile — Chicago\'s premier shopping corridor with 25 million annual visitors. 4,500 sqft ground-floor with 40-foot frontage, 20-foot ceilings, and a dramatic glass storefront. Currently vacant and in vanilla box condition, ready for tenant buildout. Neighboring tenants include Apple, Nordstrom, and Bloomingdale\'s. Ideal for luxury retail, flagship restaurant, or experiential brand activation.',
      price: 980000,
      location: '900 N Michigan Ave',
      city: 'Chicago',
      area_sqft: 4500,
      bedrooms: null,
      bathrooms: null,
      type: 'commercial',
      status: 'sold',
      images: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      ],
      featured: false,
      owner_id: user1Id,
      agent_id: agent2Id,
    },
    {
      title: 'Mediterranean Villa — Coral Gables, FL',
      description: 'Grand Mediterranean estate on a half-acre lot in Old Coral Gables. This completely renovated 6,800 sqft home features a dramatic two-story foyer, coffered ceilings, marble floors, and a gourmet kitchen with custom cabinetry. Six bedrooms, each en-suite, plus a dedicated home office, gym, and theater. The resort-style grounds include a lagoon pool with waterfall, outdoor summer kitchen, and a three-car garage. A+ school district. Seller financing available.',
      price: 1150000,
      location: '200 Arvida Pkwy',
      city: 'Miami',
      area_sqft: 6800,
      bedrooms: 6,
      bathrooms: 7,
      type: 'house',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
      ],
      featured: true,
      owner_id: adminId,
      agent_id: agent1Id,
    },
    {
      title: 'Townhome in Mueller Community — Austin, TX',
      description: 'Like-new 3-bedroom townhome in Austin\'s award-winning Mueller community — built on the former municipal airport, offering 5+ miles of trails, two swimming pools, a farmers market, and a thriving mixed-use town center. Open layout with 10-foot ceilings, quartz counters, and a private rooftop terrace. Attached 2-car garage with EV charger. Energy Star certified, solar-ready. Walk to UFCU Park, restaurants, and the Alamo Drafthouse. Low HOA.',
      price: 389000,
      location: '4610 Berkman Dr',
      city: 'Austin',
      area_sqft: 1980,
      bedrooms: 3,
      bathrooms: 3,
      type: 'house',
      status: 'pending',
      images: [
        'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=800&q=80',
      ],
      featured: false,
      owner_id: user2Id,
      agent_id: agent2Id,
    },
    {
      title: 'Buildable Ocean-View Lot — Malibu, CA',
      description: 'Rare Pacific Ocean-view lot in the exclusive Malibu hills, just minutes from world-famous Zuma Beach. The 1.8-acre parcel offers panoramic ocean and canyon views. Perched above the marine layer for near-year-round sunshine. Utilities at the street. Preliminary grading assessment completed; estimated pad area of 8,000 sqft. Neighboring parcels developed with luxury estates valued $5M+. A once-in-a-generation land opportunity in one of the world\'s most coveted coastal communities.',
      price: 475000,
      location: '28901 Cliffside Dr',
      city: 'Malibu',
      area_sqft: 78408,
      bedrooms: null,
      bathrooms: null,
      type: 'plot',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
      ],
      featured: false,
      owner_id: user1Id,
      agent_id: agent1Id,
    },
    {
      title: 'Creative Tech Campus — SoMa District, San Francisco',
      description: 'Fully equipped tech campus in San Francisco\'s SoMa innovation hub. 12,000 sqft across two floors with open-plan workspaces, private offices, a 60-person conference center, podcast studio, and barista bar. Enterprise fiber, backup generator, HVAC, and 24/7 keycard access. Six-minute walk from Salesforce Transit Center. Surrounded by Square, Stripe, and Airbnb HQs. Flexible lease terms from 12 months. Perfect for scaling tech startups or established firms.',
      price: 1800000,
      location: '350 Townsend St',
      city: 'San Francisco',
      area_sqft: 12000,
      bedrooms: null,
      bathrooms: null,
      type: 'commercial',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
      ],
      featured: false,
      owner_id: adminId,
      agent_id: agent2Id,
    },
    {
      title: 'Raw Land — Hill Country, Texas',
      description: '42 acres of pristine Texas Hill Country land in Wimberley, TX. The property features dramatic elevation changes with panoramic views of the Blanco River Valley, a seasonal creek, a stock tank pond, and a mature live oak grove. AG exempt, low taxes. Two miles from Wimberley Square with restaurants, boutiques, and the Blue Hole swimming hole. Perfect for a private retreat, family compound, agri-tourism venture, or long-term land investment.',
      price: 320000,
      location: 'RR 12 N of Wimberley',
      city: 'Austin',
      area_sqft: 1829520,
      bedrooms: null,
      bathrooms: null,
      type: 'plot',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
      ],
      featured: false,
      owner_id: user2Id,
      agent_id: agent1Id,
    },
    {
      title: 'Renovated Victorian — Noe Valley, San Francisco',
      description: 'Meticulously renovated 1890 Italianate Victorian on a sun-drenched corner lot in Noe Valley. The 3,100 sqft home preserves its iconic painted-lady facade and original redwood trim while delivering a fully modern interior: Thermador kitchen, radiant-heat floors, smart home system, and a 500-bottle wine cellar. Three bedrooms, three baths, an au-pair suite, and a private garden with fountain. All-new systems: electrical, plumbing, HVAC, and seismic retrofit. Two-car parking.',
      price: 1100000,
      location: '3844 24th St',
      city: 'San Francisco',
      area_sqft: 3100,
      bedrooms: 4,
      bathrooms: 3,
      type: 'house',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      ],
      featured: true,
      owner_id: adminId,
      agent_id: agent1Id,
    },
    {
      title: 'Mixed-Use Building — Nashville, TN',
      description: 'Income-producing mixed-use building in Nashville\'s booming East Nashville neighborhood. Ground floor: two retail units currently leased to a coffee shop and a yoga studio. Floors 2–3: four residential apartments (two 2BR/2BA). Fully occupied with long-term tenants generating $22,000/month gross income. Recent renovations: new roof, updated electrical, and fresh exterior. Walk to Five Points, Rosepepper Cantina, and the East Nashville Farmers Market. Excellent cap rate of 6.1%.',
      price: 875000,
      location: '1102 Fatherland St',
      city: 'Nashville',
      area_sqft: 8400,
      bedrooms: null,
      bathrooms: null,
      type: 'commercial',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&q=80',
      ],
      featured: false,
      owner_id: user2Id,
      agent_id: agent2Id,
    },
    {
      title: 'Starter Home — East Nashville, TN',
      description: 'Adorable 2-bedroom, 1-bathroom cottage in the heart of East Nashville\'s coveted Lockeland Springs neighborhood. Original hardwood floors, updated kitchen with butcher-block counters, and a fenced backyard with a deck and raised garden beds. Mini-split HVAC installed 2022, new roof 2021. Detached one-car garage with bonus room above — perfect for a home office or studio. Walk Score 85. Minutes to Shelby Park and some of Nashville\'s best restaurants and bars.',
      price: 299000,
      location: '1015 Shelby Ave',
      city: 'Nashville',
      area_sqft: 1050,
      bedrooms: 2,
      bathrooms: 1,
      type: 'house',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1507149833265-60c372daea22?w=800&q=80',
      ],
      featured: false,
      owner_id: user1Id,
      agent_id: agent1Id,
    },
    {
      title: 'Waterfront Estate — Lake Washington, Seattle',
      description: 'Extraordinary waterfront estate on the coveted western shore of Lake Washington in the gated enclave of Hunts Point. 110 feet of prime lakefront on a 1.3-acre lot with a private dock, boathouse, and sandy beach. The 9,200 sqft residence features a grand foyer, great room with 22-foot coffered ceilings, five bedroom suites, a professional catering kitchen, billiards room, and a six-car garage. Smart home automation throughout. An incomparable setting 12 minutes from Seattle.',
      price: 2400000,
      location: '3207 Evergreen Point Rd',
      city: 'Seattle',
      area_sqft: 9200,
      bedrooms: 5,
      bathrooms: 6,
      type: 'house',
      status: 'sold',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      ],
      featured: false,
      owner_id: user2Id,
      agent_id: agent1Id,
    },
    {
      title: 'Luxury High-Rise Condo — Midtown Manhattan',
      description: 'Spectacular full-floor residence on the 62nd floor of a landmark Midtown tower. This 4,000 sqft sky home offers 360-degree views stretching from Central Park to the Hudson River, the East River, and Lower Manhattan. Corner great room, custom Italian kitchen, four bedroom suites with spa baths, private wine storage, and direct elevator entry. White-glove building services include a 24-hour attended lobby, valet, indoor pool, spa, squash court, and private dining. A rare pinnacle address.',
      price: 1950000,
      location: '432 Park Ave, Floor 62',
      city: 'New York',
      area_sqft: 4000,
      bedrooms: 4,
      bathrooms: 4,
      type: 'apartment',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
      ],
      featured: true,
      owner_id: adminId,
      agent_id: agent2Id,
    },
    {
      title: 'New Construction Farmhouse — Westlake, TX',
      description: 'Stunning new construction Modern Farmhouse in Westlake\'s most sought-after gated community, Vaquero. The 6,500 sqft design by a nationally recognized architect blends warm wood, steel, and stone. Five bedroom suites, a show kitchen with La Cornue range, a climate-controlled 1,200-bottle wine room, a home gym, and a resort-style pool with cabana and outdoor kitchen. Three-car climate-controlled garage. Award-winning Carroll ISD schools. Completion expected this fall.',
      price: 920000,
      location: '6800 Vaquero Cir',
      city: 'Austin',
      area_sqft: 6500,
      bedrooms: 5,
      bathrooms: 6,
      type: 'house',
      status: 'available',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        'https://images.unsplash.com/photo-1549517045-bc93de075e53?w=800&q=80',
      ],
      featured: true,
      owner_id: adminId,
      agent_id: agent1Id,
    },
  ];
};

// ─── Leads ────────────────────────────────────────────────
const getLeads = (userIds, propIds) => {
  const [, agent1Id, agent2Id] = userIds;
  return [
    { name: 'Ryan Mitchell',   email: 'ryan.mitchell@gmail.com',    phone: '+1 (310) 442-8801', message: 'Very interested in this property. Is the listed price firm or is there room to negotiate? Would love to schedule a showing this weekend if possible.', property_id: propIds[0],  status: 'contacted',   assigned_agent_id: agent1Id },
    { name: 'Lauren Hayes',    email: 'lauren.hayes@yahoo.com',     phone: '+1 (646) 213-5590', message: 'Looking to relocate to NYC from Boston. How quickly can we close? Is the building pet-friendly? We have a golden retriever.', property_id: propIds[1],  status: 'interested',  assigned_agent_id: agent2Id },
    { name: 'Brandon Kim',     email: 'brandon.kim@outlook.com',    phone: '+1 (786) 334-9920', message: 'This penthouse looks absolutely incredible. Can you share the HOA fees and any special assessments? Also interested in the building\'s rental policy.', property_id: propIds[2],  status: 'negotiation', assigned_agent_id: agent1Id },
    { name: 'Stephanie Ortiz', email: 'stephanie.ortiz@gmail.com',  phone: '+1 (773) 558-7743', message: 'Is the condo still available? I\'m looking to move in by the 1st. What\'s the application process and security deposit amount?', property_id: propIds[3],  status: 'new',         assigned_agent_id: null    },
    { name: 'Kevin Tran',      email: 'kevin.tran@gmail.com',       phone: '+1 (512) 788-0034', message: 'I represent a private equity group. We are interested in acquiring the office tower. Can you share the rent roll, DSCR, and the operating expense breakdown?', property_id: propIds[4],  status: 'closed',      assigned_agent_id: agent2Id },
    { name: 'Amanda Brooks',   email: 'amanda.brooks@icloud.com',   phone: '+1 (480) 906-1287', message: 'Is there any water access to the property? We\'d like to build a ranch-style home. Can we walk the lot before making an offer?', property_id: propIds[5],  status: 'interested',  assigned_agent_id: agent1Id },
    { name: 'Chris Hoffman',   email: 'chris.hoffman@gmail.com',    phone: '+1 (206) 452-8841', message: 'What year was the bungalow last fully updated? Are the systems (roof, HVAC, plumbing) recently replaced? We want to avoid any big-ticket surprises.', property_id: propIds[6],  status: 'new',         assigned_agent_id: null    },
    { name: 'Priya Sharma',    email: 'priya.sharma@gmail.com',     phone: '+1 (404) 671-3390', message: 'We run a growing creative agency and are looking for office space in SoMa. What is the minimum lease term? Can we sublease a portion of the floor?', property_id: propIds[12], status: 'contacted',   assigned_agent_id: agent2Id },
    { name: 'Nathan Ford',     email: 'nathan.ford@gmail.com',      phone: '+1 (512) 244-6602', message: 'Interested in the townhome in Mueller. Can we schedule a private showing? We are pre-approved up to $750K and hoping to close before summer.', property_id: propIds[10], status: 'negotiation', assigned_agent_id: agent1Id },
    { name: 'Olivia Chang',    email: 'olivia.chang@hotmail.com',   phone: '+1 (415) 593-2245', message: 'The Victorian looks stunning. How much of the original woodwork is intact? We\'re preservationists and this is exactly the kind of project we\'ve been looking for.', property_id: propIds[14], status: 'lost',       assigned_agent_id: agent2Id },
    { name: 'Derek Johnson',   email: 'derek.johnson@gmail.com',    phone: '+1 (310) 887-5543', message: 'Is the Malibu lot accessible by road year-round? Has it been surveyed recently? Very serious buyer looking to break ground within 18 months.', property_id: propIds[11], status: 'interested',  assigned_agent_id: agent1Id },
    { name: 'Cassandra Lee',   email: 'cassandra.lee@gmail.com',    phone: '+1 (305) 774-8832', message: 'We have a cash offer ready for the Coral Gables estate. Would the seller consider a 21-day close? We\'d like to send our inspector this week.', property_id: propIds[9],  status: 'closed',      assigned_agent_id: agent2Id },
    { name: 'Tyler Robinson',  email: 'tyler.robinson@gmail.com',   phone: '+1 (415) 320-9901', message: 'International buyer relocating from London. Can we arrange a live video walkthrough of the Manhattan condo? What is the pied-à-terre surcharge?', property_id: propIds[18], status: 'contacted',   assigned_agent_id: agent1Id },
    { name: 'Megan Walsh',     email: 'megan.walsh@gmail.com',      phone: '+1 (615) 489-2278', message: 'Love the East Nashville cottage! Is the garage converted to living space or is it a separate structure? What are the neighbors like?', property_id: propIds[16], status: 'new',         assigned_agent_id: null    },
    { name: 'James Rivera',    email: 'james.rivera@outlook.com',   phone: '+1 (512) 930-1150', message: 'We are a tech company looking to lease the Austin campus. What is the current occupancy rate and how soon can we get access? We need to move in Q2.', property_id: propIds[4],  status: 'interested',  assigned_agent_id: agent2Id },
  ];
};

// ─── Notes ────────────────────────────────────────────────
const getNotes = (userIds, leadIds) => {
  const [adminId, agent1Id, agent2Id] = userIds;
  return [
    { lead_id: leadIds[0],  author_id: agent1Id,  note: 'Called Ryan. He is pre-approved at $4.5M through Wells Fargo. He wants to bring a contractor for a second showing this Saturday at 2pm. Very motivated buyer.' },
    { lead_id: leadIds[0],  author_id: adminId,   note: 'Confirmed Saturday showing. Prepared property disclosures and HOA documents. Seller has agreed to leave all appliances in any accepted offer.' },
    { lead_id: leadIds[2],  author_id: agent1Id,  note: 'Brandon submitted a formal offer at $8.4M — $500K below ask. Seller countered at $8.75M. Brandon is reviewing with his financial advisor and expects to respond by Thursday.' },
    { lead_id: leadIds[2],  author_id: agent1Id,  note: 'Offer accepted at $8.6M. Brandon wired 10% earnest money deposit. Inspection scheduled for next Monday. Estimated close in 30 days.' },
    { lead_id: leadIds[4],  author_id: agent2Id,  note: 'CLOSED. Kevin\'s group finalized the office tower purchase at $18.1M. Title transferred. Commission check received. Excellent deal for both parties.' },
    { lead_id: leadIds[8],  author_id: agent1Id,  note: 'Nathan toured the Mueller townhome and loved it. He and his wife are writing an offer tonight at $690K with a 45-day close. I expect this one to go quickly.' },
    { lead_id: leadIds[11], author_id: agent2Id,  note: 'Cash deal with Cassandra closed on the Coral Gables estate at $5.65M. Smooth 21-day close. Client thrilled. Referral bonus expected from her attorney.' },
    { lead_id: leadIds[12], author_id: agent1Id,  note: 'Tyler joined a video call from London. Very impressed with the 432 Park unit. He is engaging a NYC attorney to review the co-op financials. Expecting a formal offer within two weeks.' },
  ];
};

// ─── Main Seed Function ───────────────────────────────────
async function seed() {
  try {
    await q(`SET search_path TO realestate, public`);

    console.log('🌱 Starting PropVista seed (US data)...\n');

    // ── Clear existing data ──────────────────────────────────
    await q(`TRUNCATE realestate.lead_notes, realestate.leads, realestate.properties, realestate.users RESTART IDENTITY CASCADE`);
    console.log('🗑  Cleared existing data');

    // ── Users ────────────────────────────────────────────────
    const userIds = [];
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, 12);
      const res = await q(
        `INSERT INTO realestate.users (name, email, password_hash, role, phone)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [u.name, u.email, hash, u.role, u.phone]
      );
      userIds.push(res.rows[0].id);
      console.log(`   👤 ${u.role.toUpperCase().padEnd(6)} — ${u.name} <${u.email}>`);
    }
    console.log(`\n✅ ${userIds.length} users created`);

    // ── Properties ───────────────────────────────────────────
    const props = getProperties(userIds);
    const propIds = [];
    for (const p of props) {
      const res = await q(
        `INSERT INTO realestate.properties
           (title, description, price, location, city, area_sqft, bedrooms, bathrooms,
            type, status, images, featured, owner_id, agent_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING id`,
        [
          p.title, p.description, p.price, p.location, p.city,
          p.area_sqft, p.bedrooms, p.bathrooms,
          p.type, p.status, p.images,
          p.featured, p.owner_id, p.agent_id,
        ]
      );
      propIds.push(res.rows[0].id);
      console.log(`   🏠 [${p.status.toUpperCase().padEnd(9)}] ${p.title.slice(0, 55)}`);
    }
    console.log(`\n✅ ${propIds.length} properties created`);

    // ── Leads ────────────────────────────────────────────────
    const leads = getLeads(userIds, propIds);
    const leadIds = [];
    for (const l of leads) {
      const res = await q(
        `INSERT INTO realestate.leads (name, email, phone, message, property_id, status, assigned_agent_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [l.name, l.email, l.phone, l.message, l.property_id, l.status, l.assigned_agent_id]
      );
      leadIds.push(res.rows[0].id);
      console.log(`   📩 [${l.status.toUpperCase().padEnd(11)}] ${l.name}`);
    }
    console.log(`\n✅ ${leadIds.length} leads created`);

    // ── Notes ────────────────────────────────────────────────
    const notes = getNotes(userIds, leadIds);
    for (const n of notes) {
      await q(
        `INSERT INTO realestate.lead_notes (lead_id, author_id, note) VALUES ($1,$2,$3)`,
        [n.lead_id, n.author_id, n.note]
      );
    }
    console.log(`\n✅ ${notes.length} lead notes created`);

    // ── Summary ──────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉  PropVista US seed complete!\n');
    console.log('📋  Login credentials:');
    for (const u of USERS) {
      console.log(`   ${u.role.toUpperCase().padEnd(6)}  ${u.email.padEnd(38)} password: ${u.password}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

seed();
