export function createQueueId(now = Date.now(), random = Math.random()) {
  return `mobile-${now}-${random.toString(36).slice(2, 8)}`;
}

export function isRetryableOfflineError(message: string) {
  return /network|fetch|timed out|connection|portal request failed|abort/i.test(message);
}
