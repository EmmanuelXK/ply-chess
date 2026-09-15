"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { PlyNav } from "@/components/drill/ply-nav";
import { SplashBoard } from "@/components/drill/splash-board";
import { playLine } from "@/lib/chess/line";
import {
  modeSwitchCopy,
  type ModeSwitchKind,
} from "@/lib/openings/mode-switch";

export function ModePreview({
  kind,
  line,
  startPly,
  orientation,
  onConfirm,
  onCancel,
}: {
  kind: ModeSwitchKind;
  line: string[];
  startPly: number;
  orientation: "white" | "black";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const copy = modeSwitchCopy(kind);
  const [ply, setPly] = useState(() =>
    Math.max(0, Math.min(startPly, line.length)),
  );
  const [playing, setPlaying] = useState(false);
  const pos = useMemo(() => playLine(line, ply), [line, ply]);
  const autoplaying = playing && ply < line.length;

  useEffect(() => {
    setPly(Math.max(0, Math.min(startPly, line.length)));
    setPlaying(false);
  }, [startPly, line.length, kind]);

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
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, onConfirm]);

  return (
    <div
      className="splash-root"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      data-testid="mode-preview"
      data-mode={kind}
    >
      <button type="button" className="splash-scrim" aria-label="Stay here" onClick={onCancel} />
      <div className="splash-card splash-in coach-explain-card">
        <header className="splash-head">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[var(--ember)] uppercase">
              Switch mode
            </p>
            <h2 className="truncate text-[17px] font-semibold tracking-tight">
              {copy.title}
            </h2>
          </div>
          <button type="button" className="study-close" onClick={onCancel} aria-label="Stay">
            <X className="size-3.5" />
            Stay
          </button>
        </header>
        <p className="splash-copy">{copy.blurb}</p>
        <div className="coach-explain-line" data-testid="mode-preview-line">
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
                go(startPly);
                setPlaying(true);
                return;
              }
              setPlaying((on) => !on);
            }}
          />
        </div>
        <div className="coach-explain-toggle" role="group" aria-label="Confirm mode">
          <button
            type="button"
            className="explain-mode"
            data-testid="mode-preview-stay"
            onClick={onCancel}
          >
            Stay
          </button>
          <button
            type="button"
            className="explain-mode explain-mode-on"
            data-testid="mode-preview-confirm"
            onClick={onConfirm}
          >
            {copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
