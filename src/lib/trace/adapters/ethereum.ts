import type { ChainAdapter, NormalizedTx } from "../types";
import { normalizeAddress, validateAddress } from "../validate";
import { fetchExplorerJson } from "./http";

const ZERO = "0x0000000000000000000000000000000000000000";
const ETHPLORER = "https://api.ethplorer.io";
const BLOCKSCOUT = "https://eth.blockscout.com/api/v2";

function formatUnits(raw: string, decimals: number): string {
  try {
    const negative = raw.startsWith("-");
    const digits = (negative ? raw.slice(1) : raw).replace(/^0+/, "") || "0";
    if (decimals <= 0) return `${negative ? "-" : ""}${digits}`;
    const padded = digits.padStart(decimals + 1, "0");
    const i = padded.length - decimals;
    const whole = padded.slice(0, i);
    const frac = padded.slice(i).replace(/0+$/, "");
    const body = frac ? `${whole}.${frac.slice(0, 8)}` : whole;
    return `${negative ? "-" : ""}${body}`;
  } catch {
    return raw;
  }
}

function toUnix(ts: number): number {
  if (!ts) return 0;
  return ts > 1e12 ? Math.floor(ts / 1000) : ts;
}

function fromEthplorerNative(rows: unknown[], limit: number): NormalizedTx[] {
  if (!Array.isArray(rows)) return [];
  const out: NormalizedTx[] = [];
  for (const row of rows.slice(0, limit)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const from = String(r.from ?? "");
    const to = String(r.to ?? "");
    const hash = String(r.hash ?? "");
    if (!from || !to || !hash) continue;
    const rawValue = String(r.rawValue ?? "0");
    const amount = formatUnits(rawValue, 18);
    out.push({
      hash,
      from,
      fromNorm: from.toLowerCase(),
      to,
      toNorm: to.toLowerCase(),
      valueAtomic: rawValue,
      decimals: 18,
      symbol: "ETH",
      amountDisplay: `${amount} ETH`,
      timestamp: toUnix(Number(r.timestamp ?? 0)),
      isToken: false,
      explorerUrl: `https://etherscan.io/tx/${hash}`,
    });
  }
  return out;
}

function fromEthplorerTokens(payload: unknown, limit: number): NormalizedTx[] {
  const ops = (payload && typeof payload === "object" && "operations" in payload
    ? (payload as { operations: unknown }).operations
    : payload) as unknown;
  if (!Array.isArray(ops)) return [];
  const out: NormalizedTx[] = [];
  for (const row of ops.slice(0, limit)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const from = String(r.from ?? "");
    const to = String(r.to ?? "");
    const hash = String(r.transactionHash ?? r.hash ?? "");
    if (!from || !to || !hash) continue;
    const token = (r.tokenInfo ?? {}) as Record<string, unknown>;
    const decimals = Number(token.decimals ?? 18) || 18;
    const symbol = String(token.symbol ?? "TOKEN").slice(0, 12);
    const raw = String(r.value ?? "0");
    const amount = formatUnits(raw, decimals);
    out.push({
      hash,
      from,
      fromNorm: from.toLowerCase(),
      to,
      toNorm: to.toLowerCase(),
      valueAtomic: raw,
      decimals,
      symbol,
      amountDisplay: `${amount} ${symbol}`,
      timestamp: toUnix(Number(r.timestamp ?? 0)),
      isToken: true,
      tokenAddress: String(token.address ?? ""),
      explorerUrl: `https://etherscan.io/tx/${hash}`,
    });
  }
  return out;
}

function fromBlockscout(payload: unknown, limit: number): NormalizedTx[] {
  const items = payload && typeof payload === "object" && "items" in payload
    ? (payload as { items: unknown }).items
    : null;
  if (!Array.isArray(items)) return [];
  const out: NormalizedTx[] = [];
  for (const row of items.slice(0, limit)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const fromObj = r.from as Record<string, unknown> | undefined;
    const toObj = r.to as Record<string, unknown> | undefined;
    const from = String(fromObj?.hash ?? "");
    const to = String(toObj?.hash ?? "");
    const hash = String(r.hash ?? "");
    if (!from || !to || !hash) continue;
    const value = String(r.value ?? "0");
    const amount = formatUnits(value, 18);
    const ts = String(r.timestamp ?? "");
    const unix = ts ? Math.floor(new Date(ts).getTime() / 1000) : 0;
    out.push({
      hash,
      from,
      fromNorm: from.toLowerCase(),
      to,
      toNorm: to.toLowerCase(),
      valueAtomic: value,
      decimals: 18,
      symbol: "ETH",
      amountDisplay: `${amount} ETH`,
      timestamp: unix,
      isToken: false,
      explorerUrl: `https://etherscan.io/tx/${hash}`,
    });
  }
  return out;
}

