import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";
import { verifyBirthdaySession } from "@/lib/session";

const COOKIE_NAME = "gacha_admin";
const MAX_AGE = 60 * 60 * 2;

function secret() {
  const value = process.env.GACHA_ADMIN_SECRET;

  if (!value || value.length < 32) {
    throw new Error("Invalid GACHA_ADMIN_SECRET");
  }

  return value;
}

function sign(value) {
  return createHmac("sha256", secret())
    .update(value)
    .digest("hex");
}

export function checkAdminPassword(password) {
  const expected = process.env.GACHA_ADMIN_PASSWORD;

  if (!expected || expected.length < 16) {
    throw new Error("Invalid GACHA_ADMIN_PASSWORD");
  }

  if (typeof password !== "string") return false;

  const receivedHash = createHmac("sha256", secret())
    .update(password)
    .digest();

  const expectedHash = createHmac("sha256", secret())
    .update(expected)
    .digest();

  return timingSafeEqual(receivedHash, expectedHash);
}

export function createAdminToken() {
  const expiresAt = Date.now() + MAX_AGE * 1000;
  const payload = String(expiresAt);

  return `${payload}.${sign(payload)}`;
}

export async function hasBirthdaySession() {
  const store = await cookies();
  const token = store.get("birthday_session")?.value;

  if (!token) return false;

  try {
    return Boolean(await verifyBirthdaySession(token));
  } catch {
    return false;
  }
}

export async function isGachaAdmin() {
  if (!(await hasBirthdaySession())) return false;

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) return false;

  const [payload, signature, extra] = token.split(".");

  if (extra !== undefined || !payload || !signature) {
    return false;
  }

  const expiresAt = Number(payload);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    return false;
  }

  const expected = Buffer.from(sign(payload), "hex");
  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export function isTrustedOrigin(request) {
  const origin = request.headers.get("origin");
  const allowed = process.env.APP_ORIGIN;

  return Boolean(origin && allowed && origin === allowed);
}