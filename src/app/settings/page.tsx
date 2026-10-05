import { Suspense } from "react";
import { SettingsScreen } from "@/components/settings/settings-screen";

export const metadata = {
  title: "Settings · EDGES",
};

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="dash-shell">
          <header className="dash-head">
            <p className="dash-kicker">EDGES</p>
            <h1>Settings</h1>
          </header>
        </div>
      }
    >
      <SettingsScreen />
    </Suspense>
  );
}
