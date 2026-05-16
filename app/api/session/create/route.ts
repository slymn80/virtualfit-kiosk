import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { formatExpiresAt } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { customerName, storeId, language } = await req.json();

    if (!customerName || customerName.length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const store = await db.store.findUnique({ where: { id: storeId } });
    const ttlMinutes = store?.sessionTtlMinutes ?? 60;

    const session = await db.customerSession.create({
      data: {
        storeId: storeId ?? "store_default",
        customerName: customerName.trim(),
        language: language ?? "en",
        consentGiven: true,
        consentAt: new Date(),
        status: "ACTIVE",
        expiresAt: formatExpiresAt(ttlMinutes),
      },
    });

    await db.auditLog.create({
      data: {
        sessionId: session.id,
        action: "session.create",
        actor: "customer",
        ip: req.headers.get("x-forwarded-for") ?? "unknown",
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Session create error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
