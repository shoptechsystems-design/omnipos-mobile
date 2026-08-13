import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/shared/omnipos";

type CartLine = Product & { quantity: number };
type CartContextValue = { lines: CartLine[]; total: number; itemCount: number; add: (product: Product) => void; decrement: (productId: number) => void; remove: (productId: number) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => { AsyncStorage.getItem("omnipos_cart").then((value) => value && setLines(JSON.parse(value))).catch(() => undefined); }, []);
  useEffect(() => { AsyncStorage.setItem("omnipos_cart", JSON.stringify(lines)).catch(() => undefined); }, [lines]);
  const value = useMemo(() => ({
    lines,
    total: lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    add: (product: Product) => setLines((current) => current.some((line) => line.id === product.id) ? current.map((line) => line.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, Math.max(product.stock, 1)) } : line) : [...current, { ...product, quantity: 1 }]),
    decrement: (productId: number) => setLines((current) => current.flatMap((line) => line.id !== productId ? [line] : line.quantity > 1 ? [{ ...line, quantity: line.quantity - 1 }] : [])),
    remove: (productId: number) => setLines((current) => current.filter((line) => line.id !== productId)),
    clear: () => setLines([]),
  }), [lines]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart must be used within CartProvider"); return value; }
