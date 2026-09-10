"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export function PlyNav({
  onBack,
  onForward,
  canBack,
  canForward,
  playing,
  onPlay,
}: {
  onBack: () => void;
  onForward: () => void;
  canBack: boolean;
  canForward: boolean;
  playing?: boolean;
  onPlay?: () => void;
}) {
  return (
    <div className="ply-nav" role="group" aria-label="Step through the line">
      <button
        type="button"
        className="ply-btn"
        onClick={onBack}
        disabled={!canBack}
        aria-label="Backward"
      >
        <ChevronLeft />
        Back
      </button>
      {onPlay ? (
        <button
          type="button"
          className="ply-btn ply-btn-play"
          onClick={onPlay}
          aria-label={playing ? "Pause line" : "Play line"}
          aria-pressed={playing}
        >
          {playing ? <Pause /> : <Play />}
        </button>
      ) : null}
      <button
        type="button"
        className="ply-btn ply-btn-fwd"
        onClick={onForward}
        disabled={!canForward}
        aria-label="Forward"
      >
        Forward
        <ChevronRight />
      </button>
    </div>
  );
}
