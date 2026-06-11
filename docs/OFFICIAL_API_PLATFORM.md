# Official API Provider Platform

This fork runs Sub2API as a commercial API aggregation platform for overseas customers. The production path is intentionally limited to official or otherwise authorized upstream API providers.

## Production Guard

`security.official_api_providers.enabled` defaults to `true`.

When enabled, admin account creation and credential updates reject account types that depend on shared user sessions or OAuth account pooling. The allowed upstream account types are:

- `apikey`
- `upstream`
- `bedrock`
- `service_account`

For `apikey` and `upstream` accounts, `credentials.api_key` is required. For `upstream` accounts, `credentials.base_url` is also required and must be an absolute `http` or `https` URL.

The guard blocks production writes for `oauth` and `setup-token` account types. Existing records can still be disabled or deleted, but credential changes are rejected while the guard is enabled.

## Recommended Deployment Shape

- US node: public API gateway, customer portal, admin console, billing service, PostgreSQL primary, Redis.
- Hong Kong node: upstream relay/router and local health checks for authorized domestic API providers.
- Private link: connect nodes through a private network, WireGuard, Tailscale, or a cloud private interconnect.
- Public ingress: terminate TLS at the US edge and forward only authenticated gateway traffic to the application.

## Upstream Provider Configuration

Create each upstream provider as an account:

- `platform`: `openai`, `anthropic`, `gemini`, or another supported platform.
- `type`: prefer `upstream` for OpenAI-compatible upstream gateways, or `apikey` for direct official vendor APIs.
- `credentials.api_key`: provider-issued official API key.
- `credentials.base_url`: provider API base URL for `upstream` accounts.
- `concurrency`: provider/account concurrency cap.
- `priority`: lower values route first.
- `extra.base_rpm`: optional account-level RPM hint.
- `rate_multiplier`: account cost multiplier for upstream cost reporting.

Use channels and channel model pricing to map customer-facing models to upstream models and to set customer price, upstream cost, and margin reporting.

## Billing Integration

Use the existing payment order, redeem code, subscription plan, and admin payment integration APIs as the boundary to your own payment system.

Recommended flow:

- Your payment system creates/collects the customer payment.
- On confirmed payment, call the Sub2API admin API with an idempotency key.
- Sub2API updates balance, subscription, or plan entitlement.
- API gateway enforcement uses the resulting subscription/balance state.

Do not let the payment system write API keys, upstream credentials, or database state directly.

## KYC and Risk Controls

Use the existing user attribute system for KYC fields instead of adding a second customer profile table. Create enabled admin attributes such as:

- `kyc_status`: `pending`, `approved`, `rejected`, `manual_review`
- `kyc_country`: ISO country/region code
- `risk_tier`: `low`, `medium`, `high`, `blocked`
- `business_entity`: legal customer or organization name
- `terms_accepted_at`: latest terms acceptance timestamp

Operational rule for launch: only issue production API keys or assign paid subscription groups after `kyc_status=approved` and `risk_tier` is not `blocked`.

Use the existing risk-control console for content moderation, keyword blocking, pre-block checks, auto-ban thresholds, and audit logs. Keep group-level RPM/TPM, API-key quotas, and account concurrency limits enabled for every paid plan.

## Compliance Defaults

- Keep `security.official_api_providers.enabled=true` in production.
- Keep `security.url_allowlist.enabled=true` once provider hostnames are finalized.
- Keep request body logging disabled unless a customer explicitly enables a debug workflow.
- Store upstream keys only in the Sub2API credential store and never in frontend code, customer-visible logs, or payment metadata.
- Use KYC, country/region rules, API key quotas, RPM/TPM limits, and audit logs before selling access broadly.

## Smoke Test

After configuring one official upstream account and one customer API key:

```bash
curl "$BASE/v1/models" \
  -H "Authorization: Bearer $CUSTOMER_API_KEY"

curl "$BASE/v1/chat/completions" \
  -H "Authorization: Bearer $CUSTOMER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "ping"}],
    "stream": false
  }'
```

Expected result: the request is accepted only when the customer API key is active, the customer has balance/subscription entitlement, and at least one authorized upstream provider is healthy.
