import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";
import { numeric, type Category, type CheckoutResult, type Customer, type CustomerGroup, type DashboardStats, type Expense, type InventoryItem, type Membership, type Product, type Sale, type TeamMember, type Tenant, type User } from "@/shared/omnipos";

export const PORTAL_ORIGIN = "https://omnipos-hjcb6uyk.manus.space";
const API_BASE = Platform.OS === "web" ? `${getApiBaseUrl()}/api/portal/trpc` : `${PORTAL_ORIGIN}/api/trpc`;
const COOKIE_KEY = "omnipos_session_cookie";

type TRPCError = { message?: string };

export async function getPortalSessionCookie() {
  return Platform.OS === "web" ? AsyncStorage.getItem(COOKIE_KEY) : SecureStore.getItemAsync(COOKIE_KEY);
}

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
  const cookie = await getPortalSessionCookie();
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
    const session = setCookie.split(",").find((part) => part.includes("app_session_id") || part.includes("omnipos_session"))?.split(";")[0];
    if (session) await saveCookie(session);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.error) {
    const error = (payload?.error ?? {}) as TRPCError & { json?: { message?: string } };
    throw new Error(error.message ?? error.json?.message ?? `Portal request failed (${response.status})`);
  }
  return (payload?.result?.data?.json ?? payload?.result?.data ?? payload) as T;
}

async function login(input: { email: string; password: string }) {
  if (Platform.OS !== "web") return request<{ success: true; user: User }>("auth.login", input, "POST");
  const response = await fetch(`${getApiBaseUrl()}/api/portal/session/login`, { method: "POST", credentials: "include", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ email: input.email, password: input.password }) });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.error) {
    const error = payload?.error as TRPCError & { json?: { message?: string } } | undefined;
    throw new Error(error?.message ?? error?.json?.message ?? `Portal request failed (${response.status})`);
  }
  return (payload?.result?.data?.json ?? payload?.result?.data ?? payload) as { success: true; user: User };
}

function normalizeImageUrl(value: unknown): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    for (const candidate of value) {
      const found = normalizeImageUrl(candidate);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return normalizeImageUrl(record.url ?? record.src ?? record.path ?? record.imageUrl ?? record.image_url ?? record.thumbnailUrl ?? record.photoUrl);
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw.startsWith("data:") || raw.startsWith("blob:") || raw.startsWith("http://") || raw.startsWith("https://") ? raw : `${PORTAL_ORIGIN}${raw.startsWith("/") ? "" : "/"}${raw}`;
  return normalized;
}

function normalizeProduct(value: Record<string, unknown>): Product {
  return {
    id: numeric(value.id),
    name: String(value.name ?? value.title ?? "Unnamed product"),
    sku: String(value.sku ?? value.code ?? "—"),
    barcode: value.barcode == null ? null : String(value.barcode),
    price: numeric(value.price ?? value.sellingPrice ?? value.salePrice ?? value.retailPrice ?? value.unitPrice),
    stock: numeric(value.stock ?? value.stockQuantity ?? value.quantity ?? value.inventory),
    categoryId: value.categoryId == null ? null : numeric(value.categoryId),
    imageUrl: normalizeImageUrl(value.imageUrl ?? value.image_url ?? value.image ?? value.thumbnailUrl ?? value.photoUrl ?? value.thumbnail ?? value.media ?? value.images ?? value.photos),
    imageProxyUrl: (() => {
      const direct = normalizeImageUrl(value.imageUrl ?? value.image_url ?? value.image ?? value.thumbnailUrl ?? value.photoUrl ?? value.thumbnail ?? value.media ?? value.images ?? value.photos);
      return direct && (direct.startsWith(PORTAL_ORIGIN) || direct.includes("d36hbw14aib5lz.cloudfront.net")) ? `${getApiBaseUrl()}/api/portal/image?url=${encodeURIComponent(direct)}` : direct;
    })(),
  };
}

