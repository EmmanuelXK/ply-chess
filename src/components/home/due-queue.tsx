"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProgressStore } from "@/components/home/use-progress-store";
import { getOpening, type Opening } from "@/lib/openings";
import {
  DAILY_QUEUE_CAP,
  currentStreak,
  listDueCards,
  queueMinutes,
  type DueMove,
} from "@/lib/reps/schedule";

const PREVIEW = 6;

export function visibleDue(catalog: Opening[]): DueMove[] {
  return listDueCards().filter((row) => {
    const opening = getOpening(row.openingId);
    return !!opening && catalog.some((item) => item.id === row.openingId) && row.ply < opening.moves.length;
  });
}

export function DueQueue({ openings }: { openings: Opening[] }) {
  const stored = useProgressStore();

  const snapshot = useMemo(() => {
    if (!stored) {
      return { total: 0, preview: [] as DueMove[], session: 0, minutes: 0, streak: 0 };
    }
    const due = visibleDue(openings);
    const session = Math.min(due.length, DAILY_QUEUE_CAP);
    return {
      total: due.length,
      preview: due.slice(0, PREVIEW),
      session,
      minutes: queueMinutes(session),
      streak: currentStreak(),
    };
  }, [openings, stored]);

  return (
    <section className="due-queue" aria-label="Due review" data-testid="due-queue">
      <div className="due-queue-top">
        <h2>Due</h2>
        <p className="due-queue-count">
          {snapshot.total} {snapshot.total === 1 ? "move" : "moves"}
        </p>
      </div>
      {snapshot.streak > 0 ? (
        <p className="due-streak">
          {snapshot.streak}-day streak
        </p>
      ) : null}
      {snapshot.total === 0 ? (
        <p className="due-queue-empty">Nothing due. Learn a line and the moves return.</p>
      ) : (
        <>
          <p className="due-queue-meta">
            Next {snapshot.session} · about {snapshot.minutes} min
          </p>
          <ol className="due-queue-list">
            {snapshot.preview.map((row) => {
              const opening = getOpening(row.openingId);
              const san = opening?.moves[row.ply] ?? "—";
              return (
                <li key={`${row.openingId}:${row.ply}`}>
                  <span className="due-queue-name">{opening?.shortName ?? row.openingId}</span>
                  <span className="due-queue-san">{san}</span>
                </li>
              );
            })}
          </ol>
          {snapshot.total > snapshot.preview.length ? (
            <p className="due-queue-meta">
              {snapshot.total - snapshot.preview.length} more due
            </p>
          ) : null}
          <Link href="/review" className="due-start">
            Start review
          </Link>
        </>
      )}
    </section>
  );
}
