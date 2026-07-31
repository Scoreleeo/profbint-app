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
  provider?: "api-football" | "sportmonks";
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

type DashboardPayload = {
  standings: StandingRow[];
  fixtures: MatchRow[];
  results: MatchRow[];
  live: MatchRow[];
};

const SEASON = 2026;

const STANDARD_BUTTON =
  "shrink-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300 sm:text-sm";

const ACTIVE_BUTTON =
  "shrink-0 rounded-xl border border-amber-400 bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 transition hover:bg-amber-300 sm:text-sm";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TeamLogo({
  src,
  alt,
  size = 24,
}: {
  src?: string;
  alt: string;
  size?: number;
}) {
  const boxSize = size + 10;
  const [imgError, setImgError] = useState(false);
  const logoSrc = cleanLogoUrl(src);
  const initials = getInitials(alt);

  const shellClassName =
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_6px_14px_rgba(0,0,0,0.28)]";

  if (!logoSrc || imgError) {
    return (
      <div
        className={`${shellClassName} text-[10px] font-black text-slate-800`}
        style={{ width: boxSize, height: boxSize }}
        title={alt}
      >
        {initials || "?"}
      </div>
    );
  }

  return (
    <div className={shellClassName} style={{ width: boxSize, height: boxSize }}>
      <Image
        src={logoSrc}
        alt={alt}
        fill
        unoptimized
        sizes={`${boxSize}px`}
        className="object-contain p-1.5"
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
              ? "bg-emerald-500/15 text-emerald-300"
              : result === "D"
                ? "bg-amber-500/15 text-amber-300"
                : "bg-red-500/15 text-red-300";

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
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl sm:rounded-3xl">
      <div className="border-b border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="truncate text-sm font-black text-white sm:text-lg">
          {title}
        </h2>
      </div>

      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

function QuickNav() {
  const internalLinks = [
    { href: "/live", label: "Live Match Centre" },
    { href: "#live", label: "Live on this page" },
    { href: "#standings", label: "Standings" },
    { href: "#fixtures", label: "Fixtures" },
    { href: "#results", label: "Latest Results" },
  ];

  const externalLinks = [
    {
      href: "https://players.profbint.com/",
      label: "Player Database",
    },
    {
      href: "https://predictions.profbint.com/",
      label: "Predictions",
    },
    {
      href: "https://results.profbint.com/",
      label: "Results Dashboard",
    },
  ];

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-xl sm:mt-5 sm:rounded-3xl">
      <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
        Jump to
      </div>

      <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {internalLinks.map((item) => (
          <a key={item.href} href={item.href} className={STANDARD_BUTTON}>
            {item.label}
          </a>
        ))}

        {externalLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={STANDARD_BUTTON}
          >
            {item.label}
          </a>
        ))}
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
    goals: {
      home: number | null;
      away: number | null;
    };
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
      setFlashingIds((previous) =>
        Array.from(new Set([...previous, ...changedIds])),
      );

      const timeout = window.setTimeout(() => {
        setFlashingIds((previous) =>
          previous.filter((id) => !changedIds.includes(id)),
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
            goals: {
              home: null,
              away: null,
            },
            elapsed: null,
            leagueName: "Live Centre",
          },
        ];

  return (
    <div className="sticky top-0 z-50 w-full max-w-full overflow-hidden border-b border-red-400/20 bg-slate-950/95 backdrop-blur">
      <div className="flex min-w-0 max-w-full items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4">
        <div className="shrink-0 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white sm:px-3 sm:text-xs">
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
                  <span className="max-w-[72px] truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:max-w-[160px] sm:text-xs">
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
                        className={`rounded-lg px-1.5 py-1 text-[10px] font-black whitespace-nowrap transition sm:px-2 sm:text-xs ${
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
    [leagueId],
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
        }),
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

    const interval = window.setInterval(() => {
      void loadData(leagueId, true);
    }, 120000);

    return () => window.clearInterval(interval);
  }, [leagueId]);

  return (
    <main className="min-h-[100dvh] w-full max-w-full overflow-x-hidden scroll-smooth bg-slate-950 text-white">
      <LiveTicker matches={data?.live || []} />

      <div className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3 md:px-5 lg:px-8">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">
            Live Football Centre
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl sm:rounded-3xl">
          <div className="grid gap-3 px-3 py-3 sm:px-4 sm:py-4 md:px-5 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div className="min-w-0">
              <div className="mb-2 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 sm:text-[10px]">
                Matchday coverage
              </div>

              <h1 className="truncate text-lg font-black leading-tight tracking-tight sm:text-xl md:text-2xl">
                Pro Football Intel
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300 sm:text-sm">
                Data-driven football insights, live scores and match coverage
                across Europe’s top leagues.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2">
              <InfoCard label="League" value={selectedLeague.name} />
              <InfoCard label="Season" value={String(SEASON)} />
              <InfoCard
                label="Live Games"
                value={String(data?.live?.length ?? 0)}
              />
              <InfoCard label="Updated" value={lastUpdated || "--:--:--"} />
            </div>
          </div>
        </section>

        <QuickNav />

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-xl sm:mt-5 sm:rounded-3xl">
          <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
            Select competition
          </div>

          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {TOP_EURO_LEAGUES.map((league) => {
              const active = league.id === leagueId;

              return (
                <button
                  key={league.id}
                  type="button"
                  onClick={() => setLeagueId(league.id)}
                  className={active ? ACTIVE_BUTTON : STANDARD_BUTTON}
                >
                  {league.name}
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:mt-5 sm:rounded-3xl">
            <div className="text-sm text-slate-300">
              Loading {selectedLeague.name} data...
            </div>
          </section>
        ) : null}

        {error ? (
          <section className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 sm:mt-5 sm:rounded-3xl">
            <div className="font-semibold text-red-200">{error}</div>
          </section>
        ) : null}

        {!loading && data ? (
          <>
            <section id="live" className="scroll-mt-20 mt-4 sm:mt-5">
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-base font-black sm:text-lg">
                  Live Matches
                </h2>

                <span className="shrink-0 text-sm font-black text-red-400">
                  {data.live.length} LIVE
                </span>
              </div>

              {data.live.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300 sm:rounded-3xl">
                  No live matches right now.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {data.live.map((match) => (
                    <div
                      key={match.fixtureId}
                      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-lg transition hover:border-slate-700"
                    >
                      <div className="mb-2 flex min-w-0 items-center justify-between gap-2 text-xs font-black uppercase tracking-wide">
                        <span className="min-w-0 truncate text-slate-500">
                          {match.leagueName}
                        </span>

                        <span className="shrink-0 text-red-400">
                          LIVE {match.elapsed ?? ""}
                        </span>
                      </div>

                      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <TeamLogo
                            src={match.homeLogo}
                            alt={match.homeTeam}
                          />

                          <span className="min-w-0 truncate text-sm font-semibold">
                            {match.homeTeam}
                          </span>
                        </div>

                        <div className="min-w-[52px] rounded-xl bg-white px-2 py-2 text-center text-xs font-black leading-none whitespace-nowrap text-slate-950 sm:min-w-[64px] sm:px-3 sm:text-sm">
                          {match.goals.home ?? 0} - {match.goals.away ?? 0}
                        </div>

                        <div className="flex min-w-0 items-center justify-end gap-2">
                          <span className="min-w-0 truncate text-right text-sm font-semibold">
                            {match.awayTeam}
                          </span>

                          <TeamLogo
                            src={match.awayLogo}
                            alt={match.awayTeam}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="mt-4 grid min-w-0 gap-4 sm:mt-5 lg:grid-cols-2">
              <div id="standings" className="scroll-mt-20">
                <SectionCard title="Standings">
                  {data.standings.length === 0 ? (
                    <p className="text-sm text-slate-300">
                      No standings returned for this league.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.standings.map((row) => (
                        <Link
                          key={row.teamId}
                          href={`/team/${row.teamId}?league=${leagueId}&season=${SEASON}&name=${encodeURIComponent(row.team)}&logo=${encodeURIComponent(row.logo || "")}&form=${encodeURIComponent(row.form || "")}`}
                          className="flex min-h-[58px] min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-700 sm:min-h-[64px]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="w-6 shrink-0 text-sm font-semibold text-slate-500">
                              {row.rank}
                            </span>

                            <TeamLogo src={row.logo} alt={row.team} />

                            <div className="min-w-0">
                              <span className="block min-w-0 truncate text-sm font-semibold">
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
              </div>

              <div id="fixtures" className="scroll-mt-20">
                <SectionCard title="Upcoming Fixtures">
                  {data.fixtures.length === 0 ? (
                    <p className="text-sm text-slate-300">
                      No fixtures returned for this league.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.fixtures.map((match) => (
                        <div
                          key={match.fixtureId}
                          className="block overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-700"
                        >
                          <div className="flex min-w-0 items-center justify-between gap-2">
                            <div className="min-w-0 truncate text-sm text-slate-500">
                              {match.leagueName}
                            </div>

                            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-amber-300">
                              Fixture scheduled
                            </span>
                          </div>

                          <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <TeamLogo
                                src={match.homeLogo}
                                alt={match.homeTeam}
                              />

                              <span className="min-w-0 truncate text-sm font-medium">
                                {match.homeTeam}
                              </span>
                            </div>

                            <span className="text-xs font-semibold uppercase text-slate-500">
                              vs
                            </span>

                            <div className="flex min-w-0 items-center justify-end gap-2">
                              <span className="min-w-0 truncate text-right text-sm font-medium">
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
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>

            <div id="results" className="scroll-mt-20 mt-4 sm:mt-5">
              <SectionCard title="Latest Results">
                {data.results.length === 0 ? (
                  <p className="text-sm text-slate-300">
                    No results returned for this league.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.results.map((match) => (
                      <Link
                        key={match.fixtureId}
                        href={`/report/${match.fixtureId}`}
                        className="block overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-700"
                      >
                        <div className="truncate text-sm text-slate-500">
                          {match.leagueName}
                        </div>

                        <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <TeamLogo
                              src={match.homeLogo}
                              alt={match.homeTeam}
                            />

                            <span className="min-w-0 truncate text-sm font-medium">
                              {match.homeTeam}
                            </span>
                          </div>

                          <span className="min-w-[52px] rounded-xl bg-slate-900 px-2 py-2 text-center text-xs font-black leading-none whitespace-nowrap sm:min-w-[64px] sm:px-3 sm:text-sm">
                            {match.goals.home ?? 0} - {match.goals.away ?? 0}
                          </span>

                          <div className="flex min-w-0 items-center justify-end gap-2">
                            <span className="min-w-0 truncate text-right text-sm font-medium">
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
          </>
        ) : null}

        <footer className="mt-8 border-t border-slate-800 pt-5 pb-5 sm:mt-10 sm:pt-6 sm:pb-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Home
            </Link>

            <a
              href="https://predictions.profbint.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Predictions
            </a>

            <a
              href="https://players.profbint.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Player Database
            </a>

            <a
              href="https://results.profbint.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Results Dashboard
            </a>

            <Link
              href="/privacy"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Terms of Service
            </Link>

            <Link
              href="/refunds"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Refund Policy
            </Link>

            <Link
              href="/responsible-gambling"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Responsible Gambling
            </Link>

            <Link
              href="/legal"
              className="text-sm text-slate-400 transition hover:text-amber-300"
            >
              Legal & Disclaimer
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-2.5 sm:p-3">
      <div className="text-[9px] font-black uppercase tracking-wide text-slate-500 sm:text-[10px]">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-black sm:text-sm">{value}</div>
    </div>
  );
}