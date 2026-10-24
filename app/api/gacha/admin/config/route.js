import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  hasBirthdaySession,
  isTrustedOrigin,
} from "@/lib/gacha-admin";

const DEFAULT_CONFIG = {
  special_threshold: 30,
  special_start_roll: 21,
  special_guaranteed_roll: 25,
};

function unauthorized() {
  return NextResponse.json(
    { error: "Bạn không có quyền thực hiện thao tác này" },
    { status: 403 }
  );
}

async function checkAdmin() {
  return await hasBirthdaySession();
}

// Lấy cấu hình và tiến độ hiện tại
export async function GET() {
  if (!(await checkAdmin())) return unauthorized();

  const db = getSupabaseAdmin();

  const [configResult, progressResult] = await Promise.all([
    db.from("gacha_config").select("*").eq("id", 1).single(),
    db
      .from("gacha_roll_progress")
      .select("roll_count, special_won")
      .eq("id", 1)
      .single(),
  ]);

  if (configResult.error || progressResult.error) {
    return NextResponse.json(
      {
        error:
          configResult.error?.message ||
          progressResult.error?.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    config: configResult.data,
    progress: progressResult.data,
    defaults: DEFAULT_CONFIG,
  });
}

// Lưu cấu hình
export async function PUT(request) {
  if (!(await checkAdmin()) || !isTrustedOrigin(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);

  const threshold = Number(body?.special_threshold);
  const startRoll = Number(body?.special_start_roll);
  const guaranteedRoll = Number(body?.special_guaranteed_roll);

  if (
    !Number.isFinite(threshold) ||
    threshold <= 0 ||
    threshold > 100 ||
    !Number.isInteger(startRoll) ||
    startRoll < 1 ||
    !Number.isInteger(guaranteedRoll) ||
    guaranteedRoll < startRoll
  ) {
    return NextResponse.json(
      { error: "Cấu hình không hợp lệ" },
      { status: 400 }
    );
  }

  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("gacha_config")
    .update({
      special_threshold: threshold,
      special_start_roll: startRoll,
      special_guaranteed_roll: guaranteedRoll,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ config: data });
}

// Reset cấu hình hoặc reset lượt quay
export async function POST(request) {
  if (!(await checkAdmin()) || !isTrustedOrigin(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;

  const db = getSupabaseAdmin();

  if (action === "reset_config") {
    const { data, error } = await db
      .from("gacha_config")
      .update({
        ...DEFAULT_CONFIG,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ config: data });
  }

  if (action === "reset_progress") {
    const { data, error } = await db
      .from("gacha_roll_progress")
      .update({
        roll_count: 0,
        special_won: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select("roll_count, special_won")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress: data });
  }

  return NextResponse.json(
    { error: "Thao tác không hợp lệ" },
    { status: 400 }
  );
}