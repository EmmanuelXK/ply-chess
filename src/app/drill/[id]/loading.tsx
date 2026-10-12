export default function DrillLoading() {
  return (
    <div className="board-shell">
      <header className="board-header">
        <div className="shell-skel" />
      </header>
      <div className="board-row">
        <div className="board-rail" />
        <div className="board-well">
          <div className="board-frame animate-pulse" />
        </div>
      </div>
      <div className="board-panel">
        <p className="shell-wait">Loading the book…</p>
      </div>
      <div className="board-dock" aria-hidden>
        <div className="ply-nav">
          <span className="ply-btn" />
          <span className="ply-btn ply-btn-fwd" />
        </div>
      </div>
    </div>
  );
}
