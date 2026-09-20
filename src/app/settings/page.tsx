import { Suspense } from "react";
import { SettingsScreen } from "@/components/settings/settings-screen";

export const metadata = {
  title: "Settings · Opening Edge",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="dash-shell" />}>
      <SettingsScreen />
    </Suspense>
  );
}
