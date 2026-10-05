"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function iosDevice(): boolean {
  const ua = window.navigator.userAgent;
  const classic = /iPad|iPhone|iPod/.test(ua);
  const ipadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return classic || ipadOs;
}

function installed(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return standalone || nav.standalone === true;
}

function subscribeStatic(): () => void {
  return () => {};
}

function serverFalse(): boolean {
  return false;
}

export function InstallHint() {
  const ios = useSyncExternalStore(subscribeStatic, iosDevice, serverFalse);
  const onHomeScreen = useSyncExternalStore(subscribeStatic, installed, serverFalse);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  return (
    <section className="set-block" id="install" data-testid="install-hint">
      <h2>Add to Home Screen</h2>
      {onHomeScreen ? (
        <p className="set-help">
          EDGES is on this home screen. iOS keeps the old icon until you remove it and Add to Home Screen again.
        </p>
      ) : (
        <p className="set-help">
          Install from the browser. The app stays online, so a new deploy shows up the next time you open it.
        </p>
      )}
      <p className="install-label">iPhone · Safari</p>
      <ol className="install-steps">
        <li>Open blitzbar.app in Safari.</li>
        <li>Tap Share.</li>
        <li>Tap Add to Home Screen.</li>
      </ol>
      {ios || onHomeScreen ? null : (
        <>
          <p className="install-label">Android · Chrome</p>
          <p className="set-help">
            Use the browser menu and choose Install app, or Add to Home Screen.
          </p>
          {promptEvent ? (
            <button
              type="button"
              className="set-save"
              onClick={() => {
                void promptEvent.prompt().then(() => setPromptEvent(null));
              }}
            >
              Install
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
