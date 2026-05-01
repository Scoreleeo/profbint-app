"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { TOP_EURO_LEAGUES } from "@/lib/constants";
import { formatUKDateTime } from "@/lib/utils/date";

type MatchRow = {
  fixtureId: number;
  date: string;
  status: string;
  elapsed?: number | null;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  goals: {
    home: number | null;
    away: number | null;
  };
};

type StandingRow = {
  rank: number;
  teamId: number;
  team: string;
  logo?: string;
  played: number;
  goalDiff: number;
  points: number;
  form: string;
};

type NewsItem = {
  id: string;
  title: string;
  summary?: string;
  source?: string;
  date?: string;
  link?: string;
  kind?: "breaking" | "injury" | "transfer" | "news" | string;
};

type DailyPick = {
  fixtureId: number;
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  league: string;
  date: string;
  label: string;
  shortLabel: string;
  type: "home" | "draw" | "away";
  probability: number;
  confidence: number;
};

type DashboardPayload = {
  standings: StandingRow[];
  fixtures: MatchRow[];
  results: MatchRow[];
  live: MatchRow[];
  news?: NewsItem[];
  dailyPick?: DailyPick | null;
};

const SEASON = 2025;

function TeamLogo({
  src,
  alt,
  size = 24,
}: {
  src?: string;
  alt: string;
  size?: number;
}) {
  const boxSize = size + 6;
  const [imgError, setImgError] = useState(false);

  // Create initials fallback (e.g. "Man Utd" -> "MU")
  const initials = alt
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || imgError) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white"
        style={{ width: boxSize, height: boxSize }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-white/5"
      style={{ width: boxSize, height: boxSize }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${boxSize}px`}
        className="object-contain p-1"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function FormPills({ form }: { form?: string }) {
  if (!form) {
    return null;
  }

  return (
    <div className="mt-1 flex min-w-0 items-center gap-1">
      {form
        .slice(-5)
        .split("")
        .map((result, index) => {
          const styles =
            result === "W"
              ? "bg-green-500/20 text-green-300"
              : result === "D"
                ? "bg-yellow-500/20 text-yellow-300"
                : "bg-red-500/20 text-red-300";

          return (
            <span
              key={`${result}-${index}`}
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${styles}`}
            >
              {result}
            </span>
          );
        })}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-xl sm:rounded-3xl">
      <div className="border-b border-white/10 px-3 py-3 sm:px-5 sm:py-4">
        <h2 className="truncate text-base font-bold text-white sm:text-xl">
          {title}
        </h2>
      </div>
      <div className="p-3 sm:p-5">{children}</div>
    </section>
  );
}

function getConfidenceLabel(confidence: number) {
  if (confidence >= 70) return "High";
  if (confidence >= 60) return "Medium";
  return "Low";
}

function getDailyPickAccent(type: DailyPick["type"]) {
  if (type === "home") return "text-green-300";
  if (type === "away") return "text-blue-300";
  return "text-yellow-300";
}

function getDailyPickBadge(type: DailyPick["type"]) {
  if (type === "home") {
    return "border-green-400/20 bg-green-500/15 text-green-300";
  }

  if (type === "away") {
    return "border-blue-400/20 bg-blue-500/15 text-blue-300";
  }

  return "border-yellow-400/20 bg-yellow-500/15 text-yellow-300";
}

