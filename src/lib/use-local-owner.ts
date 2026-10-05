"use client";

import { useSyncExternalStore } from "react";
import { OWNER_KEY, readLocalOwner, type LocalOwner } from "@/lib/owner";

const OWNER_EVENT = "opening-edge-owner";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(OWNER_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(OWNER_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

let cachedRaw: string | null | undefined;
let cachedOwner: LocalOwner | null = null;

function snapshot(): LocalOwner | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(OWNER_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedOwner;
  cachedRaw = raw;
  cachedOwner = readLocalOwner();
  return cachedOwner;
}

function serverOwner(): LocalOwner | null {
  return null;
}

export function useLocalOwner(): LocalOwner | null {
  return useSyncExternalStore(subscribe, snapshot, serverOwner);
}
