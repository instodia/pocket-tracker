"use client";

import { useCallback, useSyncExternalStore } from "react";

const PARAM = "id";
const CHANGE_EVENT = "ledger:urlchange";

function readId(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get(PARAM);
  return raw ? raw.trim().toUpperCase() : null;
}

function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

const getServerSnapshot = () => null;

function writeId(id: string | null, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set(PARAM, id);
  else url.searchParams.delete(PARAM);
  const state = { ledger: mode };
  if (mode === "push") window.history.pushState(state, "", url);
  else window.history.replaceState(state, "", url);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * The selected list ID lives in the URL (`?id=XXXXXXXX`) so lists are
 * linkable and the browser back button returns to the list grid.
 */
export function useUrlListId() {
  const id = useSyncExternalStore(subscribe, readId, getServerSnapshot);

  const select = useCallback((next: string | null, mode: "push" | "replace" = "push") => {
    if (next === readId()) return;
    writeId(next, mode);
  }, []);

  /** Returns to the grid, popping history when we pushed the entry ourselves. */
  const back = useCallback(() => {
    if (window.history.state?.ledger === "push") {
      window.history.back();
    } else {
      writeId(null, "replace");
    }
  }, []);

  return { id, select, back };
}