export const portal = {
  login,
  me: () => request<User | null>("auth.me"),
  tenantContext: () => request<{ tenant: Tenant; membership: Membership }>("tenant.context"),
  products: async (input?: { search?: string; categoryId?: number }) => {
    const values = await request<unknown[]>("catalog.products", { query: input?.search, categoryId: input?.categoryId });
    return (Array.isArray(values) ? values : []).map((value) => normalizeProduct((value ?? {}) as Record<string, unknown>));
  },
  categories: () => request<Category[]>("catalog.categories"),
  customers: (input?: { search?: string }) => request<Customer[]>("customers.list", { query: input?.search }),
  createCategory: (input: { name: string; color?: string }) => request<{ success: true }>("catalog.createCategory", input, "POST"),
  updateCategory: (input: { id: number; name: string; color?: string }) => request<{ success: true }>("catalog.updateCategory", input, "POST"),
  deleteCategory: (input: { id: number }) => request<{ success: true }>("catalog.deleteCategory", input, "POST"),
  createProduct: (input: { name: string; sku?: string; barcode?: string | null; categoryId?: number | null; sellingPrice: number; stockQuantity: number; imageUrl?: string | null; costPrice?: number; discountPrice?: number | null; taxRate?: number | null; minStockLevel?: number; unit?: string }) => request<{ success: true }>("catalog.createProduct", input, "POST"),
  updateProduct: (input: { id: number; name: string; sku: string; categoryId?: number | null; sellingPrice: number; stockQuantity: number; imageUrl?: string | null }) => request<{ success: true }>("catalog.updateProduct", input, "POST"),
  deleteProduct: (input: { id: number }) => request<{ success: true }>("catalog.deleteProduct", input, "POST"),
  uploadProductImage: (input: { filename: string; base64Data: string; contentType: string }) => request<{ url: string }>("catalog.uploadProductImage", input, "POST"),
  createCustomer: (input: { name: string; email?: string | null; phone?: string | null; groupId?: number | null }) => request<Customer>("customers.create", input, "POST"),
  customerGroups: () => request<CustomerGroup[]>("customerGroups.list"),
  dashboardStats: () => request<DashboardStats>("dashboard.stats"),
  dashboardLowStock: () => request<InventoryItem[]>("dashboard.lowStock"),
  dashboardRecentSales: () => request<Sale[]>("dashboard.recentSales"),
  expenses: () => request<Expense[]>("expenses.list"),
  createExpense: (input: { category: string; amount: number; notes?: string | null; expenseDate?: string }) => request<{ success: true }>("expenses.create", input, "POST"),
  team: () => request<TeamMember[]>("team.list"),
  inviteTeamMember: (input: { email: string; name: string; role: "cashier" | "inventory_manager" }) => request<{ success: true }>("team.invite", input, "POST"),
  tenantSettings: () => request<Record<string, unknown>>("tenant.settings"),
  updateTenantSettings: (input: { name: string; businessType: string; currency: string; taxRate: number; logoUrl?: string | null; receiptFooter?: string | null }) => request<{ success: true }>("tenant.updateSettings", input, "POST"),
  checkout: (input: { items: Array<{ productId: number; quantity: number; price?: number }>; customerId?: number | null; paymentMethod: "cash" | "card" | "transfer" | "other"; amountReceived: number; discountTotal?: number; taxTotal?: number }) => request<CheckoutResult>("pos.checkout", { items: input.items.map(({ productId, quantity }) => ({ productId, quantity })), customerId: input.customerId, paymentMethod: input.paymentMethod, amountReceived: input.amountReceived, discount: input.discountTotal ?? 0 }, "POST"),
  sales: async (input?: { query?: string }) => {
    const rows = await request<Array<{ sale?: Record<string, unknown>; customer?: Record<string, unknown> | null }>>("pos.history", input ?? {});
    return (Array.isArray(rows) ? rows : []).map((row) => {
      const sale = row.sale ?? {};
      const items = Array.isArray(sale.items) ? sale.items : [];
      return {
        id: numeric(sale.id),
        orderNumber: String(sale.saleNumber ?? sale.orderNumber ?? "—"),
        items: items as Sale["items"],
        total: numeric(sale.total),
        paymentMethod: String(sale.paymentMethod ?? "other") as Sale["paymentMethod"],
        timestamp: String(sale.createdAt ?? sale.timestamp ?? ""),
        customer: row.customer ? ({ id: numeric(row.customer.id), name: String(row.customer.name ?? ""), email: row.customer.email == null ? null : String(row.customer.email), phone: row.customer.phone == null ? null : String(row.customer.phone), loyaltyPoints: numeric(row.customer.loyaltyPoints), totalSpent: numeric(row.customer.totalSpent), groupId: row.customer.groupId == null ? null : numeric(row.customer.groupId) } as Customer) : null,
      } satisfies Sale;
    });
  },
  inventory: async () => {
    const values = await request<unknown[]>("inventory.lowStock");
    return (Array.isArray(values) ? values : []).map((value) => normalizeProduct((value ?? {}) as Record<string, unknown>));
  },
  adjustInventory: (input: { productId: number; adjustment: number; reason: string }) => request<{ success: true; stockQuantity: number }>("inventory.adjust", { productId: input.productId, quantity: input.adjustment, reason: input.reason }, "POST"),
  variants: (input: { productId: number }) => request<unknown[]>("inventory.variants", input),
  createVariant: (input: { productId: number; name: string; sku: string; additionalPrice?: number; stockQuantity?: number }) => request<{ success: true }>("inventory.createVariant", input, "POST"),
  deleteVariant: (input: { id: number }) => request<{ success: true }>("inventory.deleteVariant", input, "POST"),
  suppliers: () => request<unknown[]>("suppliers.list"),
  createSupplier: (input: { name: string; email?: string | null; phone?: string | null; notes?: string | null }) => request<{ success: true }>("suppliers.create", input, "POST"),
  purchases: () => request<unknown[]>("purchases.list"),
  createPurchase: (input: { supplierId?: number | null; notes?: string | null; items: Array<{ productId: number; quantity: number; unitCost: number }> }) => request<unknown>("purchases.create", input, "POST"),
  signOut: async () => {
    if (Platform.OS === "web") {
      await fetch(`${getApiBaseUrl()}/api/portal/session/logout`, { method: "POST", credentials: "include" }).catch(() => undefined);
    }
    await clearCookie();
  },
};
