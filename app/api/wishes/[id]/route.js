
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyBirthdaySession } from "@/lib/session";

export const runtime = "nodejs";

function safeCompare(a, b) {
    const key = process.env.BIRTHDAY_SESSION_SECRET;

    if (!key || !a || !b) return false;

    const hash = (value) =>
        createHmac("sha256", key).update(value).digest();

    return timingSafeEqual(hash(a), hash(b));
}

export async function DELETE(request, { params }) {
    if (process.env.VERCEL_ENV === "production") {
        return NextResponse.json(
            { message: "Chức năng xóa bị vô hiệu hóa trên Production." },
            { status: 403 }
        );
    }

    const cookieStore = await cookies();

    const session = cookieStore.get("birthday_session")?.value;

    if (!verifyBirthdaySession(session)) {
        return NextResponse.json(
            { message: "Bạn chưa mở khóa website." },
            { status: 401 }
        );
    }

    const adminSecret = request.headers.get("x-admin-secret");

    if (
        !safeCompare(
            adminSecret,
            process.env.BIRTHDAY_ADMIN_SECRET
        )
    ) {
        return NextResponse.json(
            { message: "Bạn không có quyền xóa điều ước." },
            { status: 403 }
        );
    }

    const { id } = await params;

    if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ) {
        return NextResponse.json(
            { message: "ID điều ước không hợp lệ." },
            { status: 400 }
        );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("birthday_wishes")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("Delete wish error:", error.message);

        return NextResponse.json(
            { message: "Không thể xóa điều ước." },
            { status: 500 }
        );
    }

    if (!data) {
        return NextResponse.json(
            { message: "Không tìm thấy điều ước." },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        deletedId: id,
    });
}
