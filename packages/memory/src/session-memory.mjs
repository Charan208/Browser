export class SessionMemory {
  #sessions = new Map();

  upsertSession(taskId, data) {
    const previous = this.#sessions.get(taskId) ?? { events: [] };
    const merged = {
      ...previous,
      ...data,
      updatedAt: new Date().toISOString(),
      events: [...(previous.events ?? []), ...(data.events ?? [])]
    };
    this.#sessions.set(taskId, merged);
    return merged;
  }

  getSession(taskId) {
    return this.#sessions.get(taskId) ?? null;
  }

  clearSession(taskId) {
    this.#sessions.delete(taskId);
  }
}
