import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { portal } from "@/lib/portal";
import { useColors } from "@/hooks/use-colors";

export function usePortalGate() {
  const colors = useColors();
  const query = useQuery({ queryKey: ["me"], queryFn: portal.me, retry: false, staleTime: 20_000 });
  useEffect(() => {
    if (query.isError || (query.isSuccess && !query.data)) return void router.replace("/sign-in");
    if (!query.isPending) return;
    const fallback = setTimeout(() => router.replace("/sign-in"), 5_000);
    return () => clearTimeout(fallback);
  }, [query.isError, query.isPending, query.isSuccess, query.data]);
  const loading = query.isPending || (query.isFetching && !query.data);
  const blocked = query.isError || (query.isSuccess && !query.data);
  const gate = loading || blocked ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} size="small" /></View> : null;
  return { ...query, gate, isReady: Boolean(query.data) && !query.isError };
}
