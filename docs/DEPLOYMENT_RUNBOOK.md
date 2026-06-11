# Sub2API Deployment Runbook

## Current Comparison

| Item | Local source | Current Vercel production |
| --- | --- | --- |
| Frontend homepage | Includes 3 subscription tiers and Codex / Claude comparison | Does not yet include the new pricing section |
| Vercel status | Ready to rebuild from `vercel.json` | Ready deployment created on 2026-06-10 09:30:05 CST |
| Production aliases | N/A | `https://liupeizhou.cn`, `https://www.liupeizhou.cn`, `https://sub2api-official-api-portal.vercel.app` |
| Runtime role | Full local gateway with Docker Compose | Static Vue portal only |
| Backend API | `http://127.0.0.1:8080` locally | Must be provided by an external Sub2API backend through `VITE_API_BASE_URL` |

## Deployment Shape

```text
Private GitHub source
  ├─ Go gateway backend
  ├─ Vue customer/admin portal
  ├─ Docker Compose local stack
  └─ Vercel static portal config

Local Mac / OrbStack
  └─ PostgreSQL + Redis + Sub2API on 127.0.0.1:8080

Vercel
  └─ Static Vue portal
       ├─ Supabase email OTP session
       └─ Calls external gateway API by VITE_API_BASE_URL
```

## Vercel Build

`vercel.json` builds from the repository root:

```bash
npx --yes pnpm@10.30.3 --dir frontend install --frozen-lockfile
npx --yes pnpm@10.30.3 --dir frontend build
```

The Vite output is `backend/internal/web/dist`, then Vercel serves it as a static SPA. Non-API routes rewrite to `/index.html`.

The current Vercel optimization:

- `/assets/*` uses `Cache-Control: public, max-age=31536000, immutable`.
- CSP keeps scripts/styles self-hosted and allows HTTPS/WSS connections so the portal can move between Supabase and the production gateway API without editing `vercel.json` for every API domain change.

## Required Vercel Environment Variables

```env
VITE_AUTH_PROVIDER=supabase
VITE_SUPABASE_URL=https://soabuobzlaywwnfpuywd.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
VITE_API_BASE_URL=https://your-gateway.example.com/api/v1
```

Do not put service-role keys, upstream provider API keys, database passwords, JWT secrets, or payment provider secrets in `VITE_*` variables. `VITE_*` values are public browser bundle data.

## Local Verification

```bash
docker compose -f deploy/docker-compose.dev.yml up --build -d
curl http://127.0.0.1:8080/health
pnpm --dir frontend run typecheck
```

Smoke-test user:

```text
demo@sub2api.local / demo123456
```

Important pages:

- Public portal: `/home`
- User purchase: `/purchase`, then select `Subscribe`
- Orders: `/orders`
- Admin payment dashboard: `/admin/orders/dashboard`
- Admin orders: `/admin/orders`
- Admin plans: `/admin/orders/plans`

## GitHub Source Hygiene

Commit source, configuration templates, migrations, and docs. Do not commit:

- `.vercel/`
- `deploy/.env`
- `frontend/.env.local`
- runtime data under `deploy/data/`
- `ops/sessions/`
- generated frontend build output under `backend/internal/web/dist/`

Before pushing:

```bash
git status --short
pnpm --dir frontend run typecheck
go test ./backend/internal/service
```
