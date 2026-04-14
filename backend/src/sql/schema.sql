-- PropVista Real Estate Platform — PostgreSQL Schema
-- Target database : grayphite
-- Target schema   : realestate
-- Safe to run multiple times (idempotent)

-- ============================================================
-- Create schema (will not touch any other schema)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS realestate;

SET search_path TO realestate, public;

-- Enable UUID extension (must be in public schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS realestate.users (
  id            UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'user'
                  CHECK (role IN ('admin', 'agent', 'user')),
  phone         VARCHAR(30),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_re_users_email ON realestate.users(email);
CREATE INDEX IF NOT EXISTS idx_re_users_role  ON realestate.users(role);

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE IF NOT EXISTS realestate.properties (
  id          UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  price       NUMERIC(15, 2) NOT NULL,
  location    VARCHAR(500) NOT NULL,
  city        VARCHAR(150) NOT NULL,
  area_sqft   NUMERIC(10, 2),
  bedrooms    INTEGER,
  bathrooms   INTEGER,
  type        VARCHAR(30) NOT NULL DEFAULT 'house'
                CHECK (type IN ('house', 'apartment', 'commercial', 'plot')),
  status      VARCHAR(20) NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'sold', 'rented', 'pending')),
  images      TEXT[] DEFAULT '{}',
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id    UUID REFERENCES realestate.users(id) ON DELETE SET NULL,
  agent_id    UUID REFERENCES realestate.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_re_props_status   ON realestate.properties(status);
CREATE INDEX IF NOT EXISTS idx_re_props_type     ON realestate.properties(type);
CREATE INDEX IF NOT EXISTS idx_re_props_city     ON realestate.properties(city);
CREATE INDEX IF NOT EXISTS idx_re_props_price    ON realestate.properties(price);
CREATE INDEX IF NOT EXISTS idx_re_props_owner    ON realestate.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_re_props_featured ON realestate.properties(featured);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS realestate.leads (
  id                 UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
  name               VARCHAR(255) NOT NULL,
  email              VARCHAR(255) NOT NULL,
  phone              VARCHAR(30),
  message            TEXT,
  property_id        UUID REFERENCES realestate.properties(id) ON DELETE SET NULL,
  status             VARCHAR(20) NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new','contacted','interested','negotiation','closed','lost')),
  assigned_agent_id  UUID REFERENCES realestate.users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_re_leads_status  ON realestate.leads(status);
CREATE INDEX IF NOT EXISTS idx_re_leads_prop    ON realestate.leads(property_id);
CREATE INDEX IF NOT EXISTS idx_re_leads_agent   ON realestate.leads(assigned_agent_id);

-- ============================================================
-- LEAD NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS realestate.lead_notes (
  id         UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
  lead_id    UUID NOT NULL REFERENCES realestate.leads(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES realestate.users(id) ON DELETE SET NULL,
  note       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_re_notes_lead ON realestate.lead_notes(lead_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER (schema-scoped)
-- ============================================================
CREATE OR REPLACE FUNCTION realestate.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON realestate.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON realestate.users
  FOR EACH ROW EXECUTE FUNCTION realestate.update_updated_at();

DROP TRIGGER IF EXISTS trg_props_updated_at ON realestate.properties;
CREATE TRIGGER trg_props_updated_at
  BEFORE UPDATE ON realestate.properties
  FOR EACH ROW EXECUTE FUNCTION realestate.update_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated_at ON realestate.leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON realestate.leads
  FOR EACH ROW EXECUTE FUNCTION realestate.update_updated_at();
