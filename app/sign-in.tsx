import { useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { portal } from "@/lib/portal";
import { ScreenContainer } from "@/components/screen-container";

export default function SignIn() {
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const buttonContent = <Text className="text-white font-bold">{loading ? "Signing in…" : "Sign in"}</Text>;

  return <ScreenContainer className="px-5 justify-center" edges={["top", "bottom", "left", "right"]}>
    <View className="mb-10"><Text className="text-4xl font-bold text-foreground">Omni<Text style={{ color: colors.primary }}>POS</Text></Text><Text className="text-base text-muted mt-2">Sign in to your live shop portal</Text></View>
    <View className="rounded-3xl bg-surface border border-border p-5">
      <Text className="font-semibold text-foreground mb-2">Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@business.com" placeholderTextColor={colors.muted} className="h-12 rounded-xl bg-background px-3 text-foreground mb-4" />
      <Text className="font-semibold text-foreground mb-2">Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Your portal password" placeholderTextColor={colors.muted} className="h-12 rounded-xl bg-background px-3 text-foreground mb-3" onSubmitEditing={submit} returnKeyType="done" />
      {error ? <View className="rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: "#FEE2E2" }}><Text style={{ color: colors.error }}>{error}</Text></View> : null}
      {Platform.OS === "web" ? <button type="button" disabled={disabled} onClick={submit} style={buttonStyle}>{buttonContent}</button> : <Pressable disabled={disabled} onPress={submit} style={({ pressed }) => [buttonStyle, pressed && !disabled && { opacity: 0.86 }]}>{buttonContent}</Pressable>}
    </View>
  </ScreenContainer>;
}
