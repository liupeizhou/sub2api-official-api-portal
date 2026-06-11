# Project Structure

## Top-Level Layout

| Path | Purpose |
| --- | --- |
| `backend/` | Go API gateway, routing, billing, migrations, account and channel management |
| `frontend/` | Vue 3 portal for users and admins |
| `deploy/` | Docker Compose, local environment templates, and container entrypoint |
| `docs/` | Operator-facing deployment, payment, and platform notes |
| `assets/` | Static project assets |
| `.github/` | CI, release, CLA, and security scan workflows |
| `vercel.json` | Static Vercel portal build and HTTP headers |
| `Dockerfile` | Multi-stage local/container build for full gateway deployment |

## Runtime Modes

| Mode | Entry | Data plane |
| --- | --- | --- |
| Local full stack | `deploy/docker-compose.dev.yml` | PostgreSQL + Redis + Go gateway + embedded Vue portal |
| Container production | `Dockerfile` and `deploy/docker-compose.yml` | Full API gateway with persistent database/cache |
| Vercel portal | `vercel.json` | Static Vue portal only; API calls go to `VITE_API_BASE_URL` |

## Frontend Areas

| Area | Main files |
| --- | --- |
| Homepage and subscription comparison | `frontend/src/views/HomeView.vue` |
| Auth and Supabase portal login | `frontend/src/views/auth/*`, `frontend/src/api/supabaseAuth.ts` |
| User dashboard, keys, usage, purchase | `frontend/src/views/user/*` |
| Admin operations and payment management | `frontend/src/views/admin/*` |
| API clients | `frontend/src/api/*` |
| Shared layout/components | `frontend/src/components/*`, `frontend/src/stores/*` |

## Backend Areas

| Area | Main files |
| --- | --- |
| Server bootstrap | `backend/cmd/server/*` |
| Configuration | `backend/internal/config/*` |
| Business services | `backend/internal/service/*` |
| HTTP handlers and routing | `backend/internal/handler/*`, `backend/internal/router/*` |
| Database schema and generated Ent client | `backend/ent/*` |
| SQL migrations | `backend/migrations/*` |
| Embedded web assets | `backend/internal/web/*` |

## Current Product Configuration

The local test environment has three initial subscription products:

| Plan | Price | Benchmark |
| --- | --- | --- |
| 基础版 | `$4.99/month` | Codex / Claude `$20` level |
| 正常版 | `$19.99/month` | Codex / Claude `$100` level |
| Pro 版 | `$39.99/month` | Codex / Claude `$200` level |

Payment pages are enabled locally, but real payment provider credentials still need to be configured before production checkout can collect money.
