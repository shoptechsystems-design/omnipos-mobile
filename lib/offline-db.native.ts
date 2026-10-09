import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import type { QueuedCheckout } from "./offline-db";

let database: SQLiteDatabase | null = null;

function getDatabase() {
  if (!database) {
    database = openDatabaseSync("omnipos-offline.db");
    database.execSync(`CREATE TABLE IF NOT EXISTS checkout_queue (id TEXT PRIMARY KEY NOT NULL, created_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL, last_error TEXT, payload TEXT NOT NULL)`);
  }
  return database;
}

export async function enqueueCheckout(entry: QueuedCheckout) {
  getDatabase().runSync("INSERT OR REPLACE INTO checkout_queue (id, created_at, attempts, status, last_error, payload) VALUES (?, ?, ?, ?, ?, ?)", entry.id, entry.createdAt, entry.attempts, entry.status, entry.lastError ?? null, JSON.stringify(entry.payload));
}

export async function listQueuedCheckouts(): Promise<QueuedCheckout[]> {
  const rows = getDatabase().getAllSync<{ id: string; created_at: number; attempts: number; status: "pending" | "failed"; last_error: string | null; payload: string }>("SELECT * FROM checkout_queue WHERE status IN ('pending', 'failed') ORDER BY created_at ASC");
  return rows.map((row) => ({ id: row.id, createdAt: row.created_at, attempts: row.attempts, status: row.status, lastError: row.last_error ?? undefined, payload: JSON.parse(row.payload) }));
}

export async function markCheckoutComplete(id: string) {
  getDatabase().runSync("DELETE FROM checkout_queue WHERE id = ?", id);
}

export async function markCheckoutFailed(entry: QueuedCheckout, message: string) {
  const attempts = entry.attempts + 1;
  getDatabase().runSync("UPDATE checkout_queue SET attempts = ?, status = ?, last_error = ? WHERE id = ?", attempts, attempts >= 5 ? "failed" : "pending", message, entry.id);
}

export async function getQueueCount() {
  const rows = getDatabase().getAllSync<{ count: number }>("SELECT COUNT(*) AS count FROM checkout_queue WHERE status IN ('pending', 'failed')");
  return Number(rows[0]?.count ?? 0);
}
