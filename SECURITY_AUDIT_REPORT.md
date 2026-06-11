# Sub2API 安全审计报告

**审计日期**: 2026-06-09  
**项目**: Sub2API (AI API Gateway Platform)  
**代码库路径**: `/Volumes/Extreme SSD/02_文档归档_Documents/api中转站`  
**技术栈**: Go 1.25 + Vue 3.4 + PostgreSQL + Redis

---

## 审计范围与方法

本次安全审计覆盖以下 10 个维度：
1. 基础安全配置检查
2. 数据加密与传输安全
3. 权限管理与访问控制
4. 输入验证与防注入攻击
5. 日志记录与审计
6. 第三方依赖安全
7. 备份与恢复机制
8. 防 DDoS 攻击措施
9. 安全漏洞扫描与修复
10. 用户安全教育与意识

审计方法包括：代码静态分析、Schema 审查、配置审查、依赖分析、认证流程审查。

---

## 一、严重风险 (Critical - 需立即修复)

### C1. 上游账号凭证以明文 JSONB 存储在数据库中

**文件**: `backend/ent/schema/account.go:79-81`  
**风险等级**: 严重

Account 实体的 `credentials` 字段以 JSONB 格式存储，包含上游 AI 服务（Claude、OpenAI、Gemini 等）的 API Key、OAuth access_token/refresh_token、session cookie 等敏感凭证。该字段未做任何加密处理：

```go
field.JSON("credentials", map[string]any{}).
    Default(func() map[string]any { return map[string]any{} }).
    SchemaType(map[string]string{dialect.Postgres: "jsonb"}),
```

虽然项目中存在 AES-256-GCM 加密器 (`aes_encryptor.go`)，但仅用于 TOTP 密钥加密，未用于 account credentials。

**影响**: 数据库被攻破后，攻击者可直接获取所有上游 API 账户的完整凭证，导致上游服务被滥用，造成巨大经济损失。

**修复建议**:

- 使用 AES-256-GCM 对 `credentials` JSONB 字段的敏感子键进行应用层加密后再写入数据库
- 加密密钥应通过环境变量或密钥管理服务 (KMS) 注入，不应存储在数据库中
- 考虑使用 PostgreSQL pgcrypto 扩展进行列级加密作为附加防护层

---

### C2. API Key 以明文存储在数据库中

**文件**: `backend/ent/schema/api_key.go:37-40`  
**风险等级**: 严重

用户 API Key 以明文形式存储在 `api_keys.key` 字段中，未做哈希处理：

```go
field.String("key").
    MaxLen(128).
    NotEmpty().
    Unique(),
```

**影响**: 数据库泄露意味着所有用户的 API Key 全部暴露，等同于所有用户账户被接管。

**修复建议**:

- API Key 应当像密码一样进行哈希存储（如 SHA-256 + salt），只在创建时返回完整 Key
- 验证时对输入 Key 进行同样的哈希后比对
- 注意：前缀 `sk-` 可用于路由/识别，但完整 Key 不应明文存储

---

### C3. 系统安全密钥存储在数据库表中

**文件**: `backend/ent/schema/security_secret.go:13-42`  
**风险等级**: 严重

JWT 签名密钥、TOTP 加密密钥等系统级安全密钥存储在 `security_secrets` 数据库表中：

```go
field.String("key").MaxLen(100).NotEmpty().Unique(),
field.String("value").NotEmpty().SchemaType(map[string]string{dialect.Postgres: "text"}),
```

**影响**: 数据库被攻破后，攻击者可伪造任意 JWT token、解密所有 TOTP 密钥，完全接管系统。

**修复建议**:

- JWT 签名密钥和 TOTP 加密密钥应通过环境变量或 KMS 注入
- 不应将系统级密钥存储在应用数据库中
- 如果必须持久化，应使用独立的密钥管理方案（如 HashiCorp Vault、AWS KMS）

---

### C4. 支付 provider 配置已迁移为明文存储

**文件**: `backend/internal/payment/crypto.go:20-23`  
**风险等级**: 严重

代码注释明确表明支付 provider 配置已经从加密存储迁移为明文 JSON：

```
// Deprecated: payment provider configs are now stored as plaintext JSON.
```

**影响**: 支付提供商配置（可能包含 API Key、商户密钥等）以明文存储，可能导致支付系统被滥用。

**修复建议**:

- 恢复对支付配置的加密存储
- 支付相关的密钥应使用独立的加密密钥，不应与业务加密密钥共用

---

## 二、高风险 (High - 应尽快修复)

### H1. 缺少账户锁定机制

**文件**: `backend/ent/schema/user.go` (user schema), `backend/internal/service/auth_service.go` (login logic)  
**风险等级**: 高

