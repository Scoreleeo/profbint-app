"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LiveMatch = {
  fixtureId: number;
  date: string;
  status: string;
  elapsed: number | null;
  leagueName: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  provider: string;
  goals: {
    home: number | null;
    away: number | null;
  };
};

type LiveResponse = {
  live: LiveMatch[];
  updatedAt: string;
  error?: string;
};

const LEAGUE_ORDER = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Eredivisie",
  "Primeira Liga",
] as const;

const LEAGUE_LOGOS: Record<(typeof LEAGUE_ORDER)[number], string> = {
  "Premier League": "https://media.api-sports.io/football/leagues/39.png",
  "La Liga": "https://media.api-sports.io/football/leagues/140.png",
  "Serie A": "https://media.api-sports.io/football/leagues/135.png",
  Bundesliga: "https://media.api-sports.io/football/leagues/78.png",
  "Ligue 1": "https://media.api-sports.io/football/leagues/61.png",
  Eredivisie: "https://media.api-sports.io/football/leagues/88.png",
  "Primeira Liga": "https://media.api-sports.io/football/leagues/94.png",
};

const APP_NAVIGATION = [
  { href: "/live", label: "Live Match Centre", icon: "⚡", external: false },
  { href: "/#live", label: "Live Worldwide", icon: "●", external: false },
  { href: "/#standings", label: "Standings", icon: "🏆", external: false },
  { href: "/#fixtures", label: "Fixtures", icon: "◫", external: false },
  { href: "/#results", label: "Latest Results", icon: "▥", external: false },
  {
    href: "https://players.profbint.com/",
    label: "Player Database",
    icon: "◎",
    external: true,
  },
  {
    href: "https://predictions.profbint.com/",
    label: "Predictions",
    icon: "◉",
    external: true,
  },
  {
    href: "https://results.profbint.com/",
    label: "Results Dashboard",
    icon: "▥",
    external: true,
  },
] as const;

const LEAGUE_THEMES: Record<
  (typeof LEAGUE_ORDER)[number],
  {
    filterActive: string;
    filterIdle: string;
    sectionBorder: string;
    sectionBackground: string;
    eyebrow: string;
    badge: string;
    scoreGlow: string;
  }
