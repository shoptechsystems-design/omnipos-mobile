import { Pressable, Text, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { portal } from "@/lib/portal";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

export default function More() {
  const colors = useColors();
  const client = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const context = useQuery({ queryKey: ["tenant-context"], queryFn: portal.tenantContext });
  const me = useQuery({ queryKey: ["me"], queryFn: portal.me });
  const signOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await portal.signOut();
      await client.cancelQueries();
      client.clear();
      router.replace("/sign-in");
    } catch (error) {
      setIsSigningOut(false);
      console.warn("Sign out failed", error);
    }
  };
  return <ScreenContainer className="px-4 pt-4"><Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "900", letterSpacing: -0.6 }}>More</Text><Text style={{ color: colors.muted, fontSize: 13, marginTop: 2, marginBottom: 18 }}>Account and sync status</Text><View style={{ borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }}>BUSINESS</Text><Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "900", marginTop: 6 }}>{context.data?.tenant.name ?? "Loading tenant…"}</Text><Text style={{ color: colors.muted, fontSize: 13, marginTop: 7 }}>Currency: {context.data?.tenant.currency ?? "PKR"}</Text><Text style={{ color: colors.muted, fontSize: 13 }}>Role: {context.data?.membership.role ?? "—"}</Text></View><View style={{ borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }}>SIGNED IN AS</Text><Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800", marginTop: 6 }}>{me.data?.name || me.data?.email || "Loading profile…"}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Live portal session</Text></View><Pressable onPress={() => router.push("/catalog-management")} style={({ pressed }) => [{ minHeight: 66, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", marginBottom: 10 }, pressed && { opacity: 0.72, transform: [{ scale: 0.99 }] }]}><View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E6F6F7", alignItems: "center", justifyContent: "center" }}><IconSymbol name="inventory.fill" size={20} color={colors.primary} /></View><View className="flex-1 ml-3"><Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "900" }}>Catalog Management</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>Add products and categories</Text></View><IconSymbol name="chevron.right" size={21} color={colors.muted} /></Pressable><Pressable onPress={() => router.push("/expenses")} style={({ pressed }) => [{ minHeight: 66, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", marginBottom: 10 }, pressed && { opacity: 0.72, transform: [{ scale: 0.99 }] }]}><View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF0EC", alignItems: "center", justifyContent: "center" }}><IconSymbol name="receipt.fill" size={20} color={colors.error} /></View><View className="flex-1 ml-3"><Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "900" }}>Expenses</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>Track operational expenses</Text></View><IconSymbol name="chevron.right" size={21} color={colors.muted} /></Pressable><Pressable onPress={() => router.push("/business-settings")} style={({ pressed }) => [{ minHeight: 66, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", marginBottom: 12 }, pressed && { opacity: 0.72, transform: [{ scale: 0.99 }] }]}><View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E6F6F7", alignItems: "center", justifyContent: "center" }}><IconSymbol name="adjustments" size={20} color={colors.primary} /></View><View className="flex-1 ml-3"><Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "900" }}>Business Settings</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>Tenant profile, currency, and access</Text></View><IconSymbol name="chevron.right" size={21} color={colors.muted} /></Pressable><View style={{ borderRadius: 20, backgroundColor: "#EAF8F4", padding: 15, marginBottom: 20 }}><Text style={{ color: colors.success, fontWeight: "800" }}>● Synced with OmniPOS portal</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>Catalog, orders, customers, and inventory refresh from the shared tenant routes.</Text></View><Pressable disabled={isSigningOut} onPress={signOut} style={({ pressed }) => [{ height: 54, borderRadius: 17, borderWidth: 1, borderColor: colors.error, alignItems: "center", justifyContent: "center", opacity: isSigningOut ? 0.55 : 1 }, pressed && { opacity: 0.7 }]}><Text style={{ color: colors.error, fontWeight: "800" }}>{isSigningOut ? "Signing out…" : "Sign out"}</Text></Pressable></ScreenContainer>;
}
