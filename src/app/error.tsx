"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TabBar } from "@/components/app/tab-bar";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="dash-shell">
      <header className="dash-head">
        <p className="dash-kicker">Opening Edge</p>
        <h1>That line slipped.</h1>
        <p className="dash-sub">Reload the book, or go back to the racks.</p>
      </header>
      <div className="dash-scroll">
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
        <Button asChild variant="ghost" className="mt-3">
          <Link href="/">Back to repertoire</Link>
        </Button>
      </div>
      <TabBar active="home" />
    </div>
  );
}