> = {
  "Premier League": {
    filterActive:
      "border-violet-400 bg-violet-500/20 text-violet-100 shadow-[0_0_24px_rgba(139,92,246,0.2)]",
    filterIdle:
      "border-violet-400/20 bg-violet-500/[0.06] text-violet-100 hover:border-violet-400/50 hover:bg-violet-500/10",
    sectionBorder: "border-violet-400/30",
    sectionBackground:
      "bg-gradient-to-br from-violet-950/45 via-[#0a1a2c] to-[#081522]",
    eyebrow: "text-violet-300",
    badge: "border-violet-400/30 bg-violet-500/15 text-violet-200",
    scoreGlow: "shadow-[0_0_24px_rgba(139,92,246,0.12)]",
  },
  "La Liga": {
    filterActive:
      "border-rose-400 bg-rose-500/20 text-rose-100 shadow-[0_0_24px_rgba(244,63,94,0.2)]",
    filterIdle:
      "border-rose-400/20 bg-rose-500/[0.06] text-rose-100 hover:border-rose-400/50 hover:bg-rose-500/10",
    sectionBorder: "border-rose-400/30",
    sectionBackground:
      "bg-gradient-to-br from-rose-950/40 via-[#0a1a2c] to-[#081522]",
    eyebrow: "text-rose-300",
    badge: "border-rose-400/30 bg-rose-500/15 text-rose-200",
    scoreGlow: "shadow-[0_0_24px_rgba(244,63,94,0.12)]",
  },
  "Serie A": {
    filterActive:
      "border-sky-400 bg-sky-500/20 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.2)]",
    filterIdle:
      "border-sky-400/20 bg-sky-500/[0.06] text-sky-100 hover:border-sky-400/50 hover:bg-sky-500/10",
    sectionBorder: "border-sky-400/30",
    sectionBackground:
      "bg-gradient-to-br from-sky-950/45 via-[#0a1a2c] to-[#081522]",
    eyebrow: "text-sky-300",
    badge: "border-sky-400/30 bg-sky-500/15 text-sky-200",
    scoreGlow: "shadow-[0_0_24px_rgba(56,189,248,0.12)]",
  },
  Bundesliga: {
    filterActive:
      "border-red-400 bg-red-500/20 text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.2)]",
    filterIdle:
      "border-red-400/20 bg-red-500/[0.06] text-red-100 hover:border-red-400/50 hover:bg-red-500/10",
    sectionBorder: "border-red-400/30",
    sectionBackground:
      "bg-gradient-to-br from-red-950/40 via-[#0a1a2c] to-[#081522]",
    eyebrow: "text-red-300",
    badge: "border-red-400/30 bg-red-500/15 text-red-200",
    scoreGlow: "shadow-[0_0_24px_rgba(248,113,113,0.12)]",
  },
  "Ligue 1": {
    filterActive:
      "border-lime-400 bg-lime-500/20 text-lime-100 shadow-[0_0_24px_rgba(163,230,53,0.18)]",
    filterIdle:
      "border-lime-400/20 bg-lime-500/[0.06] text-lime-100 hover:border-lime-400/50 hover:bg-lime-500/10",
    sectionBorder: "border-lime-400/30",
    sectionBackground:
      "bg-gradient-to-br from-lime-950/30 via-[#0a1a2c] to-[#081522]",
    eyebrow: "text-lime-300",
    badge: "border-lime-400/30 bg-lime-500/15 text-lime-200",
    scoreGlow: "shadow-[0_0_24px_rgba(163,230,53,0.1)]",
  },
  Eredivisie: {
    filterActive:
      "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.2)]",
    filterIdle:
      "border-cyan-400/20 bg-cyan-500/[0.06] text-cyan-100 hover:border-cyan-400/50 hover:bg-cyan-500/10",
    sectionBorder: "border-cyan-400/30",
    sectionBackground:
      "bg-gradient-to-br from-cyan-950/40 via-[#0a1a2c] to-[#081522]",
    eyebrow: "text-cyan-300",
    badge: "border-cyan-400/30 bg-cyan-500/15 text-cyan-200",
    scoreGlow: "shadow-[0_0_24px_rgba(34,211,238,0.12)]",
  },
  "Primeira Liga": {
    filterActive:
      "border-emerald-400 bg-emerald-500/20 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.2)]",
    filterIdle:
      "border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-100 hover:border-emerald-400/50 hover:bg-emerald-500/10",
    sectionBorder: "border-emerald-400/30",
    sectionBackground:
      "bg-gradient-to-br from-emerald-950/35 via-[#0a1a2c] to-[#081522]",
    eyebrow: "text-emerald-300",
    badge:
      "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
    scoreGlow: "shadow-[0_0_24px_rgba(52,211,153,0.12)]",
  },
};

const REFRESH_INTERVAL_MS = 45_000;
const GOAL_ALERT_DURATION_MS = 8_000;

function formatMatchTime(match: LiveMatch) {
  if (match.status === "HT") {
    return "HT";
  }

  if (match.status === "PEN") {
    return "PEN";
  }

  if (match.status === "AET") {
    return "AET";
  }

  if (match.elapsed !== null) {
    return `${match.elapsed}'`;
  }

  return match.status || "LIVE";
}

function formatUpdatedTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LiveMatchCentrePage() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goalAlertIds, setGoalAlertIds] = useState<number[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("All Live");
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const previousScoresRef = useRef<Record<number, string>>({});
  const goalAlertTimeoutsRef = useRef<Record<number, number>>({});

  const loadLiveMatches = useCallback(async (initialLoad = false) => {
    if (initialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch("/api/live", {
        cache: "no-store",
      });

      const data = (await response.json()) as LiveResponse;

      if (!response.ok) {
        throw new Error(data.error || "Unable to load live matches.");
      }

      const nextMatches = Array.isArray(data.live) ? data.live : [];

      setMatches((currentMatches) => {
        const hasPreviousMatches = currentMatches.length > 0;
        const changedFixtureIds: number[] = [];

        nextMatches.forEach((match) => {
          const nextScore = `${match.goals.home ?? 0}-${match.goals.away ?? 0}`;
          const previousScore = previousScoresRef.current[match.fixtureId];

          if (
            hasPreviousMatches &&
            previousScore &&
            previousScore !== nextScore
          ) {
            changedFixtureIds.push(match.fixtureId);
          }

          previousScoresRef.current[match.fixtureId] = nextScore;
        });

        if (changedFixtureIds.length > 0) {
          setGoalAlertIds((currentIds) =>
            Array.from(new Set([...currentIds, ...changedFixtureIds]))
          );

          changedFixtureIds.forEach((fixtureId) => {
            const existingTimeout = goalAlertTimeoutsRef.current[fixtureId];

            if (existingTimeout) {
              window.clearTimeout(existingTimeout);
            }

            goalAlertTimeoutsRef.current[fixtureId] = window.setTimeout(() => {
              setGoalAlertIds((currentIds) =>
                currentIds.filter((id) => id !== fixtureId)
              );
              delete goalAlertTimeoutsRef.current[fixtureId];
            }, GOAL_ALERT_DURATION_MS);
          });
        }

        return nextMatches;
      });

      setUpdatedAt(data.updatedAt || new Date().toISOString());
      setError(null);
    } catch (requestError) {
      console.error("LIVE MATCH CENTRE ERROR:", requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load live matches."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadLiveMatches(true);

    const interval = window.setInterval(() => {
      void loadLiveMatches(false);
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);

      Object.values(goalAlertTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, [loadLiveMatches]);

  const groupedMatches = useMemo(() => {
    const filtered = selectedLeague === "All Live"
      ? matches
      : matches.filter((m) => m.leagueName === selectedLeague);

    return LEAGUE_ORDER.map((leagueName) => ({
      leagueName,
      matches: filtered.filter((match) => match.leagueName === leagueName),
    })).filter((league) => league.matches.length > 0);
  }, [matches, selectedLeague]);

  const totalLiveMatches = matches.length;
  const lastUpdated = formatUpdatedTime(updatedAt);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.09),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.08),_transparent_28%),linear-gradient(180deg,_#050c16_0%,_#06111f_48%,_#040a12_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050c16]/95 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <a
              href="/"
              className="group flex shrink-0 items-center gap-2.5 rounded-xl pr-2"
              aria-label="Pro Football Intel home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-lg shadow-[0_0_18px_rgba(52,211,153,0.14)] transition group-hover:border-emerald-300/60 group-hover:bg-emerald-500/15">
                ⚽
              </span>
              <span className="hidden text-sm font-black tracking-tight text-white sm:block">
                Pro Football Intel
              </span>
            </a>

            <button
              type="button"
              onClick={() => void loadLiveMatches(false)}
              disabled={isRefreshing}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className={isRefreshing ? "animate-spin" : ""}>↻</span>
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>

          <nav
            className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1"
            aria-label="Pro Football Intel navigation"
          >
            {APP_NAVIGATION.map((item) => {
              const isActive = item.href === "/live";

              return (
                <a
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition duration-200 ${
                    isActive
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.16)]"
                      : "border-white/10 bg-white/[0.035] text-slate-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-500/[0.08] hover:text-white"
                  }`}
                >
                  <span
                    className={
                      isActive ? "text-emerald-300" : "text-cyan-300"
                    }
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#0d3b3a] via-[#0a2340] to-[#071522] p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-red-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                  Live
                </span>

                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-amber-300 sm:text-xs">
                  Seven-league coverage
                </p>
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-[2.8rem] lg:leading-none">
                Live Match Centre
              </h1>

              <div className="mt-3 max-w-full overflow-x-auto pb-1">
                <p className="whitespace-nowrap text-sm leading-6 text-slate-300 sm:text-[15px]">
                  Live scores from the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie and Primeira Liga.
                </p>
              </div>

              {lastUpdated ? (
                <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  Updated {lastUpdated}
                  <span className="text-slate-600">•</span>
                  Live updates every 45 seconds
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 lg:min-w-[300px]">
              <div className="rounded-2xl border border-cyan-400/25 bg-cyan-950/25 px-4 py-4 shadow-[0_0_24px_rgba(34,211,238,0.08)] backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                  Live matches
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-black leading-none text-white">
                    {totalLiveMatches}
                  </p>
                  <span className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                    Now
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-950/25 px-4 py-4 shadow-[0_0_24px_rgba(52,211,153,0.08)] backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                  Auto refresh
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-xl font-black leading-none text-white sm:text-2xl">
                    45s
                  </p>
                  <span className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-300">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#071321]/80 shadow-xl shadow-black/20">
          <div className="flex overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedLeague("All Live")}
              className={`flex min-h-[104px] min-w-[124px] shrink-0 flex-col items-center justify-center gap-2 border-r border-white/10 px-3 py-4 text-center transition duration-200 lg:flex-1 ${
                selectedLeague === "All Live"
                  ? "bg-gradient-to-br from-emerald-500/25 to-cyan-500/15 text-white shadow-[inset_0_-2px_0_rgba(52,211,153,0.9)]"
                  : "bg-white/[0.02] text-slate-300 hover:bg-emerald-500/10 hover:text-white"
              }`}
            >
              <span className="flex h-8 items-center justify-center whitespace-nowrap text-center text-xs font-black uppercase leading-tight tracking-[0.1em]">
                All Live
              </span>
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-500/10 text-xl text-emerald-300"
                aria-hidden="true"
              >
                ◉
              </span>
            </button>

            {LEAGUE_ORDER.map((league) => {
              const theme = LEAGUE_THEMES[league];
              const isSelected = selectedLeague === league;

              return (
                <button
                  key={league}
                  type="button"
                  onClick={() => setSelectedLeague(league)}
                  className={`flex min-h-[104px] min-w-[132px] shrink-0 flex-col items-center justify-center gap-2 border-r px-3 py-4 text-center transition duration-200 last:border-r-0 hover:-translate-y-0.5 lg:flex-1 ${
                    isSelected ? theme.filterActive : theme.filterIdle
                  }`}
                >
                  <span className="flex h-8 items-center justify-center whitespace-nowrap text-center text-xs font-black leading-tight sm:text-sm">
                    {league}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-2 shadow-[0_4px_18px_rgba(255,255,255,0.16)]">
                    <img
                      src={LEAGUE_LOGOS[league]}
                      alt={`${league} logo`}
                      width={38}
                      height={38}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {isLoading ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-amber-300" />
            <p className="text-sm font-semibold text-slate-300">
              Loading live matches...
            </p>
          </section>
        ) : error && matches.length === 0 ? (
          <section className="rounded-3xl border border-red-400/20 bg-red-500/10 px-6 py-14 text-center">
            <h2 className="text-xl font-bold">Live scores are unavailable</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-red-100/80">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadLiveMatches(false)}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Try again
            </button>
          </section>
        ) : groupedMatches.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <span className="h-3 w-3 rounded-full bg-slate-500" />
            </div>
            <h2 className="text-2xl font-black">No matches currently live</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
              This page will automatically update when a match begins in one of
              the seven supported leagues.
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            {groupedMatches.map((league) => {
              const theme =
                LEAGUE_THEMES[
                  league.leagueName as (typeof LEAGUE_ORDER)[number]
                ];

              return (
              <section
                key={league.leagueName}
                className={`overflow-hidden rounded-3xl border shadow-xl shadow-black/20 ${theme.sectionBorder} ${theme.sectionBackground}`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.035] px-5 py-4 sm:px-6">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.eyebrow}`}>
                      Live league
                    </p>
                    <h2 className="mt-1 text-xl font-black sm:text-2xl">
                      {league.leagueName}
                    </h2>
                  </div>

                  <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${theme.badge}`}>
                    {league.matches.length} live
                  </span>
                </div>

                <div className="divide-y divide-white/10 bg-black/10">
                  {league.matches.map((match) => {
                    const hasGoalAlert = goalAlertIds.includes(match.fixtureId);

                    return (
                    <article
                      key={match.fixtureId}
                      onClick={() =>
                        setExpandedMatchId(
                          expandedMatchId === match.fixtureId
                            ? null
                            : match.fixtureId
                        )
                      }
                      className={`relative grid cursor-pointer gap-5 px-5 py-5 transition duration-500 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6 ${
                        hasGoalAlert
                          ? "bg-emerald-400/10 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]"
                          : "hover:bg-white/[0.025]"
                      }`}
                    >
                      {hasGoalAlert ? (
                        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-950 shadow-lg shadow-emerald-950/30">
                          <span aria-hidden="true">⚽</span>
                          Goal
                        </div>
                      ) : null}
                      <div className="space-y-3">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            {match.homeLogo ? (
                              <img
                                src={match.homeLogo}
                                alt=""
                                width={32}
                                height={32}
                                className="h-8 w-8 shrink-0 object-contain"
                              />
                            ) : (
                              <div className="h-8 w-8 shrink-0 rounded-full bg-white/10" />
                            )}
                            <span className="truncate text-sm font-bold text-slate-100 sm:text-base">
                              {match.homeTeam}
                            </span>
                          </div>
                          <span
                            className={`min-w-10 rounded-xl border border-white/10 bg-black/20 px-2 py-1.5 text-right text-xl font-black transition duration-500 ${theme.scoreGlow} ${
                              hasGoalAlert
                                ? "animate-pulse bg-emerald-400 text-emerald-950"
                                : ""
                            }`}
                          >
                            {match.goals.home ?? 0}
                          </span>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            {match.awayLogo ? (
                              <img
                                src={match.awayLogo}
                                alt=""
                                width={32}
                                height={32}
                                className="h-8 w-8 shrink-0 object-contain"
                              />
                            ) : (
                              <div className="h-8 w-8 shrink-0 rounded-full bg-white/10" />
                            )}
                            <span className="truncate text-sm font-bold text-slate-100 sm:text-base">
                              {match.awayTeam}
                            </span>
                          </div>
                          <span
                            className={`min-w-10 rounded-xl border border-white/10 bg-black/20 px-2 py-1.5 text-right text-xl font-black transition duration-500 ${theme.scoreGlow} ${
                              hasGoalAlert
                                ? "animate-pulse bg-emerald-400 text-emerald-950"
                                : ""
                            }`}
                          >
                            {match.goals.away ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 sm:block sm:min-w-28 sm:border-0 sm:pt-0 sm:text-right">
                        <div className="flex items-center gap-2 sm:justify-end">
                          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-red-300">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                            Live
                          </span>
                          <span
                            className={`text-sm text-slate-500 transition-transform ${
                              expandedMatchId === match.fixtureId
                                ? "rotate-180"
                                : ""
                            }`}
                            aria-hidden="true"
                          >
                            ⌄
                          </span>
                        </div>
                        <p className="text-lg font-black text-amber-300 sm:mt-2">
                          {formatMatchTime(match)}
                        </p>
                      </div>
                    

                      {expandedMatchId === match.fixtureId ? (
                        <div className="mt-1 rounded-2xl border border-white/10 bg-[#081522]/90 p-4 text-sm text-slate-300 sm:col-span-2">
                          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                            Match information
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.06] p-3">
                              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-violet-300">
                                Competition
                              </span>
                              <span className="mt-1 block font-bold text-white">
                                {match.leagueName}
                              </span>
                            </div>

                            <div className="rounded-xl border border-rose-400/15 bg-rose-500/[0.06] p-3">
                              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-rose-300">
                                Status
                              </span>
                              <span className="mt-1 block font-bold text-white">
                                {match.status}
                              </span>
                            </div>

                            <div className="rounded-xl border border-cyan-400/15 bg-cyan-500/[0.06] p-3">
                              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                                Kick-off
                              </span>
                              <span className="mt-1 block font-bold text-white">
                                {new Date(match.date).toLocaleString("en-GB")}
                              </span>
                            </div>

                            <div className="rounded-xl border border-amber-400/15 bg-amber-500/[0.06] p-3">
                              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">
                                Fixture ID
                              </span>
                              <span className="mt-1 block font-bold text-white">
                                {match.fixtureId}
                              </span>
                            </div>

                            <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] p-3">
                              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                                Provider
                              </span>
                              <span className="mt-1 block break-words font-bold text-white">
                                {match.provider}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                    );
                  })}
                </div>
              </section>
              );
            })}
          </div>
        )}

        {error && matches.length > 0 ? (
          <p className="mt-6 text-center text-xs text-amber-200">
            The latest refresh failed. The most recently loaded scores remain
            visible.
          </p>
        ) : null}

        <footer className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Live scores powered by API-Football. Data may be delayed by a few
            seconds.
          </p>
          <a
            href="/"
            className="font-bold text-cyan-300 transition hover:text-cyan-200"
          >
            Return to Pro Football Intel →
          </a>
        </footer>
      </div>
    </main>
  );
}