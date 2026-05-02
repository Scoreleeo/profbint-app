import { NextResponse } from "next/server";
import { getSportmonksLeagues } from "@/lib/sportmonks/services";

export async function GET() {
  try {
    const data = await getSportmonksLeagues();

    return NextResponse.json({
      ok: true,
      count: Array.isArray(data?.data) ? data.data.length : 0,
      sample: Array.isArray(data?.data) ? data.data.slice(0, 5) : [],
    });
  } catch (error) {
    console.error("Sportmonks test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Sportmonks test failed",
      },
      { status: 500 }
    );
  }
}