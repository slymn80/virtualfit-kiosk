import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId") ?? "store_default";
  const categoryId = searchParams.get("categoryId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const where = {
    storeId,
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    pageSize,
    hasMore: total > page * pageSize,
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const product = await db.product.create({ data });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
