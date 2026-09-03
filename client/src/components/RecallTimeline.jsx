function formatShort(date) {
  return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function isDue(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return today >= target;
}

function CircleButton({ checked, clickable, onClick, title }) {
  const base = "block w-4 h-4 rounded-full border-2 transition-colors";
  const color = checked
    ? "bg-done border-done"
    : clickable
    ? "bg-overdue/20 border-overdue"
    : "bg-transparent border-line";

  if (!clickable) {
    return <span className={`${base} ${color}`} title={title} />;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={checked}
      className={`${base} ${color} ${checked ? "" : "hover:bg-overdue/40"} cursor-pointer`}
    />
  );
}

export default function RecallTimeline({
  addedDate,
  day4Date,
  day7Date,
  day4Checked,
  day7Checked,
  onToggleCheckpoint,
}) {
  const day4Clickable = isDue(day4Date);
  const day7Clickable = isDue(day7Date);

  const nodes = [
    {
      key: "added",
      label: "Added",
      date: addedDate,
      node: <CircleButton checked clickable={false} title={`Added: ${formatShort(addedDate)}`} />,
    },
    {
      key: "day4",
      label: "Day 4",
      date: day4Date,
      node: (
        <CircleButton
          checked={day4Checked}
          clickable={day4Clickable}
          onClick={() => onToggleCheckpoint("day4")}
          title={
            day4Checked
              ? "Revised - tap to undo"
              : day4Clickable
              ? "Tap once you've revised this"
              : `Not due until ${formatShort(day4Date)}`
          }
        />
      ),
    },
    {
      key: "day7",
      label: "Day 7",
      date: day7Date,
      node: (
        <CircleButton
          checked={day7Checked}
          clickable={day7Clickable}
          onClick={() => onToggleCheckpoint("day7")}
          title={
            day7Checked
              ? "Revised - tap to undo"
              : day7Clickable
              ? "Tap once you've revised this"
              : `Not due until ${formatShort(day7Date)}`
          }
        />
      ),
    },
  ];

  return (
    <div className="flex items-start w-full max-w-xs" aria-label="Recall timeline">
      {nodes.map((n, i) => (
        <div key={n.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 shrink-0">
            {n.node}
            <span className="text-[11px] font-body text-ink-soft">{n.label}</span>
            <span className="text-[10px] font-body text-ink-soft/70">{formatShort(n.date)}</span>
          </div>
          {i < nodes.length - 1 && <span className="h-[2px] flex-1 mx-1 mt-[-20px] bg-line" />}
        </div>
      ))}
    </div>
  );
}