用户表没有 `failed_login_attempts`、`locked_until` 等字段，登录函数 `Login()` 没有失败次数追踪和锁定逻辑。虽然路由层面有频率限制（login: 20次/分钟），但缺乏基于账户的暴力破解防护。

**修复建议**:

- 在 user 表中增加 `failed_login_attempts` 和 `locked_until` 字段
- 连续失败 N 次后临时锁定账户
- 锁定期间即使密码正确也拒绝登录并返回统一错误

---

### H2. 缺少密码复杂度要求

**文件**: `backend/internal/service/auth_service.go`  
**风险等级**: 高

注册和密码重置功能未对密码复杂度做任何验证。密码可接受任意长度和字符组合。

**修复建议**:

- 实施最小密码长度要求（至少 8 位，推荐 12 位以上）
- 要求包含大小写字母、数字和特殊字符中的至少三类
- 检查密码是否出现在已知泄露密码库中（如 Have I Been Pwned API）

---

### H3. 前端 Token 存储在 localStorage

**文件**: `frontend/src/stores/auth.ts:18-21`  
**风险等级**: 高

JWT access token 和 refresh token 存储在浏览器的 localStorage 中：

```typescript
const AUTH_TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
```

**影响**: localStorage 可被任何同源 JavaScript 代码读取，XSS 攻击可轻易窃取 token。

**修复建议**:

- 使用 httpOnly、Secure、SameSite=Strict 的 Cookie 存储 JWT
- 实现 BFF (Backend For Frontend) 模式管理 session
- 如必须使用 localStorage，确保严格的 CSP 策略和输入输出转义以防御 XSS

---

### H4. CORS 配置可能过于宽松

**文件**: `backend/internal/server/middleware/cors.go:15-101`  
**风险等级**: 高

CORS 中间件允许配置通配符 origin (`*`)，且可与 `allow_credentials` 同时存在（代码会禁用 credentials 但 origin 仍然为 `*`）。

**修复建议**:

- 生产环境禁止使用 `*` 作为 allowed origin
- 实施严格的 origin 白名单
- 配置文档中应明确警告不要在生产环境使用 `*`

---

## 三、中风险 (Medium - 建议修复)

### M1. JWT 使用对称签名算法 (HMAC)

**文件**: `backend/internal/service/auth_service.go:1172`  
**风险等级**: 中

JWT 使用 HMAC-SHA256 对称签名。所有需要验证 token 的服务必须共享同一个密钥，密钥泄露影响范围大。

**修复建议**:

- 考虑迁移到 RS256 (RSA) 或 ES256 (ECDSA) 非对称签名
- 如果维持 HMAC，确保密钥定期轮换

---

### M2. TOTP 密钥前缀出现在 Debug 日志中

**文件**: `backend/internal/service/totp_service.go:242-245, 378-381`  
**风险等级**: 中

Debug 日志中包含 TOTP 密钥的前 4 字符前缀，虽不足以恢复完整密钥，但降低了暴力破解难度。

**修复建议**:

- 生产环境应彻底移除 TOTP 密钥的任何日志输出
- 使用日志级别控制：这些 debug 日志不应在 production level 输出

---

### M3. 前端多处使用 v-html 渲染动态内容

**文件**: 多个前端文件  
**风险等级**: 中

发现 15+ 处使用 `v-html` 渲染内容，包括：
- `HomeView.vue:12` - 主页内容
- `CustomPageView.vue:74` - 自定义页面
- `LegalDocumentView.vue:73` - 法律文档
- `AnnouncementPopup.vue:58` - 公告弹窗
- `AnnouncementBell.vue:270` - 公告通知（Markdown 渲染）
- `UseKeyModal.vue:108` - 代码高亮

**修复建议**:

- 对所有 v-html 渲染的内容进行服务端 HTML 净化（如 DOMPurify 在服务端）
- 对 Markdown 渲染使用安全的 Markdown 解析器且禁用 HTML 标签
- 优先使用文本插值 (`{{ }}`) 而非 v-html

---

### M4. 缺少 WebSocket 安全加固

**文件**: `backend/internal/server/middleware/admin_auth.go:37-44`  
**风险等级**: 中

管理后台 WebSocket 连接通过 `Sec-WebSocket-Protocol` 头传递 JWT，虽验证了 token，但缺少：
- WebSocket 连接频率限制
- Origin 头验证（防止跨站 WebSocket 劫持）
- 消息大小限制

**修复建议**:

- 验证 WebSocket 握手请求的 Origin 头
- 对 WebSocket 连接实施频率限制
- 设置最大消息大小限制

---

### M5. Docker 镜像标签未固定到具体摘要

