
import { NextRequest, NextResponse } from "next/server";

async function verifySession(token?: string) {
  const secret = process.env.BIRTHDAY_SESSION_SECRET;

  if (!token || !secret) return false;

  const [expiresAt, signature] = token.split(".");

  if (!expiresAt || !signature) return false;

  const expires = Number(expiresAt);

  if (!Number.isFinite(expires) || Date.now() > expires) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(expiresAt)
  );

  const expectedSignature = Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  // So sánh toàn bộ chuỗi, không dừng tại ký tự khác đầu tiên
  let diff = 0;

  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return diff === 0;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = request.cookies.get("birthday_session")?.value;

  const authenticated = await verifySession(token);

  if (pathname === "/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/happy-birth-day-be-ToHien-2026/:path*",
  ],
};
