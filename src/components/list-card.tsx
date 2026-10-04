"use client";

import { cn } from "cn";
import { listTotals } from "@/hooks/use-expense-lists";
import { formatMoney, formatRelativeUpdated, parseAmount } from "@/lib/format";
import type { CurrencyCode, ExpenseList } from "@/lib/types";

type Props = {
  list: ExpenseList;
  currency: CurrencyCode;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
};

export function ListCard({ list, currency, selected, compact, onSelect }: Props) {
  const { spent, received, remaining } = listTotals(list, parseAmount);
  const hasReceived = received > 0;
  const over = hasReceived && remaining < 0;
  const ratio = hasReceived ? Math.min(spent / received, 1) : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-xl bg-card p-4 text-left ring-1 ring-foreground/10 transition-all",
        "hover:ring-foreground/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-amber-50 ring-amber-400 dark:bg-amber-950/30 dark:ring-amber-500/60",
        compact && "gap-2 p-3",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={cn(
            "line-clamp-2 font-medium leading-snug",
            compact ? "text-sm" : "text-base",
            !list.title && "text-muted-foreground italic",
          )}
        >
          {list.title || "Untitled list"}
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {list.items.length} {list.items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Spent</p>
          <p className={cn("font-semibold tabular-nums", compact ? "text-base" : "text-lg")}>
            {formatMoney(spent, currency)}
          </p>
        </div>
        {hasReceived && (
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {over ? "Over by" : "Left"}
            </p>
            <p
              className={cn(
                "font-medium tabular-nums",
                compact ? "text-sm" : "text-base",
                over ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {formatMoney(Math.abs(remaining), currency)}
            </p>
          </div>
        )}
      </div>

      {hasReceived && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              over ? "bg-rose-500" : ratio > 0.85 ? "bg-amber-500" : "bg-emerald-500",
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">Edited {formatRelativeUpdated(list.updatedAt)}</p>
    </button>
  );
}
