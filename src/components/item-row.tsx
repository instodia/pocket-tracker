"use client";

import { cn } from "cn";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, parseAmount } from "@/lib/format";
import type { CurrencyCode, ExpenseItem } from "@/lib/types";

export const inlineInputClass =
  "h-9 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm outline-none transition-colors hover:border-border hover:bg-muted/40 focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground";

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
    <li className="group grid grid-cols-[1.5rem_minmax(0,1fr)_2rem] items-center gap-x-2 gap-y-1.5 rounded-lg px-2 py-2 hover:bg-muted/30 sm:grid-cols-[1.5rem_minmax(0,1fr)_8.5rem_9.75rem_2rem]">
      <span className="text-right text-xs text-muted-foreground tabular-nums sm:row-span-1">
        {index + 1}.
      </span>

      <input
        value={item.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Product name"
        aria-label={`Item ${index + 1} name`}
        className={cn(inlineInputClass, "sm:order-1")}
      />

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove item ${index + 1}`}
        onClick={onRemove}
        className="text-muted-foreground hover:text-rose-600 sm:order-4 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <Trash2 />
      </Button>

      <div className="col-start-2 flex items-center gap-2 sm:order-2 sm:col-start-auto">
        <div className="relative flex-1 sm:w-full">
          <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-sm text-muted-foreground">
            {symbol}
          </span>
          <input
            value={item.mrp}
            onChange={(e) => onChange({ mrp: e.target.value })}
            inputMode="decimal"
            placeholder="0.00"
            aria-label={`Item ${index + 1} MRP`}
            title={amount ? formatMoney(amount, currency) : undefined}
            className={cn(inlineInputClass, "pl-6 text-right tabular-nums")}
          />
        </div>
        <input
          type="date"
          value={item.date}
          onChange={(e) => onChange({ date: e.target.value })}
          aria-label={`Item ${index + 1} date`}
          className={cn(inlineInputClass, "flex-1 text-muted-foreground sm:hidden")}
        />
      </div>

      <input
        type="date"
        value={item.date}
        onChange={(e) => onChange({ date: e.target.value })}
        aria-label={`Item ${index + 1} date`}
        className={cn(inlineInputClass, "hidden text-muted-foreground sm:order-3 sm:block")}
      />
    </li>
  );
}
