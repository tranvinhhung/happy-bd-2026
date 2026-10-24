import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { hasBirthdaySession } from "@/lib/gacha-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const authenticated = await hasBirthdaySession();

        if (!authenticated) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from("gacha_types")
            .select("id, name")
            .eq("is_active", true)
            .order("name");

        if (error) {
            console.error("Supabase gacha_types:", error);

            return NextResponse.json(
                { error: "Không lấy được danh sách loại Gacha" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { types: data ?? [] },
            {
                headers: {
                    "Cache-Control": "private, no-store",
                },
            }
        );
    } catch (error) {
        console.error("GET /api/gacha/types:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}