"use client";

import { cn } from "cn";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, parseAmount } from "@/lib/format";
import type { CurrencyCode, ExpenseItem } from "@/lib/types";

export const inlineInputClass =
  "h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm outline-none transition-colors hover:border-border hover:bg-muted/40 focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground";

type Props = {
  index: number;
  count: number;
  item: ExpenseItem;
  currency: CurrencyCode;
  symbol: string;
  onChange: (patch: Partial<Omit<ExpenseItem, "id">>) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
};

export const itemGridClass =
  "grid-cols-[1.25rem_minmax(0,1fr)_5.5rem_1.25rem_1.75rem] sm:grid-cols-[1.5rem_minmax(0,1fr)_8.5rem_9.75rem_1.5rem_2rem]";

export function ItemRow({ index, count, item, currency, symbol, onChange, onMove, onRemove }: Props) {
  const amount = parseAmount(item.mrp);
  const isFirst = index === 0;
  const isLast = index === count - 1;

  return (
    <li className={cn("group grid items-center gap-x-1.5 px-1 py-1 hover:bg-muted/30 sm:gap-x-2 sm:rounded-lg sm:px-2 sm:py-1.5", itemGridClass)}>
      <span className="self-start pt-1.5 text-right text-xs text-muted-foreground tabular-nums sm:self-center sm:pt-0">
        {index + 1}.
      </span>

      <div className="min-w-0">
        <input
          type="search"
          enterKeyHint="done"
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Product name"
          aria-label={`Item ${index + 1} name`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          name={`product-${item.id}`}
          className={cn(inlineInputClass, "h-7 sm:h-8")}
        />
        <input
          type="date"
          value={item.date}
          onChange={(e) => onChange({ date: e.target.value })}
          aria-label={`Item ${index + 1} date`}
          className="block h-5 w-auto max-w-full appearance-none rounded border border-transparent bg-transparent px-2 text-[11px] leading-none text-muted-foreground outline-none hover:border-border focus-visible:border-ring sm:hidden"
        />
      </div>

      <label
        className={cn(
          inlineInputClass,
          "flex cursor-text items-center justify-end gap-0.5 px-1.5 font-medium tabular-nums sm:font-normal",
        )}
        title={amount ? formatMoney(amount, currency) : undefined}
      >
        <span className="text-muted-foreground">{symbol}</span>
        <input
          type="search"
          enterKeyHint="done"
          value={item.mrp}
          onChange={(e) => onChange({ mrp: e.target.value })}
          inputMode="decimal"
          autoComplete="off"
          name={`price-${item.id}`}
          placeholder="0"
          aria-label={`Item ${index + 1} MRP`}
          size={Math.max(item.mrp.length, 1)}
          className="h-full min-w-0 max-w-full bg-transparent text-left outline-none tabular-nums placeholder:text-muted-foreground"
          style={{ width: `calc(${Math.max(item.mrp.length, 1)}ch + 2px)` }}
        />
      </label>

      <input
        type="date"
        value={item.date}
        onChange={(e) => onChange({ date: e.target.value })}
        aria-label={`Item ${index + 1} date`}
        className={cn(inlineInputClass, "hidden text-muted-foreground sm:block")}
      />

      <div className="flex flex-col items-center" role="group" aria-label={`Reorder item ${index + 1}`}>
        <button
          type="button"
          onClick={() => onMove("up")}
          disabled={isFirst}
          aria-label={`Move item ${index + 1} up`}
          className="flex h-4 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-25"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove("down")}
          disabled={isLast}
          aria-label={`Move item ${index + 1} down`}
          className="flex h-4 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-25"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove item ${index + 1}`}
        onClick={onRemove}
        className="text-muted-foreground hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <Trash2 />
      </Button>
    </li>
  );
}
