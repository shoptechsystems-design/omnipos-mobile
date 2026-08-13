import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";
import type { Category, CheckoutResult, Customer, CustomerGroup, InventoryItem, Membership, Product, Sale, Tenant, User } from "@/shared/omnipos";

export const PORTAL_ORIGIN = "https://omnipos-hjcb6uyk.manus.space";
const API_BASE = Platform.OS === "web" ? `${getApiBaseUrl()}/api/portal/trpc` : `${PORTAL_ORIGIN}/api/trpc`;
const COOKIE_KEY = "omnipos_session_cookie";

type TRPCError = { message?: string };

async function getCookie() {
  return Platform.OS === "web" ? AsyncStorage.getItem(COOKIE_KEY) : SecureStore.getItemAsync(COOKIE_KEY);
}

async function saveCookie(value: string) {
  if (Platform.OS === "web") return AsyncStorage.setItem(COOKIE_KEY, value);
  return SecureStore.setItemAsync(COOKIE_KEY, value);
}

async function clearCookie() {
  if (Platform.OS === "web") return AsyncStorage.removeItem(COOKIE_KEY);
  return SecureStore.deleteItemAsync(COOKIE_KEY);
}

function inputParam(input: unknown) {
  return encodeURIComponent(JSON.stringify({ json: input }));
}

async function request<T>(path: string, input?: unknown, method: "GET" | "POST" = "GET") {
  const cookie = await getCookie();
  const url = `${API_BASE}/${path}${method === "GET" && input !== undefined ? `?input=${inputParam(input)}` : ""}`;
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: method === "POST" ? JSON.stringify({ json: input ?? {} }) : undefined,
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const session = setCookie.split(",").find((part) => part.includes("omnipos_session"))?.split(";")[0];
    if (session) await saveCookie(session);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.error) {
    const error = (payload?.error ?? {}) as TRPCError & { json?: { message?: string } };
    throw new Error(error.message ?? error.json?.message ?? `Portal request failed (${response.status})`);
  }
  return (payload?.result?.data?.json ?? payload?.result?.data ?? payload) as T;
}

export const portal = {
  login: (input: { email: string; password: string }) => request<{ success: true; user: User }>("auth.login", input, "POST"),
  me: () => request<User | null>("auth.me"),
  tenantContext: () => request<{ tenant: Tenant; membership: Membership }>("tenant.context"),
  products: (input?: { search?: string; categoryId?: number }) => request<Product[]>("catalog.products", input ?? {}),
  categories: () => request<Category[]>("catalog.categories"),
  customers: (input?: { search?: string }) => request<Customer[]>("customers.list", input ?? {}),
  createCustomer: (input: { name: string; email?: string | null; phone?: string | null; groupId?: number | null }) => request<Customer>("customers.create", input, "POST"),
  customerGroups: () => request<CustomerGroup[]>("customerGroups.list"),
  checkout: (input: { items: Array<{ productId: number; quantity: number; price: number }>; customerId?: number | null; paymentMethod: "cash" | "card" | "transfer" | "other"; amountReceived: number; discountTotal?: number; taxTotal?: number }) => request<CheckoutResult>("pos.checkout", input, "POST"),
  sales: (input?: { startDate?: number; endDate?: number; customerId?: number }) => request<Sale[]>("sales.list", input ?? {}),
  inventory: () => request<InventoryItem[]>("inventory.list"),
  adjustInventory: (input: { productId: number; adjustment: number; reason: string }) => request<InventoryItem>("inventory.adjust", input, "POST"),
  signOut: clearCookie,
};
