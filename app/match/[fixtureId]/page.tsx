export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFixtureDetail } from "@/lib/api-football/services";
import { formatUKDateTime } from "@/lib/utils/date";

type Props = {
  params: {
    fixtureId: string;
  };
};

function TeamBadge({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo?: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 sm:gap-3 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      {align === "right" ? (
        <>
          <span className="min-w-0 truncate text-right text-sm font-bold sm:text-lg md:text-2xl">
            {name}
          </span>
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/5 sm:h-10 sm:w-10">
            {logo ? (
              <Image
                src={logo}
                alt={name}
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/5 sm:h-10 sm:w-10">
            {logo ? (
              <Image
                src={logo}
                alt={name}
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            ) : null}
          </div>
          <span className="min-w-0 truncate text-sm font-bold sm:text-lg md:text-2xl">
            {name}
          </span>
        </>
      )}
    </div>
  );
}

export default async function MatchPage({ params }: Props) {
  const fixtureId = Number(params.fixtureId);

  if (!fixtureId) {
    notFound();
  }

  const detail = await getFixtureDetail(fixtureId);

  if (!detail) {
    notFound();
  }

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
            Match Preview
          </div>

          <h1 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">
            {detail.homeTeam} vs {detail.awayTeam}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Fixture details, lineups, statistics and match context.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#1e293b] shadow-2xl sm:rounded-[32px]">
          <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8">
            <div className="mb-5 truncate text-sm font-semibold uppercase tracking-wide text-slate-400 sm:mb-6">
              {detail.leagueName}
            </div>

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 md:gap-6">
              <TeamBadge name={detail.homeTeam} logo={detail.homeLogo} />

              <div className="max-w-[128px] rounded-2xl border border-white/10 bg-white/5 px-2.5 py-3 text-center sm:max-w-none sm:px-6 sm:py-4">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  Kickoff
                </div>
                <div className="mt-2 text-xs font-black leading-5 sm:text-lg">
                  {formatUKDateTime(detail.date)}
                </div>
              </div>

              <TeamBadge
                name={detail.awayTeam}
                logo={detail.awayLogo}
                align="right"
              />
            </div>

            <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-3">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Venue
                </div>
                <div className="mt-2 truncate text-base font-bold sm:text-lg">
                  {detail.venue || "TBC"}
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Referee
                </div>
                <div className="mt-2 truncate text-base font-bold sm:text-lg">
                  {detail.referee || "TBC"}
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Status
                </div>
                <div className="mt-2 truncate text-base font-bold sm:text-lg">
                  {detail.status}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid min-w-0 gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-xl sm:rounded-3xl">
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Statistics
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              {detail.statistics.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-400">
                  Statistics will appear once the match is live.
                </div>
              ) : (
                <div className="space-y-4">
                  {detail.statistics.map((team) => (
                    <div
                      key={team.teamName}
                      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-3 flex min-w-0 items-center gap-2 font-bold">
                        {team.teamLogo ? (
                          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/5">
                            <Image
                              src={team.teamLogo}
                              alt={team.teamName}
                              fill
                              sizes="28px"
                              className="object-contain p-1"
                            />
                          </div>
                        ) : null}
                        <span className="min-w-0 truncate">
                          {team.teamName}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        {Object.entries(team.stats).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2"
                          >
                            <span className="min-w-0 truncate text-slate-300">
                              {key}
                            </span>
                            <span className="shrink-0 font-semibold text-white">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-xl sm:rounded-3xl">
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Lineups
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              {detail.lineups.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-400">
                  Confirmed lineups usually appear around 60–75 minutes before
                  kick-off, depending on the competition and data availability.
                </div>
              ) : (
                <div className="space-y-4">
                  {detail.lineups.map((lineup) => (
                    <div
                      key={lineup.teamName}
                      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-3 flex min-w-0 items-center gap-2 font-bold">
                        {lineup.teamLogo ? (
                          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/5">
                            <Image
                              src={lineup.teamLogo}
                              alt={lineup.teamName}
                              fill
                              sizes="28px"
                              className="object-contain p-1"
                            />
                          </div>
                        ) : null}
                        <span className="min-w-0 truncate">
                          {lineup.teamName}
                        </span>
                      </div>

                      <div className="mb-3 break-words text-sm text-slate-400">
                        Formation: {lineup.formation || "—"} • Coach:{" "}
                        {lineup.coach || "—"}
                      </div>

                      <div className="grid min-w-0 gap-4 md:grid-cols-2">
                        <div className="min-w-0">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Starting XI
                          </div>
                          <div className="space-y-2">
                            {lineup.startXI.map((player, index) => (
                              <div
                                key={`${lineup.teamName}-start-${index}`}
                                className="break-words rounded-lg bg-black/20 px-3 py-2 text-sm"
                              >
                                {player}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Substitutes
                          </div>
                          <div className="space-y-2">
                            {lineup.substitutes.map((player, index) => (
                              <div
                                key={`${lineup.teamName}-sub-${index}`}
                                className="break-words rounded-lg bg-black/20 px-3 py-2 text-sm"
                              >
                                {player}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-xl sm:mt-6 sm:rounded-3xl">
          <div className="border-b border-white/10 px-4 py-4 sm:px-5">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Match Events
            </h2>
          </div>

          <div className="p-4 sm:p-5">
            {detail.events.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-400">
                Match events will appear once the game starts.
              </div>
            ) : (
              <div className="space-y-3">
                {detail.events.map((event, index) => (
                  <div
                    key={`${event.time}-${event.type}-${index}`}
                    className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 break-words text-sm font-bold text-white">
                        {event.time} • {event.teamName}
                      </div>
                      <div className="shrink-0 text-xs font-semibold uppercase tracking-wide text-red-400">
                        {event.type}
                      </div>
                    </div>

                    <div className="mt-2 break-words text-sm text-slate-300">
                      {event.detail}
                    </div>

                    {event.playerName ? (
                      <div className="mt-2 break-words text-xs text-slate-500">
                        Player: {event.playerName}
                        {event.assistName
                          ? ` • Assist: ${event.assistName}`
                          : ""}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}