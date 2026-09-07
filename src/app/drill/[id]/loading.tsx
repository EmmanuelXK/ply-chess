export default function DrillLoading() {
  return (
    <div className="drill-shell">
      <div className="drill-top">
        <div className="h-8 w-32 rounded bg-zinc-800/80" />
        <div className="coach-strip mt-3">
          <p className="text-zinc-500">Loading the book…</p>
        </div>
      </div>
      <div className="board-stage">
        <div className="board-frame animate-pulse bg-zinc-900" />
      </div>
    </div>
  );
}
