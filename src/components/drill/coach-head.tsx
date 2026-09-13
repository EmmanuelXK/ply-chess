"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { squaresInSpeech } from "@/lib/dialogue";
import type { SpeakerId } from "@/lib/tts/types";

type Park = "board" | "rim";
type Gag = "idle" | "pop" | "shrink" | "tease" | "hint";

const HINTS = ["Psst.", "Look closer.", "Not there.", "Nice try.", "This file."];

export function CoachHead({
  speaker: _speaker,
  text,
  orientation: _orientation,
}: {
  speaker: SpeakerId;
  text: string;
  orientation: "white" | "black";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [park, setPark] = useState<Park>("board");
  const [pos, setPos] = useState({ x: 28, y: 36 });
  const [dragging, setDragging] = useState(false);
  const [wander, setWander] = useState({ x: 0, y: 0 });
  const [gag, setGag] = useState<Gag>("idle");
  const [hint, setHint] = useState<string | null>(null);
  const dragRef = useRef<{
    pointer: number;
    ox: number;
    oy: number;
    px: number;
    py: number;
  } | null>(null);

  const talking = text.trim().length > 0;
  const named = useMemo(() => squaresInSpeech(text)[0], [text]);

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
    if (dragging) return;
    let timer = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const tick = () => {
      const roll = Math.random();
      const next: Gag =
        roll < 0.28 ? "pop" : roll < 0.5 ? "shrink" : roll < 0.74 ? "tease" : "hint";
      setGag(next);
      if (next === "hint") {
        setHint(named ? `Look at ${named}.` : HINTS[Math.floor(Math.random() * HINTS.length)]);
      } else {
        setHint(null);
      }
      timer = window.setTimeout(() => {
        setGag("idle");
        setHint(null);
        timer = window.setTimeout(tick, 2200 + Math.random() * 2800);
      }, 820);
    };

    timer = window.setTimeout(tick, 1600 + Math.random() * 1800);
    return () => window.clearTimeout(timer);
  }, [dragging, named, text]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const root = rootRef.current;
    if (!root) return;
    dragRef.current = {
      pointer: event.pointerId,
      ox: event.clientX,
      oy: event.clientY,
      px: pos.x,
      py: pos.y,
    };
    setDragging(true);
    setGag("idle");
    setHint(null);
    event.currentTarget.setPointerCapture(event.pointerId);
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
      <div
        className={`coach-head-slot coach-gag-${gag} ${
          park === "rim" ? "coach-head-parked" : ""
        } ${talking ? "coach-head-talk" : ""} ${dragging ? "coach-head-drag" : ""}`}
        style={{ left: `${left}%`, top: `${top}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {hint ? <span className="coach-hint-bubble">{hint}</span> : null}
        <div className="coach-head-dilly">
          <div
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
      <circle cx="32" cy="32" r="32" fill="#14110e" />
      <path d="M10 28c6-16 38-16 44 0v6c-7-10-36-10-44 0z" fill="#1c1814" />
      <circle cx="32" cy="36" r="16.5" fill="#c4a07a" />
      <ellipse className="coach-eye" cx="24.6" cy="36.2" rx="2.15" ry="2.45" fill="#1a120e" />
      <ellipse className="coach-eye" cx="39.4" cy="36.2" rx="2.15" ry="2.45" fill="#1a120e" />
      <path d="M25 45.2c3.6 2.4 10.4 2.4 14 0" stroke="#6a4030" strokeWidth="1.6" fill="none" />
      <circle cx="17.5" cy="22.5" r="2.6" fill="#f59e0b" />
      <circle cx="46.5" cy="22.5" r="2.6" fill="#f59e0b" />
    </svg>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
