import { Alert, Pressable, Text, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { portal } from "@/lib/portal";
import { useColors } from "@/hooks/use-colors";

export default function More() {
  const colors = useColors();
  const client = useQueryClient();
  const context = useQuery({ queryKey: ["tenant-context"], queryFn: portal.tenantContext });
  const me = useQuery({ queryKey: ["me"], queryFn: portal.me });
  const signOut = async () => {
    try {
      await portal.signOut();
      await client.cancelQueries();
      client.clear();
      router.replace("/sign-in");
    } catch (error) {
      Alert.alert("Sign out failed", error instanceof Error ? error.message : "Please try again.");
    }
  };
  return <ScreenContainer className="px-4 pt-4"><Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "900", letterSpacing: -0.6 }}>More</Text><Text style={{ color: colors.muted, fontSize: 13, marginTop: 2, marginBottom: 18 }}>Account and sync status</Text><View style={{ borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }}>BUSINESS</Text><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "900", marginTop: 6 }}>{context.data?.tenant.name ?? "Loading tenant…"}</Text><Text style={{ color: colors.muted, fontSize: 13, marginTop: 7 }}>Currency: {context.data?.tenant.currency ?? "PKR"}</Text><Text style={{ color: colors.muted, fontSize: 13 }}>Role: {context.data?.membership.role ?? "—"}</Text></View><View style={{ borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }}>SIGNED IN AS</Text><Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800", marginTop: 6 }}>{me.data?.name || me.data?.email || "Loading profile…"}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Live portal session</Text></View><Pressable onPress={() => router.push("/business-settings")} style={({ pressed }) => [{ minHeight: 66, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", marginBottom: 12 }, pressed && { opacity: 0.72, transform: [{ scale: 0.99 }] }]}><View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E6F6F7", alignItems: "center", justifyContent: "center" }}><IconSymbol name="adjustments" size={20} color={colors.primary} /></View><View className="flex-1 ml-3"><Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "900" }}>Business Settings</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>Tenant profile, currency, and access</Text></View><IconSymbol name="chevron.right" size={21} color={colors.muted} /></Pressable><View style={{ borderRadius: 20, backgroundColor: "#EAF8F4", padding: 15, marginBottom: 20 }}><Text style={{ color: colors.success, fontWeight: "800" }}>● Synced with OmniPOS portal</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>Catalog, orders, customers, and inventory refresh from the shared tenant routes.</Text></View><Pressable onPress={() => Alert.alert("Sign out?", "Your portal session will be removed from this device.", [{ text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: signOut }])} style={({ pressed }) => [{ height: 54, borderRadius: 17, borderWidth: 1, borderColor: colors.error, alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.7 }]}><Text style={{ color: colors.error, fontWeight: "800" }}>Sign out</Text></Pressable></ScreenContainer>;
}
