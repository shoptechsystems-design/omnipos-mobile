import * as Network from "expo-network";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, AppState, Pressable, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { listQueuedCheckouts } from "@/lib/offline-db";
import { flushOfflineCheckouts } from "@/lib/offline-sync";

type QueueStatus = { pending: number; failed: number; lastError?: string; lastSyncedAt?: number };

export function OfflineSyncRunner() {
  const colors = useColors();
  const [status, setStatus] = useState<QueueStatus>({ pending: 0, failed: 0 });
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const entries = await listQueuedCheckouts();
    setStatus((current) => ({ ...current, pending: entries.length, failed: entries.filter((entry) => entry.status === "failed").length, lastError: entries.find((entry) => entry.lastError)?.lastError }));
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      await flushOfflineCheckouts();
      setStatus((current) => ({ ...current, lastSyncedAt: Date.now() }));
      await refresh();
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
    void sync();
    const interval = setInterval(() => { void sync(); }, 30_000);
    const appSubscription = AppState.addEventListener("change", (state) => { if (state === "active" || state === "background") void sync(); });
    const networkSubscription = Network.addNetworkStateListener((state) => { if (state.isConnected && state.isInternetReachable !== false) void sync(); });
    return () => { clearInterval(interval); appSubscription.remove(); networkSubscription.remove(); };
  }, [refresh, sync]);

  if (!status.pending) return null;
  const headline = status.failed ? `${status.failed} sale${status.failed === 1 ? "" : "s"} need attention` : `${status.pending} sale${status.pending === 1 ? "" : "s"} waiting to sync`;
  return <View style={{ position: "absolute", left: 14, right: 14, top: 48, zIndex: 100, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: status.failed ? colors.error : colors.border, padding: 12, shadowColor: "#0E1B3A", shadowOpacity: 0.14, shadowRadius: 12, elevation: 8 }}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {syncing ? <ActivityIndicator size="small" color={colors.primary} /> : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: status.failed ? colors.error : colors.warning }} />}
      <View style={{ flex: 1, marginLeft: 9 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 13 }}>{headline}</Text><Text style={{ color: colors.muted, fontSize: 11, marginTop: 3 }}>{status.lastError ? status.lastError.slice(0, 84) : "They will sync automatically when the connection returns."}</Text></View>
      <Pressable onPress={() => void sync()} disabled={syncing} style={{ paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.primary, opacity: syncing ? 0.55 : 1 }}><Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>{syncing ? "Syncing" : "Retry"}</Text></Pressable>
    </View>
  </View>;
}
