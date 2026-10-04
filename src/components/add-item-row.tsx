"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { todayISO } from "@/lib/format";
import type { ExpenseItem } from "@/lib/types";

type Props = {
  symbol: string;
  onAdd: (draft: Omit<ExpenseItem, "id">) => void;
};

export function AddItemRow({ symbol, onAdd }: Props) {
  const [name, setName] = useState("");
  const [mrp, setMrp] = useState("");
  const [date, setDate] = useState(todayISO);
  const nameRef = useRef<HTMLInputElement>(null);

  const canAdd = name.trim().length > 0 || mrp.trim().length > 0;

  function submit() {
    if (!canAdd) return;
    onAdd({ name: name.trim(), mrp: mrp.trim(), date: date || todayISO() });
    setName("");
    setMrp("");
    nameRef.current?.focus();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-dashed border-foreground/20 bg-muted/20 p-2 sm:grid-cols-[minmax(0,1fr)_8.5rem_9.75rem_auto]"
    >
      <Input
        ref={nameRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a product, e.g. Milk"
        aria-label="New item name"
        className="h-9 bg-background"
        autoComplete="off"
      />
      <Button type="submit" disabled={!canAdd} className="h-9 sm:order-4" aria-label="Add item">
        <Plus data-icon="inline-start" />
        Add
      </Button>
      <div className="col-span-2 grid grid-cols-2 gap-2 sm:order-2 sm:col-span-1 sm:grid-cols-1">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground">
            {symbol}
          </span>
          <Input
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            inputMode="decimal"
            placeholder="MRP"
            aria-label="New item MRP"
            className="h-9 bg-background pl-6 text-right tabular-nums"
            autoComplete="off"
          />
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="New item date"
          className="h-9 bg-background text-muted-foreground sm:hidden"
        />
      </div>
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="New item date"
        className="hidden h-9 bg-background text-muted-foreground sm:order-3 sm:block"
      />
    </form>
  );
}
