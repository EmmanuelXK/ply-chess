"use client";

import type { ReactNode } from "react";

/** Full-height phone column: header, edge-to-edge board, panel, dock. */
export function BoardShell({
  testId,
  fen,
  mode,
  header,
  evalBar,
  board,
  wellTestId,
  wellArrow,
  panel,
  dock,
  overlays,
}: {
  testId?: string;
  fen?: string;
  mode?: string;
  header: ReactNode;
  evalBar: ReactNode;
  board: ReactNode;
  wellTestId?: string;
  wellArrow?: string;
  panel: ReactNode;
  dock?: ReactNode;
  overlays?: ReactNode;
}) {
  return (
    <div className="board-shell" data-testid={testId} data-fen={fen} data-mode={mode}>
      <header className="board-header">{header}</header>
      <div className="board-row">
        <div className="board-rail" data-testid="eval-bar">
          {evalBar}
        </div>
        <div className="board-well" data-testid={wellTestId} data-arrow={wellArrow}>
          {board}
        </div>
      </div>
      <div className="board-panel">{panel}</div>
      {dock ? <div className="board-dock">{dock}</div> : null}
      {overlays}
    </div>
  );
}
