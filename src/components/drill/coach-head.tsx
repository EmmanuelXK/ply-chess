"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Key } from "@lichess-org/chessground/types";
import { squaresInSpeech } from "@/lib/dialogue";
import type { SpeakerId } from "@/lib/tts/types";

type Park = "board" | "rim";

export function CoachHead({
  speaker,
  text,
  orientation,
}: {
  speaker: SpeakerId;
  text: string;
  orientation: "white" | "black";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const [park, setPark] = useState<Park>("board");
  const [pos, setPos] = useState({ x: 28, y: 36 });
  const [dragging, setDragging] = useState(false);
  const [wander, setWander] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointer: number;
    ox: number;
    oy: number;
    px: number;
    py: number;
  } | null>(null);

  const targets = useMemo(() => squaresInSpeech(text).slice(0, 2), [text]);
  const talking = text.trim().length > 0;

  useEffect(() => {
    if (dragging || park === "rim") return;
    const id = window.setInterval(() => {
      setWander({
        x: (Math.random() - 0.5) * 22,
        y: (Math.random() - 0.5) * 18,
      });
    }, 2800 + Math.random() * 1400);
    return () => window.clearInterval(id);
  }, [dragging, park]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      const board = root.parentElement?.querySelector(".board-frame") as
        | HTMLElement
        | null;
      const head = pillRef.current;
      if (!board || !head || !targets.length) return;
      const stage = root.getBoundingClientRect();
      const boardBox = board.getBoundingClientRect();
      const headBox = head.getBoundingClientRect();
      const origin = {
        x: headBox.left + headBox.width / 2 - stage.left,
        y: headBox.top + headBox.height / 2 - stage.top,
      };
      targets.forEach((sq, i) => {
        const node = pathRefs.current[i];
        if (!node) return;
        const { x, y } = squareCenter(sq, orientation, boardBox, stage);
        const midX = origin.x + (x - origin.x) * 0.48;
        const midY = Math.min(origin.y, y) - 18;
        node.setAttribute("d", `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${x} ${y}`);
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);
    let frame = 0;
    const tick = () => {
      update();
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      ro.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [targets, orientation, pos, park, wander]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const root = rootRef.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    dragRef.current = {
      pointer: event.pointerId,
      ox: event.clientX,
      oy: event.clientY,
      px: pos.x,
      py: pos.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    void box;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const root = rootRef.current;
    if (!drag || !root || event.pointerId !== drag.pointer) return;
    const box = root.getBoundingClientRect();
    const dx = ((event.clientX - drag.ox) / box.width) * 100;
    const dy = ((event.clientY - drag.oy) / box.height) * 100;
    setPos({
      x: clamp(drag.px + dx, 2, 88),
      y: clamp(drag.py + dy, 2, 86),
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointer) return;
    dragRef.current = null;
    setDragging(false);
    const root = rootRef.current;
    const board = root?.parentElement?.querySelector(".board-frame") as
      | HTMLElement
      | null;
    if (!board) return;
    const box = board.getBoundingClientRect();
    const off =
      event.clientX < box.left + 10 ||
      event.clientX > box.right - 10 ||
      event.clientY < box.top + 8 ||
      event.clientY > box.bottom - 8;
    if (off) {
      setPark("rim");
      setPos({ x: 78, y: 4 });
      setWander({ x: 0, y: 0 });
    } else {
      setPark("board");
    }
  };

  const left = park === "rim" ? pos.x : pos.x + wander.x * 0.15;
  const top = park === "rim" ? pos.y : pos.y + wander.y * 0.15;

  return (
    <div ref={rootRef} className="coach-head-layer" aria-hidden>
      <svg className="chat-arrows chat-arrows-draw">
        <defs>
          <marker
            id="coach-arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" className="chat-arrow-mark" />
          </marker>
        </defs>
        {targets.map((sq, i) => (
          <path
            key={`${sq}-${i}`}
            ref={(node) => {
              pathRefs.current[i] = node;
            }}
            d=""
            className={`chat-arrow chat-arrow-${speaker} chat-arrow-in`}
            markerEnd="url(#coach-arrowhead)"
          />
        ))}
      </svg>

      <div
        className={`coach-head-slot ${park === "rim" ? "coach-head-parked" : ""} ${
          talking ? "coach-head-talk" : ""
        } ${dragging ? "coach-head-drag" : ""}`}
        style={{ left: `${left}%`, top: `${top}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="coach-head-dilly">
          <div
            ref={pillRef}
            className={`chat-pill chat-pill-amber ${talking ? "chat-pill-talk" : ""}`}
          >
            <span className="chat-ring" />
            <span className="chat-face">
              <BotFace />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BotFace() {
  return (
    <svg viewBox="0 0 64 64" className="chat-face-svg" role="img" aria-label="Coach">
      <circle cx="32" cy="32" r="32" fill="#1c1814" />
      <circle cx="32" cy="34" r="17.5" fill="#d4a574" />
      <path d="M14 26c5-13 31-13 36 0v8c-6-9-29-9-36 0z" fill="#2a211b" />
      <ellipse cx="24.5" cy="36" rx="2.2" ry="2.5" fill="#1a120e" />
      <ellipse cx="39.5" cy="36" rx="2.2" ry="2.5" fill="#1a120e" />
      <path d="M24 45c4.2 3.6 12 3.6 16 0" stroke="#6a4030" strokeWidth="1.8" fill="none" />
      <circle cx="18" cy="22" r="3.2" fill="#fbbf24" />
      <circle cx="46" cy="22" r="3.2" fill="#fbbf24" />
    </svg>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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
