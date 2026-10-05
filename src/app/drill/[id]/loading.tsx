export default function DrillLoading() {
  return (
    <div className="drill-shell">
      <div className="drill-top">
        <div className="shell-skel" />
      </div>
      <div className="learn-main">
        <div className="board-stage">
          <div className="board-with-history">
            <div className="board-frame animate-pulse" />
          </div>
        </div>
        <div className="ply-nav" aria-hidden>
          <span className="ply-btn" />
          <span className="ply-btn ply-btn-fwd" />
        </div>
        <div className="coach-strip">
          <p className="shell-wait">Loading the book…</p>
        </div>
      </div>
    </div>
  );
}
