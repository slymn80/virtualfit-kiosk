import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId") ?? "store_default";

  const gender = searchParams.get("gender");

  const categories = await db.productCategory.findMany({
    where: { storeId, isActive: true, ...(gender ? { gender } : {}) },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const category = await db.productCategory.create({ data });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
