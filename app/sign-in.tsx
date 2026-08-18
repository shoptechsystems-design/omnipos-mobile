import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { portal } from "@/lib/portal";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function SignIn() {
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim() || !password) return;
    try {
      setError("");
      setLoading(true);
      await portal.login({ email: email.trim(), password });
      await portal.tenantContext();
      router.replace("/(tabs)");
    } catch (value) {
      const message = value instanceof Error ? value.message : "Please check your credentials and try again.";
      setError(message);
      if (Platform.OS !== "web") Alert.alert("Unable to sign in", message);
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !email.trim() || !password;
  const buttonStyle = { height: 52, borderRadius: 16, backgroundColor: disabled ? colors.border : colors.primary, alignItems: "center" as const, justifyContent: "center" as const, width: "100%" as const, borderWidth: 0 };
  const inputStyle = { height: 52, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, color: colors.foreground, fontSize: 15 } as const;
  const buttonContent = <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 15 }}>{loading ? "Signing in…" : "Sign in"}</Text>;

  return <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 28 }}><Text style={{ color: colors.foreground, fontSize: 36, lineHeight: 42, fontWeight: "900", letterSpacing: -1.2 }}>Omni<Text style={{ color: colors.primary }}>POS</Text></Text><Text style={{ color: colors.muted, fontSize: 16, lineHeight: 22, marginTop: 8 }}>Sign in to your live shop portal</Text></View>
        <View style={{ borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 18, shadowColor: "#0E1B3A", shadowOpacity: 0.06, shadowRadius: 16, elevation: 2 }}>
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 13, marginBottom: 8 }}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" placeholder="you@business.com" placeholderTextColor={colors.muted} style={inputStyle} returnKeyType="next" />
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 13, marginTop: 16, marginBottom: 8 }}>Password</Text>
          <View style={{ height: 52, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" }}>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="password" textContentType="password" placeholder="Your portal password" placeholderTextColor={colors.muted} style={{ flex: 1, height: 50, paddingHorizontal: 14, color: colors.foreground, fontSize: 15 }} onSubmitEditing={submit} returnKeyType="done" />
            <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"} hitSlop={8} onPress={() => setShowPassword((visible) => !visible)} style={({ pressed }) => [{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.55 }]}><IconSymbol name={showPassword ? "eye.slash.fill" : "eye.fill"} size={21} color={colors.muted} /></Pressable>
          </View>
          {error ? <View style={{ borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14, backgroundColor: "#FEE2E2" }}><Text style={{ color: colors.error, fontSize: 13, lineHeight: 19 }}>{error}</Text></View> : null}
          <View style={{ marginTop: 16 }}>{Platform.OS === "web" ? <button type="button" disabled={disabled} onClick={submit} style={buttonStyle}>{buttonContent}</button> : <Pressable accessibilityRole="button" disabled={disabled} onPress={submit} style={({ pressed }) => [buttonStyle, pressed && !disabled && { opacity: 0.86 }]}>{buttonContent}</Pressable>}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenContainer>;
}
