import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamFixtures } from "@/lib/api-football/services";
import { TOP_EURO_LEAGUES } from "@/lib/constants";
import { formatUKDateTime } from "@/lib/utils/date";

type Props = {
  params: Promise<{
    teamId: string;
  }>;
  searchParams: Promise<{
    league?: string;
    season?: string;
    name?: string;
    logo?: string;
    form?: string;
  }>;
};

function TeamLogo({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  if (!src) {
    return <div className="h-8 w-8 shrink-0 rounded-full bg-white/10" />;
  }

  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/5">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="32px"
        className="object-contain p-1"
      />
    </div>
  );
}

function FormPills({ form }: { form?: string }) {
  if (!form) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Recent form
      </span>

      <div className="flex items-center gap-1">
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
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${styles}`}
              >
                {result}
              </span>
            );
          })}
      </div>
    </div>
  );
}

export default async function TeamPage({ params, searchParams }: Props) {
  const { teamId } = await params;
  const query = await searchParams;

  const parsedTeamId = Number(teamId);
  const leagueId = Number(query.league || TOP_EURO_LEAGUES[0].id);
  const season = Number(query.season || 2025);

  if (!parsedTeamId || !leagueId || !season) {
    notFound();
  }

  const selectedLeague =
    TOP_EURO_LEAGUES.find((league) => league.id === leagueId) ||
    TOP_EURO_LEAGUES[0];

  const data = await getTeamFixtures(parsedTeamId, leagueId, season);

  const firstMatch = data.matches[0];

  const teamMatch = data.matches.find((match) => {
    return (
      String(match.homeTeamId) === String(parsedTeamId) ||
      String(match.awayTeamId) === String(parsedTeamId)
    );
  });

  const teamName =
    query.name ||
    (teamMatch && String(teamMatch.homeTeamId) === String(parsedTeamId)
      ? teamMatch.homeTeam
      : teamMatch && String(teamMatch.awayTeamId) === String(parsedTeamId)
        ? teamMatch.awayTeam
        : firstMatch?.homeTeam || firstMatch?.awayTeam || "Team fixtures");

  const teamLogo =
    query.logo ||
    (teamMatch && String(teamMatch.homeTeamId) === String(parsedTeamId)
      ? teamMatch.homeLogo
      : teamMatch && String(teamMatch.awayTeamId) === String(parsedTeamId)
        ? teamMatch.awayLogo
        : undefined);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0b1220] text-white">
      <div className="border-b border-white/10 bg-[#08101c]">
        <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            ← Back to Home
          </Link>

          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-red-400 sm:text-sm sm:tracking-[0.2em]">
            Team Centre
          </div>

          <div className="mt-3 flex min-w-0 items-center gap-3">
            <TeamLogo src={teamLogo} alt={teamName} />
            <h1 className="min-w-0 break-words text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">
              {teamName}
            </h1>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            League results and remaining fixtures for {selectedLeague.name}.
          </p>

          <FormPills form={query.form} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8">
        <section className="grid min-w-0 gap-4 md:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              League
            </div>
            <div className="mt-2 truncate text-base font-bold sm:text-lg">
              {selectedLeague.name}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Season
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">{season}</div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Matches Found
            </div>
            <div className="mt-2 text-base font-bold sm:text-lg">
              {data.matches.length}
            </div>
          </div>
        </section>

        <div className="mt-5 grid min-w-0 gap-5 sm:mt-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-xl sm:rounded-3xl">
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Results
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              {data.results.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-400">
                  No results available yet.
                </div>
              ) : (
                <div className="space-y-3">
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
                          <TeamLogo src={match.homeLogo} alt={match.homeTeam} />
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
                          <TeamLogo src={match.awayLogo} alt={match.awayTeam} />
                        </div>
                      </div>

                      <div className="mt-2 truncate text-sm text-slate-300">
                        {formatUKDateTime(match.date)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-xl sm:rounded-3xl">
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Fixtures Left To Play
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              {data.fixtures.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-400">
                  No upcoming fixtures available.
                </div>
              ) : (
                <div className="space-y-3">
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
                          <TeamLogo src={match.homeLogo} alt={match.homeTeam} />
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
                          <TeamLogo src={match.awayLogo} alt={match.awayTeam} />
                        </div>
                      </div>

                      <div className="mt-2 truncate text-sm text-slate-300">
                        {formatUKDateTime(match.date)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}