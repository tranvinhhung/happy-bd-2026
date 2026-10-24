import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  isGachaAdmin,
  isTrustedOrigin,
} from "@/lib/gacha-admin";

export const runtime = "nodejs";

export async function PATCH(request) {
  if (!(await isGachaAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const raw = await request.text();

    if (Buffer.byteLength(raw, "utf8") > 8192) {
      return NextResponse.json(
        { error: "Dữ liệu quá lớn" },
        { status: 413 }
      );
    }

    const { probabilities } = JSON.parse(raw);

    if (
      !Array.isArray(probabilities) ||
      probabilities.length === 0 ||
      probabilities.length > 100
    ) {
      return NextResponse.json(
        { error: "Danh sách tỉ lệ không hợp lệ" },
        { status: 400 }
      );
    }

    const valid = probabilities.every(
      (item) =>
        typeof item.id === "string" &&
        typeof item.probability === "number" &&
        Number.isFinite(item.probability) &&
        item.probability >= 0 &&
        item.probability <= 100 &&
        Number.isInteger(item.probability * 100)
    );

    const uniqueIds = new Set(
      probabilities.map((item) => item.id)
    );

    const total = probabilities.reduce(
      (sum, item) => sum + Math.round(item.probability * 100),
      0
    );

    if (
      !valid ||
      uniqueIds.size !== probabilities.length ||
      total !== 10000
    ) {
      return NextResponse.json(
        { error: "Tổng tỉ lệ phải bằng 100%" },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();

    // Cần đảm bảo không bỏ sót loại nào.
    const { data: types, error: fetchError } = await db
      .from("gacha_types")
      .select("id");

    if (fetchError) throw fetchError;

    const databaseIds = new Set(types.map((type) => type.id));

    if (
      databaseIds.size !== uniqueIds.size ||
      [...uniqueIds].some((id) => !databaseIds.has(id))
    ) {
      return NextResponse.json(
        { error: "Danh sách loại Gacha đã thay đổi. Hãy tải lại." },
        { status: 409 }
      );
    }

    // Ghi chú: RPC bên dưới giúp lưu tất cả tỉ lệ
    // trong một transaction, tránh cập nhật dở dang.
    const { error } = await db.rpc(
      "update_gacha_probabilities",
      { p_probabilities: probabilities }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update probabilities:", error);

    return NextResponse.json(
      { error: "Không thể lưu tỉ lệ" },
      { status: 500 }
    );
  }
}