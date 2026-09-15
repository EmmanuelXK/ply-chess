"use client";

import { useEffect, useState } from "react";
import {
  getFocusBedStatus,
  startFocusBed,
  stopFocusBed,
  subscribeFocusBed,
  unlockFocusBed,
  type FocusBedStatus,
} from "@/lib/audio/focus-player";

export { unlockFocusBed };

export function useFocusBed(systemId: string, musicOn: boolean) {
  useEffect(() => {
    if (!musicOn) {
      stopFocusBed();
      return;
    }
    // Retarget without stopping first — cleanup-stop on systemId change
    // (traps, Strict Mode) tears down a running context before the next
    // gesture and iOS will not restart it.
    startFocusBed(systemId);
  }, [systemId, musicOn]);

  useEffect(() => {
    return () => {
      stopFocusBed();
    };
  }, []);
}

export function useFocusBedStatus(): FocusBedStatus {
  const [status, setStatus] = useState(getFocusBedStatus);
  useEffect(() => subscribeFocusBed(setStatus), []);
  return status;
}
