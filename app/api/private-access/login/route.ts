import { NextRequest, NextResponse } from "next/server";

import {
  createPrivateSiteSession,
  verifyPrivatePassword,
} from "@/lib/private-site-auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const password = String(
      formData.get("password") ?? "",
    );

    if (!password || !verifyPrivatePassword(password)) {
      return NextResponse.redirect(
        new URL("/private-access?error=invalid", request.url),
        303,
      );
    }

    await createPrivateSiteSession();

    return NextResponse.redirect(
      new URL("/", request.url),
      303,
    );
  } catch (error) {
    console.error("PRIVATE SITE LOGIN ERROR:", error);

    return NextResponse.redirect(
      new URL("/private-access?error=config", request.url),
      303,
    );
  }
}