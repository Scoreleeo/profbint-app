import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = process.env.STRONGEST_PICKS_HISTORY_API_URL?.trim();
  const apiSecret = process.env.STRONGEST_PICKS_HISTORY_SECRET?.trim();

  if (!apiUrl || !apiSecret) {
    return NextResponse.json(
      { error: "Strongest Picks history service is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-strongest-picks-history-key": apiSecret,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to load Strongest Picks history." },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Strongest Picks history proxy error:", error);

    return NextResponse.json(
      { error: "Unable to load Strongest Picks history." },
      { status: 500 },
    );
  }
}
