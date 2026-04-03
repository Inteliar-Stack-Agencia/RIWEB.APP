# CLAUDE.md — RiWeb.app

## Project overview

RiWeb.app is a bilingual (EN/ES) SaaS platform built for a digital agency. It exposes:

1. **Landing + AI audit** — public users enter a URL, get an AI-powered site audit and report
2. **Bots dashboard** — internal CRM to manage WhatsApp-agent clients (`/bots`)
3. **Admin panel** — lead management, audit history (`/admin`)

Stack: **React 18 + TypeScript + Vite**, hosted on **Cloudflare Pages**, backend via **Supabase** (Postgres + Edge Functions).

## Repo structure

```
src/
  App.tsx                  # Routes (bilingual: /path + /es/path)
  pages/
    HomePage.tsx           # Landing + lead capture + AI audit CTA
    AuditPage.tsx          # URL → audit → report flow
    ReportPage.tsx         # AI-generated site report display
    BotsPage.tsx           # List of bot clients (CRM index)
    BotDetailsPage.tsx     # Single client: info, payments, extras
    AdminPage.tsx          # Lead/audit admin table
  components/
    Layout.tsx             # Shell, nav, locale switcher
    Footer.tsx
    AIAssistantWidget.tsx
  lib/
    supabase.ts            # Supabase REST helpers (insertRow, listRows, updateRow, getSingle)
    data.ts
  types.ts                 # Shared types (Locale, Audit, Report, etc.)
supabase/
  schema.sql               # leads, audits, reports tables + RLS policies
```

## Key conventions

- **Locale**: every page accepts `locale: Locale` prop (`"en" | "es"`). Translations live as a `labels` object inside each page component — no external i18n library.
- **Supabase**: direct REST calls via `src/lib/supabase.ts` helpers. No Supabase JS SDK — raw fetch with anon key from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- **Routing**: bilingual routes via React Router (`/bots` EN, `/es/bots` ES).
- **Styling**: inline CSS-in-JSX with `<style>` blocks per component + `styles.css` global. No CSS modules, no Tailwind.
- **Build**: `npm run build` → `tsc -b && vite build`. Dist goes to `dist/`.

## Supabase tables used by the bots CRM

These tables are used by the bots dashboard but **not in `schema.sql`** yet (created directly in Supabase dashboard):

| Table | Purpose |
|---|---|
| `clients` | Bot clients — main entity |
| `pagos` | Payment records per client |
| `extras_contratados` | Extras/add-ons contracted per client |

### `clients` key columns
`id, name, email, phone, whatsapp, plan, precio_base, precio_total, estado_pago, fecha_contratacion, fecha_entrega_estimada, fecha_entrega_real, fecha_expiracion_soporte, hosting_proveedor, hosting_url, dominio, creditos_disponibles, mensajes_usados_este_mes, leads_capturados, active`

### `extras_contratados` key columns
`id, client_id (→ clients.id), nombre, costo_mensual, costo_unico, estado (activo|cancelado|pausado), fecha_inicio`

## Backend agent (separate repo)

The Python WhatsApp agent lives in a separate repo (`whatsapp-agentkit`). It exposes a FastAPI server with endpoints:
- `POST /checkout/mercado-pago` — creates MP checkout for a client
- `POST /checkout/stripe` — creates Stripe checkout
- `POST /register-payment` — registers manual payment
- `GET /check-support-expiration` — cron: checks clients with support expiring in 7 days, creates alerts
- `GET /alerts/{client_id}` — gets client alerts
- `POST /alerts/{alerta_id}/read` — marks alert as read

## Deploy

- **Frontend**: GitHub Actions → Cloudflare Pages (`.github/workflows/deploy.yml`)
- Env vars needed: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Development commands

```bash
npm install       # install deps
npm run dev       # dev server (Vite)
npm run build     # tsc -b && vite build
```

## Active branch

Feature development happens on `claude/review-terminal-work-GJYBq`.
