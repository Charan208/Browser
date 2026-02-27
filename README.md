# AI Browser (Starter Blueprint)

A practical starter plan for building your own **automated browser platform** with:

- a web app (Next.js)
- an API server (Node.js)
- an AI orchestration layer
- a browser automation engine (Playwright)
- short-term + long-term memory

This repository currently contains a blueprint and implementation guide so you can build iteratively instead of trying to ship everything at once.

---

## 1) Target architecture

Use this as your north-star structure:

```txt
ai-browser/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Node.js backend
├── packages/
│   ├── ai-core/          # planning + agent logic
│   ├── automation/       # Playwright wrappers + DOM tools
│   ├── memory/           # session + vector retrieval
│   └── shared/           # shared types/utilities
├── infra/                # docker/nginx/terraform/scripts
├── turbo.json
└── package.json
```

---

## 2) Build it in 4 phases

### Phase 1 — MVP browser automation

**Goal:** Execute deterministic browser tasks from an API.

Implement first:

- `packages/automation/browser/launch.ts`
- `packages/automation/actions/navigate.ts`
- `packages/automation/actions/click.ts`
- `packages/automation/actions/type.ts`
- `packages/automation/actions/extract.ts`
- `apps/api/src/routes/task.routes.ts`

Example API contract:

- `POST /tasks`
  - body: `{ "url": "https://example.com", "steps": [{"action":"click","selector":"#login"}] }`
  - result: action log + extracted data + screenshot URL

### Phase 2 — Planner and execution loop

**Goal:** Convert a natural-language objective into browser actions.

Implement:

- `packages/ai-core/planner/task-planner.ts`
- `packages/ai-core/planner/plan-validator.ts`
- `packages/ai-core/execution/step-executor.ts`
- `apps/api/src/services/planner.service.ts`
- `apps/api/src/services/execution.service.ts`

Execution flow:

1. user goal → planner
2. planner returns structured steps
3. validator blocks unsafe/impossible steps
4. executor runs steps in browser
5. formatter returns clean result to UI

### Phase 3 — Memory

**Goal:** Keep context across tasks and improve reliability.

Implement:

- short-term memory: active tab, last selectors, recent errors
- long-term memory: website-specific patterns and successful action sequences

Suggested files:

- `packages/memory/short-term/session-memory.ts`
- `packages/memory/long-term/vector-store.ts`
- `apps/api/src/services/memory.service.ts`

### Phase 4 — Production hardening

**Goal:** make it stable and multi-user.

Add:

- auth and workspace isolation
- rate limiting + queueing (BullMQ / Redis)
- browser session pooling
- retries and fallback selectors
- structured telemetry (OpenTelemetry + logs)

---

## 3) Suggested data contracts

### Task input

```json
{
  "taskId": "uuid",
  "goal": "Find the cheapest flight from NYC to SF next Friday",
  "constraints": {
    "maxSteps": 30,
    "headless": true,
    "timeoutMs": 120000
  }
}
```

### Planned step

```json
{
  "id": "step-3",
  "action": "click",
  "selector": "button[type='submit']",
  "reason": "submit search form",
  "fallbackSelectors": ["text=Search", "#search-btn"]
}
```

### Step result

```json
{
  "stepId": "step-3",
  "status": "success",
  "durationMs": 412,
  "artifacts": {
    "screenshot": "/artifacts/task-123/step-3.png"
  },
  "output": {}
}
```

---

## 4) Engineering defaults (recommended)

- **Automation:** Playwright (Chromium first)
- **Frontend:** Next.js + Tailwind + Zustand
- **Backend:** Fastify or Express + Zod validation
- **Queue:** BullMQ + Redis
- **DB:** Postgres + Prisma
- **Vector store:** pgvector (start simple)
- **Monorepo:** Turborepo + pnpm

---

## 5) Security and safety checklist

Before letting users run open-ended tasks, enforce:

- allowlist/denylist for domains
- block dangerous actions by policy (file downloads, payments, account deletion)
- redact secrets from logs/screenshots
- per-task budget limits (time, steps, retries)
- anti-loop detection

---

## 6) First milestone you should ship

Build one end-to-end capability:

> "Given a product page URL, extract title, price, availability, and take a screenshot."

Why this is a great first target:

- deterministic and easy to test
- exercises navigate/click/extract/screenshot
- immediately useful for demos and internal validation

---

## 7) Definition of done for MVP

You are MVP-complete when you can:

- accept a task via API
- run it in Playwright
- return structured JSON output
- save step-level screenshots
- show task status + result in the web UI

---

## 8) Next step (today)

If you want, the next implementation pass can scaffold:

- root `package.json` + `turbo.json`
- `apps/api` minimal server with `/health` and `/tasks`
- `packages/automation` with `navigate/click/type/extract/screenshot`
- shared TypeScript types across `apps` and `packages`

That gives you a working vertical slice to build on.
