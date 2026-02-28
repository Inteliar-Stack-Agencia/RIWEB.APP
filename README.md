# RIWEB.APP
Sistema de actualizacion de Paginas Webs 


# RiWeb — AI Website Audit + Rebuild (MVP)

RiWeb es un proyecto híbrido:
1) **Web Audit (SaaS captador)**: el usuario pega una URL, recibe un puntaje y un reporte, y deja su email.
2) **Upgrade / Rebuild (servicio/producto)**: CTA para que RiWeb “modernice” la web con IA (venta posterior).
3) **Admin Console (interno)**: consola para ver leads, auditorías, reportes, y configurar parámetros.

## Objetivo del MVP (lo que hay que construir)
- Landing bilingüe (EN/ES) con selector de idioma.
- Flujo de auditoría:
  1) Input URL → “Analizando…”
  2) Mostrar un score preliminar (rápido)
  3) “Desbloquear reporte completo” → pedir email
  4) Guardar lead + auditoría + reporte en Supabase
  5) Mostrar reporte completo + CTA “Upgrade my website”
- Admin Console:
  - Login (solo admin) con Supabase Auth
  - Tabla de leads
  - Detalle por lead: auditoría, reporte, estado (nuevo/contactado/cerrado)
  - Acciones: marcar estado, agregar notas, reenviar reporte (solo UI por ahora)

---

## Stack
- Frontend: React + Vite + TypeScript
- Routing: React Router
- UI: Tailwind CSS
- Hosting: Cloudflare Pages
- Backend: Supabase (Postgres + Auth)
- Auditoría técnica (MVP): sin headless chrome pesado.
  - usar `fetch` + parsing HTML + heurísticas
  - (opcional) integrar PageSpeed Insights luego

---

## Reglas de producto
- No prometer resultados exagerados.
- El reporte debe ser entendible (no técnico puro).
- El “audit” debe parecer serio, aunque al inicio use heurísticas.
- Capturar leads es prioridad #1.

---

## Estructura del repo (monorepo simple)



> Si preferís simplificar aún más: un solo app con rutas `/` y `/admin`.
> Pero mantener /web y /admin ayuda a separar.

---

## Rutas (Web)
- `/` → Home EN (default)
- `/es` → Home ES
- `/audit` → pantalla audit (input URL) (EN)
- `/es/audit` → audit ES
- `/report/:id` → muestra reporte final (EN)
- `/es/report/:id` → reporte ES

Flujo sugerido:
- Home → input URL → /audit?url=...
- En /audit: loading steps + score preliminar
- Email gate: al enviar email se crea Lead + Audit + Report y redirige a /report/:id

---

## Rutas (Admin)
- `/admin/login`
- `/admin` (dashboard)
- `/admin/leads`
- `/admin/leads/:id`

Admin requiere autenticación (Supabase Auth).

---

## Datos (Supabase) — Tablas (MVP)
Crear en Supabase (SQL en `supabase/schema.sql`):

### 1) leads
- id (uuid, pk)
- email (text, not null)
- url (text, not null)
- locale (text: 'en' | 'es')
- created_at (timestamptz default now())
- status (text: 'new' | 'contacted' | 'won' | 'lost' default 'new')
- notes (text, nullable)
- source (text, nullable)  // utm/referrer opcional

### 2) audits
- id (uuid, pk)
- lead_id (uuid, fk -> leads.id, on delete cascade)
- url (text)
- fetched_at (timestamptz default now())
- tech (jsonb)  // detecciones: cms, ssl, analytics, chatbot, etc.
- metrics (jsonb) // speed/mobile/seo/conversion/aiReadiness: 0-100
- score_total (int) // 0-100

### 3) reports
- id (uuid, pk)
- lead_id (uuid, fk)
- audit_id (uuid, fk)
- locale (text)
- summary (text) // resumen humano
- opportunities (jsonb) // lista de mejoras
- risks (jsonb) // issues
- created_at (timestamptz default now())

### 4) admin_users (opcional)
Se puede usar Supabase Auth + claim/role.
MVP: restringir por email allowlist en el front (ENV) + RLS simple.

---

## RLS / Seguridad (MVP pragmático)
- **Web público**: puede insertar `leads`, `audits`, `reports` vía anon key.
- **Admin**: para leer todo, usar Supabase Auth (email/pass) y políticas RLS:
  - Solo usuarios autenticados pueden SELECT/UPDATE en leads/audits/reports.