function DailyPickCard({ dailyPick }: { dailyPick?: DailyPick | null }) {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 via-[#111827] to-red-400/5 p-3 shadow-xl sm:mt-6 sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300 sm:mb-3 sm:text-xs">
            Free daily prediction
          </div>

          <h2 className="truncate text-lg font-black tracking-tight text-white sm:text-2xl">
            Today’s Best Pick
          </h2>

          {dailyPick ? (
            <>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                The strongest model probability across all available leagues.
                This automatically moves to the next available matchday once the
                current games are over.
              </p>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:mt-4 sm:p-4">
                <div className="mb-3 flex min-w-0 flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="min-w-0 truncate">{dailyPick.league}</span>
                  <span className="shrink-0 text-xs sm:text-sm">
                    {formatUKDateTime(dailyPick.date)}
                  </span>
                </div>

                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <TeamLogo src={dailyPick.homeLogo} alt={dailyPick.home} />
                    <span className="min-w-0 truncate text-sm font-semibold sm:text-base">
                      {dailyPick.home}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[11px] font-semibold uppercase text-slate-300 sm:px-3 sm:text-xs">
                    vs
                  </div>

                  <div className="flex min-w-0 items-center justify-end gap-2">
                    <span className="min-w-0 truncate text-right text-sm font-semibold sm:text-base">
                      {dailyPick.away}
                    </span>
                    <TeamLogo src={dailyPick.awayLogo} alt={dailyPick.away} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                      Strongest pick
                    </div>
                    <div
                      className={`mt-1 break-words text-base font-black sm:text-xl ${getDailyPickAccent(
                        dailyPick.type
                      )}`}
                    >
                      {dailyPick.label}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left sm:px-4 sm:text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                      Probability
                    </div>
                    <div className="mt-1 text-xl font-black text-white sm:text-2xl">
                      {dailyPick.probability}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getDailyPickBadge(
                      dailyPick.type
                    )}`}
                  >
                    {dailyPick.shortLabel}
                  </span>

                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-200">
                    {getConfidenceLabel(dailyPick.confidence)} confidence
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Today’s strongest model pick will appear here when eligible
                fixtures are available across your selected leagues.
              </p>

              <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                    Access
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">
                    Free pick daily
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                    Status
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">
                    Waiting for eligible fixtures
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <Link
          href="/predictions"
          className="inline-flex justify-center rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-400"
        >
          View Predictions →
        </Link>
      </div>
    </section>
  );
}

function LiveTicker({
  matches,
}: {
  matches: Array<{
    fixtureId: number;
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    goals: { home: number | null; away: number | null };
    elapsed?: number | null;
    leagueName: string;
  }>;
}) {
  const previousScoresRef = useRef<Record<number, string>>({});
  const [flashingIds, setFlashingIds] = useState<number[]>([]);

  useEffect(() => {
    const changedIds: number[] = [];

    matches.forEach((match) => {
      const currentScore = `${match.goals.home ?? 0}-${match.goals.away ?? 0}`;
      const previousScore = previousScoresRef.current[match.fixtureId];

      if (previousScore && previousScore !== currentScore) {
        changedIds.push(match.fixtureId);
      }

      previousScoresRef.current[match.fixtureId] = currentScore;
    });

    if (changedIds.length > 0) {
      setFlashingIds((prev) => Array.from(new Set([...prev, ...changedIds])));

      const timeout = window.setTimeout(() => {
        setFlashingIds((prev) =>
          prev.filter((id) => !changedIds.includes(id))
        );
      }, 4000);

      return () => window.clearTimeout(timeout);
    }
  }, [matches]);

  const items =
    matches.length > 0
      ? [...matches, ...matches]
      : [
          {
            fixtureId: 0,
            homeTeam: "No live matches",
            awayTeam: "Check back soon",
            homeLogo: undefined,
            awayLogo: undefined,
            goals: { home: null, away: null },
            elapsed: null,
            leagueName: "Live Centre",
          },
        ];

  return (
    <div className="sticky top-0 z-50 w-full max-w-full overflow-hidden border-b border-red-400/20 bg-[#09111d]/95 backdrop-blur">
      <div className="flex min-w-0 max-w-full items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4">
        <div className="shrink-0 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:px-3 sm:text-xs">
          Live
        </div>

        <div className="relative min-w-0 max-w-full flex-1 overflow-hidden">
          <div className="ticker-track flex min-w-max items-center gap-4 sm:gap-8">
            {items.map((match, index) => {
              const isFlashing =
                match.fixtureId !== 0 && flashingIds.includes(match.fixtureId);

              return (
                <div
                  key={`${match.fixtureId}-${index}`}
                  className="flex max-w-[86vw] shrink-0 items-center gap-1.5 rounded-lg px-1 py-1 text-[11px] text-white sm:max-w-none sm:gap-3 sm:px-2 sm:text-sm"
                >
                  <span className="max-w-[72px] truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:max-w-[160px] sm:text-xs">
                    {match.leagueName}
                  </span>

                  {match.fixtureId !== 0 ? (
                    <>
                      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                        <TeamLogo
                          src={match.homeLogo}
                          alt={match.homeTeam}
                          size={16}
                        />
                        <span className="max-w-[58px] truncate font-medium sm:max-w-[150px]">
                          {match.homeTeam}
                        </span>
                      </div>

                      <span
                        className={`rounded-lg px-1.5 py-1 text-[10px] font-bold whitespace-nowrap transition sm:px-2 sm:text-xs ${
                          isFlashing
                            ? "bg-red-500 text-white ticker-score-flash"
                            : "bg-white text-slate-950"
                        }`}
                      >
                        {match.goals.home ?? 0} - {match.goals.away ?? 0}
                      </span>

                      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                        <span className="max-w-[58px] truncate font-medium sm:max-w-[150px]">
                          {match.awayTeam}
                        </span>
                        <TeamLogo
                          src={match.awayLogo}
                          alt={match.awayTeam}
                          size={16}
                        />
                      </div>

                      <span className="text-[10px] font-semibold whitespace-nowrap text-red-400 sm:text-xs">
                        {match.elapsed ? `${match.elapsed}'` : "LIVE"}
                      </span>
                    </>
                  ) : (
                    <span className="truncate text-slate-300">
                      No live matches right now. Check back soon.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [leagueId, setLeagueId] = useState<number>(TOP_EURO_LEAGUES[0].id);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const selectedLeague = useMemo(
    () =>
      TOP_EURO_LEAGUES.find((league) => league.id === leagueId) ||
      TOP_EURO_LEAGUES[0],
    [leagueId]
  );

  async function loadData(id: number, background = false) {
    if (!background) {
      setLoading(true);
    }

    setError(null);

    try {
      const res = await fetch(`/api/dashboard/${id}?season=${SEASON}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to load dashboard: ${res.status}`);
      }

      const json: DashboardPayload = await res.json();
      setData(json);
      setLastUpdated(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Europe/London",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    } catch (err) {
      console.error(err);
      setError("Could not load football data.");
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadData(leagueId, false);

    const interval = setInterval(() => {
      void loadData(leagueId, true);
    }, 120000);

    return () => clearInterval(interval);
  }, [leagueId]);

  function formatNewsDate(value?: string) {
    if (!value) return "";
    return formatUKDateTime(value);
  }

  const news = data?.news?.slice(0, 6) ?? [];

  const kindClasses: Record<string, string> = {
    breaking: "bg-red-500 text-white shadow-md shadow-red-500/30",
    injury: "bg-yellow-500 text-black",
    transfer: "bg-blue-500 text-white",
    news: "bg-white/10 text-white",
  };

  return (
    <main className="min-h-[100dvh] w-full max-w-full overflow-x-hidden overscroll-none bg-[#0b1220] text-white">
      <LiveTicker matches={data?.live || []} />

      <div className="border-b border-white/10 bg-[#08101c]">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-5 md:px-6 lg:px-8">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-400 sm:text-sm sm:tracking-[0.2em]">
            Live Football Centre
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#1e293b] shadow-2xl sm:rounded-[32px]">
          <div className="grid gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8 md:px-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div className="min-w-0">
              <div className="mb-2 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300 sm:mb-3 sm:text-xs">
                Matchday coverage
              </div>

              <h1 className="truncate text-[26px] font-black leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                Pro Football Intel
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-3 md:text-base">
                Data-driven football insights, live scores, and AI-powered match
                predictions across Europe’s top leagues.
              </p>

              <div className="mt-4 grid gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3">
                <Link
                  href="/predictions"
                  className="inline-flex justify-center rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-red-400 sm:py-3"
                >
                  View AI Predictions
                </Link>

                <Link
                  href="/predictions"
                  className="inline-flex justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:py-3"
                >
                  Premium Insights →
                </Link>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  League
                </div>
                <div className="mt-1 truncate text-sm font-bold sm:mt-2 sm:text-lg">
                  {selectedLeague.name}
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  Season
                </div>
                <div className="mt-1 text-sm font-bold sm:mt-2 sm:text-lg">
                  {SEASON}
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  Live Games
                </div>
                <div className="mt-1 text-sm font-bold sm:mt-2 sm:text-lg">
                  {data?.live?.length ?? 0}
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  Updated
                </div>
                <div className="mt-1 truncate text-sm font-bold sm:mt-2 sm:text-lg">
                  {lastUpdated || "--:--:--"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <DailyPickCard dailyPick={data?.dailyPick} />

        <section className="mt-4 overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-r from-red-500/10 to-red-400/5 p-3 sm:mt-6 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-red-300 sm:text-xs">
                New
              </div>
              <div className="truncate text-base font-bold sm:text-lg">
                AI Match Predictions Now Live
              </div>
              <div className="text-sm leading-6 text-slate-300">
                Unlock best outcome options, win probabilities and confidence
                ratings.
              </div>
            </div>

            <Link
              href="/predictions"
              className="inline-flex justify-center rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              View →
            </Link>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#101826] p-3 shadow-xl sm:mt-6 sm:rounded-3xl sm:p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:text-sm">
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
                    "shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-4",
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

        {loading ? (
          <section className="mt-4 rounded-2xl border border-white/10 bg-[#111827] p-4 sm:mt-6 sm:rounded-3xl sm:p-6">
            <div className="text-sm text-slate-300 sm:text-base">
              Loading {selectedLeague.name} data...
            </div>
          </section>
        ) : null}

        {error ? (
          <section className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 sm:mt-6 sm:rounded-3xl sm:p-6">
            <div className="font-semibold text-red-200">{error}</div>
          </section>
        ) : null}

        {!loading && data ? (
          <>
            <section className="mt-4 sm:mt-6">
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-base font-bold sm:text-xl">
                  Live Matches
                </h2>
                <span className="shrink-0 text-sm font-semibold text-red-400">
                  {data.live.length} LIVE
                </span>
              </div>

              {data.live.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 text-sm text-slate-300 sm:rounded-3xl sm:p-5 sm:text-base">
                  No live matches right now.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {data.live.map((match) => (
                    <div
                      key={match.fixtureId}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-3 shadow-lg transition hover:border-red-400/40 sm:p-4"
                    >
                      <div className="mb-2 flex min-w-0 items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide">
                        <span className="min-w-0 truncate text-slate-400">
                          {match.leagueName}
                        </span>
                        <span className="shrink-0 text-red-400">
                          LIVE {match.elapsed ?? ""}
                        </span>
                      </div>

                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <TeamLogo src={match.homeLogo} alt={match.homeTeam} />
                          <span className="min-w-0 truncate text-sm font-semibold sm:text-base">
                            {match.homeTeam}
                          </span>
                        </div>

                        <div className="min-w-[52px] rounded-xl bg-white px-2 py-2 text-center text-xs font-black leading-none whitespace-nowrap text-slate-950 sm:min-w-[64px] sm:px-3 sm:text-sm">
                          {match.goals.home ?? 0} - {match.goals.away ?? 0}
                        </div>

                        <div className="flex min-w-0 items-center justify-end gap-2">
                          <span className="min-w-0 truncate text-right text-sm font-semibold sm:text-base">
                            {match.awayTeam}
                          </span>
                          <TeamLogo src={match.awayLogo} alt={match.awayTeam} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="mt-4 grid min-w-0 gap-4 sm:mt-6 sm:gap-5 lg:grid-cols-2">
              <SectionCard title="Standings">
                {data.standings.length === 0 ? (
                  <p className="text-sm text-slate-300 sm:text-base">
                    No standings returned for this league.
                  </p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {data.standings.map((row) => (
                      <Link
                        key={row.teamId}
                        href={`/team/${row.teamId}?league=${leagueId}&season=${SEASON}&name=${encodeURIComponent(row.team)}&logo=${encodeURIComponent(row.logo || "")}&form=${encodeURIComponent(row.form || "")}`}
                        className="flex min-h-[62px] min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-red-400/40 hover:bg-white/10 sm:min-h-[68px]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="w-6 shrink-0 text-sm font-semibold text-slate-400">
                            {row.rank}
                          </span>
                          <TeamLogo src={row.logo} alt={row.team} />
                          <div className="min-w-0">
                            <span className="block min-w-0 truncate text-sm font-semibold sm:text-base">
                              {row.team}
                            </span>
                            <FormPills form={row.form} />
                          </div>
                        </div>

                        <div className="shrink-0 text-right text-xs text-slate-300 sm:text-sm">
                          {row.points} pts
                          <span className="hidden sm:inline">
                            {" "}
                            • GD {row.goalDiff}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Upcoming Fixtures">
                {data.fixtures.length === 0 ? (
                  <p className="text-sm text-slate-300 sm:text-base">
                    No fixtures returned for this league.
                  </p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {data.fixtures.map((match) => (
                      <Link
                        key={match.fixtureId}
                        href={`/match/${match.fixtureId}`}
                        className="block overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-red-400/40 hover:bg-white/10"
                      >
                        <div className="truncate text-sm text-slate-400">
                          {match.leagueName}
                        </div>

                        <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <TeamLogo
                              src={match.homeLogo}
                              alt={match.homeTeam}
                            />
                            <span className="min-w-0 truncate text-sm font-medium sm:text-base">
                              {match.homeTeam}
                            </span>
                          </div>

                          <span className="text-xs font-semibold uppercase text-slate-400 sm:text-sm">
                            vs
                          </span>

                          <div className="flex min-w-0 items-center justify-end gap-2">
                            <span className="min-w-0 truncate text-right text-sm font-medium sm:text-base">
                              {match.awayTeam}
                            </span>
                            <TeamLogo
                              src={match.awayLogo}
                              alt={match.awayTeam}
                            />
                          </div>
                        </div>

                        <div className="mt-2 truncate text-sm text-slate-300">
                          {formatUKDateTime(match.date)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="mt-4 sm:mt-6">
              <SectionCard title="Latest Results">
                {data.results.length === 0 ? (
                  <p className="text-sm text-slate-300 sm:text-base">
                    No results returned for this league.
                  </p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {data.results.map((match) => (
                      <Link
                        key={match.fixtureId}
                        href={`/report/${match.fixtureId}`}
                        className="block overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-red-400/40 hover:bg-white/10"
                      >
                        <div className="truncate text-sm text-slate-400">
                          {match.leagueName}
                        </div>

                        <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <TeamLogo
                              src={match.homeLogo}
                              alt={match.homeTeam}
                            />
                            <span className="min-w-0 truncate text-sm font-medium sm:text-base">
                              {match.homeTeam}
                            </span>
                          </div>

                          <span className="min-w-[52px] rounded-xl bg-slate-950 px-2 py-2 text-center text-xs font-black leading-none whitespace-nowrap sm:min-w-[64px] sm:px-3 sm:text-sm">
                            {match.goals.home ?? 0} - {match.goals.away ?? 0}
                          </span>

                          <div className="flex min-w-0 items-center justify-end gap-2">
                            <span className="min-w-0 truncate text-right text-sm font-medium sm:text-base">
                              {match.awayTeam}
                            </span>
                            <TeamLogo
                              src={match.awayLogo}
                              alt={match.awayTeam}
                            />
                          </div>
                        </div>

                        <div className="mt-2 truncate text-sm text-slate-300">
                          {formatUKDateTime(match.date)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="mt-4 sm:mt-6">
              <SectionCard title="Football News">
                {news.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 sm:p-5 sm:text-base">
                    Football news feed unavailable right now.
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500"></div>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400 sm:tracking-[0.2em]">
                        Live Updates
                      </span>
                    </div>

                    {news.map((article, i) => {
                      const isFeatured = i === 0;
                      const kind = article.kind?.toLowerCase() || "news";

                      const cardClasses = isFeatured
                        ? "block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] p-4 shadow-lg transition hover:border-red-400/30 hover:bg-white/[0.04] sm:rounded-[28px] sm:p-7 md:p-8"
                        : "block overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10 sm:p-5";

                      const titleClasses = isFeatured
                        ? "mt-3 max-w-4xl break-words text-lg font-black leading-tight text-white sm:mt-4 sm:text-3xl md:text-4xl lg:text-5xl"
                        : "mt-2 break-words text-base font-bold leading-tight text-white sm:text-lg md:text-xl";

                      const summaryClasses = isFeatured
                        ? "mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base md:text-lg md:leading-7"
                        : "mt-3 text-sm leading-6 text-slate-300";

                      const content = (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                                kindClasses[kind] || kindClasses.news
                              }`}
                            >
                              {kind}
                            </span>

                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:tracking-[0.22em]">
                              {article.source || "Football News"}
                            </span>
                          </div>

                          <div className={titleClasses}>{article.title}</div>

                          {article.summary ? (
                            <div className={summaryClasses}>
                              {article.summary}
                            </div>
                          ) : null}

                          {article.date ? (
                            <div className="mt-4 text-xs font-medium text-slate-500">
                              {formatNewsDate(article.date)}
                            </div>
                          ) : null}
                        </>
                      );

                      if (article.link) {
                        return (
                          <a
                            key={article.id}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cardClasses}
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <div key={article.id} className={cardClasses}>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </div>
          </>
        ) : null}

        <footer className="mt-8 border-t border-white/10 pt-5 pb-5 sm:mt-10 sm:pt-6 sm:pb-2">
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