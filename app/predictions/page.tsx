"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TOP_EURO_LEAGUES } from "@/lib/constants";

type ScoreMarket = {
  score: string;
  modelProbability: number;
  bookmaker?: string | null;
  odds?: number | null;
  marketProbability?: number | null;
  edge?: number | null;
  valueLabel: "STRONG_VALUE" | "SMALL_VALUE" | "NO_VALUE" | "NO_ODDS";
};

type PredictionMatch = {
  fixtureId: number;
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  league: string;
  date: string;
  prediction: {
    winner: string;
    outcome: "HOME_WIN" | "DRAW" | "AWAY_WIN";
    confidence: number;
    probabilities: {
      home: number;
      draw: number;
      away: number;
    };
    likelyScores: Array<{
      score: string;
      probability: number;
    }>;
    scoreMarkets?: ScoreMarket[];
    insights: string[];
  };
};

function TeamLogo({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  if (!src) {
    return <div className="h-6 w-6 shrink-0 rounded-full bg-white/10" />;
  }

  return (
    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-white/5">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="24px"
        className="object-contain p-1"
      />
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  let label = "Low";
  let styles = "bg-red-500/15 text-red-300 border-red-400/20";

  if (confidence >= 70) {
    label = "High";
    styles = "bg-green-500/15 text-green-300 border-green-400/20";
  } else if (confidence >= 60) {
    label = "Medium";
    styles = "bg-yellow-500/15 text-yellow-300 border-yellow-400/20";
  }

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${styles}`}
    >
      {label}
    </span>
  );
}

function ProbabilityBar({
  label,
  value,
  barClassName,
}: {
  label: string;
  value: number;
  barClassName: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex min-w-0 justify-between gap-3 text-xs">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full ${barClassName}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function getPredictionLabel(match: PredictionMatch) {
  if (match.prediction.outcome === "HOME_WIN") return "Home Win";
  if (match.prediction.outcome === "AWAY_WIN") return "Away Win";
  return "Draw";
}

function getPredictionAccent(match: PredictionMatch) {
  if (match.prediction.outcome === "HOME_WIN") return "text-green-300";
  if (match.prediction.outcome === "AWAY_WIN") return "text-blue-300";
  return "text-yellow-300";
}

function ValueBadge({
  valueLabel,
  edge,
}: {
  valueLabel: ScoreMarket["valueLabel"];
  edge?: number | null;
}) {
  if (valueLabel === "STRONG_VALUE") {
    return (
      <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-green-300">
        Strong Value {edge !== null && edge !== undefined ? `+${edge}%` : ""}
      </span>
    );
  }

  if (valueLabel === "SMALL_VALUE") {
    return (
      <span className="shrink-0 rounded-full bg-yellow-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-yellow-300">
        Small Value {edge !== null && edge !== undefined ? `+${edge}%` : ""}
      </span>
    );
  }

  if (valueLabel === "NO_ODDS") {
    return (
      <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
        No Odds
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-slate-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">
      No Value
    </span>
  );
}

export default function PredictionsPage() {
  const [matches, setMatches] = useState<PredictionMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagueId, setLeagueId] = useState<number>(TOP_EURO_LEAGUES[0].id);

  const selectedLeague =
    TOP_EURO_LEAGUES.find((league) => league.id === leagueId) ||
    TOP_EURO_LEAGUES[0];

  useEffect(() => {
    setLoading(true);

    fetch(`/api/predictions?league=${leagueId}&season=2025`)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data.matches || []);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(() => {
        setMatches([]);
        setLoading(false);
      });
  }, [leagueId]);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0b1220] px-3 py-5 text-white sm:px-4 sm:py-6 md:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-5 overflow-x-hidden sm:space-y-6">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#1e293b] p-4 shadow-2xl sm:rounded-3xl sm:p-6">
          <div className="mb-3 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300 sm:text-xs">
            Premium insights
          </div>

          <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
            Pro Football Intel — Predictions
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Match outcome predictions with win probabilities, confidence, top 3
            likely scores, and value betting comparisons against the market.
          </p>

          <div className="mt-2 text-sm text-slate-400">
            Showing predictions for{" "}
            <span className="font-semibold text-white">
              {selectedLeague.name}
            </span>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101826] p-4 shadow-xl sm:rounded-3xl">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Select competition
          </div>

          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
            {TOP_EURO_LEAGUES.map((league) => {
              const active = league.id === leagueId;

              return (
                <button
                  key={league.id}
                  onClick={() => setLeagueId(league.id)}
                  className={[
                    "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-[#d90429] text-white shadow-lg"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
                  ].join(" ")}
                >
                  {league.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid min-w-0 gap-4 md:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Model status
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              Value betting mode
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Prediction type
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              Outcome + score value
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Access
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              All unlocked
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:rounded-3xl sm:p-6">
            <p className="text-slate-300">Loading predictions...</p>
          </div>
        ) : (
          <>
            <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {matches.map((match) => (
                <PredictionCard key={match.fixtureId} match={match} />
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-center shadow-xl">
              <p className="text-xs leading-6 text-slate-400">
                Predictions are for informational purposes only and do not
                guarantee outcomes.{" "}
                <Link href="/legal" className="underline hover:text-white">
                  See full disclaimer
                </Link>
              </p>
            </div>
          </>
        )}

        <footer className="mt-10 border-t border-white/10 pt-6 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/predictions"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Predictions
            </Link>
            <Link
              href="/legal"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Legal & Disclaimer
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

function PredictionCard({
  match,
}: {
  match: PredictionMatch;
}) {
  const predictionLabel = getPredictionLabel(match);
  const predictionAccent = getPredictionAccent(match);
  const scoreMarkets = match.prediction.scoreMarkets || [];

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-xl">
      <div className="mb-2 flex min-w-0 flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="min-w-0 truncate">{match.league}</span>
        <span className="shrink-0 text-xs sm:text-sm">
          {new Date(match.date).toLocaleString()}
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo src={match.homeLogo} alt={match.home} />
          <span className="min-w-0 truncate text-sm font-semibold sm:text-base">
            {match.home}
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold uppercase text-slate-300 sm:px-3">
          vs
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="min-w-0 truncate text-right text-sm font-semibold sm:text-base">
            {match.away}
          </span>
          <TeamLogo src={match.awayLogo} alt={match.away} />
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-xl border border-green-400/20 bg-green-500/10 p-3 text-sm">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              Prediction
            </div>
            <div className={`truncate text-lg font-black sm:text-xl ${predictionAccent}`}>
              {predictionLabel}
            </div>
          </div>

          <ConfidenceBadge confidence={match.prediction.confidence} />
        </div>

        <div className="pt-2">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-300">
            Win probabilities
          </div>

          <div className="space-y-2">
            <ProbabilityBar
              label={match.home}
              value={match.prediction.probabilities.home}
              barClassName="bg-green-400"
            />
            <ProbabilityBar
              label="Draw"
              value={match.prediction.probabilities.draw}
              barClassName="bg-yellow-400"
            />
            <ProbabilityBar
              label={match.away}
              value={match.prediction.probabilities.away}
              barClassName="bg-blue-400"
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-300">
            Top 3 likely scores + value
          </div>

          <div className="space-y-2">
            {scoreMarkets.map((item, index) => (
              <div
                key={`${match.fixtureId}-${index}`}
                className="min-w-0 rounded-lg bg-black/20 px-3 py-3"
              >
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="min-w-0 truncate text-lg font-bold text-white">
                    {item.score}
                  </div>
                  <ValueBadge
                    valueLabel={item.valueLabel}
                    edge={item.edge ?? null}
                  />
                </div>

                <div className="mt-2 grid min-w-0 grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="min-w-0">
                    <div className="truncate text-slate-500">
                      Model probability
                    </div>
                    <div>{item.modelProbability}%</div>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-slate-500">
                      Market probability
                    </div>
                    <div>
                      {item.marketProbability !== null &&
                      item.marketProbability !== undefined
                        ? `${item.marketProbability}%`
                        : "—"}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-slate-500">Best odds</div>
                    <div>
                      {item.odds !== null && item.odds !== undefined
                        ? item.odds
                        : "—"}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-slate-500">Bookmaker</div>
                    <div className="truncate">{item.bookmaker || "—"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-300">
            Match insights
          </div>

          <ul className="space-y-2 text-xs text-slate-200">
            {match.prediction.insights.map((insight, index) => (
              <li
                key={index}
                className="break-words rounded-lg bg-black/20 px-3 py-2"
              >
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}