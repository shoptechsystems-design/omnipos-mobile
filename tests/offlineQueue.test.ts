import { describe, expect, it } from "vitest";
import { createQueueId, isRetryableOfflineError } from "../lib/offline-utils";

describe("offline checkout queue", () => {
  it("creates stable-format unique queue identifiers", () => {
    expect(createQueueId(1700000000000, 0.123456)).toBe("mobile-1700000000000-4fzyo8");
  });

  it("only retries transient connectivity failures", () => {
    expect(isRetryableOfflineError("Portal request timed out. Check your connection and try again.")).toBe(true);
    expect(isRetryableOfflineError("Amount received is less than the total.")).toBe(false);
  });
});
