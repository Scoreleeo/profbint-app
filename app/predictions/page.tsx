"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { TOP_EURO_LEAGUES } from "@/lib/constants";
import { formatUKDateTime } from "@/lib/utils/date";

type PredictionOption = {
  label: string;
  probability: number;
  type: "home" | "draw" | "away";
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
    insights: string[];
  };
};

type DailyPick = {
  match: PredictionMatch;
  option: PredictionOption;
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
  const drawProbability = match.prediction.probabilities.draw;
  const homeProbability = match.prediction.probabilities.home;
  const awayProbability = match.prediction.probabilities.away;
  const homeAwayGap = Math.abs(homeProbability - awayProbability);

  const hasNoScoreDraw = match.prediction.likelyScores.some((item) => {
    return item.score.trim() === "0-0";
  });

  const hasLowScoreDraw = match.prediction.likelyScores.some((item) => {
    const parts = item.score.split("-").map((part) => Number(part.trim()));
    return (
      parts.length === 2 &&
      parts[0] === parts[1] &&
      parts[0] <= 1 &&
      parts[1] <= 1
    );
  });

  const hasHighScoreDraw = match.prediction.likelyScores.some((item) => {
    const parts = item.score.split("-").map((part) => Number(part.trim()));
    return (
      parts.length === 2 &&
      parts[0] === parts[1] &&
      parts[0] >= 2 &&
      parts[1] >= 2
    );
  });

  if (hasNoScoreDraw) {
    return "No Score Draw";
  }

  if (hasHighScoreDraw) {
    return "Score Draw";
  }

  if (hasLowScoreDraw && drawProbability >= 24) {
    return "No Score Draw";
  }

  if (drawProbability >= 26 && homeAwayGap <= 10) {
    return "No Score Draw";
  }

  if (drawProbability >= 30) {
    return "Score Draw";
  }

  return "Score Draw";
}

function getPredictionAccentByType(type: PredictionOption["type"]) {
  if (type === "home") return "text-green-300";
  if (type === "away") return "text-blue-300";
  return "text-yellow-300";
}

function getPredictionBadgeByType(type: PredictionOption["type"]) {
  if (type === "home") {
    return "border-green-400/20 bg-green-500/15 text-green-300";
  }

  if (type === "away") {
    return "border-blue-400/20 bg-blue-500/15 text-blue-300";
  }

  return "border-yellow-400/20 bg-yellow-500/15 text-yellow-300";
}

function getPredictionBorderByType(type: PredictionOption["type"]) {
  if (type === "home") {
    return "border-green-400/20 bg-green-500/10";
  }

  if (type === "away") {
    return "border-blue-400/20 bg-blue-500/10";
  }

  return "border-yellow-400/20 bg-yellow-500/10";
}

function getBestOptions(match: PredictionMatch): PredictionOption[] {
  const drawLabel = getDrawPredictionLabel(match);

  const options: PredictionOption[] = [
    {
      label: "Home Win",
      probability: match.prediction.probabilities.home,
      type: "home",
    },
    {
      label: drawLabel,
      probability: match.prediction.probabilities.draw,
      type: "draw",
    },
    {
      label: "Away Win",
      probability: match.prediction.probabilities.away,
      type: "away",
    },
  ];

  const sortedOptions = options.sort((a, b) => b.probability - a.probability);
  const primary = sortedOptions[0];
  const secondary = sortedOptions[1];

  const shouldShowSecondOption =
    secondary.probability >= 22 ||
    primary.probability - secondary.probability <= 16 ||
    secondary.type === "draw";

  if (shouldShowSecondOption) {
    return [primary, secondary];
  }

  return [primary];
}

function getStrongestOption(match: PredictionMatch): PredictionOption {
  const drawLabel = getDrawPredictionLabel(match);

  const options: PredictionOption[] = [
    {
      label: "Home Win",
      probability: match.prediction.probabilities.home,
      type: "home",
    },
    {
      label: drawLabel,
      probability: match.prediction.probabilities.draw,
      type: "draw",
    },
    {
      label: "Away Win",
      probability: match.prediction.probabilities.away,
      type: "away",
    },
  ];

  return options.sort((a, b) => b.probability - a.probability)[0];
}

function getDailyPickLabel(match: PredictionMatch, option: PredictionOption) {
  if (option.type === "home") {
    return `${match.home} home win`;
  }

  if (option.type === "away") {
    return `${match.away} away win`;
  }

  return option.label;
}

