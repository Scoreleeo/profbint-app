import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/api-football/services";
import { TOP_EURO_LEAGUES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await getLiveMatches();
    const supportedLeagueNames = new Set<string>(
      TOP_EURO_LEAGUES.map((league) => league.name)
    );

    const liveMatches = matches.filter((match) =>
      supportedLeagueNames.has(match.leagueName)
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