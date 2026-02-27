import { runStep } from "../../automation/src/step-runner.mjs";

export async function executePlan(page, plan, hooks = {}) {
  const results = [];

  for (const step of plan.steps) {
    const result = await runStep(page, step);
    results.push(result);
    await hooks.onStep?.(step, result);
  }

  return {
    taskId: plan.taskId,
    status: "completed",
    results
  };
}
