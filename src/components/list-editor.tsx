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
import { autoTitle, currencySymbol, displayTitle, formatDate, parseAmount } from "@/lib/format";
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
  const generatedTitle = autoTitle(list, store.currency);

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
              className="text-rose-400 hover:text-rose-300"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
          </div>

          <input
            type="search"
            enterKeyHint="done"
            value={list.title}
            onChange={(e) => store.setTitle(list.id, e.target.value)}
            placeholder={generatedTitle}
            aria-label="List title"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight outline-none transition-colors placeholder:text-foreground/70 hover:border-border focus-visible:border-ring sm:text-3xl"
          />
          <p className="mt-1 px-2 text-xs text-muted-foreground">
            {list.title.trim() ? "" : "Auto title · type to rename · "}
            {dateRange ? dateRange : "No expenses yet"}
          </p>

          <section
            className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 to-orange-950/20 px-3 py-2"
            aria-label="Amount received from home"
          >
            <Wallet className="size-4 shrink-0 text-amber-200/80" aria-hidden />
            <label htmlFor="received" className="flex min-w-0 flex-1 cursor-text items-baseline gap-0.5">
              <span className="sr-only">Amount received from home</span>
              <span className="text-xl font-semibold text-amber-200/70">{symbol}</span>
              <input
                id="received"
                type="search"
                enterKeyHint="done"
                name="received-amount"
                value={list.received}
                onChange={(e) => store.setReceived(list.id, e.target.value)}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                className="w-full min-w-0 bg-transparent text-2xl font-bold tracking-tight text-amber-50 outline-none tabular-nums placeholder:text-amber-200/30"
              />
            </label>
            <input
              type="date"
              value={list.receivedDate}
              onChange={(e) => store.setReceivedDate(list.id, e.target.value)}
              aria-label="Date received"
              className="h-8 shrink-0 rounded-md border border-amber-500/30 bg-black/30 px-2 text-xs text-amber-100 outline-none focus-visible:border-amber-400"
            />
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
              &ldquo;{displayTitle(list, store.currency)}&rdquo; and its {list.items.length}{" "}
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
