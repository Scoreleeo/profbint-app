import { NextRequest, NextResponse } from "next/server";

const CHECKOUT_VALIDATE_URL =
  "https://checkout.profbint.com/api/unlock/validate";

export async function GET(request: NextRequest) {
  const unlockReference = request.nextUrl.searchParams.get("ref");
  const fixtureId = request.nextUrl.searchParams.get("fixtureId");

  if (!unlockReference) {
    return NextResponse.json(
      { valid: false, error: "Missing unlock reference." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams();
  params.set("ref", unlockReference);

  if (fixtureId) {
    params.set("fixtureId", fixtureId);
  }

  try {
    const response = await fetch(`${CHECKOUT_VALIDATE_URL}?${params.toString()}`, {
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Public unlock validation proxy error:", error);

    return NextResponse.json(
      { valid: false, error: "Unable to validate unlock reference." },
      { status: 500 },
    );
  }
}