- Alternativa MVP ultra simple:
  - Desactivar RLS inicialmente SOLO en desarrollo (no recomendado en producción)
  - Para prod: habilitar RLS con policies básicas.

Recomendado:
- Habilitar RLS en todas las tablas.
- Policies:
  - insert público permitido solo en leads/audits/reports (con validaciones simples).
  - select/update solo authenticated.

---

## Auditoría (MVP) — Qué calcular
Sin “Chrome/Lighthouse” pesado. Usar heurísticas:
1) Fetch HTML
2) Parsear:
   - title, meta description, h1, canonical
   - presence de viewport meta (mobile)
   - links a analytics (gtag/ga), pixel (fbq), etc.
   - presence de chat widgets (intercom, crisp, etc.)
   - CMS hints (wp-content, wix, shopify, etc.)
   - SSL: si URL es https
3) Performance “proxy”:
   - medir TTFB aproximado con `performance.now()` + fetch timings (limitado)
   - contar tamaño HTML (bytes)
   - contar cantidad de scripts/links (estimación)
4) Scores 0-100:
   - performance
   - seoBasics
   - mobile
   - conversion
   - aiReadiness
5) score_total ponderado:
   - performance 25%
   - seo 20%
   - mobile 15%
   - conversion 25%
   - aiReadiness 15%

---

## Reporte (MVP) — Generación
Por ahora NO integrar LLM. Generar reporte con plantillas:
- `summary` según score_total
- `opportunities` según issues detectados (ej. “No meta description”, “Sin analytics”, “Sin chat”, “CTA débil”, etc.)
- idioma: EN/ES con diccionario de strings

Luego (v2):
- Integrar OpenAI/Claude para texto más persuasivo.

---

## UI/UX (importante)
- Estilo: SaaS moderno, minimal tech.
- Home con input grande + CTA.
- “Audit loading” con pasos animados (3-5 steps).
- Report con cards:
  - Score total
  - sub-scores
  - top 5 issues
  - top 5 mejoras
  - CTA “Upgrade”

---

## Variables de entorno
Crear `.env` en cada app o usar uno en root con prefijo VITE_:

### Web/Admin (Vite)
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`
- `VITE_ADMIN_ALLOWLIST=email1@email.com,email2@email.com` (MVP)

Si usás service role para admin (NO en front):
- NO exponer service_role en el cliente.
- Para v2 usar functions/worker para llamadas privilegiadas.

---

## Deploy (Cloudflare Pages)
- Conectar repo a Cloudflare Pages.
- Build command (por app):
  - si monorepo: usar `pnpm` workspaces o `npm` + scripts.
- Opción simple: 1 sola app con rutas `/admin` dentro del mismo build.

### Recomendación MVP de deploy (simple)
Hacer una sola app en `apps/web` que contenga también `/admin` como ruta.
- Un solo build, un solo deploy.
- Menos fricción.

Build:
- `npm ci && npm run build`
Output:
- `dist`

---

## Scripts (esperados)
En root:
- `npm run dev` (levanta web + admin)
- `npm run build`
- `npm run lint`
- `npm run typecheck`

---

## Entregables mínimos (Definition of Done)
- riweb.app abre Home EN y selector ES.
- Audit funciona para cualquier URL válida.
- Email gate guarda lead en Supabase.
- Report se muestra con ID real desde Supabase.
- Admin login funciona (Supabase Auth).
- Admin lista leads y permite ver detalle + cambiar estado + notas.

---

## Prioridades
1) Captura de leads (email + url) + reporte visible.
2) UX del audit y reporte (que “se sienta” pro).
3) Admin mínimo.
4) Luego integrar LLM real y análisis más profundo.

---

## Notas para Codex (instrucciones de implementación)
- Empezar por: estructura del repo + Vite + Tailwind + Router.
- Implementar Supabase client compartido.
- Crear funciones:
  - `runAudit(url): { metrics, tech, score_total }`
  - `createLeadAndReport({ email, url, locale, auditResult })`
- Internacionalización: usar diccionario simple `i18n.ts` (EN/ES).
- No usar dependencias pesadas de scraping/headless.
- Mantener el código modular y multi-tenant desde el inicio (aunque MVP).

-- supabase/schema.sql
-- RiWeb MVP schema: leads, audits, reports
-- Public (anon) can INSERT. Authenticated users can SELECT/UPDATE/DELETE.

-- Extensions (uuid generation)
create extension if not exists "pgcrypto";

-- =========================
-- 1) LEADS
-- =========================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  url text not null,
  locale text not null default 'en' check (locale in ('en', 'es')),
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  notes text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_url_idx on public.leads (url);

-- =========================
-- 2) AUDITS
-- =========================
create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  url text not null,
  fetched_at timestamptz not null default now(),
  tech jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  score_total int not null default 0 check (score_total between 0 and 100)
);

create index if not exists audits_lead_id_idx on public.audits (lead_id);
create index if not exists audits_fetched_at_idx on public.audits (fetched_at desc);

-- =========================
-- 3) REPORTS
-- =========================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  audit_id uuid not null references public.audits(id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'es')),
  summary text not null default '',
  opportunities jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reports_lead_id_idx on public.reports (lead_id);
create index if not exists reports_audit_id_idx on public.reports (audit_id);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

-- =========================
-- RLS ENABLE
-- =========================
alter table public.leads enable row level security;
alter table public.audits enable row level security;
alter table public.reports enable row level security;

-- =========================
-- POLICIES
-- Strategy MVP:
-- - Public (anon) can INSERT into leads/audits/reports
-- - Authenticated can SELECT/UPDATE/DELETE all rows (admin console)
-- =========================

-- ---- LEADS policies ----
drop policy if exists "public_insert_leads" on public.leads;
create policy "public_insert_leads"
on public.leads
for insert
to anon
with check (true);

drop policy if exists "auth_select_leads" on public.leads;
create policy "auth_select_leads"
on public.leads
for select
to authenticated
using (true);

drop policy if exists "auth_update_leads" on public.leads;
create policy "auth_update_leads"
on public.leads
for update
to authenticated
using (true)
with check (true);

drop policy if exists "auth_delete_leads" on public.leads;
create policy "auth_delete_leads"
on public.leads
for delete
to authenticated
using (true);

-- ---- AUDITS policies ----
drop policy if exists "public_insert_audits" on public.audits;
create policy "public_insert_audits"
on public.audits
for insert
to anon
with check (true);

drop policy if exists "auth_select_audits" on public.audits;
create policy "auth_select_audits"
on public.audits
for select
to authenticated
using (true);

drop policy if exists "auth_update_audits" on public.audits;
create policy "auth_update_audits"
on public.audits
for update
to authenticated
using (true)
with check (true);

drop policy if exists "auth_delete_audits" on public.audits;
create policy "auth_delete_audits"
on public.audits
for delete
to authenticated
using (true);

-- ---- REPORTS policies ----
drop policy if exists "public_insert_reports" on public.reports;
create policy "public_insert_reports"
on public.reports
for insert
to anon
with check (true);

drop policy if exists "auth_select_reports" on public.reports;
create policy "auth_select_reports"
on public.reports
for select
to authenticated
using (true);

drop policy if exists "auth_update_reports" on public.reports;
create policy "auth_update_reports"
on public.reports
for update
to authenticated
using (true)
with check (true);

drop policy if exists "auth_delete_reports" on public.reports;
create policy "auth_delete_reports"
on public.reports
for delete
to authenticated
using (true);

-- =========================
-- Optional: tighten public inserts (anti-spam) later
-- - add Turnstile token verification via Edge Function
-- - move inserts behind server endpoint
-- =========================


## Siguiente paso (deploy en Cloudflare Pages)
Sí: **lo que sigue es conectarlo a Cloudflare Pages**.

Configuración recomendada para este repo (SPA estática):
- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 20+ (si te lo pide)

Este repo ya incluye:
- Script `npm run build` que copia archivos a `dist/`
- Archivo `_redirects` con `/* /index.html 200` para que funcionen rutas SPA (`/audit`, `/report/:id`, `/admin/...`).

### Pasos rápidos
1. En Cloudflare Pages, crear proyecto y conectar `Oskelias/RIWEB.APP`.
2. En Build settings, usar:
   - `npm ci && npm run build` (si falla `ci` por lockfile, usar `npm run build`)
   - Output: `dist`
3. Deploy.
4. En `Custom domains`, asignar `riweb.app` y esperar estado `Active` (si está en `Verificando`, solo esperar propagación DNS).

### Variables de entorno (cuando migremos a Supabase)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_ALLOWLIST`

> Nota: hoy el MVP guarda datos en `localStorage` (cliente). El siguiente hito técnico es reemplazar eso por Supabase para persistencia real multiusuario.

