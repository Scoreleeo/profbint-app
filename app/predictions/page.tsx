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

function TeamLogo({ src, alt }: { src?: string; alt: string }) {
  const initials = alt
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-black text-white">
        {initials || "?"}
      </div>
    );
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

function QuickNav() {
  const links = [
    { href: "/", label: "Home" },
    { href: "#best-pick", label: "Best Pick" },
    { href: "#competitions", label: "Competitions" },
    { href: "#predictions-list", label: "Predictions" },
    { href: "#disclaimer", label: "Disclaimer" },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101826] p-4 shadow-xl sm:rounded-3xl">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Jump to
      </div>

      <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-red-400/40 hover:bg-white/10"
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

function findDailyPick(matches: PredictionMatch[]): DailyPick | null {
  const todayMatches = matches.filter((match) => isTodayFixture(match.date));

  if (todayMatches.length === 0) {
    return null;
  }

  const rankedPicks = todayMatches
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
    <main className="min-h-screen w-full max-w-full overflow-x-hidden scroll-smooth bg-[#0b1220] px-3 py-5 text-white sm:px-4 sm:py-6 md:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-5 overflow-x-hidden sm:space-y-6">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#1e293b] p-4 shadow-2xl sm:rounded-3xl sm:p-6">
          <Link
            href="/"
            className="mb-4 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            ← Back to Home
          </Link>

          <div className="mb-3 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300 sm:text-xs">
            Premium insights
          </div>

          <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
            Pro Football Intel — Predictions
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Predictions are locked before kick-off. Choose one match, one
            division, or all predictions for the day.
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
          className="scroll-mt-20 overflow-hidden rounded-2xl border border-white/10 bg-[#101826] p-4 shadow-xl sm:rounded-3xl"
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
              Locked premium
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Prediction type
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              Best outcome options
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Access
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              Paid unlock
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:rounded-3xl sm:p-6">
            <p className="text-slate-300">Loading predictions...</p>
          </div>
        ) : (
          <>
            <section id="predictions-list" className="scroll-mt-20">
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-base font-bold sm:text-xl">
                  Locked Predictions
                </h2>
                <span className="shrink-0 text-sm font-semibold text-red-400">
                  {matches.length} matches
                </span>
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {matches.map((match) => (
                  <LockedPredictionCard key={match.fixtureId} match={match} />
                ))}
              </div>
            </section>

            <div
              id="disclaimer"
              className="scroll-mt-20 rounded-2xl border border-white/10 bg-[#111827] p-4 text-center shadow-xl"
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
      <section
        id="best-pick"
        className="scroll-mt-20 overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 via-[#111827] to-red-400/5 p-4 shadow-xl sm:rounded-3xl sm:p-5"
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
        className="scroll-mt-20 overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 via-[#111827] to-red-400/5 p-4 shadow-xl sm:rounded-3xl sm:p-5"
      >
        <div className="mb-3 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300 sm:text-xs">
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
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 via-[#111827] to-red-400/5 p-4 shadow-xl sm:rounded-3xl sm:p-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300 sm:text-xs">
            Featured match
          </div>

          <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            Best Pick Right Now
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            This is the strongest match selection available right now. It can
            update automatically as fixtures change, kick off or close.
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

            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-red-300">
                Prediction locked
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                Outcome, probability and confidence are hidden until unlocked.
              </div>
            </div>
          </div>
        </div>

        <Link
          href={buildPredictionHref(match)}
          className="inline-flex justify-center rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-400"
        >
          Unlock best pick right now →
        </Link>
      </div>
    </section>
  );
}

function LockedPredictionCard({ match }: { match: PredictionMatch }) {
  const matchStarted = hasMatchStarted(match.date);

  return (
    <Link
      href={buildPredictionHref(match)}
      className="block min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-4 shadow-xl transition hover:border-red-400/40 hover:bg-white/[0.04]"
    >
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

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Prediction
            </div>
            <div className="mt-2 blur-sm text-lg font-black text-white">
              Home Win
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Probability
            </div>
            <div className="mt-2 blur-sm text-lg font-black text-white">
              67%
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {matchStarted ? (
            <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 text-xs font-bold text-yellow-300">
              Prediction closed
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-2 py-1 text-xs font-bold text-red-300">
              Locked prediction
            </span>
          )}

          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300">
            {matchStarted ? "Match started" : "Unlock from £1.99"}
          </span>
        </div>
      </div>
    </Link>
  );
}