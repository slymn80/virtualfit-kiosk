import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

const BASE = "https://api.fal.ai/v1";

function falHeaders() {
  return {
    Authorization: `Key ${process.env.FAL_KEY}`,
    "Content-Type": "application/json",
  };
}

async function deletePayload(requestId: string): Promise<"deleted" | "skipped"> {
  const res = await fetch(`${BASE}/models/requests/${requestId}/payloads`, {
    method: "DELETE",
    headers: falHeaders(),
  });
  if (res.status === 404) return "skipped";
  if (!res.ok) throw new Error(`Delete ${requestId} failed: ${res.status}`);
  return "deleted";
}

export async function POST() {
  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
  }

  // Read all fal.ai request IDs stored in our DB (saved in n8nJobId column after each stream)
  const jobs = await db.tryOnJob.findMany({
    where: { n8nJobId: { not: null } },
    select: { id: true, n8nJobId: true },
  });

  let deleted = 0;
  let skipped = 0;
  let failed = 0;

  await Promise.allSettled(
    jobs.map(async (job) => {
      try {
        const result = await deletePayload(job.n8nJobId!);
        if (result === "deleted") {
          deleted++;
          // Clear the stored request ID so it won't be attempted again
          await db.tryOnJob.update({ where: { id: job.id }, data: { n8nJobId: null } }).catch(() => {});
        } else {
          skipped++;
        }
      } catch {
        failed++;
      }
    })
  );

  return NextResponse.json({ deleted, skipped, failed, total: jobs.length });
}
