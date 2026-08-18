import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export type FormError = { title: string; message: string } | null;

export function classifyFormError(value: unknown): FormError {
  const raw = value instanceof Error ? value.message : String(value ?? "");
  const normalized = raw.toLowerCase();
  if (normalized.includes("required") || normalized.includes("invalid") || normalized.includes("must") || normalized.includes("positive")) return { title: "Check the form", message: raw || "Review the highlighted fields and try again." };
  if (normalized.includes("unauthorized") || normalized.includes("forbidden") || normalized.includes("admin") || normalized.includes("login")) return { title: "Permission required", message: "Your portal account does not have permission for this action. Sign in again or ask a tenant administrator." };
  if (normalized.includes("fetch") || normalized.includes("network") || normalized.includes("timeout") || normalized.includes("connect")) return { title: "Connection problem", message: "We could not reach the live portal. Check your internet connection and try again." };
  return { title: "Could not save", message: raw || "Something went wrong while saving. Please try again." };
}

export function FormErrorCard({ error }: { error: FormError }) {
  const colors = useColors();
  if (!error) return null;
  return <View accessibilityRole="alert" style={{ borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 12, backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" }}><View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}><IconSymbol name="checkmark.circle.fill" size={18} color={colors.error} /><View style={{ flex: 1 }}><Text style={{ color: colors.error, fontWeight: "900", fontSize: 13 }}>{error.title}</Text><Text style={{ color: colors.error, fontSize: 13, lineHeight: 19, marginTop: 2 }}>{error.message}</Text></View></View></View>;
}

export function LoadingButton({ label, loading, disabled, onPress }: { label: string; loadingLabel: string; loading: boolean; disabled?: boolean; onPress: () => void }) {
  const colors = useColors();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!loading) { spin.stopAnimation(); spin.setValue(0); return; }
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })); loop.start(); return () => loop.stop();
  }, [loading, spin]);
  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [{ flex: 1, height: 52, borderRadius: 15, backgroundColor: disabled || loading ? colors.border : colors.primary, alignItems: "center", justifyContent: "center" }, pressed && !loading && { opacity: 0.82 }]}>{loading ? <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}><Animated.View style={{ transform: [{ rotate: rotation }] }}><View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "rgba(255,255,255,0.35)", borderTopColor: "#FFFFFF" }} /></Animated.View><Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Saving…</Text></View> : <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{label}</Text>}</Pressable>;
}
