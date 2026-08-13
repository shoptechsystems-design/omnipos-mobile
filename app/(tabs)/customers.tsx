import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ScreenContainer } from "@/components/screen-container";
import { portal } from "@/lib/portal";
import { useColors } from "@/hooks/use-colors";

export default function Customers() {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const context = useQuery({ queryKey: ["tenant-context"], queryFn: portal.tenantContext, retry: false });
  const q = useQuery({ queryKey: ["customers", search], queryFn: () => portal.customers({ search: search.trim() || undefined }), enabled: context.isSuccess });
  const errorMessage = q.error instanceof Error ? q.error.message : context.error instanceof Error ? context.error.message : "Unable to load customers.";

  return <ScreenContainer className="px-4 pt-4">
    <View className="flex-row justify-between items-center"><View><Text className="text-3xl font-bold text-foreground">Customers</Text><Text className="text-sm text-muted mb-4">Directory and loyalty</Text></View><Pressable onPress={() => alert("Customer creation form is ready to connect to customers.create")} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><Text className="text-white text-2xl">+</Text></Pressable></View>
    <TextInput value={search} onChangeText={setSearch} placeholder="Search customers" placeholderTextColor={colors.muted} className="h-12 rounded-2xl border border-border bg-surface px-4 text-foreground mb-4" />
    {context.isError || q.isError ? <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#FEE2E2" }}><Text style={{ color: colors.error, fontWeight: "700" }}>Customer sync unavailable</Text><Text style={{ color: colors.error, marginTop: 4 }}>{errorMessage}</Text><Pressable onPress={() => { context.refetch(); q.refetch(); }} style={{ marginTop: 12 }}><Text style={{ color: colors.error, fontWeight: "800" }}>Retry</Text></Pressable></View> : null}
    <FlatList data={q.data ?? []} keyExtractor={(x) => String(x.id)} contentContainerStyle={{ gap: 10, paddingBottom: 24 }} renderItem={({ item }) => <View className="rounded-2xl bg-surface border border-border p-4"><View className="flex-row justify-between"><Text className="font-bold text-foreground">{item.name}</Text><Text style={{ color: colors.primary, fontWeight: "700" }}>{item.loyaltyPoints} pts</Text></View><Text className="text-sm text-muted mt-1">{item.phone || item.email || "No contact details"}</Text><Text className="text-sm text-muted mt-2">Total spent: Rs{item.totalSpent.toLocaleString("en-PK")}</Text></View>} ListEmptyComponent={!context.isError && !q.isError ? <Text className="text-muted text-center py-12">{context.isLoading || q.isLoading ? "Loading customers…" : "No customers found"}</Text> : null} />
  </ScreenContainer>;
}
