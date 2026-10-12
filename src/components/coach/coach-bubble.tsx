"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";

import type { CoachPosition } from "@/lib/coach/prompt";

const DEVICE_KEY = "edges-device";

function deviceId(): string {
  try {
    const existing = window.localStorage.getItem(DEVICE_KEY);
    if (existing && /^[a-zA-Z0-9-]{8,80}$/.test(existing)) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, next);
    return next;
  } catch {
    return "anon-device";
  }
}

export function CoachBubble({ position }: { position: CoachPosition }) {
  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState({ right: 12, bottom: 118 });
  const [connected, setConnected] = useState<boolean | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [lines, setLines] = useState<Array<{ role: "user" | "coach"; text: string }>>([]);
  const drag = useRef<{ x: number; y: number; right: number; bottom: number; moved: boolean } | null>(
    null,
  );
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const device = deviceId();
    let cancelled = false;
    void fetch("/api/coach", { headers: { "x-edges-device": device }, cache: "no-store" })
      .then((response) => response.json())
      .then((body: { connected?: boolean; remaining?: number }) => {
        if (cancelled) return;
        setConnected(body.connected === true);
        if (typeof body.remaining === "number") setRemaining(body.remaining);
      })
      .catch(() => {
        if (!cancelled) setConnected(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      right: spot.right,
      bottom: spot.bottom,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = drag.current;
    const shell = host.current?.offsetParent as HTMLElement | null;
    if (!start || !shell) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (dx * dx + dy * dy > 16) start.moved = true;
    const width = shell.clientWidth;
    const height = shell.clientHeight;
    const size = 44;
    const right = Math.min(Math.max(8, start.right - dx), Math.max(8, width - size - 8));
    const bottom = Math.min(Math.max(8, start.bottom - dy), Math.max(8, height - size - 8));
    setSpot({ right, bottom });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const moved = drag.current?.moved ?? false;
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!moved) setOpen((value) => !value);
  };

  const resting = remaining === 0;
  const disconnected = connected === false;
  const [panelBox, setPanelBox] = useState<{
    left: number;
    width: number;
    maxHeight: number;
    top?: number;
    bottom?: number;
  } | null>(null);

  useEffect(() => {
    if (!open || !host.current) return;
    const place = () => {
      const rect = host.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(280, window.innerWidth - 16);
      let left = rect.right - width;
      if (left < 8) left = 8;
      if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
      if (rect.top > 240) {
        const maxHeight = Math.min(320, rect.top - 16);
        setPanelBox({
          left,
          width,
          maxHeight,
          bottom: window.innerHeight - rect.top + 8,
        });
        return;
      }
      const maxHeight = Math.min(320, window.innerHeight - rect.bottom - 16);
      setPanelBox({ left, width, maxHeight, top: rect.bottom + 8 });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, spot]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const question = draft.trim();
    if (!question || pending || resting || disconnected) return;
    setDraft("");
    setLines((current) => [...current, { role: "user", text: question }]);
    setPending(true);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-edges-device": deviceId(),
        },
        body: JSON.stringify({ ...position, question, deviceId: deviceId() }),
      });
      const body = (await response.json()) as {
        reply?: string;
        error?: string;
        remaining?: number;
        connected?: boolean;
        resting?: boolean;
      };
      if (typeof body.remaining === "number") setRemaining(body.remaining);
      if (body.connected === false) setConnected(false);
      const reply =
        body.reply ||
        body.error ||
        (body.resting ? "Coach is resting, back tomorrow" : "Coach could not answer. Try again.");
      setLines((current) => [...current, { role: "coach", text: reply }]);
    } catch {
      setLines((current) => [
        ...current,
        { role: "coach", text: "Coach could not answer. Try again." },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      ref={host}
      className="coach-bubble"
      style={{ right: spot.right, bottom: spot.bottom }}
      data-testid="coach-bubble"
    >
      {open && panelBox ? (
        <div
          className="coach-panel"
          role="dialog"
          aria-label="Coach"
          data-testid="coach-panel"
          style={{
            position: "fixed",
            left: panelBox.left,
            width: panelBox.width,
            maxHeight: panelBox.maxHeight,
            top: panelBox.top,
            bottom: panelBox.bottom,
          }}
        >
          <header>
            <strong>Coach</strong>
            <span className="coach-left" data-testid="coach-remaining">
              {remaining == null ? "…" : resting ? "0 left" : `${remaining} left`}
            </span>
          </header>
          <div className="coach-log">
            {disconnected ? (
              <p className="coach-note" data-testid="coach-disconnected">
                Coach not connected yet
              </p>
            ) : null}
            {resting ? (
              <p className="coach-note" data-testid="coach-resting">
                Coach is resting, back tomorrow
              </p>
            ) : null}
            {lines.map((line, index) => (
              <p key={`${line.role}-${index}`} className={`coach-line coach-line-${line.role}`}>
                {line.text}
              </p>
            ))}
          </div>
          {disconnected || resting ? null : (
            <form className="coach-form" onSubmit={send}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="why not Bc4?"
                aria-label="Ask the coach"
                maxLength={500}
                enterKeyHint="send"
              />
              <button type="submit" disabled={pending || !draft.trim()}>
                {pending ? "…" : "Ask"}
              </button>
            </form>
          )}
        </div>
      ) : null}
      <button
        type="button"
        className="coach-dot"
        aria-label={open ? "Close coach" : "Open coach"}
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="2.2" fill="currentColor" />
          <circle cx="8" cy="8" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </div>
  );
}
