import { NextRequest, NextResponse } from "next/server";
import { addQueue } from "@/lib/storage";

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
  const { customer, quantity, deadline, status, notes } = body ?? {};

  if (!customer || !quantity || !status) {
    return NextResponse.json(
      { message: "customer, quantity, and status are required" },
      { status: 400 }
    );
  }

  const parsedQuantity = Number(quantity);
  if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return NextResponse.json(
      { message: "quantity must be a positive number" },
      { status: 400 }
    );
  }

  const queue = await addQueue({
    customer,
    quantity: parsedQuantity,
    deadline,
    status,
    notes,
  });

  return NextResponse.json({ queue });
}
