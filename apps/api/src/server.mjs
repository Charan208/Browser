import http from "node:http";
import { TaskService } from "./task-service.mjs";

function createMockPage() {
  return {
    async goto() {},
    async click() {},
    async fill() {},
    async textContent(selector) {
      return `mocked-content-for:${selector}`;
    },
    async screenshot() {}
  };
}

const service = new TaskService({
  browserFactory: async () => ({
    page: createMockPage(),
    async close() {}
  })
});

function send(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function collectJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { status: "ok", uptime: process.uptime() });
  }

  if (req.method === "GET" && req.url === "/tasks") {
    return send(res, 200, { tasks: service.listTasks() });
  }

  if (req.method === "POST" && req.url === "/tasks") {
    try {
      const body = await collectJsonBody(req);
      const created = await service.createTask(body);
      return send(res, 202, created);
    } catch (error) {
      return send(res, 400, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (req.method === "GET" && req.url?.startsWith("/tasks/")) {
    const taskId = req.url.slice("/tasks/".length);
    const task = service.getTask(taskId);
    if (!task) {
      return send(res, 404, { error: "Task not found" });
    }
    return send(res, 200, task);
  }

  return send(res, 404, { error: "Not found" });
});

const PORT = Number(process.env.PORT ?? 3001);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on :${PORT}`);
});
