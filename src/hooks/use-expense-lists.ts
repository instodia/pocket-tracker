"use client";

import { useCallback, useSyncExternalStore } from "react";
import { todayISO } from "@/lib/format";
import { DEFAULT_STATE, STORAGE_KEY, loadState, newId, saveState } from "@/lib/storage";
import type { AppState, CurrencyCode, ExpenseItem, ExpenseList } from "@/lib/types";

type Snapshot = {
  status: "loading" | "ready";
  state: AppState;
  error: string | null;
};

const SERVER_SNAPSHOT: Snapshot = { status: "loading", state: DEFAULT_STATE, error: null };

let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): Snapshot {
  const result = loadState();
  return { status: "ready", state: result.state, error: result.ok ? null : result.error };
}

function getSnapshot(): Snapshot {
  if (!snapshot) snapshot = readFromStorage();
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return;
    snapshot = readFromStorage();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(updater: (s: AppState) => AppState) {
  const current = getSnapshot();
  const next = updater(current.state);
  if (next === current.state) return;
  const saveError = saveState(next);
  snapshot = { status: "ready", state: next, error: saveError ?? current.error };
  emit();
}

function setError(error: string | null) {
  const current = getSnapshot();
  snapshot = { ...current, error };
  emit();
}

function touch(list: ExpenseList): ExpenseList {
  return { ...list, updatedAt: Date.now() };
}

function updateListIn(state: AppState, id: string, patch: (l: ExpenseList) => ExpenseList): AppState {
  return { ...state, lists: state.lists.map((l) => (l.id === id ? touch(patch(l)) : l)) };
}

export function useExpenseLists() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const createList = useCallback((): string => {
    const now = Date.now();
    const list: ExpenseList = {
      id: newId(),
      title: "",
      received: "",
      receivedDate: todayISO(),
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    commit((s) => ({ ...s, lists: [list, ...s.lists] }));
    return list.id;
  }, []);

  const deleteList = useCallback((id: string) => {
    commit((s) => ({ ...s, lists: s.lists.filter((l) => l.id !== id) }));
  }, []);

  const duplicateList = useCallback((id: string): string | null => {
    const source = getSnapshot().state.lists.find((l) => l.id === id);
    if (!source) return null;
    const now = Date.now();
    const copy: ExpenseList = {
      ...source,
      id: newId(),
      title: source.title ? `${source.title} (copy)` : "",
      items: source.items.map((i) => ({ ...i, id: newId() })),
      createdAt: now,
      updatedAt: now,
    };
    commit((s) => ({ ...s, lists: [copy, ...s.lists] }));
    return copy.id;
  }, []);

  const setTitle = useCallback((id: string, title: string) => {
    commit((s) => updateListIn(s, id, (l) => ({ ...l, title })));
  }, []);

  const setReceived = useCallback((id: string, received: string) => {
    commit((s) => updateListIn(s, id, (l) => ({ ...l, received })));
  }, []);

  const setReceivedDate = useCallback((id: string, receivedDate: string) => {
    commit((s) => updateListIn(s, id, (l) => ({ ...l, receivedDate })));
  }, []);

  const addItem = useCallback((id: string, draft: Omit<ExpenseItem, "id">) => {
    const item: ExpenseItem = { id: newId(), ...draft, date: draft.date || todayISO() };
    commit((s) => updateListIn(s, id, (l) => ({ ...l, items: [...l.items, item] })));
  }, []);

  const updateItem = useCallback(
    (id: string, itemId: string, patch: Partial<Omit<ExpenseItem, "id">>) => {
      commit((s) =>
        updateListIn(s, id, (l) => ({
          ...l,
          items: l.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
        })),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string, itemId: string) => {
    commit((s) =>
      updateListIn(s, id, (l) => ({ ...l, items: l.items.filter((i) => i.id !== itemId) })),
    );
  }, []);

  const setCurrency = useCallback((currency: CurrencyCode) => {
    commit((s) => ({ ...s, currency }));
  }, []);

  const resetStorage = useCallback(() => {
    commit(() => DEFAULT_STATE);
    setError(null);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return {
    lists: snap.state.lists,
    currency: snap.state.currency,
    status: snap.status,
    error: snap.error,
    createList,
    deleteList,
    duplicateList,
    setTitle,
    setReceived,
    setReceivedDate,
    addItem,
    updateItem,
    removeItem,
    setCurrency,
    resetStorage,
    dismissError,
  };
}

export type ExpenseStore = ReturnType<typeof useExpenseLists>;

export function listTotals(list: ExpenseList, parse: (raw: string) => number) {
  const spent = list.items.reduce((sum, i) => sum + parse(i.mrp), 0);
  const received = parse(list.received);
  return { spent, received, remaining: received - spent };
}
