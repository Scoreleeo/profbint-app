const BASE_URL = "https://api.sportmonks.com/v3/football";

const API_KEY = process.env.SPORTMONKS_API_KEY;

async function fetchSportmonks(endpoint: string) {
  const url = `${BASE_URL}${endpoint}?api_token=${API_KEY}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Sportmonks error: ${res.status}`);
  }

  return res.json();
}

// ✅ Upcoming fixtures (we'll use this first)
export async function getUpcomingFixtures(leagueId: number) {
  return fetchSportmonks(
    `/fixtures/upcoming/leagues/${leagueId}`
  );
}