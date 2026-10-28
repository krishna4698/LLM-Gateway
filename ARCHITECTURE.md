# LLM Gateway — Master Architecture & Implementation Blueprint

> **Reference Specification & Production Roadmap**  
> *Keep this document updated as each milestone is built and verified.*

---

## 1. What is this Project?

An **LLM Gateway** is a centralized backend infrastructure proxy between client applications (web apps, mobile apps, customer support bots, AI coding assistants) and multiple AI model providers (OpenAI, Google Gemini, Anthropic, Groq, local Ollama).

Instead of every application managing its own API keys, rate limits, retries, cost tracking, and provider schemas, **all requests pass through this gateway via an OpenAI-compatible API (`/v1/chat/completions`)**.

```
Client Applications (Web / Mobile / Microservices)
                    │
                    ▼
          ┌─────────────────────┐
          │     LLM GATEWAY     │
          │  Auth • Router      │
          │  Budgets • Caching  │
          │  Retries • Fallback │
          │  Observability      │
          └──────────┬──────────┘
                     │
     ┌───────────────┼───────────────┬───────────────┐
     ▼               ▼               ▼               ▼
  OpenAI         Anthropic        Gemini           Groq
 (GPT-4o)      (Claude 3.5)    (1.5 Flash)     (Llama 3.3)
```

---

## 2. Production Architecture (The 5 Layers)

1. **Client Layer:** Web apps, backend microservices, or any official OpenAI SDK pointing to `baseURL: http://localhost:3001/v1`.
2. **API Edge (Express + TypeScript):**
   - API Key authentication (`Authorization: Bearer gw_live_...`).
   - Request schema validation (Zod).
   - Rate limiting (Sliding window / Token bucket).
   - Request size & payload guards.
3. **Gateway Orchestration (Core Brain):**
   - **Model Alias Resolution:** Maps `"smart-chat"` ➔ Primary & Fallback deployments.
   - **Router:** Selects deployment based on availability, health, priority.
   - **Resilience Engine:** Bounded exponential backoff retries & failover.
   - **Streaming Coordinator:** SSE chunk pass-through with client abort detection.
4. **Provider Adapter Layer (Adapter Pattern):**
   - Normalized internal format ➔ Provider-specific API format.
   - Converts OpenAI / Anthropic / Gemini responses into standard output.
5. **Supporting Infrastructure (Out-of-Band):**
   - **PostgreSQL (Neon):** Durable records (Users, Projects, GatewayKeys, ProviderKeys, UsageRecords).
   - **Redis:** Shared rate-limit counters, exact-match prompt cache.
   - **Async Logger:** Asynchronously writes usage & cost without blocking TTFT.

---

## 3. The 10 Core Architectural Components

### Component 1: API Keys & Authentication
- **Gateway Keys (`gw_live_...`):** Issued to your users/clients. Hashed with SHA-256 in DB. Never stored in plaintext.
- **Provider Keys (`OPENAI_API_KEY`, etc.):** Master keys in `.env` OR user BYOK encrypted keys in DB.
- **Cache Auth:** Cache valid `keyHash` in memory/Redis (TTL 60s) to keep auth overhead < 1ms.

### Component 2: The Model Router (Virtual Models)
- Clients request an **alias**, not a hardcoded model:
  - **`smart-chat`**: Primary = Claude 3.5 Sonnet, Fallback = GPT-4o.
  - **`fast-chat`**: Primary = Groq (Llama 3.3 70b), Fallback = GPT-4o-mini.
  - **`cheap-chat`**: Primary = Gemini 1.5 Flash, Fallback = Groq (Llama 3.1 8b).
- **Model Selection vs Failover:**
  - *Selection:* Which model is right for the task?
  - *Failover:* Where to route if the selected model returns 429/500/timeout?

### Component 3: Provider Adapters (Adapter Pattern)
- Single interface `BaseProvider`:
  - `generate(req, apiKey, signal): Promise<GatewayResult>`
  - `stream(req, apiKey, signal): AsyncIterable<string>`
- Handles provider-specific differences in headers, JSON payloads, and SSE stream formatting.

### Component 4: Retries, Timeouts, and Fallback
- **Do NOT retry everything:**
  - `400 Bad Request` ➔ Return immediately (invalid prompt).
  - `401 Unauthorized` ➔ Return immediately (bad key).
  - `429 Rate Limit` or `5xx Server Error` ➔ Eligible for bounded retry or failover.
