"use client";

import { useEffect } from "react";

/** Production only. Dev keeps the network path so the engine headers stay obvious. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    let refreshing = false;
    const hadController = !!navigator.serviceWorker.controller;
    const onChange = () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* Install still works from the browser menu if registration fails. */
    });
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);

  return null;
}
