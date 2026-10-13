import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { verifyBirthdaySession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_DIRECTORY = path.join(
    process.cwd(),
    "birthday-private"
);

const MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
};

export async function GET(request, { params }) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("birthday_session")?.value;

        if (!session || !verifyBirthdaySession(session)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { path: segments } = await params;

        if (
            !Array.isArray(segments) ||
            segments.length === 0 ||
            segments.some(
                (segment) =>
                    !segment ||
                    segment === "." ||
                    segment === ".." ||
                    segment.includes("/") ||
                    segment.includes("\\") ||
                    segment.includes("\0")
            )
        ) {
            return NextResponse.json(
                { error: "Invalid image path" },
                { status: 400 }
            );
        }

        const relativePath = segments.join("/");
        const extension = path.extname(relativePath).toLowerCase();
        const contentType = MIME_TYPES[extension];

        if (!contentType) {
            return NextResponse.json(
                { error: "Unsupported file type" },
                { status: 415 }
            );
        }

        const imagePath = path.resolve(
            IMAGE_DIRECTORY,
            ...segments
        );

        // Không cho phép truy cập ra ngoài thư mục ảnh
        const relative = path.relative(
            IMAGE_DIRECTORY,
            imagePath
        );

        if (
            relative.startsWith("..") ||
            path.isAbsolute(relative)
        ) {
            return NextResponse.json(
                { error: "Invalid image path" },
                { status: 400 }
            );
        }

        let imageBuffer;

        try {
            imageBuffer = await readFile(imagePath);
        } catch (error) {
            if (error.code === "ENOENT") {
                return NextResponse.json(
                    { error: "Image not found" },
                    { status: 404 }
                );
            }

            throw error;
        }

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, no-store",
                "X-Content-Type-Options": "nosniff",
                "Content-Disposition": "inline",
            },
        });
    } catch (error) {
        console.error("Private image error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
