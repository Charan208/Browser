import { createPlanFromTask, validatePlan } from "../../../packages/ai-core/src/planner.mjs";
import { executePlan } from "../../../packages/ai-core/src/executor.mjs";
import { SessionMemory } from "../../../packages/memory/src/session-memory.mjs";
import { DEFAULT_POLICY, ensureTaskPolicy } from "../../../packages/shared/src/policy.mjs";

function randomId(prefix = "task") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export class TaskService {
  #tasks = new Map();
  #memory = new SessionMemory();

  constructor({ browserFactory, policy = DEFAULT_POLICY } = {}) {
    this.browserFactory = browserFactory;
    this.policy = policy;
  }

  listTasks() {
    return [...this.#tasks.values()].map(({ pageContext, ...rest }) => rest);
  }

  getTask(taskId) {
    const task = this.#tasks.get(taskId);
    if (!task) return null;
    const { pageContext, ...rest } = task;
    return {
      ...rest,
      memory: this.#memory.getSession(taskId)
    };
  }

  async createTask(input) {
    const taskId = input.taskId ?? randomId();
    const task = { ...input, taskId };

    ensureTaskPolicy(task, this.policy);

    const plan = createPlanFromTask(task);
    validatePlan(plan, { maxSteps: this.policy.maxSteps });

    const record = {
      taskId,
      status: "queued",
      createdAt: new Date().toISOString(),
      goal: plan.goal,
      plan
    };

    this.#tasks.set(taskId, record);
    queueMicrotask(() => this.#runTask(taskId));

    return record;
  }

  async #runTask(taskId) {
    const record = this.#tasks.get(taskId);
    if (!record) return;

    record.status = "running";
    record.startedAt = new Date().toISOString();
    this.#memory.upsertSession(taskId, { events: [{ message: "Task started" }] });

    let pageContext;
    try {
      pageContext = await this.browserFactory();
      const execution = await executePlan(pageContext.page, record.plan, {
        onStep: async (step, result) => {
          this.#memory.upsertSession(taskId, {
            events: [{ message: `Step ${step.id} ${result.status}`, stepId: step.id }]
          });
        }
      });

      record.status = execution.status;
      record.results = execution.results;
      record.finishedAt = new Date().toISOString();
      this.#memory.upsertSession(taskId, { events: [{ message: "Task completed" }] });
    } catch (error) {
      record.status = "failed";
      record.error = error instanceof Error ? error.message : String(error);
      record.finishedAt = new Date().toISOString();
      this.#memory.upsertSession(taskId, { events: [{ message: `Task failed: ${record.error}` }] });
    } finally {
      await pageContext?.close?.();
    }
  }
}
