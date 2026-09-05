import "server-only";
import { apiFootballFetch } from "./client";

export async function fetchStandingsRaw(league: number, season: number) {
  return apiFootballFetch<any>("/standings", { league, season }, 60 * 15);
}

export async function fetchFixturesRaw(
  league: number,
  season: number,
  status?: string
) {
  const params: Record<string, string | number> = { league, season };

  if (status) {
    params.status = status;
  }

  return apiFootballFetch<any>("/fixtures", params, 60 * 5);
}

export async function fetchTeamFixturesRaw(
  team: number,
  league: number,
  season: number
) {
  return apiFootballFetch<any>(
    "/fixtures",
    { team, league, season },
    60 * 5
  );
}

export async function fetchLiveRaw() {
  return apiFootballFetch<any>("/fixtures", { live: "all" }, 15);
}

export async function fetchTeamInjuriesRaw(
  team: number,
  league: number,
  season: number
) {
  return apiFootballFetch<any>(
    "/injuries",
    { team, league, season },
    60 * 30
  );
}

export async function fetchTransfersRaw(team: number) {
  return apiFootballFetch<any>("/transfers", { team }, 60 * 60 * 6);
}

export async function fetchFixtureByIdRaw(fixture: number) {
  return apiFootballFetch<any>("/fixtures", { id: fixture }, 60 * 2);
}

export async function fetchFixtureEventsRaw(fixture: number) {
  return apiFootballFetch<any>(
    "/fixtures/events",
    { fixture },
    60 * 2
  );
}

export async function fetchFixtureStatisticsRaw(fixture: number) {
  return apiFootballFetch<any>(
    "/fixtures/statistics",
    { fixture },
    60 * 2
  );
}

export async function fetchFixtureLineupsRaw(fixture: number) {
  return apiFootballFetch<any>(
    "/fixtures/lineups",
    { fixture },
    60 * 2
  );
}