import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { portal } from "@/lib/portal";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

type FormError = { title: string; message: string } | null;

function classifyError(value: unknown): FormError {
  const raw = value instanceof Error ? value.message : String(value ?? "");
  const normalized = raw.toLowerCase();
  if (normalized.includes("incorrect") || normalized.includes("credential") || normalized.includes("unauthorized") || normalized.includes("password")) {
    return { title: "Check your sign-in details", message: "The email or password was not accepted. Please try again." };
  }
  if (normalized.includes("fetch") || normalized.includes("network") || normalized.includes("timeout") || normalized.includes("connect")) {
    return { title: "Connection problem", message: "We could not reach the shop portal. Check your internet connection and try again." };
  }
  return { title: "Unable to sign in", message: raw || "Something went wrong while signing in. Please try again." };
}

export default function SignIn() {
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) { spin.stopAnimation(); spin.setValue(0); return; }
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [loading, spin]);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError({ title: "Email and password required", message: "Enter both fields to continue to your live shop portal." });
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await portal.login({ email: email.trim(), password });
      await portal.tenantContext();
      router.replace("/(tabs)");
    } catch (value) {
      const nextError = classifyError(value);
      setError(nextError);
      if (Platform.OS !== "web" && nextError) Alert.alert(nextError.title, nextError.message);
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading;
  const buttonStyle = { height: 52, borderRadius: 16, backgroundColor: disabled ? colors.border : colors.primary, alignItems: "center" as const, justifyContent: "center" as const, width: "100%" as const, borderWidth: 0 };
  const inputStyle = { height: 52, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, color: colors.foreground, fontSize: 15 } as const;
  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const buttonContent = loading ? <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}><Animated.View style={{ transform: [{ rotate: rotation }] }}><View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "rgba(255,255,255,0.35)", borderTopColor: "#FFFFFF" }} /></Animated.View><Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 15 }}>Signing in…</Text></View> : <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 15 }}>Sign in</Text>;

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 28 }}><Text style={{ color: colors.foreground, fontSize: 36, lineHeight: 42, fontWeight: "900", letterSpacing: -1.2 }}>Omni<Text style={{ color: colors.primary }}>POS</Text></Text><Text style={{ color: colors.muted, fontSize: 16, lineHeight: 22, marginTop: 8 }}>Sign in to your live shop portal</Text></View>
        <View style={{ borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 18, shadowColor: "#0E1B3A", shadowOpacity: 0.06, shadowRadius: 16, elevation: 2 }}>
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 13, marginBottom: 8 }}>Email</Text>
          <TextInput value={email} onChangeText={(value) => { setEmail(value); if (error) setError(null); }} autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" placeholder="you@business.com" placeholderTextColor={colors.muted} style={inputStyle} returnKeyType="next" />
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 13, marginTop: 16, marginBottom: 8 }}>Password</Text>
          <View style={{ height: 52, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: error ? colors.error : colors.border, flexDirection: "row", alignItems: "center" }}>
            <TextInput value={password} onChangeText={(value) => { setPassword(value); if (error) setError(null); }} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="password" textContentType="password" placeholder="Your portal password" placeholderTextColor={colors.muted} style={{ flex: 1, height: 50, paddingHorizontal: 14, color: colors.foreground, fontSize: 15 }} onSubmitEditing={submit} returnKeyType="done" />
            <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"} hitSlop={8} onPress={() => setShowPassword((visible) => !visible)} style={({ pressed }) => [{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.55 }]}><IconSymbol name={showPassword ? "eye.slash.fill" : "eye.fill"} size={21} color={colors.muted} /></Pressable>
          </View>
          {error ? <View accessibilityRole="alert" style={{ borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, marginTop: 14, backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" }}><View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}><IconSymbol name="checkmark.circle.fill" size={18} color={colors.error} /><View style={{ flex: 1 }}><Text style={{ color: colors.error, fontWeight: "900", fontSize: 13 }}>{error.title}</Text><Text style={{ color: colors.error, fontSize: 13, lineHeight: 19, marginTop: 2 }}>{error.message}</Text></View></View></View> : null}
          <View style={{ marginTop: 16 }}>{Platform.OS === "web" ? <button type="button" disabled={disabled} onClick={submit} style={buttonStyle}>{buttonContent}</button> : <Pressable accessibilityRole="button" disabled={disabled} onPress={submit} style={({ pressed }) => [buttonStyle, pressed && !disabled && { opacity: 0.86 }]}>{buttonContent}</Pressable>}</View>
          {loading ? <Text style={{ color: colors.muted, textAlign: "center", fontSize: 12, marginTop: 10 }}>Connecting securely to your shop portal…</Text> : <Text style={{ color: colors.muted, textAlign: "center", fontSize: 12, marginTop: 10 }}>Your session is protected and synchronized with the portal.</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenContainer>;
}
