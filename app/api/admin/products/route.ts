import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId") ?? "store_default";

  const products = await db.product.findMany({
    where: { storeId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const product = await db.product.create({
      data: {
        storeId: data.storeId ?? "store_default",
        code: data.code || null,
        name: data.name,
        nameEn: data.name,
        nameTr: data.nameTr || null,
        nameRu: data.nameRu || null,
        nameKk: data.nameKk || null,
        gender: data.gender ?? "women",
        brand: data.brand,
        color: data.color,
        categoryId: data.categoryId || null,
        garmentImageUrl: data.garmentImageUrl,
        thumbnailUrl: data.thumbnailUrl || data.garmentImageUrl,
        isActive: true,
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    console.error("Product create error:", err);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    const product = await db.product.update({ where: { id }, data });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ deleted: true });
}
