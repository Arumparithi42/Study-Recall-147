const DAY_MS = 24 * 60 * 60 * 1000;

function formatShort(date) {
  return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// Returns "upcoming" | "due" | "overdue" | "cleared" for a single checkpoint date.
function nodeStatus(date, done, todayStart) {
  if (done) return "cleared";
  const nodeStart = new Date(date);
  nodeStart.setHours(0, 0, 0, 0);
  const diffDays = Math.round((nodeStart - todayStart) / DAY_MS);
  if (diffDays > 0) return "upcoming";
  if (diffDays === 0) return "due";
  return "overdue";
}

const NODE_STYLES = {
  cleared: { dot: "bg-done border-done", label: "text-done" },
  due: { dot: "bg-due border-due animate-pulse", label: "text-due font-semibold" },
  overdue: { dot: "bg-overdue border-overdue", label: "text-overdue font-semibold" },
  upcoming: { dot: "bg-transparent border-line", label: "text-ink-soft" },
  passedAdded: { dot: "bg-added border-added", label: "text-ink-soft" },
};

export default function RecallTimeline({ addedDate, day4Date, day7Date, done }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const day4Status = nodeStatus(day4Date, done, todayStart);
  const day7Status = nodeStatus(day7Date, done, todayStart);

  const nodes = [
    { key: "added", label: "Added", date: addedDate, style: NODE_STYLES.passedAdded },
    { key: "day4", label: "Day 4", date: day4Date, style: NODE_STYLES[day4Status] },
    { key: "day7", label: "Day 7", date: day7Date, style: NODE_STYLES[day7Status] },
  ];

  const lineFillClass = done ? "bg-done" : "bg-line";

  return (
    <div className="flex items-start w-full max-w-xs" aria-label="Recall timeline">
      {nodes.map((node, i) => (
        <div key={node.key} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span
              className={`block w-3 h-3 rounded-full border-2 ${node.style.dot}`}
              title={`${node.label}: ${formatShort(node.date)}`}
            />
            <span className={`text-[11px] font-body ${node.style.label}`}>{node.label}</span>
            <span className="text-[10px] font-body text-ink-soft/70">{formatShort(node.date)}</span>
          </div>
          {i < nodes.length - 1 && (
            <span className={`h-[2px] flex-1 mx-1 mt-[-18px] ${lineFillClass}`} />
          )}
        </div>
      ))}
    </div>
  );
}
