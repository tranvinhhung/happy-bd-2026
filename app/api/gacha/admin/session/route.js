import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import {
  adminCookieOptions,
  checkAdminPassword,
  createAdminToken,
  hasBirthdaySession,
  isGachaAdmin,
  isTrustedOrigin,
} from "@/lib/gacha-admin";

export const runtime = "nodejs";

const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "gacha:admin:login",
});

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  return json({ authenticated: await isGachaAdmin() });
}

export async function POST(request) {
  if (!(await hasBirthdaySession())) {
    return json({ error: "Chưa mở khóa website" }, 401);
  }

  if (!isTrustedOrigin(request)) {
    return json({ error: "Forbidden" }, 403);
  }

  // Dùng định danh IP do proxy tin cậy cung cấp.
  // Trên Vercel, cần kiểm soát header tại lớp proxy.
  const ip =
    request.headers.get("x-forwarded-for")
      ?.split(",")[0]?.trim() || "unknown";

  try {
    const rate = await limiter.limit(ip);

    if (!rate.success) {
      return json(
        { error: "Thử quá nhiều lần. Vui lòng đợi 15 phút." },
        429
      );
    }
  } catch {
    return json(
      { error: "Tạm thời không thể xác thực" },
      503
    );
  }

  let body;

  try {
    if (
      Number(request.headers.get("content-length")) > 2048
    ) {
      return json({ error: "Dữ liệu quá lớn" }, 413);
    }

    const raw = await request.text();

    if (new TextEncoder().encode(raw).length > 2048) {
      return json({ error: "Dữ liệu quá lớn" }, 413);
    }

    body = JSON.parse(raw);
  } catch {
    return json({ error: "Dữ liệu không hợp lệ" }, 400);
  }

  if (!checkAdminPassword(body?.password)) {
    return json({ error: "Sai mật khẩu quản lý" }, 401);
  }

  const response = json({ success: true });

  response.cookies.set(
    "gacha_admin",
    createAdminToken(),
    adminCookieOptions()
  );

  return response;
}

export async function DELETE(request) {
  if (!isTrustedOrigin(request)) {
    return json({ error: "Forbidden" }, 403);
  }

  const response = json({ success: true });

  response.cookies.set("gacha_admin", "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });

  return response;
}