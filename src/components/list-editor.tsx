"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Trash2, Wallet } from "lucide-react";
import { AddItemRow } from "@/components/add-item-row";
import { ItemRow } from "@/components/item-row";
import { SummaryBar } from "@/components/summary-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listTotals, type ExpenseStore } from "@/hooks/use-expense-lists";
import { currencySymbol, formatDate, formatMoney, parseAmount } from "@/lib/format";
import type { ExpenseList } from "@/lib/types";

type Props = {
  list: ExpenseList;
  store: ExpenseStore;
  onBack: () => void;
  onDeleted: () => void;
  onDuplicated: (id: string) => void;
};

export function ListEditor({ list, store, onBack, onDeleted, onDuplicated }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const symbol = currencySymbol(store.currency);
  const { spent, received } = listTotals(list, parseAmount);

  const dates = list.items.map((i) => i.date).filter(Boolean).sort();
  const dateRange =
    dates.length === 0
      ? null
      : dates[0] === dates[dates.length - 1]
        ? formatDate(dates[0])
        : `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-3 sm:px-6">
          <div className="mb-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              aria-label="Back to all lists"
              className="lg:hidden"
            >
              <ArrowLeft />
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const id = store.duplicateList(list.id);
                if (id) onDuplicated(id);
              }}
            >
              <Copy data-icon="inline-start" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:text-rose-700"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
          </div>

          <input
            value={list.title}
            onChange={(e) => store.setTitle(list.id, e.target.value)}
            placeholder="List title, e.g. October groceries"
            aria-label="List title"
            className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-ring sm:text-3xl"
          />
          <p className="mt-1 px-2 text-xs text-muted-foreground">
            {dateRange ? dateRange : "No expenses yet"} · Created{" "}
            {new Date(list.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          <section className="mt-5 rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-500/30 dark:from-amber-950/40 dark:to-orange-950/20">
            <label htmlFor="received" className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-200">
              <Wallet className="size-4" />
              Received from home
            </label>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-amber-900/70 dark:text-amber-200/70 sm:text-3xl">
                {symbol}
              </span>
              <input
                id="received"
                value={list.received}
                onChange={(e) => store.setReceived(list.id, e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className="w-full min-w-0 bg-transparent text-3xl font-bold tracking-tight text-amber-950 outline-none tabular-nums placeholder:text-amber-900/30 dark:text-amber-50 dark:placeholder:text-amber-200/30 sm:text-4xl"
              />
            </div>
            <p className="mt-1 text-xs text-amber-900/70 dark:text-amber-200/70">
              {received > 0
                ? `${formatMoney(received, store.currency)} available for this list`
                : "Enter the amount you were given, and we'll track what's left."}
            </p>
          </section>

          <section className="mt-6">
            <div className="mb-2 flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Expenses
              </h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {list.items.length} {list.items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {list.items.length > 0 && (
              <div className="hidden grid-cols-[1.5rem_minmax(0,1fr)_8.5rem_9.75rem_2rem] gap-x-2 px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground sm:grid">
                <span />
                <span className="px-2">Product</span>
                <span className="px-2 text-right">MRP</span>
                <span className="px-2">Date</span>
                <span />
              </div>
            )}

            {list.items.length === 0 ? (
              <div className="mb-3 rounded-xl border border-dashed px-4 py-8 text-center">
                <p className="text-sm font-medium">Nothing added yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Type a product name and its MRP below. Today&apos;s date is filled in
                  automatically and you can change it anytime.
                </p>
              </div>
            ) : (
              <ul className="mb-3 divide-y divide-border/60">
                {list.items.map((item, idx) => (
                  <ItemRow
                    key={item.id}
                    index={idx}
                    item={item}
                    currency={store.currency}
                    symbol={symbol}
                    onChange={(patch) => store.updateItem(list.id, item.id, patch)}
                    onRemove={() => store.removeItem(list.id, item.id)}
                  />
                ))}
              </ul>
            )}

            <AddItemRow symbol={symbol} onAdd={(draft) => store.addItem(list.id, draft)} />
          </section>
        </div>
      </div>

      <SummaryBar
        spent={spent}
        received={received}
        currency={store.currency}
        itemCount={list.items.length}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this list?</DialogTitle>
            <DialogDescription>
              &ldquo;{list.title || "Untitled list"}&rdquo; and its {list.items.length}{" "}
              {list.items.length === 1 ? "item" : "items"} will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false);
                store.deleteList(list.id);
                onDeleted();
              }}
            >
              Delete list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
