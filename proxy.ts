import { NextRequest, NextResponse } from "next/server";

const PRIVATE_SITE_COOKIE = "profbint_private_access";

async function createPrivateToken(password: string) {
  const data = new TextEncoder().encode(
    `profbint-private:${password}`,
  );

  const digest = await crypto.subtle.digest(
    "SHA-256",
    data,
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) =>
      byte.toString(16).padStart(2, "0"),
    )
    .join("");
}

export async function proxy(request: NextRequest) {
  const password =
    process.env.PRIVATE_SITE_PASSWORD;

  if (!password) {
    return NextResponse.redirect(
      new URL(
        "/private-access?error=config",
        request.url,
      ),
    );
  }

  const cookieValue =
    request.cookies.get(
      PRIVATE_SITE_COOKIE,
    )?.value ?? "";

  if (cookieValue) {
    const expectedToken =
      await createPrivateToken(password);

    if (cookieValue === expectedToken) {
      return NextResponse.next();
    }
  }

  const loginUrl = new URL(
    "/private-access",
    request.url,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!api|private-access|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};