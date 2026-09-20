"use client";

import Link from "next/link";
import { OpeningCard } from "@/components/home/opening-card";
import { useJournal } from "@/hooks/use-journal";
import type { Opening } from "@/lib/openings";

export function HomeScreen({ openings }: { openings: Opening[] }) {
  const journal = useJournal();
  const firstDue = journal.due[0];
  const pins = [...journal.snap.pins].reverse().slice(0, 8);

  return (
    <div className="home-shell">
      <header className="home-hero">
        <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-500 uppercase">
          Repertoire · private journal
        </p>
        <h1 className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-zinc-50">
          Opening Trainer
        </h1>
        <p className="mt-3 max-w-[22rem] text-[14px] leading-snug text-zinc-400">
          Learn the book, then train from memory. Spaced reviews live on this
          device — no login.
        </p>
      </header>

      {journal.dueCount > 0 && firstDue ? (
        <Link
          href={`/drill/${firstDue.variationId}?mode=train&queue=due`}
          className="due-banner"
        >
          <span className="due-count">{journal.dueCount}</span>
          <span>
            <strong className="font-semibold text-amber-100">
              {journal.dueCount === 1 ? "line due" : "lines due"}
            </strong>
            <span className="mt-0.5 block text-[12px] text-zinc-400">
              Train first. Fragile lines lead the queue.
            </span>
          </span>
        </Link>
      ) : null}

      <section className="flex flex-col gap-3">
        {openings.map((opening) => (
          <OpeningCard
            key={opening.id}
            opening={opening}
            status={journal.status(opening.id)}
            card={journal.card(opening.id)}
          />
        ))}
      </section>

      {pins.length > 0 ? (
        <section className="journal-pins" aria-label="Memory pins">
          <p className="journal-pins-label">Pins</p>
          <ul>
            {pins.map((pin) => (
              <li key={pin.id}>
                <span className="pin-dot" aria-hidden />
                {pin.label}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="home-foot">
        <p>
          Progress is a private learner journal in this browser. Cloud backup
          is later — never required to study.
        </p>
        <p className="mt-2">
          Add opening #4 in <code>src/lib/openings</code> — same data shape. No
          UI change required.
        </p>
      </footer>
    </div>
  );
}
