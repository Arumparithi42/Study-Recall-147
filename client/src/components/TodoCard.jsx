import { useState } from "react";
import RecallTimeline from "./RecallTimeline";

export default function TodoCard({ todo, onUpdate, onSetDone, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [busy, setBusy] = useState(false);

  const saveEdit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onUpdate(todo._id, { title, description });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => {
    setTitle(todo.title);
    setDescription(todo.description);
    setEditing(false);
  };

  return (
    <li className="bg-surface border border-line rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              className="w-full font-display text-lg font-semibold bg-transparent border-b border-line focus:border-added outline-none pb-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              aria-label="Edit title"
            />
          ) : (
            <h3
              className={`font-display text-lg font-semibold break-words ${
                todo.done ? "line-through text-ink-soft" : "text-ink"
              }`}
            >
              {todo.title}
            </h3>
          )}
        </div>
        {todo.done && (
          <span className="shrink-0 text-[11px] font-body font-semibold text-done bg-done/10 px-2 py-1 rounded-full">
            Done
          </span>
        )}
      </div>

      {editing ? (
        <textarea
          className="w-full font-body text-sm bg-transparent border border-line rounded-lg p-2 focus:border-added outline-none resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          placeholder="What did you study?"
          aria-label="Edit description"
        />
      ) : (
        todo.description && (
          <p className="font-body text-sm text-ink-soft whitespace-pre-wrap break-words">
            {todo.description}
          </p>
        )
      )}

      <RecallTimeline
        addedDate={todo.addedDate}
        day4Date={todo.day4Date}
        day7Date={todo.day7Date}
        done={todo.done}
      />

      <div className="flex flex-wrap gap-2 pt-1">
        {editing ? (
          <>
            <button
              onClick={saveEdit}
              disabled={busy}
              className="text-sm font-body font-medium px-3 py-1.5 rounded-lg bg-added text-white disabled:opacity-50"
            >
              Save changes
            </button>
            <button
              onClick={cancelEdit}
              disabled={busy}
              className="text-sm font-body font-medium px-3 py-1.5 rounded-lg border border-line text-ink-soft"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-body font-medium px-3 py-1.5 rounded-lg border border-line text-ink-soft hover:border-added hover:text-added transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onSetDone(todo._id, !todo.done)}
              className={`text-sm font-body font-medium px-3 py-1.5 rounded-lg transition-colors ${
                todo.done
                  ? "border border-line text-ink-soft hover:text-ink"
                  : "bg-done text-white"
              }`}
            >
              {todo.done ? "Mark not done" : "Done?"}
            </button>
            <button
              onClick={() => onRemove(todo._id)}
              disabled={!todo.done}
              title={todo.done ? "Remove this entry" : "Only completed entries can be removed"}
              className="text-sm font-body font-medium px-3 py-1.5 rounded-lg border border-line text-overdue disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overdue/5 transition-colors"
            >
              Remove
            </button>
          </>
        )}
      </div>
    </li>
  );
}
