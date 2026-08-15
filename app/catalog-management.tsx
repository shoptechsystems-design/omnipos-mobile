import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { portal } from "@/lib/portal";
import { useColors } from "@/hooks/use-colors";
import { money } from "@/shared/omnipos";

export default function CatalogManagement() {
  const colors = useColors();
  const client = useQueryClient();
  const products = useQuery({ queryKey: ["products", "manage"], queryFn: () => portal.products() });
  const categories = useQuery({ queryKey: ["categories"], queryFn: portal.categories });
  const [mode, setMode] = useState<"product" | "category" | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const reset = () => { setMode(null); setName(""); setSku(""); setPrice(""); setStock(""); setImageUrl(""); setCategoryId(null); };
  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      if (mode === "category") await portal.createCategory({ name: name.trim(), color: "#0B8AA8" });
      if (mode === "product") await portal.createProduct({ name: name.trim(), sku: sku.trim() || undefined, sellingPrice: Number(price) || 0, stockQuantity: Math.max(0, Number(stock) || 0), categoryId, imageUrl: imageUrl.trim() || null });
      await client.invalidateQueries({ queryKey: ["products"] });
      await client.invalidateQueries({ queryKey: ["categories"] });
      reset();
    } finally { setSaving(false); }
  };
  const categoryNames = useMemo(() => categories.data ?? [], [categories.data]);
  return <ScreenContainer className="px-4 pt-4"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}><Pressable onPress={() => router.back()}><Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 12 }}>‹ More</Text></Pressable><Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "900" }}>Catalog Management</Text><Text style={{ color: colors.muted, fontSize: 13, marginTop: 3, marginBottom: 18 }}>Create products and categories in the live portal.</Text><View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}><Pressable onPress={() => setMode("category")} style={{ flex: 1, minHeight: 52, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.foreground, fontWeight: "900" }}>＋ Category</Text></Pressable><Pressable onPress={() => setMode("product")} style={{ flex: 1, minHeight: 52, borderRadius: 17, backgroundColor: "#0E1B3A", alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#FFFFFF", fontWeight: "900" }}>＋ Product</Text></Pressable></View>{(products.data ?? []).map((item) => <View key={item.id} style={{ padding: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }}><Text style={{ color: colors.foreground, fontWeight: "900", fontSize: 16 }}>{item.name}</Text><Text style={{ color: colors.muted, marginTop: 3 }}>SKU {item.sku} · {item.stock} in stock</Text><Text style={{ color: colors.primary, fontWeight: "900", marginTop: 7 }}>{money(item.price)}</Text></View>)}<Modal visible={mode !== null} transparent animationType="slide" onRequestClose={reset}><View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(5,15,35,0.35)" }}><View style={{ backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 34 }}><Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "900", marginBottom: 14 }}>{mode === "category" ? "Add Category" : "Add Product"}</Text><TextInput value={name} onChangeText={setName} placeholder={mode === "category" ? "Category name" : "Product name"} placeholderTextColor={colors.muted} style={{ height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.foreground, marginBottom: 10 }} />{mode === "product" && <><TextInput value={sku} onChangeText={setSku} placeholder="SKU (optional)" placeholderTextColor={colors.muted} style={{ height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.foreground, marginBottom: 10 }} /><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="Selling price (PKR)" placeholderTextColor={colors.muted} style={{ height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.foreground, marginBottom: 10 }} /><TextInput value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="Opening stock" placeholderTextColor={colors.muted} style={{ height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.foreground, marginBottom: 10 }} /><TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="Product image URL (optional)" placeholderTextColor={colors.muted} style={{ height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.foreground, marginBottom: 10 }} /></>}<View style={{ flexDirection: "row", gap: 10 }}><Pressable onPress={reset} style={{ flex: 1, height: 52, borderRadius: 15, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>Cancel</Text></Pressable><Pressable disabled={saving} onPress={save} style={{ flex: 1, height: 52, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", opacity: saving ? 0.6 : 1 }}><Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{saving ? "Saving…" : "Save"}</Text></Pressable></View></View></View></Modal></ScrollView></ScreenContainer>;
}
