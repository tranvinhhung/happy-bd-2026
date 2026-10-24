
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { hasBirthdaySession } from "@/lib/gacha-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await hasBirthdaySession())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("gacha_roll_progress")
    .select("roll_count")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Gacha progress:", error);

    return NextResponse.json(
      { error: "Không tải được tiến độ" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      roll_count: data.roll_count,
      min_rolls_for_special: 20,
      special_unlocked: data.roll_count >= 20,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
