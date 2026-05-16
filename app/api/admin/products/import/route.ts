import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

interface ImportRow {
  code: string;
  name: string;
  nameTr?: string;
  nameRu?: string;
  nameKk?: string;
  gender?: string;
  categoryId?: string;
  brand?: string;
  color?: string;
  garmentImageUrl: string;
  thumbnailUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { products, storeId = "store_default" } = await req.json() as {
      products: ImportRow[];
      storeId?: string;
    };

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    const errors: { code: string; reason: string }[] = [];

    for (const row of products) {
      if (!row.name || !row.garmentImageUrl) {
        errors.push({ code: row.code ?? "?", reason: "Missing name or garmentImageUrl" });
        continue;
      }

      try {
        const data = {
          storeId,
          code: row.code || null,
          name: row.name,
          nameTr: row.nameTr || null,
          nameRu: row.nameRu || null,
          nameKk: row.nameKk || null,
          nameEn: row.name,
          gender: row.gender ?? "women",
          categoryId: row.categoryId || null,
          brand: row.brand || null,
          color: row.color || null,
          garmentImageUrl: row.garmentImageUrl,
          thumbnailUrl: row.thumbnailUrl || row.garmentImageUrl,
          isActive: true,
        };

        if (row.code) {
          // Upsert by code
          const existing = await db.product.findFirst({
            where: { storeId, code: row.code },
          });

          if (existing) {
            await db.product.update({ where: { id: existing.id }, data });
            updated++;
          } else {
            await db.product.create({ data });
            created++;
          }
        } else {
          await db.product.create({ data });
          created++;
        }
      } catch (err) {
        errors.push({ code: row.code ?? "?", reason: String(err) });
      }
    }

    return NextResponse.json({ created, updated, failed: errors.length, errors });
  } catch (err) {
    console.error("[Import] Error:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
