# OPC Security Review

Date: 2026-06-11

Production audit: 76/100, launchable only after redeploying the current portal build and resolving or accepting the Supabase advisor warnings.

## Evidence Checked

- Local source: `main` at `7a3d13c7`, with uncommitted portal fixes for Supabase OTP auth, admin portal fallback, usage display, chart cost formatting, and tests.
- Local frontend checks already passed: `typecheck`, `test:run` (`714` tests), `lint:check`, `build`, `audit --prod`, and `git diff --check`.
- Vercel project: `sub2api-official-api-portal`, project ID `prj_3dMldDoklliJA7JVJpglt7iHggQc`.
- Vercel latest production deployment: `dpl_AjGdUmaoUMSJTpWWKHFpfccRFoDN`, Ready, but still built from upstream commit `434af38f` with `gitDirty=1`.
- Supabase project: `soabuobzlaywwnfpuywd`, status `ACTIVE_HEALTHY`, region `ap-southeast-1`.
- Supabase table `public.portal_profiles`: exists, RLS enabled, roles currently include 1 active admin and 1 active user.
- Supabase RLS policies: own-profile SELECT, own-profile UPDATE, and active-admin SELECT-all.
- GitHub comparison cases: `l-filice89/team-map`, `staszko123/Oceniator-V2`, `Problemsolver0070/llmfixer-app`, and `S-KH-Repo/react-vite-supabase-auth-template`.

## Blockers

- Production is not on the current local fix set. The latest Vercel production metadata points to an old dirty upstream snapshot, so the deployed site can still show password login or call missing backend auth endpoints until redeployed.
- Supabase security advisor warns that `public.portal_profiles` is visible through the GraphQL schema to anon/authenticated roles, and that `handle_new_portal_user()` / `set_portal_profiles_updated_at()` are callable as exposed SECURITY DEFINER RPC functions. RLS still protects row access, but the public API surface should be tightened before a broad launch.
- `VITE_API_BASE_URL` still needs to point at a live Sub2API gateway for real billing, API keys, usage, subscriptions, and provider routing. Vercel alone is a static portal.

## High-Value Fixes

- Revoke anonymous table access on `public.portal_profiles` and revoke direct RPC execute on the two trigger helper functions. Keep authenticated profile reads working for the app.
- Confirm Supabase Auth email template displays `{{ .Token }}` and does not present the magic-link URL as the primary user action.
- Verify Vercel production env vars before deploy: `VITE_AUTH_PROVIDER=supabase`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`.
- Add a post-deploy browser smoke test for `/home`, `/login`, `/register`, `/dashboard`, and `/admin/dashboard`.

## OPC Checklist

| Check | Status | Evidence / next action |
| --- | --- | --- |
| Basic security configuration | Partial | Vercel HTTPS/HSTS, CSP, frame denial, nosniff, referrer, and permissions headers are configured. Backend server ports and password/account-lockout policy require the gateway host details. |
| Data encryption and transport | Partial | Vercel and Supabase use HTTPS/TLS. Storage encryption and backup encryption for the future gateway database must be verified on the backend host. |
| Permissions and access control | Partial | Supabase role mapping is server-side through `portal_profiles`; RLS is enabled. Advisor warnings around GraphQL/RPC exposure should be fixed or accepted with written risk. |
| Input validation and injection defense | Pass for current frontend scope | OTP email/code validation exists; Supabase Auth handles verification. No backend API DAST was run in this pass. |
| Logging and audit | Partial | Backend has audit/risk-control/admin log surfaces, but Vercel/Supabase runtime logs and production gateway log retention need an operator policy. |
| Third-party dependency security | Pass for frontend | `pnpm --dir frontend audit --prod` reported no known vulnerabilities. |
| Backup and recovery | Pending | Supabase project is healthy, but backup schedule and recovery test were not verified. Gateway PostgreSQL backup plan still pending. |
| DDoS protection | Partial | Vercel edge/CDN is in front of the portal; gateway rate limits and WAF/DDoS protection must be confirmed once the backend domain is live. |
| Vulnerability scanning and remediation | Partial | Local lint/type/test/build/audit passed. No external DAST or infrastructure scanner was run. |
| User security education | Pending | Add short login/security copy: random code expires quickly, never share codes, support contact for suspicious login emails. |

## Supabase Hardening SQL

Review before applying to production:

```sql
revoke select on table public.portal_profiles from anon;
revoke execute on function public.handle_new_portal_user() from anon, authenticated;
revoke execute on function public.set_portal_profiles_updated_at() from anon, authenticated;
```

Do not revoke `select` from `authenticated` unless the frontend is changed to fetch profile data through a server-side API; the browser currently needs authenticated SELECT plus RLS to read the signed-in user's profile.

## Ship Recommendation

Deploy the current portal after committing and pushing these fixes, then run OTP login smoke tests against production. Treat the Supabase advisor items as a pre-public-launch hardening task rather than a reason to block a private beta.
