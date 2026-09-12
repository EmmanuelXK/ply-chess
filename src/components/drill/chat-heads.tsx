"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import type { Key } from "@lichess-org/chessground/types";
import { getDuo, squaresInSpeech, type DuoId } from "@/lib/dialogue";
import type { SpeakerId } from "@/lib/tts/types";

export function ChatHeads({
  duoId,
  speaker,
  text,
  orientation,
}: {
  duoId: DuoId;
  speaker: SpeakerId;
  text: string;
  orientation: "white" | "black";
}) {
  const duo = getDuo(duoId);
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const [arrowCount, setArrowCount] = useState(0);

  const targets = useMemo(() => squaresInSpeech(text).slice(0, 2), [text]);
  const leftTalk = speaker === duo.left.id;
  const rightTalk = speaker === duo.right.id;
  const leftDrift = useMemo(
    () => driftToward("left", leftTalk, targets, orientation),
    [leftTalk, targets, orientation],
  );
  const rightDrift = useMemo(
    () => driftToward("right", rightTalk, targets, orientation),
    [rightTalk, targets, orientation],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      const board = root.parentElement?.querySelector(".board-frame") as
        | HTMLElement
        | null;
      const head = leftTalk ? leftRef.current : rightRef.current;
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
        const midY = Math.min(origin.y, y) - 20;
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
  }, [leftTalk, targets, orientation, arrowCount]);

  useEffect(() => {
    setArrowCount(targets.length);
  }, [targets.length]);

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
        {targets.map((sq, i) => (
          <path
            key={`${sq}-${i}`}
            ref={(node) => {
              pathRefs.current[i] = node;
            }}
            d=""
            className={`chat-arrow chat-arrow-${speaker} chat-arrow-in`}
            markerEnd="url(#chat-arrowhead)"
          />
        ))}
      </svg>

      <HeadSlot
        slotRef={leftRef}
        side="left"
        talking={leftTalk}
        drift={leftDrift}
        color={duo.left.color}
        gender={duo.left.gender}
        label={duo.left.short}
      />
      <HeadSlot
        slotRef={rightRef}
        side="right"
        talking={rightTalk}
        drift={rightDrift}
        color={duo.right.color}
        gender={duo.right.gender}
        label={duo.right.short}
      />
    </div>
  );
}

function HeadSlot({
  slotRef,
  side,
  talking,
  drift,
  color,
  gender,
  label,
}: {
  slotRef: RefObject<HTMLDivElement | null>;
  side: "left" | "right";
  talking: boolean;
  drift: { x: number; y: number; look: number };
  color: string;
  gender: "male" | "female";
  label: string;
}) {
  return (
    <div
      className={`chat-slot chat-slot-${side} ${talking ? "chat-slot-talk" : ""}`}
      style={
        {
          "--drift-x": `${drift.x}px`,
          "--drift-y": `${drift.y}px`,
          "--look": `${drift.look}deg`,
        } as CSSProperties
      }
    >
      <div className={`chat-bob chat-bob-${side}`}>
        <div
          ref={slotRef}
          className={`chat-pill chat-pill-${color} ${talking ? "chat-pill-talk" : ""}`}
        >
          <span className="chat-ring" />
          <span className="chat-face">
            <CoachFace gender={gender} label={label} />
          </span>
        </div>
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
        <circle cx="32" cy="32" r="32" fill="#241c16" />
        <circle cx="32" cy="37" r="18.5" fill="#e8b48a" />
        <path
          d="M13 32c3-18 36-20 40 1 1 7-5 11-9 9-6-3-16-1-22 2-6 2-10-3-9-12z"
          fill="#6b4330"
        />
        <path d="M11 30c9-16 34-17 43-1-7-11-34-13-43 1z" fill="#4a2e22" />
        <path d="M18 40c-3 6-2 12 2 14" stroke="#6b4330" strokeWidth="5" fill="none" />
        <path d="M46 40c3 6 2 12-2 14" stroke="#6b4330" strokeWidth="5" fill="none" />
        <ellipse cx="25" cy="38" rx="2.1" ry="2.5" fill="#2a1c14" />
        <ellipse cx="39" cy="38" rx="2.1" ry="2.5" fill="#2a1c14" />
        <path d="M28 46.5c2.4 2.1 6 2.1 8.2 0" stroke="#8a4a38" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="chat-face-svg" role="img" aria-label={label}>
      <circle cx="32" cy="32" r="32" fill="#1a1612" />
      <circle cx="32" cy="34" r="17" fill="#c48a5a" />
      <path d="M15 27c4-14 30-14 34 0v7c-5-9-27-9-34 0z" fill="#2b1f18" />
      <path d="M21 47c3.4 7.2 18.6 7.2 22 0-2.2 4.4-17.4 4.4-22 0z" fill="#3a2a22" />
      <ellipse cx="25" cy="36" rx="2" ry="2.3" fill="#1a120e" />
      <ellipse cx="39" cy="36" rx="2" ry="2.3" fill="#1a120e" />
      <path d="M24 43.5c4 4.2 12 4.2 16 0" stroke="#5a3a28" strokeWidth="1.7" fill="none" />
    </svg>
  );
}

function driftToward(
  side: "left" | "right",
  talking: boolean,
  squares: Key[],
  orientation: "white" | "black",
) {
  let x = side === "left" ? -4 : 6;
  let y = side === "left" ? 3 : -2;
  let look = side === "left" ? -1.2 : 1.2;

  if (talking) {
    y = -16;
    const sq = squares[0];
    if (sq) {
      const file = sq.charCodeAt(0) - 97;
      const rank = Number(sq[1]) - 1;
      const fx = orientation === "white" ? file : 7 - file;
      const fy = orientation === "white" ? rank : 7 - rank;
      x = clamp((fx - 3.5) * 7.2, -26, 26);
      y += clamp((3.2 - fy) * 4, -10, 10);
      look = clamp((fx - 3.5) * 1.1, -6, 6);
    } else {
      x = side === "left" ? -8 : 10;
      look = side === "left" ? -2.4 : 2.4;
    }
  }

  return {
    x: clamp(x, -28, 28),
    y: clamp(y, -22, 12),
    look: clamp(look, -7, 7),
  };
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
