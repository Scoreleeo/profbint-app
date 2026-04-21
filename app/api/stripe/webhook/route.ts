import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Stripe disabled temporarily" },
    { status: 503 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Stripe disabled temporarily" },
    { status: 503 }
  );
}