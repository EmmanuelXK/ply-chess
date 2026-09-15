import { Suspense } from "react";
import { JournalScreen } from "@/components/journal/journal-screen";

export const metadata = {
  title: "Journal · Opening Edge",
};

export default function JournalPage() {
  return (
    <Suspense
      fallback={
        <div className="dash-shell">
          <header className="dash-head">
            <p className="dash-kicker">Opening Edge</p>
            <h1>Journal</h1>
          </header>
        </div>
      }
    >
      <JournalScreen />
    </Suspense>
  );
}
