/**
 * fal.ai bulk delete script
 * Deletes all stored output payloads for the try-on workflow.
 *
 * Usage:
 *   node scripts/fal-cleanup.mjs
 *
 * Requires FAL_KEY in environment (or .env file).
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env manually (no external dep needed)
try {
  const env = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
  for (const line of env.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  // .env not found — rely on env vars already set
}

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("FAL_KEY not set. Add it to .env or export it before running.");
  process.exit(1);
}

const ENDPOINT_ID = "workflows/stongut/test-2-dress";
const BASE = "https://api.fal.ai/v1";
const HEADERS = {
  Authorization: `Key ${FAL_KEY}`,
  "Content-Type": "application/json",
};

async function listRequests(cursor) {
  const params = new URLSearchParams({ endpoint_id: ENDPOINT_ID, limit: "100" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`${BASE}/models/requests/by-endpoint?${params}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`List failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function deletePayload(requestId) {
  const res = await fetch(`${BASE}/models/requests/${requestId}/payloads`, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (res.status === 404) return { skipped: true };
  if (!res.ok) throw new Error(`Delete failed for ${requestId}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function run() {
  console.log(`Fetching requests for endpoint: ${ENDPOINT_ID}\n`);

  let cursor = null;
  let totalFound = 0;
  let totalDeleted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  do {
    let data;
    try {
      data = await listRequests(cursor);
    } catch (err) {
      console.error("Failed to list requests:", err.message);
      break;
    }

    const requests = data.requests ?? data.items ?? [];
    if (requests.length === 0) break;

    totalFound += requests.length;
    console.log(`Found ${requests.length} request(s) — deleting payloads...`);

    for (const req of requests) {
      const id = req.request_id ?? req.id;
      process.stdout.write(`  DELETE ${id} ... `);
      try {
        const result = await deletePayload(id);
        if (result.skipped) {
          process.stdout.write("skipped (already gone)\n");
          totalSkipped++;
        } else {
          const count = result.cdn_delete_results?.length ?? 0;
          process.stdout.write(`ok (${count} file${count !== 1 ? "s" : ""})\n`);
          totalDeleted++;
        }
      } catch (err) {
        process.stdout.write(`FAILED: ${err.message}\n`);
        totalFailed++;
      }
    }

    cursor = data.next_cursor ?? data.cursor ?? null;
    console.log("");
  } while (cursor);

  console.log("─".repeat(50));
  console.log(`Total found   : ${totalFound}`);
  console.log(`Deleted       : ${totalDeleted}`);
  console.log(`Already gone  : ${totalSkipped}`);
  console.log(`Failed        : ${totalFailed}`);
  console.log("");
  console.log("Done. Future photos auto-expire in 1 day (set in upload route).");
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
