import type { CurrencyCode } from "./types";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
];

const LOCALE_FOR_CURRENCY: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "";
}

export function formatMoney(amount: number, code: CurrencyCode): string {
  return new Intl.NumberFormat(LOCALE_FOR_CURRENCY[code], {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Parses user-typed money text. Returns 0 for empty or unparseable input. */
export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function toISODate(input: Date | number): string {
  const d = typeof input === "number" ? new Date(input) : input;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** "4 October" style, used for auto-generated list titles. */
export function formatDayMonth(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
  });
}

/** Compact money without trailing ".00" for whole amounts, e.g. ₹500 or ₹35.50. */
export function formatMoneyCompact(amount: number, code: CurrencyCode): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(LOCALE_FOR_CURRENCY[code], {
    style: "currency",
    currency: code,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Title shown when the user has not typed one: "₹500 • 4 October".
 * Falls back to "Expenses • 4 October" when no amount has been entered yet.
 */
export function autoTitle(
  list: { received: string; receivedDate: string; createdAt: number },
  code: CurrencyCode,
): string {
  const amount = parseAmount(list.received);
  const date = formatDayMonth(list.receivedDate || toISODate(list.createdAt));
  return `${amount > 0 ? formatMoneyCompact(amount, code) : "Expenses"} • ${date}`;
}

export function displayTitle(
  list: { title: string; received: string; receivedDate: string; createdAt: number },
  code: CurrencyCode,
): string {
  return list.title.trim() || autoTitle(list, code);
}

export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeUpdated(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
