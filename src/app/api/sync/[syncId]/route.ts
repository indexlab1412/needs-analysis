import { NextResponse } from "next/server";
import { EncryptedSyncPayload } from "@/lib/sync/crypto";

interface SyncRecord {
  syncId: string;
  payload: EncryptedSyncPayload;
  updatedAt: number;
}

// Global in-memory storage to survive Next.js module reload cycles
declare global {
  // eslint-disable-next-line no-var
  var __fna_sync_vault__: Map<string, SyncRecord> | undefined;
}

const syncStore = global.__fna_sync_vault__ ?? new Map<string, SyncRecord>();
if (process.env.NODE_ENV !== "production") {
  global.__fna_sync_vault__ = syncStore;
}

// GET: Retrieve latest encrypted snapshot for a sync room
export async function GET(
  request: Request,
  context: { params: Promise<{ syncId: string }> | { syncId: string } }
) {
  const { syncId } = await Promise.resolve(context.params);

  if (!syncId || syncId.length < 4) {
    return NextResponse.json({ error: "Invalid sync room ID" }, { status: 400 });
  }

  const record = syncStore.get(syncId);
  if (!record) {
    return NextResponse.json({ error: "Sync room not found or expired" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    syncId,
    payload: record.payload,
    serverUpdatedAt: record.updatedAt,
  });
}

// POST: Save or update encrypted snapshot for a sync room
export async function POST(
  request: Request,
  context: { params: Promise<{ syncId: string }> | { syncId: string } }
) {
  const { syncId } = await Promise.resolve(context.params);

  if (!syncId || syncId.length < 4) {
    return NextResponse.json({ error: "Invalid sync room ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { payload } = body;

    if (!payload || !payload.ciphertext || !payload.iv || !payload.salt) {
      return NextResponse.json({ error: "Invalid encrypted payload" }, { status: 400 });
    }

    const now = Date.now();
    syncStore.set(syncId, {
      syncId,
      payload: payload as EncryptedSyncPayload,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      syncId,
      version: payload.version,
      serverUpdatedAt: now,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process sync" }, { status: 500 });
  }
}

// DELETE: Terminate and wipe sync room
export async function DELETE(
  request: Request,
  context: { params: Promise<{ syncId: string }> | { syncId: string } }
) {
  const { syncId } = await Promise.resolve(context.params);

  if (syncId) {
    syncStore.delete(syncId);
  }

  return NextResponse.json({ success: true, message: "Sync room deleted" });
}