**文件**: `Dockerfile:9-12`  
**风险等级**: 中

基础镜像使用浮动标签 `node:24-alpine`、`golang:1.26.4-alpine`、`alpine:3.21`，可能导致不同构建使用不同的镜像版本。

**修复建议**:

- 使用镜像摘要 (digest) 固定基础镜像版本，如 `alpine@sha256:xxx`
- 或至少使用更精确的版本标签

---

## 四、低风险 (Low)

### L1. index.html 缺少安全相关 meta 标签

**文件**: `frontend/index.html`  
**风险等级**: 低

HTML 入口文件未设置以下安全相关的 meta 标签：
- 缺少 `<meta http-equiv="Content-Security-Policy">`（CSP 通过中间件设置，但在 HTML 中作为备份也是良好实践）
- 未设置 `X-UA-Compatible` 为 `IE=edge`

### L2. 健康检查端点可能泄露信息

**文件**: `Dockerfile:132-133`  
**风险等级**: 低

健康检查端点 `/health` 的实现细节未知，应确保不返回内部版本号或配置信息。

### L3. 数据库 SSL 模式依赖配置

**文件**: `backend/internal/config/config.go`  
**风险等级**: 低

数据库连接 SSL 模式通过 `sslmode` 配置项控制，默认值未在审查的代码片段中明确。应确保默认为 `require` 或更高安全级别。

---

## 五、正面发现 (已良好实施的安全措施)

1. **密码哈希**: 使用 bcrypt (DefaultCost) 进行密码哈希 (`auth_service.go:1191-1196`)
2. **TOTP 加密**: 使用 AES-256-GCM 加密 TOTP 密钥 (`aes_encryptor.go`)
3. **Token 版本控制**: JWT 包含 TokenVersion，改密后旧 token 失效 (`auth_service.go:1372`)
4. **Refresh Token 轮转**: 每次刷新生成新 refresh token，旧 token 立即失效 (`auth_service.go:1544-1548`)
5. **Refresh Token 防重用检测**: 检测 refresh token 重用并撤销整个 token 家族 (`auth_service.go:1502-1505`)
6. **CSP 策略**: 定义了详细的 Content-Security-Policy (`config.go:32`)
7. **日志脱敏**: 实现了 `logredact` 包对敏感字段进行脱敏 (`logredact/redact.go`)
8. **凭证响应脱敏**: 敏感凭证 key 从 API 响应中移除 (`account_credentials_redact.go`)
9. **API Key IP 白名单/黑名单**: 支持按 API Key 配置 IP 访问控制 (`api_key.go:54-59`)
10. **速率限制**: 所有认证相关端点均配置了频率限制 (`routes/auth.go`)
11. **非 root 用户运行**: Docker 容器使用 sub2api 用户运行 (UID 1000) (`Dockerfile:111-112`)
12. **多阶段构建**: Docker 使用多阶段构建减小攻击面 (`Dockerfile`)
13. **Turnstile CAPTCHA**: 集成 Cloudflare Turnstile 进行人机验证
14. **邮件验证**: 支持注册时邮件验证码
15. **双因素认证**: 支持 TOTP 双因素认证
16. **软删除**: 使用 SoftDeleteMixin 保留数据完整性
17. **邀请码机制**: 支持邀请码控制注册
18. **输入校验**: HTML 转义应用于 API Key 名称 (`api_key_service.go:405`)
19. **URL 白名单**: 支持上游 URL 白名单和私有地址阻止 (`config.go:609-617`)
20. **Admin API Key 恒定时间比较**: 使用 `subtle.ConstantTimeCompare` 防止时序攻击 (`admin_auth.go:132`)

---

## 风险统计

| 风险等级 | 数量 |
|---------|------|
| 严重 (Critical) | 4 |
| 高 (High) | 4 |
| 中 (Medium) | 5 |
| 低 (Low) | 3 |

---

## 修复优先级建议

### 立即修复 (P0 - 本周内)
1. **C1**: 加密存储 account credentials
2. **C2**: 哈希存储 API keys
3. **C3**: 将系统安全密钥移出数据库
4. **C4**: 恢复支付配置加密

### 尽快修复 (P1 - 本月内)
5. **H1**: 实现账户锁定机制
6. **H2**: 实施密码复杂度策略
7. **H3**: 将 token 从 localStorage 迁移到 httpOnly Cookie
8. **H4**: 收紧 CORS 配置

### 计划修复 (P2 - 下季度)
9. **M1**: 评估非对称 JWT 签名迁移
10. **M2**: 移除敏感日志输出
11. **M3**: 审查并加固 v-html 使用
12. **M4**: 加固 WebSocket 安全
13. **M5**: 固定 Docker 基础镜像摘要
