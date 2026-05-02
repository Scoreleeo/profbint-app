import "server-only";
import {
  buildDashboardPayload,
  mapFixtureDetailResponse,
  mapFixturesResponse,
  mapStandingsResponse,
} from "./mappers";
import {
  fetchFixtureByIdRaw,
  fetchFixtureEventsRaw,
  fetchFixtureLineupsRaw,
  fetchFixtureStatisticsRaw,
  fetchFixturesRaw,
  fetchLiveRaw,
  fetchStandingsRaw,
  fetchTeamFixturesRaw,
  fetchTeamInjuriesRaw,
  fetchTransfersRaw,
} from "./queries";
import { getUpcomingFixtures as getSportmonksUpcomingFixtures } from "@/lib/sportmonks/services";

const SPORTMONKS_LEAGUE_MAP: Record<number, number> = {
  // API-Football Premier League -> Sportmonks Premier League
  39: 8,
};

async function getSportmonksFixturesForLeague(leagueId: number) {
  const sportmonksLeagueId = SPORTMONKS_LEAGUE_MAP[leagueId];

  if (!sportmonksLeagueId) {
    return null;
  }

  try {
    return await getSportmonksUpcomingFixtures(sportmonksLeagueId);
  } catch (error) {
    console.error("Sportmonks fixtures unavailable, using API-Football:", error);
    return null;
  }
}

export async function getDashboardData(leagueId: number, season: number) {
  const [
    standingsRaw,
    fixturesRaw,
    resultsRaw,
    liveRaw,
    sportmonksFixturesRaw,
  ] = await Promise.all([
    fetchStandingsRaw(leagueId, season),
    fetchFixturesRaw(leagueId, season, "NS"),
    fetchFixturesRaw(leagueId, season, "FT"),
    fetchLiveRaw(),
    getSportmonksFixturesForLeague(leagueId),
  ]);

  const standings = mapStandingsResponse(standingsRaw);
  const teamIds = standings
    .slice(0, 10)
    .map((row) => row.teamId)
    .filter((teamId): teamId is number => Boolean(teamId));

  const [injuryBlocks, transferBlocks] = await Promise.all([
    Promise.allSettled(
      teamIds.map((teamId) => fetchTeamInjuriesRaw(teamId, leagueId, season))
    ),
    Promise.allSettled(teamIds.map((teamId) => fetchTransfersRaw(teamId))),
  ]);

  return buildDashboardPayload({
    standingsRaw,
    fixturesRaw,
    resultsRaw,
    liveRaw,
    sportmonksFixturesRaw,
    injuryBlocks: injuryBlocks.flatMap((item) =>
      item.status === "fulfilled" ? [item.value] : []
    ),
    transferBlocks: transferBlocks.flatMap((item) =>
      item.status === "fulfilled" ? [item.value] : []
    ),
  });
}

export async function getLiveMatches() {
  const raw = await fetchLiveRaw();
  return mapFixturesResponse(raw);
}

export async function getTeamFixtures(
  teamId: number,
  leagueId: number,
  season: number
) {
  const raw = await fetchTeamFixturesRaw(teamId, leagueId, season);
  const matches = mapFixturesResponse(raw);

  const results = matches.filter((match) =>
    ["FT", "AET", "PEN"].includes(match.status)
  );

  const fixtures = matches.filter(
    (match) => !["FT", "AET", "PEN"].includes(match.status)
  );

  return {
    matches,
    results,
    fixtures,
  };
}

export async function getFixtureDetail(fixtureId: number) {
  const [fixtureRaw, eventsRaw, statisticsRaw, lineupsRaw] = await Promise.all([
    fetchFixtureByIdRaw(fixtureId),
    fetchFixtureEventsRaw(fixtureId).catch(() => ({ response: [] })),
    fetchFixtureStatisticsRaw(fixtureId).catch(() => ({ response: [] })),
    fetchFixtureLineupsRaw(fixtureId).catch(() => ({ response: [] })),
  ]);

  return mapFixtureDetailResponse({
    fixtureRaw,
    eventsRaw,
    statisticsRaw,
    lineupsRaw,
  });
}