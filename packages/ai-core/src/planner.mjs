export function createPlanFromTask(task) {
  const steps = [
    {
      id: "step-1",
      action: "navigate",
      url: task.url,
      reason: "Open target website"
    },
    ...(task.steps ?? []).map((step, index) => ({
      id: step.id ?? `step-${index + 2}`,
      ...step
    }))
  ];

  return {
    taskId: task.taskId,
    goal: task.goal ?? `Execute workflow for ${task.url}`,
    steps
  };
}

export function validatePlan(plan, { maxSteps = 30 } = {}) {
  if (plan.steps.length > maxSteps) {
    throw new Error(`Plan exceeds max step limit (${maxSteps})`);
  }

  for (const step of plan.steps) {
    if (!step.action) {
      throw new Error(`Step ${step.id} is missing action`);
    }
  }

  return true;
}
