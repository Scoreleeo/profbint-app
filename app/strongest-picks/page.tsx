"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StrongestPick = {
  fixtureId: number;
  date: string;
  league: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  pick: "HOME" | "AWAY";
};

type StrongestPicksPayload = {
  date: string;
  total: number;
  picks: StrongestPick[];
  error?: string;
};

function formatDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatKickoff(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default function StrongestPicksPage() {
  const [data, setData] = useState<StrongestPicksPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPicks() {
      try {
        const response = await fetch("/api/strongest-picks", {
          cache: "no-store",
        });

        const payload = (await response.json()) as StrongestPicksPayload;

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load today's picks.");
        }

        setData(payload);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load today's picks.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPicks();
  }, []);

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-bold text-slate-400 transition hover:text-amber-300"
          >
            ← Pro Football Intel
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/strongest-picks/results"
              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300 transition hover:bg-amber-400/15 sm:text-xs"
            >
              View verified results →
            </Link>

            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 sm:text-xs">
              Model filtered
            </span>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl">
          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <div className="mb-3 inline-flex rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              Pro Football Intel
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Strongest Daily Picks
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              A focused shortlist of home and away selections where our
              independent prediction signals align. No forced picks and no
              draws.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Today&apos;s shortlist
                </div>
                <div className="mt-1 text-2xl font-black text-white">
                  {loading ? "—" : data?.total ?? 0}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Selection type
                </div>
                <div className="mt-1 text-sm font-black text-white">
                  Home / Away
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Filter
                </div>
                <div className="mt-1 text-sm font-black text-emerald-300">
                  3/3 signals aligned
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Matchday selections
            </div>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              {data?.date ? formatDate(data.date) : "Today"}
            </h2>
          </div>

          {!loading && data ? (
            <div className="text-sm font-bold text-slate-400">
              {data.total} {data.total === 1 ? "pick" : "picks"} qualified
            </div>
          ) : null}
        </div>

        {loading ? (
          <section className="mt-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
            Loading today&apos;s strongest picks...
          </section>
        ) : null}

        {error ? (
          <section className="mt-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
            <div className="font-black text-red-200">
              Strongest Picks unavailable
            </div>
            <p className="mt-2 text-sm text-red-100/80">{error}</p>
          </section>
        ) : null}

        {!loading && !error && data?.picks.length === 0 ? (
          <section className="mt-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-lg font-black">No qualifying picks today</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The models have not produced a home or away selection with full
              agreement. We do not add weaker picks just to fill the card.
            </p>
          </section>
        ) : null}

        {!loading && !error && data && data.picks.length > 0 ? (
          <section className="mt-4 grid gap-3 md:grid-cols-2">
            {data.picks.map((pick, index) => {
              const isHome = pick.pick === "HOME";

              return (
                <article
                  key={pick.fixtureId}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                    <div className="min-w-0 truncate text-xs font-black uppercase tracking-wide text-slate-500">
                      {pick.league}
                    </div>
                    <div className="shrink-0 text-xs font-black text-slate-300">
                      {formatKickoff(pick.kickoff)}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                        Pick {index + 1}
                      </span>
                      <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-300">
                        Strong agreement
                      </span>
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                      <div className="min-w-0 text-left">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                          Home
                        </div>
                        <div
                          className={`mt-1 text-base font-black leading-tight sm:text-lg ${
                            isHome ? "text-amber-300" : "text-white"
                          }`}
                        >
                          {pick.homeTeam}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-black text-slate-500">
                        VS
                      </div>

                      <div className="min-w-0 text-right">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                          Away
                        </div>
                        <div
                          className={`mt-1 text-base font-black leading-tight sm:text-lg ${
                            !isHome ? "text-amber-300" : "text-white"
                          }`}
                        >
                          {pick.awayTeam}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300/70">
                        Strongest pick
                      </div>
                      <div className="mt-1 text-xl font-black text-amber-300">
                        {isHome ? "HOME WIN" : "AWAY WIN"}
                      </div>
                      <div className="mt-1 text-xs font-bold text-slate-400">
                        3/3 prediction signals aligned
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            How selections qualify
          </div>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            Strongest Daily Picks only includes home or away outcomes when all
            three prediction signals point in the same direction. A day may
            contain several selections, one selection, or none at all.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Predictions are statistical model outputs and are not guarantees of
            future results. Please gamble responsibly.
          </p>
        </section>

        <footer className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-slate-800 pt-6 text-sm text-slate-500">
          <Link href="/" className="transition hover:text-amber-300">
            Home
          </Link>
          <Link href="/legal" className="transition hover:text-amber-300">
            Legal & Disclaimer
          </Link>
          <Link href="/terms" className="transition hover:text-amber-300">
            Terms
          </Link>
          <Link
            href="/responsible-gambling"
            className="transition hover:text-amber-300"
          >
            Responsible Gambling
          </Link>
        </footer>
      </div>
    </main>
  );
}
