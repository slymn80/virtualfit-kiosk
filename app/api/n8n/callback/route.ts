import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, jobId, status, results, error } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = await db.tryOnJob.findUnique({
      where: { id: jobId },
      include: { session: { include: { store: true } } },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (status === "completed" && Array.isArray(results)) {
      await db.$transaction([
        db.tryOnJob.update({
          where: { id: jobId },
          data: { status: "COMPLETED", completedAt: new Date() },
        }),
        db.tryOnResult.deleteMany({ where: { jobId } }),
        ...results.map((r: { pose: number; imageUrl: string }) =>
          db.tryOnResult.create({
            data: { jobId, poseIndex: r.pose, imageUrl: r.imageUrl },
          })
        ),
      ]);

      console.log(`[Callback] Job ${jobId} completed with ${results.length} results`);
      return NextResponse.json({ received: true });

    } else if (status === "failed") {
      await db.tryOnJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          errorMsg: error ?? "Generation failed",
        },
      });

      console.log(`[Callback] Job ${jobId} failed: ${error}`);
      return NextResponse.json({ received: true });

    } else if (status === "processing") {
      await db.tryOnJob.update({
        where: { id: jobId },
        data: { status: "PROCESSING", startedAt: new Date() },
      });
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ error: "Unknown status" }, { status: 400 });

  } catch (err) {
    console.error("[Callback] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
