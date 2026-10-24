
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  isGachaAdmin,
  isTrustedOrigin,
} from "@/lib/gacha-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function respond(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function authorize(request, mutation = false) {
  if (!(await isGachaAdmin())) {
    return respond({ error: "Unauthorized" }, 401);
  }

  if (mutation && !isTrustedOrigin(request)) {
    return respond({ error: "Forbidden" }, 403);
  }

  return null;
}

async function readBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new Error("INVALID_BODY");
  }

  const raw = await request.text();

  if (new TextEncoder().encode(raw).length > 8192) {
    throw new Error("BODY_TOO_LARGE");
  }

  return JSON.parse(raw);
}

function validateItem(body) {
  const title =
    typeof body?.title === "string"
      ? body.title.trim()
      : "";

  const message =
    typeof body?.message === "string"
      ? body.message.trim()
      : "";

  const emoji =
    typeof body?.emoji === "string"
      ? body.emoji.trim() || "💌"
      : "💌";

  const probability = Number(body?.probability ?? 100);

  if (
    title.length < 1 ||
    title.length > 120 ||
    message.length < 1 ||
    message.length > 1000 ||
    emoji.length > 20 ||
    !UUID.test(body?.type_id || "") ||
    typeof body?.is_active !== "boolean" ||
    !Number.isFinite(probability) ||
    probability < 0 ||
    probability > 100 ||
    Math.round(probability * 100) !== probability * 100
  ) {
    return null;
  }

  return {
    title,
    message,
    emoji,
    type_id: body.type_id,
    is_active: body.is_active,
    probability,
  };
}

function validateType(body) {
  if (typeof body.name !== "string") {
    return null;
  }

  const name = body.name.trim();

  if (!name || name.length > 80) {
    return null;
  }

  if (typeof body.is_active !== "boolean") {
    return null;
  }

  return {
    name,
    is_active: body.is_active,
  };
}

function dbError(error) {
  if (error.code === "23505") {
    return respond({ error: "Tên hoặc slug đã tồn tại" }, 409);
  }

  if (error.code === "23503") {
    return respond(
      { error: "Loại Gacha đang được sử dụng hoặc không tồn tại" },
      409
    );
  }

  console.error("Gacha admin DB error:", error);
  return respond({ error: "Lỗi database" }, 500);
}

export async function GET(request) {
  const denied = await authorize(request);
  if (denied) return denied;

  const db = getSupabaseAdmin();

  const [types, items] = await Promise.all([
    db.from("gacha_types")
      .select("*")
      .order("name"),

    db.from("gacha_items")
      .select("*, gacha_types(name)")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (types.error) return dbError(types.error);
  if (items.error) return dbError(items.error);

  return respond({
    types: types.data,
    items: items.data,
  });
}

export async function POST(request) {
  const denied = await authorize(request, true);
  if (denied) return denied;

  let body;
  try {
    body = await readBody(request);
  } catch {
    return respond({ error: "Body không hợp lệ" }, 400);
  }

  const db = getSupabaseAdmin();

  if (body.entity === "type") {
    const value = validateType(body);
    if (!value) return respond({ error: "Tên không hợp lệ" }, 400);

    const slug = `type-${crypto.randomUUID()}`;

    const { data, error } = await db
      .from("gacha_types")
      .insert({ ...value, slug })
      .select()
      .single();

    if (error) return dbError(error);
    return respond({ item: data }, 201);
  }

  if (body.entity === "item") {
    const value = validateItem(body);
    if (!value) return respond({ error: "Gacha không hợp lệ" }, 400);

    const { data, error } = await db
      .from("gacha_items")
      .insert(value)
      .select()
      .single();

    if (error) return dbError(error);
    return respond({ item: data }, 201);
  }

  return respond({ error: "Entity không hợp lệ" }, 400);
}

export async function PATCH(request) {
  const denied = await authorize(request, true);
  if (denied) return denied;

  let body;
  try {
    body = await readBody(request);
  } catch {
    return respond({ error: "Body không hợp lệ" }, 400);
  }

  if (!UUID.test(body.id || "")) {
    return respond({ error: "ID không hợp lệ" }, 400);
  }

  const db = getSupabaseAdmin();

  if (body.entity === "type") {
    const value = validateType(body);
    if (!value) return respond({ error: "Tên không hợp lệ" }, 400);

    const { data, error } = await db
      .from("gacha_types")
      .update(value)
      .eq("id", body.id)
      .select()
      .maybeSingle();

    if (error) return dbError(error);
    if (!data) return respond({ error: "Không tìm thấy" }, 404);

    return respond({ item: data });
  }

  if (body.entity === "item") {
    const value = validateItem(body);
    if (!value) return respond({ error: "Gacha không hợp lệ" }, 400);

    const { data, error } = await db
      .from("gacha_items")
      .update(value)
      .eq("id", body.id)
      .select()
      .maybeSingle();

    if (error) return dbError(error);
    if (!data) return respond({ error: "Không tìm thấy" }, 404);

    return respond({ item: data });
  }

  return respond({ error: "Entity không hợp lệ" }, 400);
}

export async function DELETE(request) {
  const denied = await authorize(request, true);
  if (denied) return denied;

  let body;
  try {
    body = await readBody(request);
  } catch {
    return respond({ error: "Body không hợp lệ" }, 400);
  }

  if (!UUID.test(body.id || "")) {
    return respond({ error: "ID không hợp lệ" }, 400);
  }

  const table =
    body.entity === "type"
      ? "gacha_types"
      : body.entity === "item"
        ? "gacha_items"
        : null;

  if (!table) {
    return respond({ error: "Entity không hợp lệ" }, 400);
  }

  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from(table)
    .delete()
    .eq("id", body.id)
    .select("id")
    .maybeSingle();

  if (error) return dbError(error);
  if (!data) return respond({ error: "Không tìm thấy" }, 404);

  return respond({ success: true });
}
