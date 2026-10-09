import { useEffect } from "react";
import { AppState } from "react-native";
import { flushOfflineCheckouts } from "@/lib/offline-sync";

export function OfflineSyncRunner() {
  useEffect(() => {
    const sync = () => { void flushOfflineCheckouts(); };
    sync();
    const interval = setInterval(sync, 30_000);
    const subscription = AppState.addEventListener("change", (state) => { if (state === "active") sync(); });
    return () => { clearInterval(interval); subscription.remove(); };
  }, []);
  return null;
}
