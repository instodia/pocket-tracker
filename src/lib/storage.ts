import { toISODate } from "./format";
import type { AppState, CurrencyCode, ExpenseItem, ExpenseList } from "./types";

export const STORAGE_KEY = "expense-notes:v1";

export const DEFAULT_STATE: AppState = {
  version: 1,
  lists: [],
  currency: "INR",
};

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const VALID_CURRENCIES: CurrencyCode[] = ["INR", "USD", "EUR", "GBP"];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function sanitizeItem(raw: unknown): ExpenseItem | null {
  if (!isRecord(raw)) return null;
  return {
    id: typeof raw.id === "string" ? raw.id : newId(),
    name: typeof raw.name === "string" ? raw.name : "",
    mrp: typeof raw.mrp === "string" ? raw.mrp : String(raw.mrp ?? ""),
    date: typeof raw.date === "string" ? raw.date : "",
  };
}

function sanitizeList(raw: unknown): ExpenseList | null {
  if (!isRecord(raw)) return null;
  const now = Date.now();
  const items = Array.isArray(raw.items)
    ? raw.items.map(sanitizeItem).filter((i): i is ExpenseItem => i !== null)
    : [];
  return {
    id: typeof raw.id === "string" ? raw.id : newId(),
    title: typeof raw.title === "string" ? raw.title : "",
    received:
      typeof raw.received === "string" ? raw.received : String(raw.received ?? ""),
    receivedDate:
      typeof raw.receivedDate === "string"
        ? raw.receivedDate
        : toISODate(typeof raw.createdAt === "number" ? raw.createdAt : now),
    items,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : now,
  };
}

export type LoadResult =
  | { ok: true; state: AppState }
  | { ok: false; error: string; state: AppState };

export function loadState(): LoadResult {
  if (typeof window === "undefined") return { ok: true, state: DEFAULT_STATE };
  let text: string | null = null;
  try {
    text = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      ok: false,
      error: "Browser storage is unavailable, so lists will not be saved.",
      state: DEFAULT_STATE,
    };
  }
  if (!text) return { ok: true, state: DEFAULT_STATE };
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed)) throw new Error("not an object");
    const lists = Array.isArray(parsed.lists)
      ? parsed.lists.map(sanitizeList).filter((l): l is ExpenseList => l !== null)
      : [];
    const currency = VALID_CURRENCIES.includes(parsed.currency as CurrencyCode)
      ? (parsed.currency as CurrencyCode)
      : "INR";
    return { ok: true, state: { version: 1, lists, currency } };
  } catch {
    return {
      ok: false,
      error: "Saved data could not be read. Starting with an empty workspace.",
      state: DEFAULT_STATE,
    };
  }
}

export function saveState(state: AppState): string | null {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return null;
  } catch {
    return "Could not save changes. Your browser storage may be full or blocked.";
  }
}
