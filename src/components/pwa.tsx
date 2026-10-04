"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/* The install prompt is a browser event, so it is held outside React and
   exposed through useSyncExternalStore. */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onPrompt = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  };
  const onInstalled = () => {
    installed = true;
    deferredPrompt = null;
    emit();
  };
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

const getSnapshot = () => (installed ? "installed" : deferredPrompt ? "available" : "none");
const getServerSnapshot = () => "none" as const;

export function InstallButton() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (state !== "available") return null;

  async function install() {
    const prompt = deferredPrompt;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") installed = true;
    deferredPrompt = null;
    emit();
  }

  return (
    <Button variant="outline" onClick={install} aria-label="Install Pocket Ledger as an app">
      <Download data-icon="inline-start" />
      <span className="hidden sm:inline">Install app</span>
      <span className="sm:hidden">Install</span>
    </Button>
  );
}

/** Registers the service worker in production builds only. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* Offline support is optional; the app works without it. */
    });
  }, []);
  return null;
}
