import Link from "next/link";
import { TabBar } from "@/components/app/tab-bar";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="dash-shell">
      <header className="dash-head">
        <p className="dash-kicker">Missed</p>
        <h1>That line isn&apos;t in the book.</h1>
        <p className="dash-sub">
          Phase 1 is twenty-six attacking systems. Pick one from the home list —
          Alapin, English, Caro, the Exchange package, and Slav are all in there.
        </p>
      </header>
      <div className="dash-scroll">
        <Button asChild>
          <Link href="/">Back to repertoire</Link>
        </Button>
      </div>
      <TabBar active="home" />
    </div>
  );
}
