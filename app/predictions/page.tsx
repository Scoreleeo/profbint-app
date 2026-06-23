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

function cleanLogoUrl(value?: string) {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function TeamLogo({ src, alt }: { src?: string; alt: string }) {
  const logoSrc = cleanLogoUrl(src);

  const initials = alt
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!logoSrc) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-black text-slate-800 shadow-[0_6px_14px_rgba(0,0,0,0.28)]">
        {initials || "?"}
      </div>
    );
  }

  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_6px_14px_rgba(0,0,0,0.28)]">
      <Image
        src={logoSrc}
        alt={alt}
        fill
        unoptimized
        sizes="32px"
        className="object-contain p-1.5"
      />
    </div>
  );
}

function QuickNav() {
  const links = [
    { href: "/", label: "Home" },
    { href: "#best-pick", label: "Best Pick" },
    { href: "#competitions", label: "Competitions" },
    { href: "#predictions-list", label: "Predictions" },
    { href: "#disclaimer", label: "Disclaimer" },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/15 bg-[#172033] p-4 shadow-xl sm:rounded-3xl">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Jump to
      </div>

      <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
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

function hasMatchStarted(date: string) {
  if (!date) {
    return false;
  }

  const kickoffTime = new Date(date).getTime();

  if (Number.isNaN(kickoffTime)) {
    return false;
  }

  return Date.now() >= kickoffTime;
}

function isFutureFixture(date: string) {
  if (!date) {
    return false;
  }

  const kickoffTime = new Date(date).getTime();

  if (Number.isNaN(kickoffTime)) {
    return false;
  }

  return Date.now() < kickoffTime;
}

function findDailyPick(matches: PredictionMatch[]): DailyPick | null {
  const rankedPicks = matches
    .filter((match) => isFutureFixture(match.date))
    .filter((match) => !hasMatchStarted(match.date))
    .map((match) => ({
      match,
      option: getStrongestOption(match),
    }))
    .sort((a, b) => b.option.probability - a.option.probability);

  return rankedPicks[0] || null;
}

function buildPredictionHref(match: PredictionMatch) {
  const params = new URLSearchParams();

  params.set("home", match.home);
  params.set("away", match.away);
  params.set("league", match.league);
  params.set("date", match.date);

  if (match.homeLogo) {
    params.set("homeLogo", match.homeLogo);
  }

  if (match.awayLogo) {
    params.set("awayLogo", match.awayLogo);
  }

  params.set("provider", "api-football");

  return `/predictions/${match.fixtureId}?${params.toString()}`;
}

export default function PredictionsPage() {
  const [matches, setMatches] = useState<PredictionMatch[]>([]);
  const [allLeagueMatches, setAllLeagueMatches] = useState<PredictionMatch[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [fetchFinished, setFetchFinished] = useState(false);
  const [dailyPickLoading, setDailyPickLoading] = useState(true);
  const [leagueId, setLeagueId] = useState<number>(TOP_EURO_LEAGUES[0].id);
  const [error, setError] = useState<string | null>(null);

  const selectedLeague =
    TOP_EURO_LEAGUES.find((league) => league.id === leagueId) ||
    TOP_EURO_LEAGUES[0];

  const dailyPick = useMemo(() => {
    return findDailyPick(allLeagueMatches);
  }, [allLeagueMatches]);

  async function loadPredictions(id: number) {
    setLoading(true);
    setFetchFinished(false);
    setError(null);

    try {
      const selectedLeague = TOP_EURO_LEAGUES.find(
        (league) => league.id === Number(id)
      );
      const season = selectedLeague?.season || TOP_EURO_LEAGUES[0].season;

      const res = await fetch(`/api/predictions?league=${id}&season=${season}`);

      if (!res.ok) {
        throw new Error(`Failed to load predictions: ${res.status}`);
      }

      const data = await res.json();

      setMatches(data.matches || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Could not load predictions for this league.");
    } finally {
      setFetchFinished(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPredictions(selectedLeague.id);
  }, [leagueId, selectedLeague.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadDailyPickData() {
      setDailyPickLoading(true);

      try {
        const responses = await Promise.all(
          TOP_EURO_LEAGUES.map((league) =>
            fetch(
              `/api/predictions?league=${league.id}&season=${league.season}`
            ).then((res) => res.json())
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
    <main className="min-h-screen w-full max-w-full overflow-x-hidden scroll-smooth bg-[#101827] px-3 py-5 text-white sm:px-4 sm:py-6 md:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-5 overflow-x-hidden sm:space-y-6">
        <section className="overflow-hidden rounded-2xl border border-white/15 bg-[#172033] p-4 shadow-2xl sm:rounded-3xl sm:p-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="mb-2 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:text-xs">
            Free football predictions
          </div>

          <h1 className="break-words text-xl font-black tracking-tight sm:text-2xl md:text-3xl">
            Pro Football Intel — Predictions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Every prediction is now freely visible. Review the model outcome,
            probabilities, confidence and score ideas before kick-off.
          </p>

          <div className="mt-2 text-sm text-slate-400">
            Showing predictions for{" "}
            <span className="font-semibold text-white">
              {selectedLeague.name}
            </span>
          </div>
        </section>

        <QuickNav />

        <DailyPickSection dailyPick={dailyPick} loading={dailyPickLoading} />

        <section
          id="competitions"
          className="scroll-mt-20 overflow-hidden rounded-2xl border border-white/15 bg-[#172033] p-4 shadow-xl sm:rounded-3xl"
        >
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Select competition
          </div>

          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
            {TOP_EURO_LEAGUES.map((league) => {
              const active = league.id === leagueId;

              return (
                <button
                  key={league.id}
                  type="button"
                  onClick={() => setLeagueId(league.id)}
                  className={[
                    "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "border border-[#f3d98b]/30 bg-[#d6a94f] text-[#08101c]"
                      : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    {league.name}
                    {active && loading ? (
                      <span className="h-3 w-3 animate-spin rounded-full border border-[#08101c]/40 border-t-[#08101c]" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid min-w-0 gap-4 md:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-white/15 bg-[#172033] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Model status
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              Open access
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/15 bg-[#172033] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Prediction type
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              Best outcome options
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/15 bg-[#172033] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Access
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              Free for launch
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-white/15 bg-[#172033] p-5 sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-3 text-slate-300">
              <span className="h-4 w-4 animate-spin rounded-full border border-white/30 border-t-white" />
              <span>Loading predictions...</span>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 sm:rounded-3xl sm:p-6">
            <p className="font-semibold text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => void loadPredictions(selectedLeague.id)}
              className="mt-4 rounded-xl border border-[#f3d98b]/30 bg-[#d6a94f] px-5 py-2.5 text-sm font-bold text-[#08101c] shadow-md shadow-black/30 transition hover:bg-[#c89635]"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!loading && fetchFinished && !error && matches.length === 0 ? (
          <div className="rounded-2xl border border-white/15 bg-[#172033] p-5 text-slate-300 sm:rounded-3xl sm:p-6">
            No predictions available for this league right now.
          </div>
        ) : null}

        {matches.length > 0 ? (
          <>
            <section id="predictions-list" className="scroll-mt-20">
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-base font-bold sm:text-xl">
                  Predictions
                </h2>
                <span className="shrink-0 text-sm font-semibold text-[#d6a94f]">
                  {matches.length} matches
                </span>
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {matches.map((match) => (
                  <PredictionCard key={match.fixtureId} match={match} />
                ))}
              </div>
            </section>

            <div
              id="disclaimer"
              className="scroll-mt-20 rounded-2xl border border-white/15 bg-[#172033] p-4 text-center shadow-xl"
            >
              <p className="text-xs leading-6 text-slate-400">
                Predictions are for informational purposes only and do not
                guarantee outcomes.{" "}
                <Link href="/legal" className="underline hover:text-white">
                  See full disclaimer
                </Link>
              </p>
            </div>
          </>
        ) : null}

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
              href="/privacy"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Terms of Service
            </Link>
            <Link
              href="/refunds"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Refund Policy
            </Link>
            <Link
              href="/responsible-gambling"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Responsible Gambling
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
      <section
        id="best-pick"
        className="scroll-mt-20 overflow-hidden rounded-2xl border border-white/15 bg-[#172033] p-4 shadow-xl sm:rounded-3xl sm:p-5"
      >
        <div className="text-sm font-semibold text-slate-300">
          Loading best pick right now...
        </div>
      </section>
    );
  }

  if (!dailyPick) {
    return (
      <section
        id="best-pick"
        className="scroll-mt-20 overflow-hidden rounded-2xl border border-white/15 bg-[#172033] p-4 shadow-xl sm:rounded-3xl sm:p-5"
      >
        <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 sm:text-xs">
          Featured match
        </div>

        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          Best Pick Right Now
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          No eligible fixtures are available right now. Check back when the next
          suitable fixtures are available.
        </p>
      </section>
    );
  }

  const match = dailyPick.match;

  return (
    <section
      id="best-pick"
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-white/15 bg-[#172033] p-4 shadow-xl sm:rounded-3xl sm:p-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 sm:text-xs">
            Featured match
          </div>

          <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            Best Pick Right Now
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            This is the strongest match selection available right now.
          </p>

          <div className="mt-4 rounded-2xl border border-white/15 bg-black/20 p-4">
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

              <div className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-xs font-semibold uppercase text-slate-300 sm:px-3">
                vs
              </div>

              <div className="flex min-w-0 items-center justify-end gap-2">
                <span className="min-w-0 truncate text-right text-sm font-semibold sm:text-base">
                  {match.away}
                </span>
                <TeamLogo src={match.awayLogo} alt={match.away} />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#f3d98b]/20 bg-[#d6a94f]/10 p-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#f3d98b]">
                Strongest pick
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xl font-black text-white">
                    {dailyPick.option.label}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    Confidence: {match.prediction.confidence}%
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Probability
                  </div>
                  <div className="text-2xl font-black text-white">
                    {dailyPick.option.probability}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={buildPredictionHref(match)}
          className="inline-flex justify-center rounded-xl border border-[#f3d98b]/30 bg-[#d6a94f] px-5 py-3 text-sm font-bold text-[#08101c] shadow-md shadow-black/30 transition hover:bg-[#c89635] sm:min-w-[230px]"
        >
          View full prediction →
        </Link>
      </div>
    </section>
  );
}

function PredictionCard({ match }: { match: PredictionMatch }) {
  const matchStarted = hasMatchStarted(match.date);
  const strongestOption = getStrongestOption(match);
  const href = buildPredictionHref(match);

  return (
    <article className="block min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-[#172033] p-4 shadow-xl transition hover:bg-white/[0.04]">
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

        <div className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-xs font-semibold uppercase text-slate-300 sm:px-3">
          vs
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="min-w-0 truncate text-right text-sm font-semibold sm:text-base">
            {match.away}
          </span>
          <TeamLogo src={match.awayLogo} alt={match.away} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/15 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Prediction
            </div>
            <div className="mt-2 text-lg font-black text-white">
              {strongestOption.label}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Probability
            </div>
            <div className="mt-2 text-lg font-black text-white">
              {strongestOption.probability}%
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Home
            </div>
            <div className="mt-1 text-sm font-black text-white">
              {match.prediction.probabilities.home}%
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Draw
            </div>
            <div className="mt-1 text-sm font-black text-white">
              {match.prediction.probabilities.draw}%
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-2">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Away
            </div>
            <div className="mt-1 text-sm font-black text-white">
              {match.prediction.probabilities.away}%
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {matchStarted ? (
            <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 text-xs font-bold text-yellow-300">
              Match started
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-green-400/20 bg-green-500/10 px-2 py-1 text-xs font-bold text-green-300">
              Prediction open
            </span>
          )}

          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300">
            Confidence {match.prediction.confidence}%
          </span>
        </div>

        {match.prediction.likelyScores.length > 0 ? (
          <div className="mt-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Likely scores
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {match.prediction.likelyScores.slice(0, 3).map((item) => (
                <span
                  key={`${match.fixtureId}-${item.score}`}
                  className="inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-200"
                >
                  {item.score} · {item.probability}%
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <Link
          href={href}
          className="mt-4 inline-flex w-full justify-center rounded-xl border border-[#f3d98b]/30 bg-[#d6a94f] px-4 py-2.5 text-sm font-bold text-[#08101c] shadow-md shadow-black/30 transition hover:bg-[#c89635]"
        >
          View full prediction →
        </Link>
      </div>
    </article>
  );
}