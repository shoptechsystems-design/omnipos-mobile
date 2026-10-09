import AsyncStorage from "@react-native-async-storage/async-storage";

export type QueuedCheckout = {
  id: string;
  createdAt: number;
  attempts: number;
  status: "pending" | "failed";
  lastError?: string;
  payload: {
    items: Array<{ productId: number; quantity: number }>;
    customerId?: number | null;
    paymentMethod: "cash" | "card" | "transfer" | "other";
    amountReceived: number;
    discountTotal?: number;
  };
};

const STORAGE_KEY = "omnipos_offline_checkouts_v1";

async function readQueue(): Promise<QueuedCheckout[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as QueuedCheckout[]; } catch { return []; }
}

async function writeQueue(entries: QueuedCheckout[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function enqueueCheckout(entry: QueuedCheckout) {
  const current = await readQueue();
  await writeQueue([...current.filter((item) => item.id !== entry.id), entry]);
}

export async function listQueuedCheckouts() {
  return readQueue();
}

export async function markCheckoutComplete(id: string) {
  await writeQueue((await readQueue()).filter((item) => item.id !== id));
}

export async function markCheckoutFailed(entry: QueuedCheckout, message: string) {
  const next: QueuedCheckout = { ...entry, attempts: entry.attempts + 1, status: entry.attempts + 1 >= 5 ? "failed" : "pending", lastError: message };
  await writeQueue((await readQueue()).map((item) => item.id === entry.id ? next : item));
}

export async function getQueueCount() {
  return (await readQueue()).length;
}
