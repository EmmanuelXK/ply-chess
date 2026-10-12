"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { exportFen, exportPgn, importNotation } from "@/lib/chess/pgn";
import type { AnalysisTree } from "@/lib/chess/tree";

export function NotationSheet({
  tree,
  onLoad,
  onClose,
}: {
  tree: AnalysisTree;
  onLoad: (tree: AnalysisTree) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(() => exportPgn(tree));
  const [message, setMessage] = useState<string | null>(null);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied`);
    } catch {
      setMessage("Select the text and copy it");
    }
  }

  return (
    <div className="analyze-sheet" data-testid="notation-sheet" role="dialog" aria-label="PGN and FEN">
      <header className="analyze-sheet-head">
        <div>
          <p className="analyze-kicker">Notation</p>
          <h2>PGN and FEN</h2>
        </div>
        <button type="button" className="analyze-text-btn" onClick={onClose}>
          <X />
          Close
        </button>
      </header>
      <textarea
        className="analyze-pgn"
        value={text}
        spellCheck={false}
        aria-label="PGN or FEN"
        onChange={(event) => {
          setText(event.target.value);
          setMessage(null);
        }}
      />
      <div className="analyze-sheet-actions">
        <button
          type="button"
          className="analyze-text-btn analyze-text-btn-on"
          onClick={() => {
            const next = importNotation(text);
            if (!next) {
              setMessage("Paste a PGN or a FEN.");
              return;
            }
            onLoad(next);
            onClose();
          }}
        >
          Import
        </button>
        <button type="button" className="analyze-text-btn" onClick={() => copy(exportPgn(tree), "PGN")}>
          Copy PGN
        </button>
        <button type="button" className="analyze-text-btn" onClick={() => copy(exportFen(tree), "FEN")}>
          Copy FEN
        </button>
      </div>
      <p className="analyze-note" role="status">
        {message ?? "Paste a game or a position. Variations in parentheses are kept."}
      </p>
    </div>
  );
}
