import { NextResponse } from "next/server";
import { readContent } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  const content = await readContent();
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
