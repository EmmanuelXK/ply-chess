"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "@lichess-org/chessground/types";
import { getDuo, squaresInSpeech, type DuoId } from "@/lib/dialogue";
import type { SpeakerId } from "@/lib/tts/types";

export function ChatHeads({
  duoId,
  speaker,
  text,
  fen,
  san,
  orientation,
}: {
  duoId: DuoId;
  speaker: SpeakerId;
  text: string;
  fen?: string;
  san?: string;
  orientation: "white" | "black";
}) {
  const duo = getDuo(duoId);
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);

  const targets = useMemo(
    () => squaresInSpeech(text, { fen, san }).slice(0, 2),
    [text, fen, san],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      const board = root.parentElement?.querySelector(".board-frame") as
        | HTMLElement
        | null;
      const head =
        speaker === duo.right.id ? rightRef.current : leftRef.current;
      if (!board || !head || !targets.length) {
        setPaths([]);
        return;
      }
      const stage = root.getBoundingClientRect();
      const boardBox = board.getBoundingClientRect();
      const headBox = head.getBoundingClientRect();
      const origin = {
        x: headBox.left + headBox.width / 2 - stage.left,
        y: headBox.top + headBox.height / 2 - stage.top,
      };
      const next = targets.map((sq) => {
        const { x, y } = squareCenter(sq, orientation, boardBox, stage);
        const midX = origin.x + (x - origin.x) * 0.5;
        const midY = Math.min(origin.y, y) - 22;
        return `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${x} ${y}`;
      });
      setPaths(next);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);
    const timer = window.setInterval(update, 420);
    return () => {
      ro.disconnect();
      window.clearInterval(timer);
    };
  }, [speaker, duo.right.id, targets, orientation]);

  return (
    <div ref={rootRef} className="chat-heads" aria-hidden>
      <svg className="chat-arrows chat-arrows-draw">
        <defs>
          <marker
            id="chat-arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" className="chat-arrow-mark" />
          </marker>
        </defs>
        {paths.map((d, i) => (
          <path
            key={`${d}-${i}`}
            d={d}
            className={`chat-arrow chat-arrow-${speaker}`}
            markerEnd="url(#chat-arrowhead)"
          />
        ))}
      </svg>
      <div
        ref={leftRef}
        className={`chat-head chat-head-left chat-head-${duo.left.color} ${
          speaker === duo.left.id ? "chat-head-talk" : ""
        }`}
      >
        <CoachFace gender={duo.left.gender} label={duo.left.short} />
      </div>
      <div
        ref={rightRef}
        className={`chat-head chat-head-right chat-head-${duo.right.color} ${
          speaker === duo.right.id ? "chat-head-talk" : ""
        }`}
      >
        <CoachFace gender={duo.right.gender} label={duo.right.short} />
      </div>
    </div>
  );
}

function CoachFace({
  gender,
  label,
}: {
  gender: "male" | "female";
  label: string;
}) {
  if (gender === "female") {
    return (
      <svg viewBox="0 0 64 64" className="chat-face-svg" role="img" aria-label={label}>
        <circle cx="32" cy="32" r="32" fill="#1f1a16" />
        <circle cx="32" cy="36" r="18" fill="#e8b48a" />
        <path
          d="M14 30c2-16 34-18 38 2 1 8-4 12-8 10-6-3-16-2-22 1-6 2-9-4-8-13z"
          fill="#5a3a28"
        />
        <path d="M12 28c8-14 32-16 40 0-6-10-32-12-40 0z" fill="#3d261c" />
        <ellipse cx="25" cy="38" rx="2.2" ry="2.6" fill="#2a1c14" />
        <ellipse cx="39" cy="38" rx="2.2" ry="2.6" fill="#2a1c14" />
        <path d="M28 46c2.2 2 5.8 2 8 0" stroke="#8a4a38" strokeWidth="1.4" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="chat-face-svg" role="img" aria-label={label}>
      <circle cx="32" cy="32" r="32" fill="#161412" />
      <circle cx="32" cy="34" r="17" fill="#c48a5a" />
      <path d="M16 28c3-14 29-14 32 0v6c-4-8-26-8-32 0z" fill="#2b1f18" />
      <path d="M22 48c3 7 17 7 20 0-2 4-16 4-20 0z" fill="#3a2a22" />
      <ellipse cx="25" cy="36" rx="2" ry="2.4" fill="#1a120e" />
      <ellipse cx="39" cy="36" rx="2" ry="2.4" fill="#1a120e" />
      <path d="M24 44c4 4 12 4 16 0" stroke="#5a3a28" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function squareCenter(
  square: Key,
  orientation: "white" | "black",
  board: DOMRect,
  stage: DOMRect,
) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  const x = orientation === "white" ? file : 7 - file;
  const y = orientation === "white" ? 7 - rank : rank;
  return {
    x: board.left - stage.left + ((x + 0.5) * board.width) / 8,
    y: board.top - stage.top + ((y + 0.5) * board.height) / 8,
  };
}
