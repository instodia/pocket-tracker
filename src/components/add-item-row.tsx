"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { todayISO } from "@/lib/format";
import type { ExpenseItem } from "@/lib/types";

type Props = {
  symbol: string;
  onAdd: (draft: Omit<ExpenseItem, "id">) => void;
};

/**
 * Attributes that keep browser/keyboard autofill (saved passwords, cards,
 * addresses) from offering suggestions on these free-text fields.
 */
const noAutofill = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "sentences",
  spellCheck: false,
  "data-lpignore": "true",
  "data-1p-ignore": "true",
  "data-form-type": "other",
} as const;

export function AddItemRow({ symbol, onAdd }: Props) {
  const [name, setName] = useState("");
  const [mrp, setMrp] = useState("");
  const [date, setDate] = useState(todayISO);
  const nameRef = useRef<HTMLInputElement>(null);
  const mrpRef = useRef<HTMLInputElement>(null);

  const canAdd = name.trim().length > 0 || mrp.trim().length > 0;

  function submit() {
    if (!canAdd) return;
    onAdd({ name: name.trim(), mrp: mrp.trim(), date: date || todayISO() });
    setName("");
    setMrp("");
    nameRef.current?.focus();
  }

  function onNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (mrp.trim().length === 0) {
      mrpRef.current?.focus();
    } else {
      submit();
    }
  }

  function onMrpKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div
      role="group"
      aria-label="Add a new expense"
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-dashed border-foreground/20 bg-muted/20 p-2 sm:grid-cols-[minmax(0,1fr)_8.5rem_9.75rem_auto]"
    >
      <Input
        ref={nameRef}
        type="search"
        enterKeyHint="next"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={onNameKeyDown}
        placeholder="Add a product, e.g. Milk"
        aria-label="New item name"
        name="product"
        className="h-9 bg-background"
        {...noAutofill}
      />
      <Button onClick={submit} disabled={!canAdd} className="h-9 sm:order-4" aria-label="Add item">
        <Plus data-icon="inline-start" />
        Add
      </Button>
      <div className="col-span-2 grid grid-cols-2 gap-2 sm:order-2 sm:col-span-1 sm:grid-cols-1">
        <label className="flex h-9 cursor-text items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-sm tabular-nums focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <span className="text-muted-foreground">{symbol}</span>
          <input
            ref={mrpRef}
            type="search"
            enterKeyHint="done"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            onKeyDown={onMrpKeyDown}
            inputMode="decimal"
            placeholder="MRP"
            aria-label="New item MRP"
            name="price"
            className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
            {...noAutofill}
            autoCapitalize="off"
          />
        </label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="New item date"
          name="day"
          autoComplete="off"
          className="h-9 bg-background text-muted-foreground sm:hidden"
        />
      </div>
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="New item date"
        name="day-wide"
        autoComplete="off"
        className="hidden h-9 bg-background text-muted-foreground sm:order-3 sm:block"
      />
    </div>
  );
}
