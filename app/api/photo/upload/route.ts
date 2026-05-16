import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { fal } from "@/lib/fal";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, imageDataUrl } = await req.json();

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: "image/jpeg" });

    // Upload directly to fal.ai storage — works in any environment
    const photoUrl = await fal.storage.upload(
      new File([blob], "photo.jpg", { type: "image/jpeg" }),
      { lifecycle: { expiresIn: "1d" } }
    );

    if (sessionId && sessionId !== "temp") {
      await db.customerSession.update({
        where: { id: sessionId },
        data: { photoUrl },
      }).catch(() => {});
    }

    return NextResponse.json({ photoUrl, fullUrl: photoUrl });
  } catch (err) {
    console.error("Photo upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
