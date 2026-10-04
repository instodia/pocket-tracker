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

/** Uppercase letters and digits without look-alikes (no 0/O, 1/I/L). */
const ID_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const LIST_ID_LENGTH = 8;
const LIST_ID_PATTERN = new RegExp(`^[${ID_ALPHABET}]{${LIST_ID_LENGTH}}$`);

export function isListId(value: unknown): value is string {
  return typeof value === "string" && LIST_ID_PATTERN.test(value);
}

/** Generates an 8-character list ID that is not already in `taken`. */
export function newListId(taken: Iterable<string> = []): string {
  const used = new Set(taken);
  const bytes = new Uint8Array(LIST_ID_LENGTH);
  for (;;) {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    let id = "";
    for (const b of bytes) id += ID_ALPHABET[b % ID_ALPHABET.length];
    if (!used.has(id)) return id;
  }
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

function sanitizeList(
  raw: unknown,
  taken: Set<string>,
  onMigrated: () => void,
): ExpenseList | null {
  if (!isRecord(raw)) return null;
  const now = Date.now();
  // Lists created before short IDs existed carry a UUID; give them a code once.
  const existing = isListId(raw.id) && !taken.has(raw.id) ? raw.id : null;
  const id = existing ?? newListId(taken);
  if (existing === null) onMigrated();
  taken.add(id);
  const items = Array.isArray(raw.items)
    ? raw.items.map(sanitizeItem).filter((i): i is ExpenseItem => i !== null)
    : [];
  return {
    id,
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
    const taken = new Set<string>();
    let migrated = false;
    const lists = Array.isArray(parsed.lists)
      ? parsed.lists
          .map((l) => sanitizeList(l, taken, () => (migrated = true)))
          .filter((l): l is ExpenseList => l !== null)
      : [];
    const currency = VALID_CURRENCIES.includes(parsed.currency as CurrencyCode)
      ? (parsed.currency as CurrencyCode)
      : "INR";
    const state: AppState = { version: 1, lists, currency };
    // Persist newly assigned IDs right away so they stay stable across reloads.
    if (migrated) saveState(state);
    return { ok: true, state };
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