function isTodayFixture(date: string) {
  const fixtureDate = new Date(date);
  const now = new Date();

  return (
    fixtureDate.toLocaleDateString("en-GB", {
      timeZone: "Europe/London",
    }) ===
    now.toLocaleDateString("en-GB", {
      timeZone: "Europe/London",
    })
  );
}

function findDailyPick(matches: PredictionMatch[]): DailyPick | null {
  const todayMatches = matches.filter((match) => isTodayFixture(match.date));

  if (todayMatches.length === 0) {
    return null;
  }

  const rankedPicks = todayMatches
    .map((match) => ({
      match,
      option: getStrongestOption(match),
    }))
    .sort((a, b) => b.option.probability - a.option.probability);

  return rankedPicks[0] || null;
}

function PredictionOptionPills({
  options,
}: {
  options: PredictionOption[];
}) {
  return (
    <div className="mt-1 flex min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap">
      {options.map((option, index) => (
        <div
          key={`${option.label}-${index}`}
          className="flex min-w-0 items-center gap-1"
        >
          <span
            className={`inline-flex shrink min-w-0 max-w-[128px] items-center justify-center truncate rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide sm:max-w-[150px] sm:px-2.5 sm:text-[11px] ${getPredictionBadgeByType(
              option.type
            )}`}
          >
            {option.label}
          </span>

          {index < options.length - 1 ? (
            <span className="shrink-0 text-xs font-black text-slate-500">
              /
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function buildMatchInsights(match: PredictionMatch, options: PredictionOption[]) {
  const homeProbability = match.prediction.probabilities.home;
  const drawProbability = match.prediction.probabilities.draw;
  const awayProbability = match.prediction.probabilities.away;
  const confidence = match.prediction.confidence;
  const primaryOption = options[0];
  const secondaryOption = options[1];

  const generatedInsights: string[] = [];

  if (primaryOption.type === "home") {
    generatedInsights.push(
      `${match.home} are the strongest model option, with a ${homeProbability}% home win chance.`
    );
  }

  if (primaryOption.type === "away") {
    generatedInsights.push(
      `${match.away} are the strongest model option, with a ${awayProbability}% away win chance.`
    );
  }

  if (primaryOption.type === "draw") {
    generatedInsights.push(
      `The draw is the strongest model option, with the draw probability currently at ${drawProbability}%.`
    );
  }

  if (secondaryOption) {
    generatedInsights.push(
      `${secondaryOption.label} is included as the backup angle because it still carries a meaningful ${secondaryOption.probability}% probability.`
    );
  } else {
    generatedInsights.push(
      "No second option is shown because the model sees a clearer gap from the strongest outcome."
    );
  }

  const homeAwayGap = Math.abs(homeProbability - awayProbability);

  if (homeAwayGap <= 8) {
    generatedInsights.push(
      "The home and away win probabilities are close, which makes this a higher-variance fixture."
    );
  } else if (homeAwayGap >= 18) {
    generatedInsights.push(
      "There is a clear gap between the home and away win probabilities, giving the prediction a stronger direction."
    );
  } else {
    generatedInsights.push(
      "The home and away gap is moderate, so the second-best option should still be respected."
    );
  }

  if (drawProbability >= 30) {
    generatedInsights.push(
      "Draw risk is meaningful here, which is why the draw angle is more relevant than guessing an exact score."
    );
  } else if (drawProbability >= 24) {
    generatedInsights.push(
      "Draw risk is present but not dominant, so it works better as a backup option than the main pick."
    );
  } else {
    generatedInsights.push(
      "Draw risk is relatively controlled compared with the win probabilities."
    );
  }

  if (options.some((option) => option.label === "No Score Draw")) {
    generatedInsights.push(
      "No score draw appears when the model sees a tight match with meaningful draw risk and limited separation between both sides."
    );
  }

  if (options.some((option) => option.label === "Score Draw")) {
    generatedInsights.push(
      "Score draw appears when the draw is relevant but the match profile suggests a better chance of both teams contributing."
    );
  }

  if (confidence >= 70) {
    generatedInsights.push(
      "Confidence is high because the model sees enough separation in the strongest option."
    );
  } else if (confidence >= 60) {
    generatedInsights.push(
      "Confidence is medium, meaning the prediction has a lean but the backup option remains useful."
    );
  } else {
    generatedInsights.push(
      "Confidence is low, so this should be treated as a cautious read rather than a strong prediction."
    );
  }

  return [...generatedInsights, ...match.prediction.insights].slice(0, 7);
}

export default function PredictionsPage() {
  const [matches, setMatches] = useState<PredictionMatch[]>([]);
  const [allLeagueMatches, setAllLeagueMatches] = useState<PredictionMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyPickLoading, setDailyPickLoading] = useState(true);
  const [leagueId, setLeagueId] = useState<number>(TOP_EURO_LEAGUES[0].id);

  const selectedLeague =
    TOP_EURO_LEAGUES.find((league) => league.id === leagueId) ||
    TOP_EURO_LEAGUES[0];

  const dailyPick = useMemo(() => {
    return findDailyPick(allLeagueMatches);
  }, [allLeagueMatches]);

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

  useEffect(() => {
    let cancelled = false;

    async function loadDailyPickData() {
      setDailyPickLoading(true);

      try {
        const responses = await Promise.all(
          TOP_EURO_LEAGUES.map((league) =>
            fetch(`/api/predictions?league=${league.id}&season=2025`).then(
              (res) => res.json()
            )
          )
        );

        if (cancelled) {
          return;
        }

        const mergedMatches = responses.flatMap((response) => {
          return response.matches || [];
        });

        setAllLeagueMatches(mergedMatches);
      } catch {
        if (!cancelled) {
          setAllLeagueMatches([]);
        }
      } finally {
        if (!cancelled) {
          setDailyPickLoading(false);
        }
      }
    }

    void loadDailyPickData();

    return () => {
      cancelled = true;
    };
  }, []);

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
            Match predictions focused on the best one or two outcome angles,
            confidence and deeper match insights instead of exact-score
            guessing.
          </p>

          <div className="mt-2 text-sm text-slate-400">
            Showing predictions for{" "}
            <span className="font-semibold text-white">
              {selectedLeague.name}
            </span>
          </div>
        </section>

        <DailyPickSection dailyPick={dailyPick} loading={dailyPickLoading} />

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
              Best 1–2 options
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Access
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              Free daily pick
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

function DailyPickSection({
  dailyPick,
  loading,
}: {
  dailyPick: DailyPick | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 via-[#111827] to-red-400/5 p-4 shadow-xl sm:rounded-3xl sm:p-5">
        <div className="text-sm font-semibold text-slate-300">
          Loading today’s strongest pick across all leagues...
        </div>
      </section>
    );
  }

  if (!dailyPick) {
    return (
      <section className="overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 via-[#111827] to-red-400/5 p-4 shadow-xl sm:rounded-3xl sm:p-5">
        <div className="mb-3 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300 sm:text-xs">
          Free daily prediction
        </div>

        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          Today’s Best Pick
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          No eligible fixtures were found for today across the available leagues.
          Check back when today’s fixtures are available.
        </p>
      </section>
    );
  }

  const match = dailyPick.match;
  const option = dailyPick.option;
  const pickLabel = getDailyPickLabel(match, option);

  return (
    <section className="overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 via-[#111827] to-red-400/5 p-4 shadow-xl sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300 sm:text-xs">
            Free daily prediction
          </div>

          <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            Today’s Best Pick
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            The strongest model probability across all available leagues today.
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex min-w-0 flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                  Strongest pick
                </div>
                <div
                  className={`mt-1 text-lg font-black sm:text-xl ${getPredictionAccentByType(
                    option.type
                  )}`}
                >
                  {pickLabel}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left sm:text-right">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                  Probability
                </div>
                <div className="mt-1 text-2xl font-black text-white">
                  {option.probability}%
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ConfidenceBadge confidence={match.prediction.confidence} />
              <span
                className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getPredictionBadgeByType(
                  option.type
                )}`}
              >
                {option.label}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/match/${match.fixtureId}`}
          className="inline-flex justify-center rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-400"
        >
          View Match →
        </Link>
      </div>
    </section>
  );
}

function PredictionCard({
  match,
}: {
  match: PredictionMatch;
}) {
  const bestOptions = getBestOptions(match);
  const primaryOption = bestOptions[0];
  const predictionBorder = getPredictionBorderByType(primaryOption.type);
  const matchInsights = buildMatchInsights(match, bestOptions);

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
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              Best options
            </div>
            <PredictionOptionPills options={bestOptions} />
          </div>

          <ConfidenceBadge confidence={match.prediction.confidence} />
        </div>

        <div className="grid min-w-0 gap-2 pt-1 sm:grid-cols-2">
          {bestOptions.map((option, index) => (
            <div
              key={`${option.label}-${index}`}
              className="rounded-lg bg-black/20 px-3 py-2"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {index === 0 ? "Primary" : "Backup"}
              </div>
              <div
                className={`mt-1 truncate text-sm font-bold ${getPredictionAccentByType(
                  option.type
                )}`}
              >
                {option.label}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {option.probability}% model probability
              </div>
            </div>
          ))}
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