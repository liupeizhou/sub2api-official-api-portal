# Sub2API Deployment Runbook

## Current Comparison

| Item | Local source | Current Vercel production |
| --- | --- | --- |
| Frontend homepage | Includes 3 subscription tiers, China-market model catalog, and Codex / Claude comparison | Production serves the same portal title and bundle from deployment `dpl_9H7A6SuWPpjhChpBzfwzVCFVixkC` |
| Auth mode | Supabase email OTP only; `/login` and `/register` no longer require passwords in Supabase mode | Built with `VITE_AUTH_PROVIDER=supabase` and Supabase env vars |
| Vercel status | Built from `vercel.json` and committed source | Latest production deployment is `dpl_9H7A6SuWPpjhChpBzfwzVCFVixkC`, Ready, created from commit `a35e0cf7` |
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

When deploying from macOS external drives, remove AppleDouble resource-fork files before `vercel deploy --prebuilt`; otherwise Vercel can accept the deployment but leave it `BLOCKED` with no build logs:

```bash
find backend/internal/web/dist .vercel/output -name '._*' -type f -delete
```

This repo also tracks `.vercelignore` patterns for `._*`, `.DS_Store`, and `__MACOSX`.

## Required Vercel Environment Variables

```env
VITE_AUTH_PROVIDER=supabase
VITE_SUPABASE_URL=https://soabuobzlaywwnfpuywd.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
VITE_API_BASE_URL=https://your-gateway.example.com/api/v1
```

Do not put service-role keys, upstream provider API keys, database passwords, JWT secrets, or payment provider secrets in `VITE_*` variables. `VITE_*` values are public browser bundle data.

## GitHub Case Notes

Comparable Vite + Supabase Auth + Vercel projects reviewed:

- `l-filice89/team-map` - Vite app using Supabase Auth, Edge Functions, Storage, and Vercel. Its README keeps only Supabase URL and publishable key in frontend env, and explicitly keeps the service-role key out of `VITE_*`.
- `staszko123/Oceniator-V2` - React/Vite portal with Supabase Auth and Vercel deployment.
- `Problemsolver0070/llmfixer-app` - self-serve console using Vite, Supabase auth, and billing.
- `S-KH-Repo/react-vite-supabase-auth-template` - Vite Supabase auth template.

Takeaway for this project: keep the Vercel app as a public static portal, use Supabase only for browser-safe OTP sessions, and keep provider keys, service-role keys, billing fulfillment, and gateway metering on the backend side.

## Local Verification

```bash
docker compose -f deploy/docker-compose.dev.yml up --build -d
curl http://127.0.0.1:8080/health
pnpm --dir frontend run typecheck
pnpm --dir frontend run test:run
pnpm --dir frontend run lint:check
pnpm --dir frontend run build
pnpm --dir frontend audit --prod
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
pnpm --dir frontend run test:run
pnpm --dir frontend run lint:check
pnpm --dir frontend run build
pnpm --dir frontend audit --prod
```

Backend Go tests require a local Go toolchain or the Docker build path. The current Vercel portal changes are frontend-only.

## Current Launch Status

As of 2026-06-11, local validation is green for the frontend portal and production has been redeployed from the current GitHub commit. `https://liupeizhou.cn` redirects to `https://www.liupeizhou.cn`, and `/`, `/login`, `/register`, and `/admin/dashboard` all return the current SPA bundle titled `老刘给老孙的验证站`.
