import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { enablePushReminders } from "./push";
import TodoForm from "./components/TodoForm";
import TodoCard from "./components/TodoCard";

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pushState, setPushState] = useState("idle"); // idle | enabling | on | error
  const [theme, setTheme] = useState(getInitialTheme);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const load = async () => {
    try {
      setError("");
      const data = await api.listTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  load();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  // Ask for notification permission automatically on first load instead
  // of requiring a click. The browser still shows its own native
  // Allow/Block prompt - that part can't be skipped or done silently.
  if ("Notification" in window && Notification.permission !== "denied") {
    setPushState("enabling");
    enablePushReminders()
      .then(() => setPushState("on"))
      .catch(() => setPushState("error"));
  } else {
    setPushState("error");
  }
}, []);

  const handleCreate = async (data) => {
    const todo = await api.createTodo(data);
    setTodos((prev) => [todo, ...prev]);
  };

  const handleUpdate = async (id, data) => {
    const todo = await api.updateTodo(id, data);
    setTodos((prev) => prev.map((t) => (t._id === id ? todo : t)));
  };
  const handleToggleCheckpoint = async (id, node) => {
  try {
    const todo = await api.setCheckpoint(id, node);
    setTodos((prev) => prev.map((t) => (t._id === id ? todo : t)));
  } catch (err) {
    setError(err.message);
  }
};
  const handleSetDone = async (id, done) => {
    const todo = await api.setDone(id, done);
    setTodos((prev) => prev.map((t) => (t._id === id ? todo : t)));
  };

  const handleRemove = async (id) => {
    await api.removeTodo(id);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  const sortedTodos = useMemo(() => {
    const direction = sortOrder === "newest" ? -1 : 1;
    return [...todos].sort(
      (a, b) => direction * (new Date(a.addedDate) - new Date(b.addedDate))
    );
  }, [todos, sortOrder]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="px-4 sm:px-6 pt-8 pb-6 max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-added font-semibold">
              The 1-4-7 rule
            </p>
            <h1 className="font-display text-3xl font-bold text-ink mt-1">Recall</h1>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="shrink-0 w-10 h-10 rounded-full border border-line flex items-center justify-center text-ink-soft hover:text-added hover:border-added transition-colors"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
        <p className="font-body text-sm text-ink-soft mt-2">
          Log what you studied. Come back on day 4, then day 7 - that's what makes it stick.
        </p>

        {pushState === "error" && (
          <p className="font-body text-xs text-ink-soft mt-3">
            Notifications are off in your browser, so 6pm reminders won't reach you here. You
            can turn them on in your browser/site settings.
          </p>
        )}
      </header>

      <main className="px-4 sm:px-6 pb-16 max-w-2xl mx-auto flex flex-col gap-4">
        <TodoForm onCreate={handleCreate} />

        {error && (
          <p className="font-body text-sm text-overdue bg-overdue/5 border border-overdue/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {todos.length > 0 && (
          <div className="flex items-center justify-end gap-1 -mb-1">
            <span className="font-body text-xs text-ink-soft mr-1">Sort:</span>
            <button
              onClick={() => setSortOrder("newest")}
              className={`text-xs font-body font-medium px-2.5 py-1 rounded-full transition-colors ${
                sortOrder === "newest"
                  ? "bg-added text-white"
                  : "border border-line text-ink-soft"
              }`}
            >
              Newest first
            </button>
            <button
              onClick={() => setSortOrder("oldest")}
              className={`text-xs font-body font-medium px-2.5 py-1 rounded-full transition-colors ${
                sortOrder === "oldest"
                  ? "bg-added text-white"
                  : "border border-line text-ink-soft"
              }`}
            >
              Oldest first
            </button>
          </div>
        )}
        {loading ? (
          <p className="font-body text-sm text-ink-soft text-center py-8">Loading your entries…</p>
        ) : sortedTodos.length === 0 ? (
          <p className="font-body text-sm text-ink-soft text-center py-8">
            Nothing logged yet. Add today's study entry above to start the clock.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sortedTodos.map((todo) => (
              <TodoCard
  key={todo._id}
  todo={todo}
  onUpdate={handleUpdate}
  onSetDone={handleSetDone}
  onRemove={handleRemove}
  onToggleCheckpoint={handleToggleCheckpoint}
/>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}