- **Prevent Retry Amplification:** Disable provider SDK internal retries (`maxRetries: 0`). The Gateway alone controls retries.
- **Exponential Backoff:** $d_n = \min(d_{\max}, d_0 \cdot 2^n) + \text{jitter}$.

### Component 5: Streaming Responses (SSE)
- Streams chunks progressively using Server-Sent Events (`text/event-stream`).
- **The Mid-Stream Rule:** If a provider fails *before* the first token is sent ➔ safe to failover. If it fails *after* tokens have been sent ➔ terminate stream with error event; never silently switch models mid-sentence.
- **Client Disconnection:** Listen to `req.on('close')` and trigger `abortController.abort()` to cancel upstream requests and stop billing.

### Component 6: Token Usage & Cost Calculation
- Formula:
  $$\text{Cost} = \frac{T_{\text{in}} \cdot P_{\text{in}} + T_{\text{out}} \cdot P_{\text{out}}}{1{,}000{,}000}$$
- Extract usage from provider completion chunk (`stream_options: { include_usage: true }`).
- Store versioned pricing tables so historical billing records never silently change when providers update prices.

### Component 7: Rate Limiting & Budgets
- **Rate Limiting:** RPM (Requests Per Minute) and TPM (Tokens Per Minute) in Redis.
- **Spend Budgets:** Hard dollar limits ($/month). Reserve balance before dispatching concurrent requests.

### Component 8: Caching
- **Exact-Match Cache:** `hash(tenant_id + model + normalized_messages + temperature)`.
- Reuses identical answers at **$0 cost** and **<5ms latency**.
- Never cross-share cached private responses across different tenants.

### Component 9: Database Architecture
- `User` ➔ `Project` ➔ `GatewayKey` ➔ `UsageRecord`.
- `ProviderKey` for encrypted BYOK credentials.
- `RefreshToken` for secure, rotating user dashboard sessions.

### Component 10: Observability & Tracing
- One unique `requestId` (e.g. `req_7f2d91`) passed through all layers.
- Track metrics: TTFT (Time To First Token), upstream latency, tokens, cost, fallback rate.
- **Never log raw prompts or API secrets by default** to protect user privacy.

---

## 4. The 12-Block Implementation Flow

| Block | Phase | Description | Status |
| :---: | :--- | :--- | :---: |
| **01** | **Basic Server** | Express + TypeScript, Turborepo setup, `/health` route. | ✅ **DONE** |
| **02** | **First Provider** | Integrate 1 real LLM provider (Gemini), `/v1/chat/completions`. | ✅ **DONE** |
| **03** | **Adapter Interface** | Separate provider logic into `ProviderAdapter` contract. | ✅ **DONE** |
| **04** | **Second Provider** | Add 2nd provider (Groq) using the same interface. | ✅ **DONE** |
| **05** | **Model Router** | Implement virtual alias routing (`smart-chat`, `fast-chat`). | ✅ **DONE** |
| **06** | **Resilience & Fallback** | Add timeouts, bounded retries, and automatic failover on 429/5xx. | ✅ **DONE** |
| **07** | **Database & Persistence** | PostgreSQL + Prisma schema for Users, Projects, Keys, Logs. | ✅ **DONE** |
| **08** | **Auth & Authorization** | Validate gateway keys (`gw_live_...`), check model permissions. | 🟡 **NEXT** |
| **09** | **Redis & Rate Limits** | Shared token-bucket rate limiting and concurrency controls. | ⏳ Pending |
| **10** | **Cost & Token Tracking** | Versioned pricing table, token usage calculation, DB recording. | ⏳ Pending |
| **11** | **Streaming (SSE)** | Progressive streaming, client disconnect abort, mid-stream handling. | ⏳ Pending |
| **12** | **Dashboard & Hardening** | Next.js admin UI, charts, key creation, refresh tokens, test suite. | ⏳ Pending |

---

## 5. Golden Rules for Development

1. **Build Block by Block:** Never build Block 9 (Redis) before Block 2 (First working request) is proven.
2. **Never Block the Critical Path:** Stream first; write logs and update analytics asynchronously.
3. **Decoupled Auth:** The Gateway Proxy uses `GatewayKey` (`gw_live_...`); the Dashboard uses `User` JWT sessions.
4. **Test Failures Explicitly:** Test simulated 429s and 500s to verify fallback actually protects the user.

