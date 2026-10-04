"use client";

import { cn } from "cn";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, parseAmount } from "@/lib/format";
import type { CurrencyCode, ExpenseItem } from "@/lib/types";

export const inlineInputClass =
  "h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm outline-none transition-colors hover:border-border hover:bg-muted/40 focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground";

type Props = {
  index: number;
  item: ExpenseItem;
  currency: CurrencyCode;
  symbol: string;
  onChange: (patch: Partial<Omit<ExpenseItem, "id">>) => void;
  onRemove: () => void;
};

export function ItemRow({ index, item, currency, symbol, onChange, onRemove }: Props) {
  const amount = parseAmount(item.mrp);

  return (
    <li className="group grid grid-cols-[1.25rem_minmax(0,1fr)_5.5rem_1.75rem] items-center gap-x-1.5 px-1 py-1 hover:bg-muted/30 sm:grid-cols-[1.5rem_minmax(0,1fr)_8.5rem_9.75rem_2rem] sm:gap-x-2 sm:rounded-lg sm:px-2 sm:py-1.5">
      <span className="self-start pt-1.5 text-right text-xs text-muted-foreground tabular-nums sm:self-center sm:pt-0">
        {index + 1}.
      </span>

      <div className="min-w-0">
        <input
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Product name"
          aria-label={`Item ${index + 1} name`}
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

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-1.5 flex items-center text-xs text-muted-foreground sm:left-2 sm:text-sm">
          {symbol}
        </span>
        <input
          value={item.mrp}
          onChange={(e) => onChange({ mrp: e.target.value })}
          inputMode="decimal"
          placeholder="0.00"
          aria-label={`Item ${index + 1} MRP`}
          title={amount ? formatMoney(amount, currency) : undefined}
          className={cn(inlineInputClass, "pl-5 text-right font-medium tabular-nums sm:pl-6 sm:font-normal")}
        />
      </div>

      <input
        type="date"
        value={item.date}
        onChange={(e) => onChange({ date: e.target.value })}
        aria-label={`Item ${index + 1} date`}
        className={cn(inlineInputClass, "hidden text-muted-foreground sm:block")}
      />

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove item ${index + 1}`}
        onClick={onRemove}
        className="text-muted-foreground hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <Trash2 />
      </Button>
    </li>
  );
}
