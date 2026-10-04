export type ExpenseItem = {
  id: string;
  name: string;
  /** Stored as the raw string the user typed so partial input like "12." survives re-renders. */
  mrp: string;
  /** ISO calendar date, YYYY-MM-DD, in the user's local time zone. */
  date: string;
};

export type ExpenseList = {
  id: string;
  title: string;
  /** Amount received from home for this list, raw string (see ExpenseItem.mrp). */
  received: string;
  items: ExpenseItem[];
  createdAt: number;
  updatedAt: number;
};

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

export type AppState = {
  version: 1;
  lists: ExpenseList[];
  currency: CurrencyCode;
};
