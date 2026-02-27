# AI Browser Production Starter

This repository now includes a working, production-oriented vertical slice of an automated browser platform:

- **API service** with task lifecycle endpoints (`/health`, `/tasks`, `/tasks/:id`)
- **AI core** planner + validator + execution loop
- **Automation layer** (`navigate`, `click`, `type`, `extract`, `screenshot`)
- **Safety policy enforcement** (allowed domains, denied actions, max step budgets)
- **Session memory** for traceability across task execution
- **Minimal web console** for submitting tasks manually

## Project layout

```txt
apps/
  api/src/
    server.mjs
    task-service.mjs
  web/index.html
packages/
  ai-core/src/
    planner.mjs
    executor.mjs
  automation/src/
    step-runner.mjs
    actions/*.mjs
  memory/src/
    session-memory.mjs
  shared/src/
    policy.mjs
tests/
  task-flow.test.mjs
```

## Run

```bash
npm start
```

The API starts on `http://localhost:3001`.

## Example task

```bash
curl -X POST http://localhost:3001/tasks \
  -H 'content-type: application/json' \
  -d '{
    "url": "https://example.com",
    "steps": [
      {"action":"extract", "selector":"h1"},
      {"action":"screenshot", "id":"final", "path":"artifacts/final.png"}
    ]
  }'
```

Then query:

```bash
curl http://localhost:3001/tasks/<taskId>
```

## Production-focused controls included

- **Policy checks**: domain allowlist + denied action list + max step cap.
- **Structured task status**: `queued` → `running` → `completed|failed`.
- **Step-level observability**: durations and output per step.
- **Session memory**: records timeline events for troubleshooting.

## Test

```bash
npm test
```

