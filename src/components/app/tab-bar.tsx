"use client";

import Link from "next/link";
import { Home, Settings } from "lucide-react";

export function TabBar({ active }: { active: "home" | "settings" }) {
  return (
    <nav className="app-tabs" aria-label="App">
      <Link
        href="/"
        className={active === "home" ? "app-tab app-tab-on" : "app-tab"}
        aria-current={active === "home" ? "page" : undefined}
      >
        <Home />
        Home
      </Link>
      <Link
        href="/settings"
        className={active === "settings" ? "app-tab app-tab-on" : "app-tab"}
        aria-current={active === "settings" ? "page" : undefined}
      >
        <Settings />
        Settings
      </Link>
    </nav>
  );
}
