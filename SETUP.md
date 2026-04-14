# PropVista — Setup Instructions

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

---

## 1. Clone / navigate
```bash
cd c:/Projects/realestate
```

---

## 2. Database Setup

1. Create a PostgreSQL database named `propvista`
2. Run the schema:
```bash
psql -U <your_user> -d propvista -f backend/src/sql/schema.sql
```

---

## 3. Backend Setup

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# Install dependencies (already done)
npm install

# Start dev server
npm run dev
# → API running at http://localhost:3001
```

### .env values (already configured)
```
PORT=3001
DATABASE_URL=postgresql://postgres:zaid@localhost:5432/grayphite
JWT_SECRET=propvista_super_secret_jwt_key_2025_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
DB_SCHEMA=realestate
```

---

## 4. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env.local
# Edit .env.local if backend is not at localhost:3001

# Install dependencies (already done)
npm install

# Start dev server
npm run dev
# → App running at http://localhost:5173
```

### .env.local values
```
VITE_API_URL=http://localhost:3001/api
```

---

## 5. Create First Admin User

Register normally via the app at `/register`, then promote to admin in PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 6. Full Flow Test

1. Open http://localhost:5173 — see the public homepage
2. Register an account → promoted to admin in DB
3. Login → redirected to dashboard
4. Add a property with images
5. Go to public site → property appears in Browse
6. Submit an inquiry from the property detail page
7. In dashboard → Leads CRM → see new lead card
8. Drag lead card to "Contacted"
9. Open lead detail → add notes, assign agent
10. Check Analytics dashboard for updated metrics

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/properties | Public | List + filter |
| GET | /api/properties/:id | Public | Single property |
| POST | /api/properties | JWT | Create property |
| PUT | /api/properties/:id | JWT | Update property |
| DELETE | /api/properties/:id | JWT | Delete property |
| GET | /api/leads | JWT (admin/agent) | List leads |
| POST | /api/leads | Public | Submit inquiry |
| GET | /api/leads/:id | JWT (admin/agent) | Lead detail |
| PUT | /api/leads/:id | JWT (admin/agent) | Update status/assign |
| POST | /api/leads/:id/notes | JWT (admin/agent) | Add note |
| GET | /api/analytics | JWT (admin/agent) | Dashboard stats |
| GET | /api/users | JWT (admin/agent) | List users |
| PUT | /api/users/:id/role | JWT (admin) | Change role |
| DELETE | /api/users/:id | JWT (admin) | Delete user |
