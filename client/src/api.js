const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listTodos: () => request("/todos"),
  createTodo: (data) => request("/todos", { method: "POST", body: JSON.stringify(data) }),
  updateTodo: (id, data) =>
    request(`/todos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  setDone: (id, done) =>
    request(`/todos/${id}/done`, { method: "PATCH", body: JSON.stringify({ done }) }),
  removeTodo: (id) => request(`/todos/${id}`, { method: "DELETE" }),
  getVapidKey: () => request("/push/vapid-public-key"),
  subscribePush: (subscription) =>
    request("/push/subscribe", { method: "POST", body: JSON.stringify(subscription) }),
  setCheckpoint: (id, node) =>
  request(`/todos/${id}/checkpoint`, { method: "PATCH", body: JSON.stringify({ node }) }),
};

