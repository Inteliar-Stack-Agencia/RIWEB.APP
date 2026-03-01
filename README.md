# RIWEB.APP

RiWeb MVP reconstruido en **React + Vite + TypeScript** con routing SPA y base lista para Supabase.

## Stack
- React 18
- Vite 5
- TypeScript
- React Router
- Supabase JS
- Cloudflare Pages

## Desarrollo
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Variables de entorno (Supabase)
Crear `.env`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Si no están definidas, la app usa fallback en `localStorage` para no bloquear el flujo MVP.

## Routing SPA en Cloudflare
Mantener `public/_redirects` con:

```txt
/* /index.html 200
```

## Base de datos
El esquema SQL del MVP está en `supabase/schema.sql` (leads/audits/reports + RLS/policies).
