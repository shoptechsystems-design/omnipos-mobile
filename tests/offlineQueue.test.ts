import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueueId, isRetryableOfflineError } from "../lib/offline-utils";

const storage = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: async (key: string) => storage.get(key) ?? null, setItem: async (key: string, value: string) => { storage.set(key, value); } } }));

import { enqueueCheckout, listQueuedCheckouts, markCheckoutComplete, markCheckoutFailed } from "../lib/offline-db";

describe("offline checkout queue", () => {
  beforeEach(() => storage.clear());

  it("creates stable-format queue identifiers and classifies transient failures", () => {
    expect(createQueueId(1700000000000, 0.123456)).toBe("mobile-1700000000000-4fzyo8");
    expect(isRetryableOfflineError("Portal request timed out. Check your connection and try again.")).toBe(true);
    expect(isRetryableOfflineError("Amount received is less than the total.")).toBe(false);
  });

  it("retains failed work with retry metadata and removes completed work", async () => {
    const entry = { id: "mobile-test-1", createdAt: 1700000000000, attempts: 0, status: "pending" as const, payload: { items: [{ productId: 7, quantity: 2 }], paymentMethod: "cash" as const, amountReceived: 1000 } };
    await enqueueCheckout(entry);
    await markCheckoutFailed(entry, "Network unavailable");
    const failed = await listQueuedCheckouts();
    expect(failed[0]).toMatchObject({ id: entry.id, attempts: 1, status: "pending", lastError: "Network unavailable" });
    await markCheckoutComplete(entry.id);
    expect(await listQueuedCheckouts()).toHaveLength(0);
  });
});
