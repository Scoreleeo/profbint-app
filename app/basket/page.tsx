"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BasketItem,
  clearBasket,
  getBasket,
  getBasketTotal,
  removeFromBasket,
} from "@/lib/basket";
import { formatUKDateTime } from "@/lib/utils/date";

export default function BasketPage() {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    setItems(getBasket());
  }, []);

  const total = useMemo(() => {
    return getBasketTotal(items);
  }, [items]);

  function handleRemove(fixtureId: number) {
    const updated = removeFromBasket(fixtureId);
    setItems(updated);
  }

  function handleClear() {
    clearBasket();
    setItems([]);
  }

  return (
    <main className="min-h-screen bg-[#101827] px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/predictions"
          className="mb-6 inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          ← Back to Predictions
        </Link>

        <div className="rounded-3xl border border-white/15 bg-[#172033] p-5 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Basket
              </div>

              <h1 className="text-3xl font-black tracking-tight">
                Match Basket
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Review your selected matches before checkout.
              </p>
            </div>

            {items.length > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
              >
                Clear Basket
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-slate-300">
                Your basket is currently empty.
              </p>

              <Link
                href="/predictions"
                className="mt-4 inline-flex rounded-xl border border-[#f3d98b]/30 bg-[#d6a94f] px-5 py-3 text-sm font-bold text-[#08101c] shadow-md shadow-black/30 transition hover:bg-[#c89635]"
              >
                Browse Predictions
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.fixtureId}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">
                          {item.league}
                        </div>

                        <div className="mt-2 text-lg font-black">
                          {item.home} vs {item.away}
                        </div>

                        <div className="mt-1 text-sm text-slate-400">
                          {formatUKDateTime(item.date)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-lg font-black text-[#d6a94f]">
                          £{item.price.toFixed(2)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.fixtureId)}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#f3d98b]/20 bg-[#d6a94f]/10 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wide text-slate-300">
                    Basket Total
                  </span>

                  <span className="text-3xl font-black text-[#f3d98b]">
                    £{total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-xl border border-[#f3d98b]/30 bg-[#d6a94f] px-5 py-3 text-sm font-black text-[#08101c] shadow-md shadow-black/30 transition hover:bg-[#c89635]"
                >
                  Checkout Coming Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}