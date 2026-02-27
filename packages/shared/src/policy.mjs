export const DEFAULT_POLICY = {
  allowedDomains: ["example.com", "news.ycombinator.com", "github.com"],
  deniedActions: ["delete-account", "payment-submit", "file-download"],
  maxSteps: 30,
  maxTaskDurationMs: 120000
};

export function ensureTaskPolicy(task, policy = DEFAULT_POLICY) {
  if (!task?.url) {
    throw new Error("Task url is required");
  }

  const host = new URL(task.url).hostname;
  if (!policy.allowedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    throw new Error(`Domain ${host} is not allowed by policy`);
  }

  if (!Array.isArray(task.steps) || task.steps.length === 0) {
    throw new Error("Task must include at least one step");
  }

  if (task.steps.length > policy.maxSteps) {
    throw new Error(`Task exceeds maxSteps=${policy.maxSteps}`);
  }

  for (const step of task.steps) {
    if (policy.deniedActions.includes(step.action)) {
      throw new Error(`Action ${step.action} is denied by policy`);
    }
  }
}
