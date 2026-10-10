
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";

export const runtime = "nodejs";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export async function POST(request: NextRequest) {
  const { answer } = await request.json();

  const correctAnswer = process.env.BIRTHDAY_SECRET_ANSWER;
  const secret = process.env.BIRTHDAY_SESSION_SECRET;

  if (!correctAnswer || !secret) {
    return NextResponse.json(
      { message: "Server chưa được cấu hình." },
      { status: 500 }
    );
  }

  if (
    typeof answer !== "string" ||
    normalize(answer) !== normalize(correctAnswer)
  ) {
    return NextResponse.json(
      { message: "Chưa đúng rồi, thử lại nhé ♡" },
      { status: 401 }
    );
  }

  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = String(expiresAt);

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const token = `${payload}.${signature}`;

  const response = NextResponse.json({ success: true });

  response.cookies.set("birthday_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
