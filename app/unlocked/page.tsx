"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getBasket, saveBasket } from "@/lib/basket";
import { formatUKDateTime } from "@/lib/utils/date";

const CHECKOUT_VALIDATE_URL = "/api/unlock/validate";

type UnlockItem = {
  fixtureId: string | null;
  matchName: string | null;
  returnUrl: string | null;
  price?: number | null;
};

type UnlockValidationResult = {
  valid: boolean;
  status?: string | null;
  error?: string;
  unlockReference?: string | null;
  items?: UnlockItem[];
};

type PredictionMatch = {
  fixtureId: number;
  home: string;
  away: string;
  league: string;
  date: string;
  prediction?: {
    strongestPick?: string;
    confidence?: string;
    probabilities?: {
      home?: number;
      draw?: number;
      away?: number;
    };
  };
};

function cleanReference(value: string | null) {
  return value?.trim().toUpperCase() || "";
}

function getPurchasedFixtureIds(items: UnlockItem[]) {
  return items
    .map((item) => Number(item.fixtureId))
    .filter((fixtureId) => Number.isFinite(fixtureId));
}

function cleanBasketAfterUnlock(items: UnlockItem[]) {
  const purchasedFixtureIds = getPurchasedFixtureIds(items);

  if (purchasedFixtureIds.length === 0) {
    return;
  }

  const currentBasket = getBasket();

  const cleanedBasket = currentBasket.filter(
    (basketItem) => !purchasedFixtureIds.includes(basketItem.fixtureId),
  );

  saveBasket(cleanedBasket);
}

function splitMatchName(matchName: string | null) {
  if (!matchName) {
    return {
      home: "Purchased Match",
      away: "Prediction",
    };
  }

  const parts = matchName.split(" vs ");

  if (parts.length < 2) {
    return {
      home: matchName,
      away: "Prediction",
    };
  }

  return {
    home: parts[0],
    away: parts.slice(1).join(" vs "),
  };
}

