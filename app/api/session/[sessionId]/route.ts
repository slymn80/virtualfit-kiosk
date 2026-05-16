import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await db.customerSession.findUnique({
    where: { id: sessionId },
    include: { tryOnJobs: { include: { results: true }, orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await db.customerSession.findUnique({
      where: { id: sessionId },
      include: {
        tryOnJobs: { include: { results: true } },
      },
    });

    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete uploaded photo file
    if (session.photoUrl && session.photoUrl.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", session.photoUrl);
        await unlink(filePath);
      } catch {
        // File may already be deleted
      }
    }

    // Delete result images
    for (const job of session.tryOnJobs) {
      for (const result of job.results) {
        if (result.imageUrl.startsWith("/uploads/")) {
          try {
            const filePath = path.join(process.cwd(), "public", result.imageUrl);
            await unlink(filePath);
          } catch {}
        }
      }
    }

    // Delete DB records
    await db.$transaction([
      db.tryOnResult.deleteMany({
        where: { job: { sessionId: session.id } },
      }),
      db.tryOnJob.deleteMany({ where: { sessionId: session.id } }),
      db.shareLog.deleteMany({ where: { sessionId: session.id } }),
      db.auditLog.create({
        data: {
          sessionId: session.id,
          action: "session.delete",
          actor: "customer",
          ip: req.headers.get("x-forwarded-for") ?? "unknown",
        },
      }),
      db.customerSession.update({
        where: { id: session.id },
        data: {
          status: "DELETED",
          deletedAt: new Date(),
          photoUrl: null,
        },
      }),
    ]);

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Session delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
