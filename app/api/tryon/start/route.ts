import { NextRequest, NextResponse, after } from "next/server";
import { db } from "@/lib/prisma";
import { fal } from "@/lib/fal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, personPhotoUrl, productId, garmentImageUrl } = body;

    if (!garmentImageUrl) {
      return NextResponse.json({ error: "Missing garment image URL" }, { status: 400 });
    }
    if (!personPhotoUrl) {
      return NextResponse.json({ error: "Missing person photo" }, { status: 400 });
    }
    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }
    if (!sessionId || sessionId === "temp") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const job = await db.tryOnJob.create({
      data: {
        sessionId,
        productId,
        status: "QUEUED",
      },
    });

    after(async () => {
      try {
        await processJob(job.id, personPhotoUrl, garmentImageUrl);
      } catch (err) {
        console.error("[Fal.ai] Job failed:", err);
        await db.tryOnJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            errorMsg: String(err instanceof Error ? err.message : "Fal.ai processing failed"),
            failedAt: new Date(),
          },
        }).catch(() => {});
      }
    });

    return NextResponse.json({ jobId: job.id, status: "QUEUED" });
  } catch (err) {
    console.error("[TryOn] Start error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function processJob(jobId: string, personPhotoUrl: string, garmentImageUrl: string) {
  let falPersonUrl: string;

  if (personPhotoUrl.startsWith("data:image")) {
    // Base64 fallback — upload to fal.ai storage
    const base64Data = personPhotoUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: "image/jpeg" });
    falPersonUrl = await fal.storage.upload(new File([blob], "photo.jpg", { type: "image/jpeg" }), { lifecycle: { expiresIn: "1d" } });
  } else if (personPhotoUrl.startsWith("http")) {
    // Already an external URL (fal.ai CDN from photo/upload)
    falPersonUrl = personPhotoUrl;
  } else {
    throw new Error(`Unsupported personPhotoUrl format: ${personPhotoUrl.substring(0, 40)}`);
  }

  console.log("[Fal.ai] Person photo:", falPersonUrl);

  await db.tryOnJob.update({ where: { id: jobId }, data: { status: "PROCESSING" } });

  const stream = await fal.stream("workflows/stongut/test-2-dress", {
    input: {
      person_image_url: falPersonUrl,
      clothing: garmentImageUrl,
      aspect_ratio: "2:3",
      preserve_pose: true,
    },
  });

  let lastEvent: unknown;
  for await (const event of stream) {
    lastEvent = event;
  }

  const result = await stream.done();

  console.log("[Fal.ai] FULL RESULT:", JSON.stringify(result, null, 2));

  const imageUrls = extractAllImageUrls(result) ?? extractAllImageUrls(lastEvent) ?? [];

  if (imageUrls.length === 0) {
    throw new Error(`No image URLs found in response: ${JSON.stringify(result)}`);
  }

  for (let i = 0; i < imageUrls.length; i++) {
    await db.tryOnResult.create({
      data: { jobId, poseIndex: i + 1, imageUrl: imageUrls[i] },
    });
  }

  await db.tryOnJob.update({
    where: { id: jobId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  console.log(`[Fal.ai] Job ${jobId} completed with ${imageUrls.length} pose(s)`);
}

function extractAllImageUrls(data: unknown): string[] | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (d.output && typeof d.output === "object") {
    return extractAllImageUrls(d.output);
  }

  const urls: string[] = [];
  const imageKeys = Object.keys(d)
    .filter((k) => k === "images" || /^images_\d+$/.test(k))
    .sort((a, b) => {
      const numA = a === "images" ? 0 : parseInt(a.split("_")[1]);
      const numB = b === "images" ? 0 : parseInt(b.split("_")[1]);
      return numA - numB;
    });

  for (const key of imageKeys) {
    const val = d[key];
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0];
      if (typeof first === "string") urls.push(first);
      else if (first && typeof first === "object" && "url" in first) {
        urls.push((first as { url: string }).url);
      }
    }
  }
  if (urls.length > 0) return urls;

  if (typeof d.image === "string") return [d.image];
  if (d.image && typeof d.image === "object" && "url" in d.image) {
    return [(d.image as { url: string }).url];
  }
  if (typeof d.output === "string") return [d.output];

  return null;
}
