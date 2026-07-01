"use client";

import { useEffect } from "react";

// Registra o service worker (PWA). O SW e network-first, entao nao prende versao velha.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
