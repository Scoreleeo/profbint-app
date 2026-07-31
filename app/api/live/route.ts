import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/api-football/services";

export const dynamic = "force-dynamic";

// API-Football league IDs
const SUPPORTED_LEAGUE_IDS = new Set<number>([
  39, // Premier League (England)
  140, // La Liga
  135, // Serie A
  78, // Bundesliga
  61, // Ligue 1
  88, // Eredivisie
  94, // Primeira Liga
]);

export async function GET() {
  try {
    const matches = await getLiveMatches();

    const liveMatches = matches.filter(
      (match) => match.leagueId && SUPPORTED_LEAGUE_IDS.has(match.leagueId)
    );

    return NextResponse.json(
      {
        live: liveMatches,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("LIVE MATCHES API ERROR:", error);

    return NextResponse.json(
      {
        live: [],
        updatedAt: new Date().toISOString(),
        error: "Failed to fetch live matches",
      },
      { status: 500 }
    );
  }
}