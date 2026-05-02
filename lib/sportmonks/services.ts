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

  // required auth
  url.searchParams.set("api_token", apiKey);

  // optional params (clean + expandable)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Sportmonks error: ${res.status}`);
  }

  return res.json();
}

// ✅ Upcoming fixtures (first integration target)
export async function getUpcomingFixtures(leagueId: number) {
  return fetchSportmonks(`/fixtures`, {
    "filter[league_id]": String(leagueId),
    "filter[status]": "NS",
    include: "participants;league;state;venue",
  });
}