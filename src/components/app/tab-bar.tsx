"use client";

import Link from "next/link";
import { BookOpen, Home, Settings } from "lucide-react";

const TABS = [
  { id: "home", href: "/", label: "Home", icon: Home },
  { id: "theory", href: "/theory", label: "Openings", icon: BookOpen },
  { id: "settings", href: "/settings", label: "Settings", icon: Settings },
] as const;

export function TabBar({
  active,
}: {
  active: "home" | "theory" | "settings";
}) {
  return (
    <nav className="app-tabs" aria-label="App">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const on = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={on ? "app-tab app-tab-on" : "app-tab"}
            aria-current={on ? "page" : undefined}
          >
            <Icon />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
