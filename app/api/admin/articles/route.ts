import { NextRequest, NextResponse } from "next/server";
import { addArticle } from "@/lib/storage";

export const runtime = "nodejs";

const ADMIN_KEY =
  process.env.ADMIN_KEY || process.env.NEXT_PUBLIC_ADMIN_KEY || "changeme";

function isAuthorized(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  return token && token === ADMIN_KEY;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, summary, body: articleBody, imageUrl, videoUrl } = body ?? {};

  if (!title || !summary || !articleBody) {
    return NextResponse.json(
      { message: "title, summary, and body are required" },
      { status: 400 }
    );
  }

  const article = await addArticle({
    title,
    summary,
    body: articleBody,
    imageUrl,
    videoUrl,
  });

  return NextResponse.json({ article });
}
