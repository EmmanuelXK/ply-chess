"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { PlyNav } from "@/components/drill/ply-nav";
import { SplashBoard } from "@/components/drill/splash-board";
import { SpeakerChip } from "@/components/drill/speaker-chip";
import { playLine } from "@/lib/chess/line";
import type { DeviationExplain } from "@/lib/openings/deviation";

export function CoachExplain({
  explain,
  orientation,
  showLine: showLineProp,
  onShowLineChange,
  onClose,
}: {
  explain: DeviationExplain;
  orientation: "white" | "black";
  showLine?: boolean;
  onShowLineChange?: (on: boolean) => void;
  onClose: () => void;
}) {
  const [internalLine, setInternalLine] = useState(false);
  const showLine = showLineProp ?? internalLine;
  const setShowLine = onShowLineChange ?? setInternalLine;
  const [ply, setPly] = useState(explain.startPly);
  const [playing, setPlaying] = useState(false);

  const line = explain.bookLine;
  const pos = useMemo(() => playLine(line, ply), [line, ply]);
  const autoplaying = showLine && playing && ply < line.length;

  useEffect(() => {
    setPly(explain.startPly);
    setPlaying(false);
  }, [explain.startPly, explain.playedSan, explain.bookSan]);

  useEffect(() => {
    if (!autoplaying) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      setPly((p) => Math.min(p + 1, line.length));
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [autoplaying, ply, line.length]);

  const go = useCallback(
    (next: number) => {
      setPly(Math.max(0, Math.min(next, line.length)));
    },
    [line.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!showLine) return;
      if (e.key === "ArrowLeft") {
        setPlaying(false);
        go(ply - 1);
      }
      if (e.key === "ArrowRight") {
        setPlaying(false);
        go(ply + 1);
      }
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((on) => !on);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, ply, showLine]);

  const critical = explain.candidates.filter(
    (row) => row.book || row.classification === "Critical" || row.classification === "Strong",
  );
  const extras = explain.candidates.filter((row) => !critical.includes(row)).slice(0, 2);
  const shown = [...critical, ...extras].slice(0, 4);

  return (
    <div
      className="splash-root"
      role="dialog"
      aria-modal="true"
      aria-label="Coach"
      data-testid="coach-explain"
      data-line={showLine ? "on" : "off"}
    >
      <button type="button" className="splash-scrim" aria-label="Close coach" onClick={onClose} />
      <div className="splash-card splash-in coach-explain-card">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[var(--ember)] uppercase">
              Coach{explain.houseName ? ` · ${explain.houseName}` : ""}
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              Off the book
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onClose} aria-label="Close">
            <X className="size-3.5" />
            Close
          </button>
        </header>

        <div className="coach-explain-toggle" role="group" aria-label="Line viewer">
          <button
            type="button"
            className={!showLine ? "explain-mode explain-mode-on" : "explain-mode"}
            aria-pressed={!showLine}
            data-testid="coach-explain-hide-line"
            onClick={() => setShowLine(false)}
          >
            Ideas
          </button>
          <button
            type="button"
            className={showLine ? "explain-mode explain-mode-on" : "explain-mode"}
            aria-pressed={showLine}
            data-testid="coach-explain-show-line"
            onClick={() => setShowLine(true)}
          >
            Line
          </button>
        </div>

        <p className="splash-copy">
          <SpeakerChip /> {explain.problem}
        </p>
        {explain.playedSan ? (
          <p className="coach-explain-san">Your {explain.playedSan}</p>
        ) : null}

        <div className="human-panel">
          <p className="human-kicker">The book idea</p>
          <p className="human-copy">{explain.bookIdea}</p>
          {explain.contrast ? (
            <>
              <p className="human-kicker">Contrast</p>
              <p className="human-copy">{explain.contrast}</p>
            </>
          ) : null}
          {shown.length ? (
            <>
              <p className="human-kicker">Candidates</p>
              <ul className="engine-votes">
                {shown.map((row) => (
                  <li key={`${row.san}-${row.classification}`}>
                    <span>{row.book ? "Book" : row.classification}</span>
                    <strong>{row.san}</strong>
                    {row.reason ? <em>{row.reason}</em> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        {showLine ? (
          <div className="coach-explain-line" data-testid="coach-explain-line">
            <div className="splash-board">
              <SplashBoard
                fen={pos.fen}
                lastMove={pos.lastMove}
                orientation={orientation}
                turnColor={pos.turnColor}
                check={pos.check}
                animationMs={90}
              />
            </div>
            <PlyNav
              canBack={ply > 0}
              canForward={ply < line.length}
              lastSan={ply > 0 ? line[ply - 1] : "Start"}
              playing={autoplaying}
              onBack={() => {
                setPlaying(false);
                go(ply - 1);
              }}
              onForward={() => {
                setPlaying(false);
                go(ply + 1);
              }}
              onPlay={() => {
                if (ply >= line.length) {
                  go(explain.startPly);
                  setPlaying(true);
                  return;
                }
                setPlaying((on) => !on);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
