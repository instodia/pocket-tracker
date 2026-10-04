"use client";

import { useEffect } from "react";

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
