import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { portal } from "@/lib/portal";

export default function Entry() {
  const q = useQuery({ queryKey: ["me"], queryFn: portal.me, retry: false });
  useEffect(() => {
    if (q.isSuccess) return void router.replace(q.data ? "/(tabs)" : "/sign-in");
    if (q.isError) return void router.replace("/sign-in");
    const fallback = setTimeout(() => router.replace("/sign-in"), 5_000);
    return () => clearTimeout(fallback);
  }, [q.isSuccess, q.isError, q.data]);
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#0B8AA8" /></View>;
}
