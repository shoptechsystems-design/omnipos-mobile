import * as Network from "expo-network";
import { enqueueCheckout, getQueueCount, listQueuedCheckouts, markCheckoutComplete, markCheckoutFailed, type QueuedCheckout } from "@/lib/offline-db";
import { portal } from "@/lib/portal";
import { createQueueId } from "@/lib/offline-utils";

export async function queueCheckout(payload: QueuedCheckout["payload"]) {
  const entry: QueuedCheckout = { id: createQueueId(), createdAt: Date.now(), attempts: 0, status: "pending", payload };
  await enqueueCheckout(entry);
  return entry;
}

export async function flushOfflineCheckouts() {
  const network = await Network.getNetworkStateAsync().catch(() => ({ isConnected: true, isInternetReachable: true }));
  if (network.isConnected === false || network.isInternetReachable === false) return { synced: 0, pending: await getQueueCount() };
  let synced = 0;
  for (const entry of await listQueuedCheckouts()) {
    try {
      await portal.checkout({ ...entry.payload, clientRequestId: entry.id });
      await markCheckoutComplete(entry.id);
      synced += 1;
    } catch (error) {
      await markCheckoutFailed(entry, error instanceof Error ? error.message : "Unable to sync checkout");
      if (entry.attempts < 4) break;
    }
  }
  return { synced, pending: await getQueueCount() };
}
