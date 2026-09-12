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
        const midX = origin.x + (x - origin.x) * 0.55;
        const midY = origin.y + (y - origin.y) * 0.35 - 18;
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
        <span className="chat-face" role="img" aria-label={duo.left.short}>
          {duo.left.gender === "male" ? "👨" : "👩"}
        </span>
      </div>
      <div
        ref={rightRef}
        className={`chat-head chat-head-right chat-head-${duo.right.color} ${
          speaker === duo.right.id ? "chat-head-talk" : ""
        }`}
      >
        <span className="chat-face" role="img" aria-label={duo.right.short}>
          {duo.right.gender === "male" ? "👨" : "👩"}
        </span>
      </div>
    </div>
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
