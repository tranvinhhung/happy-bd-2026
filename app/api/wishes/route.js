
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyBirthdaySession } from "@/lib/session";
import { wishRateLimit } from "@/lib/wish-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WISH_LENGTH = 200;
const MAX_VISIBLE_WISHES = 12;

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("birthday_session")?.value;

  return verifyBirthdaySession(token);
}

function formatWish(row) {
  return {
    id: row.id,
    text: row.message,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return json(
      { message: "Bạn cần mở khóa website trước." },
      401
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("birthday_wishes")
      .select("id, message, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_VISIBLE_WISHES);

    if (error) throw error;

    return json({
      wishes: (data || []).reverse().map(formatWish),
    });
  } catch (error) {
    console.error("GET wishes error:", error);

    return json(
      { message: "Không thể tải danh sách điều ước." },
      500
    );
  }
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return json(
      { message: "Bạn cần mở khóa website trước." },
      401
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ message: "Dữ liệu không hợp lệ." }, 400);
  }

  const message =
    typeof body?.message === "string"
      ? body.message.trim()
      : "";

  if (!message || message.length > MAX_WISH_LENGTH) {
    return json(
      { message: "Điều ước phải từ 1 đến 200 ký tự." },
      400
    );
  }

  try {
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ||
      "unknown";

    const limit = await wishRateLimit.limit(`ip:${ip}`);

    if (!limit.success) {
      return json(
        { message: "Bạn đã gửi nhiều điều ước. Hãy thử lại sau nhé ♡" },
        429
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("birthday_wishes")
      .insert({ message })
      .select("id, message, created_at")
      .single();

    if (error) throw error;

    return json(
      { wish: formatWish(data) },
      201
    );
  } catch (error) {
    console.error("POST wishes error:", error);

    return json(
      { message: "Không thể lưu điều ước. Hãy thử lại." },
      500
    );
  }
}
