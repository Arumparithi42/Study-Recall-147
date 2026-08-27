import { useState } from "react";

export default function TodoForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onCreate({ title, description });
      setTitle("");
      setDescription("");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-added text-white font-body font-medium rounded-2xl py-3.5 shadow-sm hover:opacity-90 transition-opacity"
      >
        + Add what you studied today
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-surface border border-line rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
    >
      <input
        autoFocus
        className="font-display text-lg font-semibold bg-transparent border-b border-line focus:border-added outline-none pb-1"
        placeholder="Title, e.g. Graph traversal (DFS/BFS)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
      />
      <textarea
        className="font-body text-sm bg-transparent border border-line rounded-lg p-2 focus:border-added outline-none resize-none"
        rows={3}
        placeholder="Notes, source, or what to focus on when revising (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
      />
      <p className="text-[11px] font-body text-ink-soft">
        Added today. Revision reminders will fire at 6pm on day 4 and day 7 - not editable after saving.
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="text-sm font-body font-medium px-4 py-2 rounded-lg bg-added text-white disabled:opacity-50"
        >
          Save entry
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={busy}
          className="text-sm font-body font-medium px-4 py-2 rounded-lg border border-line text-ink-soft"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
