import "server-only";

const BASE_URL = "https://api.sportmonks.com/v3/football";

function getApiKey() {
  const key = process.env.SPORTMONKS_API_KEY;

  if (!key) {
    throw new Error("SPORTMONKS_API_KEY is missing");
  }

  return key;
}

async function fetchSportmonks(
  endpoint: string,
  params?: Record<string, string>
) {
  const apiKey = getApiKey();

  const url = new URL(`${BASE_URL}${endpoint}`);

  // Auth
  url.searchParams.set("api_token", apiKey);

  // Optional query params
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

    const json = await res.json();

    return json;
  } catch (error) {
    console.error("Sportmonks fetch failed:", {
      endpoint,
      params,
      error,
    });

    throw error;
  }
}

// ✅ Upcoming fixtures (primary integration endpoint)
export async function getUpcomingFixtures(leagueId: number) {
  return fetchSportmonks("/fixtures", {
    filters: `fixtureLeagues:${leagueId}`,
    include: "participants;league;state;venue",
  });
}

// (Future-ready placeholders — DO NOT use yet, but ready when we expand)

export async function getLiveFixtures() {
  return fetchSportmonks("/livescores", {
    include: "participants;league;state;venue",
  });
}

export async function getFixturesByDate(date: string) {
  return fetchSportmonks("/fixtures/date/" + date, {
    include: "participants;league;state;venue",
  });
}