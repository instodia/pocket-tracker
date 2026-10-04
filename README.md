# Pocket Ledger

A personal expense calculator that works like a notes app with a calculator built in.
Each note is an expense list: enter the money you received from home at the top, jot down
products with their MRP and date underneath, and the total (plus what's left) is worked out
for you at the bottom. Create as many lists as you like, one per week, trip, or budget.

## Features

- **Multiple lists**, Keep-style: create, duplicate, search, and delete expense lists.
- **Received from home** amount and the date it was received at the top of every list.
- **Automatic titles**: a list you don't name shows as `₹500 • 4 October` (amount and received date); type a title any time to override it.
- **Product rows** with name, MRP, and date. The date defaults to today and can be changed per item.
- **Pure black UI** that's easy on the eyes and on OLED screens.
- **Live totals** pinned to the bottom: received, total expense, and remaining (or how far over budget you are).
- **Currency switcher** (INR default, plus USD, EUR, GBP) with locale-aware formatting.
- **Saved on-device** in the browser's local storage, synced across open tabs. No account or server required.
- Responsive layout: card grid on mobile, sidebar + editor on desktop.

## Running locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open [http://localhost:4731](http://localhost:4731).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build on port 4731
npm run lint    # eslint
```

## Stack

- [Next.js](https://nextjs.org) (App Router) with TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) primitives (Button, Input, Dialog)
- [lucide-react](https://lucide.dev) icons

## Project layout

```
src/
  app/                  Next.js root layout and page
  components/
    expense-app.tsx     App shell: header, list grid/sidebar, editor pane
    list-card.tsx       Summary card for a list
    list-editor.tsx     Single list: title, received amount, items, delete dialog
    item-row.tsx        Inline-editable product row
    add-item-row.tsx    Form for adding a new product
    summary-bar.tsx     Sticky totals footer
    ui/                 shadcn/ui primitives
  hooks/
    use-expense-lists.ts  localStorage-backed store (useSyncExternalStore)
  lib/
    types.ts            Data model
    storage.ts          Load/save/sanitize persisted state
    format.ts           Currency, date, and parsing helpers
```

## Data

State is stored under the `expense-notes:v1` key in `localStorage`. Clearing site data in
your browser removes all lists. If saved data cannot be read, the app shows a banner with a
**Reset data** option instead of failing.
