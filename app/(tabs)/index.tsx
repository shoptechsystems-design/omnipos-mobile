import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, Text, TextInput, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { portal } from "@/lib/portal";
import { money } from "@/shared/omnipos";
import { useCart } from "@/lib/cart-context";

function ProductPlaceholder({ name, color }: { name: string; color: string }) {
  return <View style={{ flex: 1, backgroundColor: color, alignItems: "center", justifyContent: "center" }}><View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 30, fontWeight: "900", color: "#FFFFFF" }}>{name.slice(0, 1).toUpperCase()}</Text></View><Text style={{ color: "#FFFFFF", opacity: 0.84, marginTop: 7, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>LIVE PRODUCT</Text></View>;
}

function ProductMedia({ imageUrl, imageProxyUrl, name, color }: { imageUrl: string | null; imageProxyUrl?: string | null; name: string; color: string }) {
  const [source, setSource] = useState(imageUrl);
  const [failed, setFailed] = useState(false);
  if (!source || failed) return <ProductPlaceholder name={name} color={color} />;
  return <Image source={{ uri: source }} onError={() => {
    if (source !== imageProxyUrl && imageProxyUrl) setSource(imageProxyUrl);
    else setFailed(true);
  }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />;
}

export default function SellScreen() {
  const colors = useColors();
  const cart = useCart();
  const { width } = useWindowDimensions();
  const titleSize = width < 360 ? 24 : width > 520 ? 30 : 27;
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const products = useQuery({ queryKey: ["products", search, categoryId], queryFn: () => portal.products({ search: search.trim() || undefined, categoryId }) });
  const categories = useQuery({ queryKey: ["categories"], queryFn: portal.categories });
  const data = useMemo(() => products.data ?? [], [products.data]);
  const categoryColors = ["#0B8AA8", "#243B6B", "#C16D4B", "#6B5CA5"];

  return <ScreenContainer className="px-4 pt-3" edges={["top", "left", "right"]}>
    <View style={{ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><View style={{ flex: 1, paddingRight: 12 }}><Text numberOfLines={1} style={{ color: colors.foreground, fontSize: titleSize, fontWeight: "900", letterSpacing: -0.8 }}>OmniPOS</Text><Text numberOfLines={1} style={{ color: colors.muted, fontSize: width < 360 ? 12 : 13, marginTop: 2 }}>Sell from your live catalog</Text></View><Pressable onPress={() => {}} style={({ pressed }) => [{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#E6F6F7", alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.65 }]}><IconSymbol name="bell.fill" size={21} color={colors.primary} /></Pressable></View>
    <View style={{ height: 52, borderRadius: 17, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 14, shadowColor: "#0E1B3A", shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}><IconSymbol name="search.fill" size={21} color={colors.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search products or scan barcode" placeholderTextColor={colors.muted} style={{ flex: 1, marginLeft: 10, color: colors.foreground, fontSize: 15 }} returnKeyType="search" /><View style={{ paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: colors.border }}><IconSymbol name="barcode.viewfinder" size={23} color={colors.muted} /></View></View>
    <FlatList horizontal style={{ flexGrow: 0 }} showsHorizontalScrollIndicator={false} data={[{ id: undefined, name: "All", color: colors.primary }, ...(categories.data ?? [])]} keyExtractor={(item) => String(item.id ?? "all")} contentContainerStyle={{ gap: 8, alignItems: "center", paddingBottom: 14 }} renderItem={({ item }) => { const active = categoryId === item.id || (!categoryId && !item.id); return <Pressable onPress={() => setCategoryId(item.id)} style={({ pressed }) => [{ height: 38, paddingHorizontal: 16, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.border, shadowColor: "#0E1B3A", shadowOpacity: active ? 0.12 : 0.03, shadowRadius: 6, elevation: active ? 2 : 0 }, pressed && { opacity: 0.72 }]}><Text style={{ color: active ? "#FFFFFF" : colors.foreground, fontWeight: "800", fontSize: 13 }}>{item.name}</Text></Pressable>; }} />
    <FlatList data={data} numColumns={2} keyExtractor={(item) => String(item.id)} columnWrapperStyle={{ gap: 12 }} contentContainerStyle={{ gap: 12, paddingBottom: cart.itemCount ? 112 : 28 }} refreshControl={<RefreshControl refreshing={products.isFetching} onRefresh={() => products.refetch()} tintColor={colors.primary} />} ListEmptyComponent={<View className="items-center py-16"><Text className="text-base text-muted">{products.isLoading ? "Loading live products…" : "No products found"}</Text></View>} renderItem={({ item, index }) => { const inStock = item.stock > 0; const tone = categoryColors[index % categoryColors.length]; return <Pressable onPress={() => cart.add(item)} style={({ pressed }) => [{ flex: 1, minHeight: 236, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 10, shadowColor: "#0E1B3A", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }, pressed && { opacity: 0.82, transform: [{ scale: 0.985 }] }]}><View style={{ height: 132, borderRadius: 15, overflow: "hidden", backgroundColor: colors.background, marginBottom: 11 }}><ProductMedia imageUrl={item.imageUrl} imageProxyUrl={item.imageProxyUrl} name={item.name} color={tone} /></View><Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "800" }} numberOfLines={1}>{item.name}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>SKU: {item.sku}</Text><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}><View style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, backgroundColor: inStock ? "#E8F7F3" : "#FCEAEA" }}><Text style={{ color: inStock ? colors.success : colors.error, fontSize: 11, fontWeight: "800" }}>{inStock ? "In stock" : "Out of stock"}</Text></View><Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "900" }}>{money(item.price)}</Text></View></Pressable>; }} />
    {cart.itemCount > 0 && <Pressable onPress={() => router.push("/checkout")} style={({ pressed }) => [{ position: "absolute", left: 16, right: 16, bottom: 12, minHeight: 68, borderRadius: 22, backgroundColor: "#0E1B3A", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, shadowColor: "#0E1B3A", shadowOpacity: 0.2, shadowRadius: 14, elevation: 7 }, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}><View style={{ width: 43, height: 43, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><IconSymbol name="cart.fill" size={23} color="#FFFFFF" /></View><View className="flex-1 ml-3"><Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>{cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}</Text><Text style={{ color: "#AEB9CD", fontSize: 11, marginTop: 2 }}>Ready to review order</Text></View><Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "900", marginRight: 8 }}>{money(cart.total)}</Text><IconSymbol name="chevron.right" size={23} color="#FFFFFF" /></Pressable>}
  </ScreenContainer>;
}
