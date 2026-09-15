"use client";

import { useEffect } from "react";
import { resumeFocusBed, startFocusBed, stopFocusBed } from "@/lib/audio/focus-player";

export function useFocusBed(systemId: string, musicOn: boolean) {
  useEffect(() => {
    if (!musicOn) {
      stopFocusBed();
      return;
    }
    startFocusBed(systemId);
    return () => {
      stopFocusBed();
    };
  }, [systemId, musicOn]);
}

export function unlockFocusBed() {
  resumeFocusBed();
}
