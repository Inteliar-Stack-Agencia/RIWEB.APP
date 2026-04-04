-- RIWEB Admin — internal dashboard tables
-- Run this in your Supabase SQL editor

-- ── Clients ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  business_type TEXT,
  whatsapp      TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── AI Prompts (bot config per client) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_prompts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  system_prompt TEXT,
  tone          TEXT NOT NULL DEFAULT 'amigable',
  business_type TEXT,
  objective     TEXT NOT NULL DEFAULT 'ventas',
  active        BOOLEAN NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Bot Leads (leads captured by each client's bot) ───────────────────────
CREATE TABLE IF NOT EXISTS bot_leads (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name       TEXT,
  phone      TEXT,
  message    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────────────────
ALTER TABLE clients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_leads  ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can access these tables
CREATE POLICY "admin_all_clients"    ON clients    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_prompts"    ON ai_prompts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_bot_leads"  ON bot_leads  FOR ALL TO authenticated USING (true) WITH CHECK (true);