async function validateUnlockReference(
  ref: string,
): Promise<UnlockValidationResult> {
  const response = await fetch(
    `${CHECKOUT_VALIDATE_URL}?ref=${encodeURIComponent(ref)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      valid: false,
      error: "Unable to validate unlock reference.",
    };
  }

  return response.json();
}

async function fetchCurrentPredictions(): Promise<PredictionMatch[]> {
  try {
    const response = await fetch("/api/predictions?dailyPick=true", {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (Array.isArray(data.matches)) {
      return data.matches;
    }

    return [];
  } catch {
    return [];
  }
}

export default function UnlockedPredictionsPage() {
  const [reference, setReference] = useState("");
  const [validation, setValidation] = useState<UnlockValidationResult | null>(
    null,
  );
  const [predictions, setPredictions] = useState<PredictionMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = cleanReference(params.get("ref"));

    setReference(ref);

    async function loadUnlockedPredictions() {
      if (!ref) {
        setValidation({
          valid: false,
          error: "Missing unlock reference.",
        });
        setLoading(false);
        return;
      }

      const unlockValidation = await validateUnlockReference(ref);
      setValidation(unlockValidation);

      if (unlockValidation.valid && Array.isArray(unlockValidation.items)) {
        cleanBasketAfterUnlock(unlockValidation.items);

        const currentPredictions = await fetchCurrentPredictions();
        setPredictions(currentPredictions);
      }

      setLoading(false);
    }

    loadUnlockedPredictions();
  }, []);

  const items = useMemo(() => {
    return validation?.items ?? [];
  }, [validation]);

  const predictionMap = useMemo(() => {
    const map = new Map<number, PredictionMatch>();

    predictions.forEach((prediction) => {
      map.set(prediction.fixtureId, prediction);
    });

    return map;
  }, [predictions]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b1220] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#111827] p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Checking unlock
          </p>
          <h1 className="mt-4 text-3xl font-black">
            Loading your unlocked predictions...
          </h1>
          <p className="mt-3 text-slate-300">
            Please wait while your purchase is verified.
          </p>
        </div>
      </main>
    );
  }

  if (!validation?.valid) {
    return (
      <main className="min-h-screen bg-[#0b1220] px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-300">
            Unlock not valid
          </p>
          <h1 className="mt-4 text-3xl font-black">
            We could not unlock these predictions.
          </h1>
          <p className="mt-3 text-slate-300">
            {validation?.error ||
              "This unlock reference could not be verified."}
          </p>

          {reference ? (
            <p className="mt-5 break-all font-mono text-sm text-slate-400">
              Reference: {reference}
            </p>
          ) : null}

          <Link
            href="/predictions"
            className="mt-8 inline-flex rounded-xl border border-[#f3d98b]/30 bg-[#d6a94f] px-6 py-3 text-sm font-black text-[#08101c] transition hover:bg-[#c89635]"
          >
            Back to Predictions
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1220] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/predictions"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          ← Back to Predictions
        </Link>

        <section className="mt-6 rounded-3xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 via-[#111827] to-emerald-400/5 p-6 shadow-2xl">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
            ✓ Predictions unlocked
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Your unlocked predictions
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            Your payment has been verified. Purchased matches have also been
            removed from your basket on this device.
          </p>

          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-black/20 p-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
              Unlock reference
            </p>
            <p className="mt-2 break-all font-mono text-sm font-black text-emerald-300">
              {validation.unlockReference || reference}
            </p>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-6 text-center">
            <h2 className="text-2xl font-black">No purchased items found</h2>
            <p className="mt-3 text-slate-300">
              The unlock reference is valid, but no basket items were returned.
            </p>
          </section>
        ) : (
          <section className="mt-6 grid gap-5">
            {items.map((item) => {
              const fixtureId = Number(item.fixtureId);
              const prediction = predictionMap.get(fixtureId);
              const fallbackNames = splitMatchName(item.matchName);

              const home = prediction?.home || fallbackNames.home;
              const away = prediction?.away || fallbackNames.away;
              const league = prediction?.league || "Purchased Prediction";
              const date = prediction?.date || "";
              const probabilities = prediction?.prediction?.probabilities;

              return (
                <article
                  key={`${item.fixtureId}-${item.matchName}`}
                  className="rounded-3xl border border-white/10 bg-[#111827] p-5 shadow-xl"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {league}
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-white">
                        {home} vs {away}
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        {date ? formatUKDateTime(date) : "Kick-off details confirmed on prediction page"}
                      </p>

                      {item.fixtureId ? (
                        <p className="mt-2 font-mono text-xs text-slate-500">
                          Fixture ID: {item.fixtureId}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-200">
                      Unlocked
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Prediction
                      </p>
                      <p className="mt-2 text-lg font-black text-white">
                        {prediction?.prediction?.strongestPick ||
                          "Prediction unlocked"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Home / Draw / Away
                      </p>
                      <p className="mt-2 text-lg font-black text-white">
                        {probabilities
                          ? `${probabilities.home ?? "-"}% / ${
                              probabilities.draw ?? "-"
                            }% / ${probabilities.away ?? "-"}%`
                          : "Available via unlocked access"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Confidence
                      </p>
                      <p className="mt-2 text-lg font-black text-white">
                        {prediction?.prediction?.confidence || "Unlocked"}
                      </p>
                    </div>
                  </div>

                  {item.returnUrl ? (
                    <a
                      href={`${item.returnUrl}${
                        item.returnUrl.includes("?") ? "&" : "?"
                      }ref=${encodeURIComponent(reference)}`}
                      className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
                    >
                      Open individual prediction
                    </a>
                  ) : null}
                </article>
              );
            })}
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#111827] p-4 text-xs leading-6 text-slate-400">
          Predictions are for informational purposes only and do not guarantee
          outcomes. Please use the service responsibly.
        </section>
      </div>
    </main>
  );
}