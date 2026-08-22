import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const PRIVATE_SITE_COOKIE = "profbint_private_access";

const PRIVATE_SITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getPrivatePassword() {
  const password = process.env.PRIVATE_SITE_PASSWORD;

  if (!password) {
    throw new Error(
      "PRIVATE_SITE_PASSWORD is not configured.",
    );
  }

  return password;
}

function createPrivateToken(password: string) {
  return createHash("sha256")
    .update(`profbint-private:${password}`)
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyPrivatePassword(candidate: string) {
  return safeEqual(
    candidate,
    getPrivatePassword(),
  );
}

export async function isPrivateSiteAuthenticated() {
  const cookieStore = await cookies();

  const cookieValue =
    cookieStore.get(PRIVATE_SITE_COOKIE)?.value ?? "";

  if (!cookieValue) {
    return false;
  }

  const expectedToken = createPrivateToken(
    getPrivatePassword(),
  );

  return safeEqual(cookieValue, expectedToken);
}

export async function createPrivateSiteSession() {
  const cookieStore = await cookies();

  const token = createPrivateToken(
    getPrivatePassword(),
  );

  cookieStore.set(PRIVATE_SITE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PRIVATE_SITE_COOKIE_MAX_AGE,
  });
}

export async function destroyPrivateSiteSession() {
  const cookieStore = await cookies();

  cookieStore.set(PRIVATE_SITE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}