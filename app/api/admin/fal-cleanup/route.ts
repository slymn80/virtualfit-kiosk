import { NextResponse } from "next/server";

const ENDPOINT_ID = "workflows/stongut/test-2-dress";
const BASE = "https://api.fal.ai/v1";

function falHeaders() {
  return {
    Authorization: `Key ${process.env.FAL_KEY}`,
    "Content-Type": "application/json",
  };
}

async function listRequests(cursor?: string): Promise<{ requests: { request_id: string }[]; next_cursor?: string }> {
  const params = new URLSearchParams({ endpoint_id: ENDPOINT_ID, limit: "100" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`${BASE}/models/requests/by-endpoint?${params}`, { headers: falHeaders() });
  if (!res.ok) throw new Error(`fal.ai list failed: ${res.status}`);
  return res.json();
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

  let cursor: string | undefined;
  let deleted = 0;
  let skipped = 0;
  let failed = 0;

  do {
    const data = await listRequests(cursor);
    const requests = data.requests ?? [];
    if (requests.length === 0) break;

    await Promise.allSettled(
      requests.map(async (req) => {
        try {
          const result = await deletePayload(req.request_id);
          if (result === "deleted") deleted++;
          else skipped++;
        } catch {
          failed++;
        }
      })
    );

    cursor = data.next_cursor;
  } while (cursor);

  return NextResponse.json({ deleted, skipped, failed });
}
