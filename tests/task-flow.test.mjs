import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskService } from '../apps/api/src/task-service.mjs';

function createFakePage() {
  return {
    async goto() {},
    async click() {},
    async fill() {},
    async textContent() { return 'Example Domain'; },
    async screenshot() {}
  };
}

async function waitForCompletion(service, taskId, maxMs = 500) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const task = service.getTask(taskId);
    if (task?.status === 'completed' || task?.status === 'failed') {
      return task;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('Timed out waiting for task completion');
}

test('creates and executes a task successfully', async () => {
  const service = new TaskService({
    browserFactory: async () => ({ page: createFakePage(), close: async () => {} }),
    policy: {
      allowedDomains: ['example.com'],
      deniedActions: ['delete-account'],
      maxSteps: 10,
      maxTaskDurationMs: 5000
    }
  });

  const task = await service.createTask({
    url: 'https://example.com',
    steps: [{ action: 'extract', selector: 'h1' }]
  });

  assert.ok(['queued', 'running'].includes(task.status));

  const fetched = await waitForCompletion(service, task.taskId);
  assert.equal(fetched.status, 'completed');
  assert.equal(fetched.results.length, 2);
});

test('blocks non-allowlisted domain', async () => {
  const service = new TaskService({
    browserFactory: async () => ({ page: createFakePage(), close: async () => {} }),
    policy: {
      allowedDomains: ['example.com'],
      deniedActions: [],
      maxSteps: 10,
      maxTaskDurationMs: 5000
    }
  });

  await assert.rejects(
    () => service.createTask({ url: 'https://evil.com', steps: [{ action: 'extract', selector: 'h1' }] }),
    /not allowed/
  );
});