function fromBlockscoutTokens(payload: unknown, limit: number): NormalizedTx[] {
  const items = payload && typeof payload === "object" && "items" in payload
    ? (payload as { items: unknown }).items
    : null;
  if (!Array.isArray(items)) return [];
  const out: NormalizedTx[] = [];
  for (const row of items.slice(0, limit)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const fromObj = r.from as Record<string, unknown> | undefined;
    const toObj = r.to as Record<string, unknown> | undefined;
    const from = String(fromObj?.hash ?? "");
    const to = String(toObj?.hash ?? "");
    const hash = String((r.transaction_hash as string) ?? (r.tx_hash as string) ?? "");
    if (!from || !to || !hash) continue;
    const token = (r.token ?? {}) as Record<string, unknown>;
    const decimals = Number(token.decimals ?? 18) || 18;
    const symbol = String(token.symbol ?? "TOKEN").slice(0, 12);
    const total = r.total && typeof r.total === "object" ? (r.total as Record<string, unknown>) : null;
    const raw = String(total?.value ?? r.value ?? "0");
    const amount = formatUnits(raw, decimals);
    const ts = String(r.timestamp ?? "");
    const unix = ts ? Math.floor(new Date(ts).getTime() / 1000) : 0;
    out.push({
      hash,
      from,
      fromNorm: from.toLowerCase(),
      to,
      toNorm: to.toLowerCase(),
      valueAtomic: raw,
      decimals,
      symbol,
      amountDisplay: `${amount} ${symbol}`,
      timestamp: unix,
      isToken: true,
      tokenAddress: String(token.address ?? ""),
      explorerUrl: `https://etherscan.io/tx/${hash}`,
    });
  }
  return out;
}

function mergeTxs(lists: NormalizedTx[][]): NormalizedTx[] {
  const seen = new Set<string>();
  const out: NormalizedTx[] = [];
  for (const list of lists) {
    for (const tx of list) {
      const key = `${tx.hash}:${tx.fromNorm}:${tx.toNorm}:${tx.symbol}:${tx.valueAtomic}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (tx.fromNorm === ZERO || tx.toNorm === ZERO) continue;
      out.push(tx);
    }
  }
  out.sort((a, b) => b.timestamp - a.timestamp);
  return out;
}

export const ethereumAdapter: ChainAdapter = {
  chain: "ethereum",
  displayName: "Ethereum",
  nativeSymbol: "ETH",
  validate: (address) => !validateAddress("ethereum", address),
  normalize: (address) => normalizeAddress("ethereum", address),
  display: (address) => address,
  async fetchHistory(address, limit) {
    const sources: string[] = [];
    const native: NormalizedTx[] = [];
    const tokens: NormalizedTx[] = [];
    const errors: string[] = [];

    const [nativeRes, tokenRes] = await Promise.allSettled([
      fetchExplorerJson(`${ETHPLORER}/getAddressTransactions/${address}?apiKey=freekey&limit=${limit}`),
      fetchExplorerJson(`${ETHPLORER}/getAddressHistory/${address}?apiKey=freekey&type=transfer&limit=${limit}`),
    ]);

    if (nativeRes.status === "fulfilled") {
      native.push(...fromEthplorerNative(nativeRes.value as unknown[], limit));
      sources.push("Ethplorer");
    } else {
      errors.push(`Ethplorer native: ${nativeRes.reason instanceof Error ? nativeRes.reason.message : "fail"}`);
    }

    if (tokenRes.status === "fulfilled") {
      tokens.push(...fromEthplorerTokens(tokenRes.value, limit));
      if (!sources.includes("Ethplorer")) sources.push("Ethplorer");
    } else {
      errors.push(`Ethplorer tokens: ${tokenRes.reason instanceof Error ? tokenRes.reason.message : "fail"}`);
    }

    if (native.length === 0 || tokens.length === 0) {
      const fallbacks: Promise<void>[] = [];
      if (native.length === 0) {
        fallbacks.push(
          fetchExplorerJson(`${BLOCKSCOUT}/addresses/${address}/transactions?limit=${Math.min(limit, 50)}`)
            .then((payload) => {
              native.push(...fromBlockscout(payload, limit));
              sources.push("Blockscout");
            })
            .catch((err) => {
              errors.push(`Blockscout native: ${err instanceof Error ? err.message : "fail"}`);
            }),
        );
      }
      if (tokens.length === 0) {
        fallbacks.push(
          fetchExplorerJson(`${BLOCKSCOUT}/addresses/${address}/token-transfers?limit=${Math.min(limit, 50)}`)
            .then((payload) => {
              tokens.push(...fromBlockscoutTokens(payload, limit));
              if (!sources.includes("Blockscout")) sources.push("Blockscout");
            })
            .catch((err) => {
              errors.push(`Blockscout tokens: ${err instanceof Error ? err.message : "fail"}`);
            }),
        );
      }
      await Promise.all(fallbacks);
    }

    const txs = mergeTxs([native, tokens]).slice(0, limit * 2);
    if (txs.length === 0 && errors.length) {
      throw new Error(`Ethereum APIs returned no usable transfers (${errors.join("; ")})`);
    }
    return {
      txs,
      source: sources.join(" + ") || "ethereum-public-api",
      truncated: native.length + tokens.length >= limit,
    };
  },
};
