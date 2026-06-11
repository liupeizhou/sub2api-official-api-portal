# Vercel + Supabase Portal Deployment

This deployment mode publishes the Vue customer portal on Vercel and uses Supabase Auth for 6-digit email-code sign-in. The Go gateway remains the source of truth for OpenAI-compatible API traffic, billing, provider routing, balances, subscriptions, and admin data APIs.

The public portal brand is `老刘给老孙的验证站`. The demo model catalog is intentionally localized to China-market providers: GLM, Qwen, DeepSeek, MiniMax, StepFun, Kimi, Doubao, ERNIE, Spark, and Hunyuan.

## Vercel Project

Deploy from the repository root. The root `vercel.json` builds the frontend app:

- install: `npx --yes pnpm@10.30.3 --dir frontend install --frozen-lockfile`
- build: `npx --yes pnpm@10.30.3 --dir frontend build`
- output: `backend/internal/web/dist` (the existing Vite output used by Sub2API's embedded frontend)
- SPA fallback: every non-`/api` route rewrites to `index.html`

Current Vercel production project:

- project: `sub2api-official-api-portal`
- production URL: `https://sub2api-official-api-portal.vercel.app`
- project ID: `prj_3dMldDoklliJA7JVJpglt7iHggQc`

## Required Environment Variables

Set these in Vercel before production deployment:

```env
VITE_AUTH_PROVIDER=supabase
VITE_SUPABASE_URL=https://soabuobzlaywwnfpuywd.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Admin access is controlled by `public.portal_profiles.role` in Supabase, not by a public frontend environment variable. Keep `admin` roles limited to company-controlled mailboxes and review them before each production launch.

As of the current production deployment, these Vercel production env vars have been added:

- `VITE_AUTH_PROVIDER`
- `VITE_SUPABASE_URL`
- `VITE_API_BASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The production bundle uses Supabase's modern publishable key (`sb_publishable_...`). Do not use a service-role key in any `VITE_` variable.

Email OTP has been smoke-tested against Supabase Auth:

- endpoint: `https://soabuobzlaywwnfpuywd.supabase.co/auth/v1/otp`
- result: `200 {}`

## Supabase Auth

Enable email OTP sign-in in Supabase Auth. The frontend now uses random-code login only:

- `/login` sends the email OTP.
- `/login` verifies the 6-digit code and creates a portal session.
- `/auth/supabase/callback` remains only as a legacy fallback route; new login emails should not depend on callback URLs.

In Supabase Dashboard, update `Authentication -> Email Templates -> Magic Link` so the email body shows the random code instead of a link. Use `{{ .Token }}` and avoid exposing `{{ .ConfirmationURL }}` in the user-facing content.

Minimal template:

```html
<p>您正在登录老刘给老孙的验证站。</p>
<p>本次邮箱随机验证码：</p>
<p style="font-size:24px;font-weight:700;letter-spacing:6px;">{{ .Token }}</p>
<p>验证码几分钟内有效。如果不是您本人操作，请忽略本邮件。</p>
```

Supabase Auth only authenticates the Vercel portal. It does not issue Sub2API backend JWTs. Backend API requests still require the Go gateway to be deployed and reachable through `VITE_API_BASE_URL`.

## Supabase Database

The production Supabase project now has a portal identity table:

- table: `public.portal_profiles`
- RLS: enabled
- primary key: `id uuid references auth.users(id)`
- fields: `email`, `display_name`, `role`, `status`, `created_at`, `updated_at`
- trigger: new Supabase Auth users are mirrored into `portal_profiles`
- current admin bootstrap: `liupeizhou@gmail.com` receives the `admin` role

The Vercel portal uses Supabase Auth for sessions and a portal fallback dashboard while the full Go gateway is being deployed. Once the Go gateway is live, set `VITE_API_BASE_URL` to that backend and the existing Sub2API API clients will load live billing, key, usage, subscription, and admin data.

The frontend reads the signed-in user's own `portal_profiles` row to determine `role` and `status` before allowing protected navigation. Do not reintroduce client-side admin allowlists for production.

## Production Backend Boundary

For production API delivery, run the Sub2API Go gateway outside Vercel on container or VM infrastructure with PostgreSQL, Redis, upstream provider credentials, metering, and official-provider policy enabled. Vercel should host the portal and can later proxy light `/api` functions, but the streaming API gateway should remain on the backend deployment.
