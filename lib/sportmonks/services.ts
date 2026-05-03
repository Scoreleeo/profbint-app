import "server-only";

const BASE_URL = "https://api.sportmonks.com/v3/football";

function getApiKey() {
  const key = process.env.SPORTMONKS_API_KEY;

  if (!key) {
    throw new Error("SPORTMONKS_API_KEY is missing");
  }

  return key;
}

function formatSportmonksDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getUpcomingDateRange() {
  const startDate = new Date();
  const endDate = new Date();

  endDate.setDate(startDate.getDate() + 60);

  return {
    start: formatSportmonksDate(startDate),
    end: formatSportmonksDate(endDate),
  };
}

async function fetchSportmonks(
  endpoint: string,
  params?: Record<string, string>
) {
  const apiKey = getApiKey();

  const url = new URL(`${BASE_URL}${endpoint}`);

  url.searchParams.set("api_token", apiKey);

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(paramKey, value);
      }
    });
  }

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Sportmonks error: ${res.status} - ${text}`);
    }

    return res.json();
  } catch (error) {
    console.error("Sportmonks fetch failed:", {
      endpoint,
      params,
      error,
    });

    throw error;
  }
}

export async function getUpcomingFixtures(leagueId: number) {
  return fetchSportmonks("/fixtures", {
    filters: `fixtureLeagues:${leagueId}`,
    include: "participants;participants.team;league;state;venue",
  });
}

export async function getLiveFixtures() {
  return fetchSportmonks("/livescores", {
    include: "participants;league;state;venue",
  });
}

export async function getFixturesByDate(date: string) {
  return fetchSportmonks(`/fixtures/date/${date}`, {
    include: "participants;league;state;venue",
  });
}