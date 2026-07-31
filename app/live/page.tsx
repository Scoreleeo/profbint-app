"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

const REFRESH_INTERVAL_MS = 45_000;

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

      setMatches(Array.isArray(data.live) ? data.live : []);
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
    };
  }, [loadLiveMatches]);

  const groupedMatches = useMemo(
    () =>
      LEAGUE_ORDER.map((leagueName) => ({
        leagueName,
        matches: matches.filter((match) => match.leagueName === leagueName),
      })).filter((league) => league.matches.length > 0),
    [matches]
  );

  const totalLiveMatches = matches.length;
  const lastUpdated = formatUpdatedTime(updatedAt);

  return (
    <main className="min-h-screen bg-[#06111f] text-white">
      <div className="border-b border-white/10 bg-[#08182a]/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="text-sm font-semibold tracking-wide text-amber-300 transition hover:text-amber-200"
          >
            Pro Football Intel
          </a>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-red-300">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Live
            </span>

            <button
              type="button"
              onClick={() => void loadLiveMatches(false)}
              disabled={isRefreshing}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-300/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#102944] via-[#0b2036] to-[#071522] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
                Seven-league coverage
              </p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Live Match Centre
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Live scores from the Premier League, La Liga, Serie A,
                Bundesliga, Ligue 1, Eredivisie and Primeira Liga.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Live matches
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {totalLiveMatches}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Auto refresh
                </p>
                <p className="mt-1 text-lg font-bold text-white">45 seconds</p>
              </div>
            </div>
          </div>

          {lastUpdated ? (
            <p className="mt-5 text-xs text-slate-400">
              Last updated at {lastUpdated}
            </p>
          ) : null}
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
            {groupedMatches.map((league) => (
              <section
                key={league.leagueName}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a1a2c] shadow-xl shadow-black/15"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.035] px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                      Live league
                    </p>
                    <h2 className="mt-1 text-xl font-black sm:text-2xl">
                      {league.leagueName}
                    </h2>
                  </div>

                  <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300">
                    {league.matches.length} live
                  </span>
                </div>

                <div className="divide-y divide-white/10">
                  {league.matches.map((match) => (
                    <article
                      key={match.fixtureId}
                      className="grid gap-5 px-5 py-5 transition hover:bg-white/[0.025] sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
                    >
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
                          <span className="min-w-8 text-right text-xl font-black">
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
                          <span className="min-w-8 text-right text-xl font-black">
                            {match.goals.away ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 sm:block sm:min-w-24 sm:border-0 sm:pt-0 sm:text-right">
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-red-300">
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                          Live
                        </span>
                        <p className="text-lg font-black text-amber-300 sm:mt-2">
                          {formatMatchTime(match)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {error && matches.length > 0 ? (
          <p className="mt-6 text-center text-xs text-amber-200">
            The latest refresh failed. The most recently loaded scores remain
            visible.
          </p>
        ) : null}
      </div>
    </main>
  );
}