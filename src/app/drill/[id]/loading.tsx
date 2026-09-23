export default function DrillLoading() {
  return (
    <div className="drill-shell">
      <div className="drill-top">
        <div className="h-8 w-32 rounded bg-zinc-800/80" />
      </div>
      <div className="learn-main">
        <div className="board-stage">
          <div className="board-with-history">
            <div className="board-frame animate-pulse bg-zinc-900" />
          </div>
        </div>
        <div className="ply-nav" aria-hidden>
          <span className="ply-btn" />
          <span className="ply-btn ply-btn-fwd" />
        </div>
        <div className="coach-strip">
          <p className="text-zinc-500">Loading the book…</p>
        </div>
      </div>
    </div>
  );
}
