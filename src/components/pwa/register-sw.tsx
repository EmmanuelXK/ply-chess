"use client";

import { useEffect } from "react";

/** Production only. Dev keeps the network path so the engine headers stay obvious. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* Install still works from the browser menu if registration fails. */
    });
  }, []);

  return null;
}
