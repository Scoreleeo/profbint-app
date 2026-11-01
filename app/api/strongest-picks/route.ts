import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type StrongestPick = {
  fixtureId: number;
  date: string;
  league: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  pick: "HOME" | "AWAY";
};

type StrongestPicksPayload = {
  date: string;
  total: number;
  picks: StrongestPick[];
};

export async function GET() {
  const apiUrl = process.env.STRONGEST_PICKS_API_URL?.trim();
  const apiSecret = process.env.STRONGEST_PICKS_API_SECRET?.trim();

  if (!apiUrl || !apiSecret) {
    return NextResponse.json(
      { error: "Strongest Picks service is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-strongest-picks-key": apiSecret,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to load Strongest Picks." },
        { status: response.status },
      );
    }

    const data = (await response.json()) as StrongestPicksPayload;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Strongest Picks proxy error:", error);

    return NextResponse.json(
      { error: "Unable to load Strongest Picks." },
      { status: 500 },
    );
  }
}
