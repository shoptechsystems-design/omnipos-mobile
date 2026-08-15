import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "@/components/screen-container";
import { portal } from "@/lib/portal";
import { useColors } from "@/hooks/use-colors";
import type { InventoryItem } from "@/shared/omnipos";

const asRecord = (value: unknown) => (value && typeof value === "object" ? value as Record<string, unknown> : {});
const text = (value: unknown, fallback = "—") => value == null || value === "" ? fallback : String(value);
const numberValue = (value: unknown) => Number(value ?? 0) || 0;

type InventoryTab = "stock" | "movements" | "purchases";

export default function Inventory() {
  const colors = useColors();
  const client = useQueryClient();
  const [tab, setTab] = useState<InventoryTab>("stock");
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState("");
  const [reason, setReason] = useState("");
  const inventory = useQuery({ queryKey: ["inventory"], queryFn: () => portal.inventory() });
  const lowStock = useQuery({ queryKey: ["inventory", "lowStock"], queryFn: portal.lowStock });
  const movements = useQuery({ queryKey: ["inventory", "movements"], queryFn: () => portal.movements() });
  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: portal.suppliers });
  const purchases = useQuery({ queryKey: ["purchases"], queryFn: portal.purchases });
  const inventoryRows: InventoryItem[] = Array.isArray(inventory.data) ? inventory.data as InventoryItem[] : [];
  const lowStockRows: InventoryItem[] = Array.isArray(lowStock.data) ? lowStock.data as InventoryItem[] : [];
  const supplierRows = Array.isArray(suppliers.data) ? suppliers.data : [];
  const purchaseRows = Array.isArray(purchases.data) ? purchases.data : [];
  const movementRows = Array.isArray(movements.data) ? movements.data : [];
  const refreshing = inventory.isFetching || lowStock.isFetching || movements.isFetching || suppliers.isFetching || purchases.isFetching;
  const totalUnits = useMemo(() => inventoryRows.reduce((sum, item) => sum + item.stock, 0), [inventoryRows]);
  const adjust = useMutation({
    mutationFn: () => portal.adjustInventory({ productId: selected?.id ?? 0, adjustment: Number(adjustment), reason: reason.trim() || "Mobile stock adjustment" }),
    onSuccess: () => {
      setSelected(null); setAdjustment(""); setReason("");
      client.invalidateQueries({ queryKey: ["inventory"] });
      client.invalidateQueries({ queryKey: ["products"] });
      Alert.alert("Inventory updated", "The stock adjustment is synchronized with the portal.");
    },
    onError: (error) => Alert.alert("Adjustment failed", error.message),
  });
  const reload = () => { inventory.refetch(); lowStock.refetch(); movements.refetch(); suppliers.refetch(); purchases.refetch(); };
  const fieldStyle = { height: 48, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, color: colors.foreground, marginTop: 10 } as const;
  const tabStyle = (active: boolean) => ({ paddingHorizontal: 14, height: 38, borderRadius: 19, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.border });
  return <ScreenContainer className="px-4 pt-4" edges={["top", "left", "right"]}>
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.primary} />} contentContainerStyle={{ paddingBottom: 132 }} showsVerticalScrollIndicator={false}>
      <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "900", letterSpacing: -0.6 }}>Inventory</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>Portal-synchronized stock, purchasing, and audit movements</Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
        {[{ label: "Products", value: inventoryRows.length }, { label: "Units", value: totalUnits }, { label: "Low stock", value: lowStockRows.length }, { label: "POs", value: purchaseRows.length }].map((card) => <View key={card.label} style={{ flex: 1, minHeight: 78, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 11 }}><Text style={{ color: colors.muted, fontSize: 10, fontWeight: "800" }}>{card.label}</Text><Text style={{ color: colors.foreground, fontSize: 21, fontWeight: "900", marginTop: 7 }}>{card.value}</Text></View>)}
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 18, marginBottom: 14 }}>
        {[{ key: "stock" as const, label: "Stock" }, { key: "movements" as const, label: "Audit ledger" }, { key: "purchases" as const, label: "Purchases" }].map((item) => <Pressable key={item.key} onPress={() => setTab(item.key)} style={({ pressed }) => [tabStyle(tab === item.key), pressed && { opacity: 0.7 }]}><Text style={{ color: tab === item.key ? "#FFFFFF" : colors.foreground, fontSize: 12, fontWeight: "800" }}>{item.label}</Text></Pressable>)}
      </View>
      {tab === "stock" && <>
        {(lowStockRows.length) > 0 && <View style={{ borderRadius: 18, backgroundColor: "#FFF5DF", borderWidth: 1, borderColor: "#F5D28C", padding: 14, marginBottom: 12 }}><Text style={{ color: "#9A6500", fontWeight: "900" }}>Low Stock Alerts</Text><Text style={{ color: "#9A6500", marginTop: 4, fontSize: 12 }}>{lowStockRows.length} products are at or below their portal minimum.</Text></View>}
        {inventoryRows.map((item) => <View key={item.id} style={{ borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 15, marginBottom: 10 }}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{item.name}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{item.sku}</Text></View><Text style={{ color: item.stock <= 5 ? colors.warning : colors.primary, fontWeight: "900", fontSize: 20 }}>{item.stock}</Text></View><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}><Text style={{ color: item.stock <= 5 ? colors.warning : colors.success, fontSize: 11, fontWeight: "800" }}>{item.stock <= 5 ? "Low stock" : "Healthy stock"}</Text><Pressable onPress={() => setSelected(item)} style={({ pressed }) => [{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, pressed && { opacity: 0.7 }]}><Text style={{ color: colors.primary, fontWeight: "800", fontSize: 12 }}>Adjust stock</Text></Pressable></View></View>)}
        {inventory.isLoading && <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 40 }}>Loading portal inventory…</Text>}
        {!inventory.isLoading && !inventoryRows.length && <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 40 }}>No inventory records returned for this tenant.</Text>}
        <View style={{ marginTop: 8, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 15 }}><Text style={{ color: colors.foreground, fontWeight: "900" }}>Suppliers</Text><Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{supplierRows.length} supplier records synchronized from the portal.</Text></View>
      </>}
      {tab === "movements" && <View>{movementRows.map((value, index) => { const row = asRecord(value); return <View key={String(row.id ?? index)} style={{ borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 9 }}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ color: colors.foreground, fontWeight: "900" }}>{text(row.type, "Movement")}</Text><Text style={{ color: numberValue(row.quantity) >= 0 ? colors.success : colors.error, fontWeight: "900" }}>{numberValue(row.quantity) > 0 ? "+" : ""}{numberValue(row.quantity)}</Text></View><Text style={{ color: colors.muted, marginTop: 5, fontSize: 12 }}>{text(row.reason)} · {text(row.createdAt)}</Text></View>; })}{!movements.isLoading && !movementRows.length && <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 45 }}>No audit movements returned for this tenant.</Text>}</View>}
      {tab === "purchases" && <View>{purchaseRows.map((value, index) => { const row = asRecord(value); const purchase = asRecord(row.purchase); const supplier = asRecord(row.supplier); return <View key={String(purchase.id ?? index)} style={{ borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 9 }}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ color: colors.foreground, fontWeight: "900" }}>{text(purchase.purchaseNumber, "Purchase order")}</Text><Text style={{ color: colors.primary, fontWeight: "900" }}>Rs{numberValue(purchase.total).toLocaleString("en-PK")}</Text></View><Text style={{ color: colors.muted, marginTop: 5, fontSize: 12 }}>{text(purchase.status)} · {text(supplier.name, "No supplier")}</Text></View>; })}{!purchases.isLoading && !purchaseRows.length && <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 45 }}>No purchase orders returned for this tenant.</Text>}</View>}
    </ScrollView>
    <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}><View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(14,27,58,0.32)" }}><View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 28 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><View><Text style={{ color: colors.foreground, fontSize: 21, fontWeight: "900" }}>Adjust stock</Text><Text style={{ color: colors.muted, marginTop: 3 }}>{selected?.name}</Text></View><Pressable onPress={() => setSelected(null)}><Text style={{ color: colors.muted, fontSize: 24 }}>×</Text></Pressable></View><TextInput value={adjustment} onChangeText={setAdjustment} keyboardType="numbers-and-punctuation" placeholder="Quantity change, e.g. 10 or -2" placeholderTextColor={colors.muted} style={fieldStyle} /><TextInput value={reason} onChangeText={setReason} placeholder="Reason" placeholderTextColor={colors.muted} style={fieldStyle} /><Pressable disabled={!adjustment || adjust.isPending} onPress={() => adjust.mutate()} style={({ pressed }) => [{ height: 54, borderRadius: 16, backgroundColor: adjustment ? colors.primary : colors.border, alignItems: "center", justifyContent: "center", marginTop: 16 }, pressed && { opacity: 0.85 }]}><Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{adjust.isPending ? "Saving…" : "Apply adjustment"}</Text></Pressable></View></View></Modal>
  </ScreenContainer>;
}
