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
  39: 8,
};

function emptyApiFootballResponse() {
  return {
    response: [],
  };
}

function hasApiFootballRows(data: any) {
  return Array.isArray(data?.response) && data.response.length > 0;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetryIfEmpty(
  label: string,
  fetcher: () => Promise<any>,
  retries = 2
) {
  let lastData: any = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const data = await fetcher();
      lastData = data;

      if (hasApiFootballRows(data)) {
        return data;
      }

      if (attempt < retries) {
        await sleep(700 + attempt * 500);
      }
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await sleep(700 + attempt * 500);
      }
    }
  }

  if (lastData) {
    console.warn(`${label} returned empty after retry.`);
    return lastData;
  }

  console.error(`${label} failed after retry:`, lastError);
  return emptyApiFootballResponse();
}

async function fetchSafe(label: string, fetcher: () => Promise<any>) {
  try {
    return await fetcher();
  } catch (error) {
    console.error(`${label} failed:`, error);
    return emptyApiFootballResponse();
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
  label: string
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((resolve) => {
    timeout = setTimeout(() => {
      console.warn(`${label} timed out after ${ms}ms.`);
      resolve(fallback);
    }, ms);
  });

  const result = await Promise.race([promise, timeoutPromise]);

  if (timeout) {
    clearTimeout(timeout);
  }

  return result;
}

async function getSportmonksFixturesForLeague(leagueId: number) {
  const sportmonksLeagueId = SPORTMONKS_LEAGUE_MAP[leagueId];

  if (!sportmonksLeagueId) {
    return null;
  }

  return withTimeout(
    getSportmonksUpcomingFixtures(sportmonksLeagueId).catch((error) => {
      console.error(
        "Sportmonks fixtures unavailable, using API-Football:",
        error
      );

      return null;
    }),
    3500,
    null,
    "Sportmonks fixtures"
  );
}

export async function getDashboardData(leagueId: number, season: number) {
  const [standingsRaw, fixturesRaw, resultsRaw, liveRaw] = await Promise.all([
    fetchWithRetryIfEmpty("Standings", () =>
      fetchStandingsRaw(leagueId, season)
    ),
    fetchWithRetryIfEmpty("Upcoming fixtures", () =>
      fetchFixturesRaw(leagueId, season, "NS")
    ),
    fetchWithRetryIfEmpty("Latest results", () =>
      fetchFixturesRaw(leagueId, season, "FT")
    ),
    fetchSafe("Live matches", () => fetchLiveRaw()),
  ]);

  const sportmonksFixturesRaw = await getSportmonksFixturesForLeague(leagueId);

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