import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = await db.tryOnJob.findUnique({
      where: { id: jobId },
      include: { results: { orderBy: { poseIndex: "asc" } } },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const results = job.results.map((r) => ({
      pose: r.poseIndex,
      imageUrl: r.imageUrl,
    }));

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      results: job.status === "COMPLETED" ? results : [],
      error: job.errorMsg,
    });
  } catch (err) {
    console.error("Job status error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
