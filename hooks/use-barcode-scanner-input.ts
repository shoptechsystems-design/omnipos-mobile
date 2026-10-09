import { useCallback, useRef } from "react";

export function useBarcodeScannerInput(onScan: (value: string) => void) {
  const startedAt = useRef(0);
  const buffer = useRef("");
  const onChangeText = useCallback((value: string) => {
    const now = Date.now();
    if (!startedAt.current || now - startedAt.current > 180) {
      startedAt.current = now;
      buffer.current = value;
    } else {
      buffer.current = value;
    }
    if (value.endsWith("\n") || value.endsWith("\r")) {
      const scanned = value.trim();
      if (scanned.length >= 3) onScan(scanned);
      buffer.current = "";
      startedAt.current = 0;
    }
  }, [onScan]);
  const onSubmitEditing = useCallback((value: string) => {
    const scanned = value.trim();
    if (scanned.length >= 3) onScan(scanned);
    buffer.current = "";
    startedAt.current = 0;
  }, [onScan]);
  return { onChangeText, onSubmitEditing };
}
