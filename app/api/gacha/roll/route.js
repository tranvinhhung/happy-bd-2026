
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  hasBirthdaySession,
  isTrustedOrigin,
} from "@/lib/gacha-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function respond(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request) {
  if (!(await hasBirthdaySession())) {
    return respond({ error: "Unauthorized" }, 401);
  }

  if (!isTrustedOrigin(request)) {
    return respond({ error: "Forbidden" }, 403);
  }

  let body;

  try {
    const raw = await request.text();

    if (Buffer.byteLength(raw, "utf8") > 2048) {
      return respond({ error: "Dữ liệu quá lớn" }, 413);
    }

    body = JSON.parse(raw);
  } catch {
    return respond({ error: "JSON không hợp lệ" }, 400);
  }

  const typeId = body?.type_id ?? "all";
  const isAll = typeId === "all";

  if (
    !isAll &&
    (typeof typeId !== "string" || !UUID.test(typeId))
  ) {
    return respond(
      { error: "Loại Gacha không hợp lệ" },
      400
    );
  }

  try {
    const db = getSupabaseAdmin();

    const { data, error } = await db.rpc(
      "roll_birthday_gacha",
      {
        p_type_id: isAll ? null : typeId,
      }
    );

    if (error) {
      console.error("Gacha RPC:", error);
      return respond(
        { error: "Không thể quay Gacha" },
        500
      );
    }

    if (!data?.prize) {
      return respond(
        {
          error:
            data?.error ||
            "Không có phần thưởng khả dụng",
        },
        404
      );
    }

    return respond(data);
  } catch (error) {
    console.error("Gacha roll:", error);

    return respond(
      { error: "Không thể quay Gacha" },
      500
    );
  }
}
