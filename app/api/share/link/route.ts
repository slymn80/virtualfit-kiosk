import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const shareLog = await db.shareLog.create({
      data: {
        sessionId: sessionId ?? "temp",
        shareMethod: "LINK",
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const shareUrl = `${appUrl}/share/${shareLog.shareToken}`;

    await db.shareLog.update({
      where: { id: shareLog.id },
      data: { shareUrl },
    });

    return NextResponse.json({
      shareToken: shareLog.shareToken,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("Share link error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
