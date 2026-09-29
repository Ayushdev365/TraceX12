import type { ChainId } from "./types";

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;
// Tron mainnet Base58Check, typically 34 chars starting with T.
const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

export function detectChain(address: string): ChainId | null {
  const trimmed = address.trim();
  if (ETH_RE.test(trimmed)) return "ethereum";
  if (TRON_RE.test(trimmed)) return "tron";
  return null;
}

export function validateAddress(chain: ChainId, address: string): string | null {
  const trimmed = address.trim();
  if (chain === "ethereum") {
    if (!ETH_RE.test(trimmed)) {
      return "Ethereum addresses must be 42-character 0x-prefixed hex.";
    }
    return null;
  }
  if (!TRON_RE.test(trimmed)) {
    return "Tron addresses must be 34-character Base58 strings starting with T.";
  }
  return null;
}

export function normalizeAddress(chain: ChainId, address: string): string {
  const trimmed = address.trim();
  return chain === "ethereum" ? trimmed.toLowerCase() : trimmed;
}

export function sanitizeCaseId(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().slice(0, 64).replace(/[^\w\-./]/g, "");
  return cleaned || null;
}

export function clampHopCap(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 3;
  return Math.min(6, Math.max(2, Math.round(v)));
}
