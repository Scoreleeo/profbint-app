"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VerifiedResult = "WON" | "LOST" | "PENDING";

type StrongestPickHistoryItem = {
  fixtureId: number;
  league: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  pick: "HOME" | "AWAY";
  selectedTeam: string;
  qualifiedAt: string;
  actualResult: "HOME" | "DRAW" | "AWAY" | null;
  result: VerifiedResult;
};

type StrongestPickHistoryPayload = {
  summary: {
    total: number;
    settled: number;
    wins: number;
    losses: number;
    pending: number;
    accuracy: number;
  };
  history: StrongestPickHistoryItem[];
  error?: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function actualResultLabel(result: StrongestPickHistoryItem["actualResult"]) {
  if (result === "HOME") return "Home win";
  if (result === "AWAY") return "Away win";
  if (result === "DRAW") return "Draw";
  return "Awaiting result";
}

export default function StrongestPicksResultsPage() {
  const [data, setData] = useState<StrongestPickHistoryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/strongest-picks-history", {
          cache: "no-store",
        });

        const payload =
          (await response.json()) as StrongestPickHistoryPayload;

        if (!response.ok) {
          throw new Error(
            payload.error || "Unable to load verified Strongest Picks results.",
          );
        }

        setData(payload);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load verified Strongest Picks results.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadHistory();
  }, []);

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/strongest-picks"
            className="text-sm font-bold text-slate-400 transition hover:text-amber-300"
          >
            ← Today&apos;s Strongest Picks
          </Link>

          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 sm:text-xs">
            Verified results
          </span>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl">
          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <div className="mb-3 inline-flex rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              Pro Football Intel
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Strongest Picks Results
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              A transparent record of Strongest Daily Picks captured before
              kickoff and checked against the final match result.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div className="col-span-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 lg:col-span-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-300/70">
                  Verified accuracy
                </div>
                <div className="mt-1 text-3xl font-black text-amber-300">
                  {loading ? "—" : `${data?.summary.accuracy ?? 0}%`}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  Resulted picks only
                </div>
              </div>

              {[
                ["Total captured", data?.summary.total],
                ["Won", data?.summary.wins],
                ["Lost", data?.summary.losses],
                ["Pending", data?.summary.pending],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {label}
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {loading ? "—" : value ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Verified history
            </div>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              Captured selections
            </h2>
          </div>

          {!loading && data ? (
            <div className="text-sm font-bold text-slate-400">
              {data.summary.settled} of {data.summary.total} settled
            </div>
          ) : null}
        </div>

        {loading ? (
          <section className="mt-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
            Loading verified results...
          </section>
        ) : null}

        {error ? (
          <section className="mt-4 rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
            <div className="font-black text-red-200">
              Verified results unavailable
            </div>
            <p className="mt-2 text-sm text-red-100/80">{error}</p>
          </section>
        ) : null}

        {!loading && !error && data?.history.length === 0 ? (
          <section className="mt-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-lg font-black">No verified history yet</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Pre-match Strongest Picks will appear here as the verified record
              builds.
            </p>
          </section>
        ) : null}

        {!loading && !error && data && data.history.length > 0 ? (
          <section className="mt-4 grid gap-3">
            {data.history.map((item) => {
              const won = item.result === "WON";
              const lost = item.result === "LOST";

              return (
                <article
                  key={item.fixtureId}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-wide text-slate-500">
                      {item.league}
                    </div>
                    <div className="text-xs font-black text-slate-300">
                      {formatDateTime(item.kickoff)}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-lg font-black sm:text-xl">
                          {item.homeTeam}
                          <span className="mx-2 text-slate-600">vs</span>
                          {item.awayTeam}
                        </div>
                        <div className="mt-1 text-xs font-bold text-slate-500">
                          Captured before kickoff ·{" "}
                          {formatDateTime(item.qualifiedAt)}
                        </div>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${
                          won
                            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                            : lost
                              ? "border-red-400/25 bg-red-400/10 text-red-300"
                              : "border-slate-600 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {item.result}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300/70">
                          Strongest pick
                        </div>
                        <div className="mt-1 text-lg font-black text-amber-300">
                          {item.pick === "HOME" ? "HOME WIN" : "AWAY WIN"}
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-300">
                          {item.selectedTeam}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                          Actual result
                        </div>
                        <div className="mt-1 text-lg font-black text-white">
                          {actualResultLabel(item.actualResult)}
                        </div>
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
            Verified record
          </div>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            This history records qualifying Strongest Daily Picks before the
            scheduled kickoff. Results are then matched to the settled fixture
            result, creating a visible record of wins, losses and pending
            selections.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Accuracy is calculated from resulted selections only. Predictions
            are statistical model outputs and are not guarantees of future
            results. Please gamble responsibly.
          </p>
        </section>

        <div className="mt-6 flex justify-center">
          <Link
            href="/strongest-picks"
            className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-sm font-black text-amber-300 transition hover:bg-amber-400/15"
          >
            View Today&apos;s Strongest Picks
          </Link>
        </div>

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
