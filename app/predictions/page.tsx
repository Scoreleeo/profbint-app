"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TOP_EURO_LEAGUES } from "@/lib/constants";

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

function getDrawPredictionLabel(match: PredictionMatch) {
  const firstDrawScore = match.prediction.likelyScores.find((item) => {
    const parts = item.score.split("-").map((part) => Number(part.trim()));
    return parts.length === 2 && parts[0] === parts[1];
  });

  if (firstDrawScore?.score === "0-0") {
    return "No Score Draw";
  }

  return "Score Draw";
}

function getPredictionLabel(match: PredictionMatch) {
  if (match.prediction.outcome === "HOME_WIN") return "Home Win";
  if (match.prediction.outcome === "AWAY_WIN") return "Away Win";
  return getDrawPredictionLabel(match);
}

function getPredictionAccent(match: PredictionMatch) {
  if (match.prediction.outcome === "HOME_WIN") return "text-green-300";
  if (match.prediction.outcome === "AWAY_WIN") return "text-blue-300";
  return "text-yellow-300";
}

function getPredictionBorder(match: PredictionMatch) {
  if (match.prediction.outcome === "HOME_WIN") {
    return "border-green-400/20 bg-green-500/10";
  }

  if (match.prediction.outcome === "AWAY_WIN") {
    return "border-blue-400/20 bg-blue-500/10";
  }

  return "border-yellow-400/20 bg-yellow-500/10";
}

function buildMatchInsights(match: PredictionMatch) {
  const homeProbability = match.prediction.probabilities.home;
  const drawProbability = match.prediction.probabilities.draw;
  const awayProbability = match.prediction.probabilities.away;
  const confidence = match.prediction.confidence;
  const predictionLabel = getPredictionLabel(match);

  const generatedInsights: string[] = [];

  if (match.prediction.outcome === "HOME_WIN") {
    generatedInsights.push(
      `${match.home} are rated as the stronger side, with the model giving them a ${homeProbability}% home win chance.`
    );
  }

  if (match.prediction.outcome === "AWAY_WIN") {
    generatedInsights.push(
      `${match.away} are rated as the stronger side, with the model giving them a ${awayProbability}% away win chance.`
    );
  }

  if (match.prediction.outcome === "DRAW") {
    generatedInsights.push(
      `The model sees this as a draw-leaning match, with the draw probability currently at ${drawProbability}%.`
    );

    if (predictionLabel === "No Score Draw") {
      generatedInsights.push(
        "The draw profile leans low-scoring, so the safest read is a no score draw rather than guessing an exact result."
      );
    } else {
      generatedInsights.push(
        "The draw profile suggests both teams may still have scoring opportunities, so this is marked as a score draw."
      );
    }
  }

  const gap = Math.abs(homeProbability - awayProbability);

  if (gap <= 8) {
    generatedInsights.push(
      "The home and away win probabilities are close, which makes this a higher-variance fixture."
    );
  } else if (gap >= 18) {
    generatedInsights.push(
      "There is a clear probability gap between the two teams, giving the prediction a stronger directional lean."
    );
  } else {
    generatedInsights.push(
      "The probability gap is moderate, so confidence depends more on match context than a heavy favourite."
    );
  }

  if (drawProbability >= 30) {
    generatedInsights.push(
      "Draw risk is meaningful here, so the result should be treated with more caution than a one-sided fixture."
    );
  } else {
    generatedInsights.push(
      "Draw risk is relatively controlled compared with the win probabilities."
    );
  }

  if (confidence >= 70) {
    generatedInsights.push(
      "Confidence is high because the model sees a strong enough probability edge in the selected outcome."
    );
  } else if (confidence >= 60) {
    generatedInsights.push(
      "Confidence is medium, meaning the prediction has a lean but not enough separation to call it a banker."
    );
  } else {
    generatedInsights.push(
      "Confidence is low, so this should be treated as a cautious read rather than a strong prediction."
    );
  }

  return [...generatedInsights, ...match.prediction.insights].slice(0, 7);
}

function formatUKDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return value;
  }
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
            Match predictions focused on outcome direction, draw type, confidence
            and deeper match insights instead of exact-score guessing.
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
              Insight mode
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Prediction type
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              1X2 + draw type
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
  const predictionBorder = getPredictionBorder(match);
  const matchInsights = buildMatchInsights(match);

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-xl">
      <div className="mb-2 flex min-w-0 flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="min-w-0 truncate">{match.league}</span>
        <span className="shrink-0 text-xs sm:text-sm">
          {formatUKDateTime(match.date)}
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

      <div className={`mt-4 space-y-3 rounded-xl border p-3 text-sm ${predictionBorder}`}>
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

        <div className="grid min-w-0 grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg bg-black/20 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Draw type
            </div>
            <div className="mt-1 truncate text-sm font-bold text-white">
              {match.prediction.outcome === "DRAW"
                ? predictionLabel
                : "Not draw-led"}
            </div>
          </div>

          <div className="rounded-lg bg-black/20 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Confidence
            </div>
            <div className="mt-1 text-sm font-bold text-white">
              {match.prediction.confidence}%
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-300">
            Outcome probabilities
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
            Match insights
          </div>

          <ul className="space-y-2 text-xs text-slate-200">
            {matchInsights.map((insight, index) => (
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