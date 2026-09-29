import type { TraceResult } from "./types";

const KEY = "vasptrace:last-result";

export function stashTrace(result: TraceResult): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    /* quota / private mode */
  }
}

export function takeStashedTrace(id: string): TraceResult | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TraceResult;
    if (parsed.traceId !== id) return null;
    return parsed;
  } catch {
    return null;
  }
}
