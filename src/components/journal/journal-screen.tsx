"use client";

import Link from "next/link";
import { TabBar } from "@/components/app/tab-bar";
import { JournalList } from "@/components/drill/journal-sheet";

export function JournalScreen() {
  return (
    <div className="dash-shell">
      <header className="dash-head">
        <p className="dash-kicker">Opening Edge</p>
        <h1>Journal</h1>
        <p className="dash-sub">Pinned positions. A note for later.</p>
        <p className="dash-mode-blurb">
          From the board, pin the moment. Open a pin to return to that ply.
        </p>
      </header>
      <div className="dash-scroll journal-page">
        <JournalList />
        <p className="journal-foot">
          <Link href="/">Back to weapons</Link>
        </p>
      </div>
      <TabBar active="home" />
    </div>
  );
}
