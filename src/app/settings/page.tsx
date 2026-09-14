import { Suspense } from "react";
import { SettingsScreen } from "@/components/settings/settings-screen";

export const metadata = {
  title: "Settings · Opening Edge",
};

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="dash-shell">
          <header className="dash-head">
            <p className="dash-kicker">Opening Edge</p>
            <h1>Settings</h1>
          </header>
        </div>
      }
    >
      <SettingsScreen />
    </Suspense>
  );
}
