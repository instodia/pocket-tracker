"use client";

import { cn } from "cn";
import { formatMoney } from "@/lib/format";
import type { CurrencyCode } from "@/lib/types";

type Props = {
  spent: number;
  received: number;
  currency: CurrencyCode;
  itemCount: number;
};

export function SummaryBar({ spent, received, currency, itemCount }: Props) {
  const remaining = received - spent;
  const hasReceived = received > 0;
  const over = hasReceived && remaining < 0;

  return (
    <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <Stat label="Received" value={formatMoney(received, currency)} muted={!hasReceived} />
        <Stat
          label={`Total expense · ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          value={formatMoney(spent, currency)}
          emphasis
        />
        <Stat
          label={over ? "Over budget" : "Remaining"}
          value={hasReceived ? formatMoney(Math.abs(remaining), currency) : "—"}
          tone={!hasReceived ? "muted" : over ? "danger" : "good"}
          align="right"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis,
  muted,
  tone,
  align,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  muted?: boolean;
  tone?: "muted" | "danger" | "good";
  align?: "right";
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "truncate tabular-nums",
          emphasis ? "text-lg font-bold sm:text-2xl" : "text-sm font-medium sm:text-lg",
          (muted || tone === "muted") && "text-muted-foreground",
          tone === "danger" && "text-rose-600 dark:text-rose-400",
          tone === "good" && "text-emerald-700 dark:text-emerald-400",
        )}
      >
        {value}
      </p>
    </div>
  );
}
