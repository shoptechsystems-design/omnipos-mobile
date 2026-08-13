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
};

export type Category = { id: number; name: string; color: string };
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

export const money = (value: number) => `Rs${value.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
