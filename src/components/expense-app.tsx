"use client";

import { useMemo, useState } from "react";
import { cn } from "cn";
import { AlertTriangle, NotebookPen, Plus, Search, X } from "lucide-react";
import { ListCard } from "@/components/list-card";
import { ListEditor } from "@/components/list-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listTotals, useExpenseLists } from "@/hooks/use-expense-lists";
import { CURRENCIES, displayTitle, formatMoney, parseAmount } from "@/lib/format";
import type { CurrencyCode } from "@/lib/types";

export function ExpenseApp() {
  const store = useExpenseLists();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () => [...store.lists].sort((a, b) => b.updatedAt - a.updatedAt),
    [store.lists],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (l) =>
        displayTitle(l, store.currency).toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q.replace(/^#/, "")) ||
        l.items.some((i) => i.name.toLowerCase().includes(q)),
    );
  }, [sorted, query, store.currency]);

  const selected = store.lists.find((l) => l.id === selectedId) ?? null;

  const grandTotal = useMemo(
    () => store.lists.reduce((sum, l) => sum + listTotals(l, parseAmount).spent, 0),
    [store.lists],
  );

  function handleCreate() {
    const id = store.createList();
    setSelectedId(id);
  }

  const showEditorOnMobile = selected !== null;

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 border-b bg-background/80 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-400 text-amber-950">
            <NotebookPen className="size-4" />
          </span>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold">Pocket Ledger</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Expense notes that add themselves up
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <label className="sr-only" htmlFor="currency">
          Currency
        </label>
        <select
          id="currency"
          value={store.currency}
          onChange={(e) => store.setCurrency(e.target.value as CurrencyCode)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>
        <Button onClick={handleCreate} disabled={store.status === "loading"}>
          <Plus data-icon="inline-start" />
          <span className="hidden sm:inline">New list</span>
          <span className="sm:hidden">New</span>
        </Button>
      </header>

      {store.error && (
        <div className="flex items-start gap-3 border-b border-amber-500/40 bg-amber-950/40 px-4 py-2 text-sm text-amber-100 sm:px-6">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">{store.error}</p>
          <Button variant="ghost" size="xs" onClick={store.resetStorage}>
            Reset data
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={store.dismissError} aria-label="Dismiss">
            <X />
          </Button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "flex min-h-0 w-full flex-col lg:w-[22rem] lg:shrink-0 lg:border-r",
            showEditorOnMobile && "hidden lg:flex",
          )}
        >
          <div className="px-4 pb-2 pt-4 sm:px-6 lg:px-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lists, products, or ID"
                autoComplete="off"
                aria-label="Search lists"
                className="bg-background pl-8"
              />
            </div>
            {store.lists.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {store.lists.length} {store.lists.length === 1 ? "list" : "lists"} · all-time
                spend {formatMoney(grandTotal, store.currency)}
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-6 lg:px-4">
            {store.status === "loading" ? (
              <LoadingGrid />
            ) : store.lists.length === 0 ? (
              <EmptyState onCreate={handleCreate} />
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-10 text-center">
                <p className="text-sm font-medium">No matches for &ldquo;{query}&rdquo;</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different list title or product name.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {filtered.map((list) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    currency={store.currency}
                    selected={list.id === selectedId}
                    compact
                    onSelect={() => setSelectedId(list.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main
          className={cn(
            "min-h-0 min-w-0 flex-1 bg-background",
            !showEditorOnMobile && "hidden lg:block",
          )}
        >
          {selected ? (
            <ListEditor
              key={selected.id}
              list={selected}
              store={store}
              onBack={() => setSelectedId(null)}
              onDeleted={() => setSelectedId(null)}
              onDuplicated={(id) => setSelectedId(id)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="max-w-sm">
                <NotebookPen className="mx-auto size-10 text-muted-foreground/50" />
                <h2 className="mt-3 text-lg font-semibold">Pick a list to start</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose one from the left, or create a new one for this week&apos;s
                  shopping, a trip, or any budget you&apos;re tracking.
                </p>
                <Button className="mt-4" onClick={handleCreate}>
                  <Plus data-icon="inline-start" />
                  New list
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto mt-6 max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-amber-950 text-amber-200">
        <NotebookPen className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Your first expense list</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Each list works like a note: write down the money you received at the top, jot
        products with their MRP and date below, and the total is worked out for you.
      </p>
      <Button className="mt-5" size="lg" onClick={onCreate}>
        <Plus data-icon="inline-start" />
        Create a list
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        Everything is saved on this device, no account needed.
      </p>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1" aria-busy="true" aria-label="Loading lists">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/70" />
      ))}
    </div>
  );
}
