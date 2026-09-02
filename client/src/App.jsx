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
  }, []);

  const handleCreate = async (data) => {
    const todo = await api.createTodo(data);
    setTodos((prev) => [todo, ...prev]);
  };

  const handleUpdate = async (id, data) => {
    const todo = await api.updateTodo(id, data);
    setTodos((prev) => prev.map((t) => (t._id === id ? todo : t)));
  };

  const handleSetDone = async (id, done) => {
    const todo = await api.setDone(id, done);
    setTodos((prev) => prev.map((t) => (t._id === id ? todo : t)));
  };

  const handleRemove = async (id) => {
    await api.removeTodo(id);
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  const handleEnablePush = async () => {
    setPushState("enabling");
    try {
      await enablePushReminders();
      setPushState("on");
    } catch (err) {
      setError(err.message);
      setPushState("error");
    }
  };

  const sortedTodos = useMemo(
    () => [...todos].sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate)),
    [todos]
  );

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

        {pushState !== "on" && (
          <button
            onClick={handleEnablePush}
            disabled={pushState === "enabling"}
            className="mt-4 text-sm font-body font-medium text-added border border-added/30 bg-added/5 rounded-lg px-3 py-2 disabled:opacity-50"
          >
            {pushState === "enabling" ? "Enabling reminders…" : "Turn on 6pm reminders"}
          </button>
        )}
      </header>

      <main className="px-4 sm:px-6 pb-16 max-w-2xl mx-auto flex flex-col gap-4">
        <TodoForm onCreate={handleCreate} />

        {error && (
          <p className="font-body text-sm text-overdue bg-overdue/5 border border-overdue/20 rounded-lg px-3 py-2">
            {error}
          </p>
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
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}