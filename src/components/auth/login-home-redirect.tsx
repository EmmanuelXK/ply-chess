"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";

/** Proxy no longer session-checks /login. Bounce home once auth hydrates. */
export function LoginHomeRedirect({ next }: { next: string }) {
  const { ready, user } = useAuth();

  useEffect(() => {
    if (!ready || !user) return;
    window.location.replace(next);
  }, [next, ready, user]);

  return null;
}
