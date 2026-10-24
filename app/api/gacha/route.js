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

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("gacha_items")
    .select(`
    id,
    title,
    message,
    emoji,
    type_id,
    gacha_types!inner (
      id,
      name
    )
  `)
    .eq("is_active", true)
    .eq("gacha_types.is_active", true)
    .limit(200);

  if (error) {
    console.error("Gacha list:", error);

    return NextResponse.json(
      { error: "Không tải được Gacha" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { items: data },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}