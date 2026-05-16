import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId") ?? "store_default";

  const store = await db.store.findUnique({ where: { id: storeId } });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  return NextResponse.json({
    storeId: store.id,
    name: store.name,
    n8nWebhookUrl: store.n8nWebhookUrl ?? "",
    n8nWebhookSecret: store.n8nWebhookSecret ? "***configured***" : "",
    sessionTtlMinutes: store.sessionTtlMinutes,
    autoDeleteMinutes: store.autoDeleteMinutes,
    defaultLanguage: store.defaultLanguage,
    brandColor: store.brandColor,
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, ...data } = body;

    const updateData: Record<string, unknown> = {};
    if (data.n8nWebhookUrl !== undefined) updateData.n8nWebhookUrl = data.n8nWebhookUrl;
    if (data.n8nWebhookSecret && data.n8nWebhookSecret !== "***configured***") {
      updateData.n8nWebhookSecret = data.n8nWebhookSecret;
    }
    if (data.sessionTtlMinutes !== undefined) updateData.sessionTtlMinutes = parseInt(data.sessionTtlMinutes);
    if (data.autoDeleteMinutes !== undefined) updateData.autoDeleteMinutes = parseInt(data.autoDeleteMinutes);
    if (data.defaultLanguage !== undefined) updateData.defaultLanguage = data.defaultLanguage;
    if (data.brandColor !== undefined) updateData.brandColor = data.brandColor;
    if (data.name !== undefined) updateData.name = data.name;

    const store = await db.store.update({
      where: { id: storeId ?? "store_default" },
      data: updateData,
    });

    return NextResponse.json({ saved: true, storeId: store.id });
  } catch (err) {
    console.error("Settings update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
