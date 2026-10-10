
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyBirthdaySession(token) {
  const secret = process.env.BIRTHDAY_SESSION_SECRET;

  if (!secret || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [expiresAt, signature] = parts;

  if (!/^\d{13}$/.test(expiresAt)) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expires = Number(expiresAt);

  if (!Number.isSafeInteger(expires) || expires <= Date.now()) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(expiresAt)
    .digest();

  const provided = Buffer.from(signature, "hex");

  return (
    expected.length === provided.length &&
    timingSafeEqual(expected, provided)
  );
}
