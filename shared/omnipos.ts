export type PaymentMethod = "cash" | "card" | "transfer" | "other";

export type User = {
  id: number;
  name?: string | null;
  email: string;
};

export type Tenant = {
  id: number;
  name: string;
  currency: "PKR" | string;
};

export type Membership = {
  role: "tenant_admin" | "cashier" | "inventory_manager" | string;
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  price: number;
  stock: number;
  categoryId: number | null;
  imageUrl: string | null;
  imageProxyUrl?: string | null;
};

export type Category = { id: number; name: string; color: string };
export type Expense = { id: number; category: string; amount: number; notes: string | null; expenseDate: string | number | null };
export type TeamMember = { membership: { role: string; status: string }; user: { id: number; name: string | null; email: string; role: string } };
export type CustomerGroup = { id: number; name: string; discountPercent: number };
export type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  groupId: number | null;
};

export type SaleItem = { productId: number; quantity: number; price: number; productName?: string };
export type Sale = {
  id?: number;
  orderNumber: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: string | number;
  customer?: Customer | null;
};

export type InventoryItem = Product & { lowStock?: boolean; variants?: unknown[] };
export type CheckoutResult = {
  success: true;
  orderNumber: string;
  total: number;
  changeDue: number;
  loyaltyPointsEarned: number;
};

export type DashboardStats = { revenue?: number | string; sales?: number; orders?: number; customers?: number; lowStock?: number; [key: string]: unknown };

export const numeric = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const money = (value: unknown) => `Rs${numeric(value).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
