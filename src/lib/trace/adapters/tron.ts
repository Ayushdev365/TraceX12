import type { ChainAdapter, NormalizedTx } from "../types";
import { normalizeAddress, validateAddress } from "../validate";
import { fetchExplorerJson } from "./http";

const TRONGRID = "https://api.trongrid.io";

function formatUnits(raw: string, decimals: number): string {
  try {
    const digits = String(raw).replace(/^0+/, "") || "0";
    if (decimals <= 0) return digits;
    const padded = digits.padStart(decimals + 1, "0");
    const i = padded.length - decimals;
    const whole = padded.slice(0, i);
    const frac = padded.slice(i).replace(/0+$/, "");
    return frac ? `${whole}.${frac.slice(0, 8)}` : whole;
  } catch {
    return String(raw);
  }
}

function toUnix(ts: number): number {
  if (!ts) return 0;
  return ts > 1e12 ? Math.floor(ts / 1000) : ts;
}

function ownerAddress(obj: unknown): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "object" && obj && "address" in obj) {
    return String((obj as { address: unknown }).address ?? "");
  }
  return "";
}

function fromTrc20(payload: unknown, limit: number): NormalizedTx[] {
  const data = payload && typeof payload === "object" && "data" in payload
    ? (payload as { data: unknown }).data
    : null;
  if (!Array.isArray(data)) return [];
  const out: NormalizedTx[] = [];
  for (const row of data.slice(0, limit)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const from = String(r.from ?? "");
    const to = String(r.to ?? "");
    const hash = String(r.transaction_id ?? r.hash ?? "");
    if (!from || !to || !hash) continue;
    const token = (r.token_info ?? {}) as Record<string, unknown>;
    const decimals = Number(token.decimals ?? 6) || 6;
    const symbol = String(token.symbol ?? "TRC20").slice(0, 12);
    const raw = String(r.value ?? "0");
    const amount = formatUnits(raw, decimals);
    out.push({
      hash,
      from,
      fromNorm: from,
      to,
      toNorm: to,
      valueAtomic: raw,
      decimals,
      symbol,
      amountDisplay: `${amount} ${symbol}`,
      timestamp: toUnix(Number(r.block_timestamp ?? 0)),
      isToken: true,
      tokenAddress: String(token.address ?? ""),
      explorerUrl: `https://tronscan.org/#/transaction/${hash}`,
    });
  }
  return out;
}

function fromTrx(payload: unknown, limit: number): NormalizedTx[] {
  const data = payload && typeof payload === "object" && "data" in payload
    ? (payload as { data: unknown }).data
    : null;
  if (!Array.isArray(data)) return [];
  const out: NormalizedTx[] = [];
  for (const row of data.slice(0, limit)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const hash = String(r.txID ?? r.transaction_id ?? "");
    const rawData = (r.raw_data ?? {}) as Record<string, unknown>;
    const contracts = Array.isArray(rawData.contract) ? rawData.contract : [];
    const first = (contracts[0] ?? {}) as Record<string, unknown>;
    const param = (first.parameter ?? {}) as Record<string, unknown>;
    const value = (param.value ?? {}) as Record<string, unknown>;
    const from = ownerAddress(value.owner_address) || String(value.owner_address ?? "");
    const to = ownerAddress(value.to_address) || String(value.to_address ?? "");
    const amountSun = String(value.amount ?? "0");
    if (!from || !to || !hash) continue;
    if (String(first.type ?? "") && !String(first.type).includes("Transfer")) continue;
    const amount = formatUnits(amountSun, 6);
    out.push({
      hash,
      from,
      fromNorm: from,
      to,
      toNorm: to,
      valueAtomic: amountSun,
      decimals: 6,
      symbol: "TRX",
      amountDisplay: `${amount} TRX`,
      timestamp: toUnix(Number(rawData.timestamp ?? r.block_timestamp ?? 0)),
      isToken: false,
      explorerUrl: `https://tronscan.org/#/transaction/${hash}`,
    });
  }
  return out;
}

export const tronAdapter: ChainAdapter = {
  chain: "tron",
  displayName: "Tron",
  nativeSymbol: "TRX",
  validate: (address) => !validateAddress("tron", address),
  normalize: (address) => normalizeAddress("tron", address),
  display: (address) => address,
  async fetchHistory(address, limit) {
    const sources: string[] = [];
    const txs: NormalizedTx[] = [];
    const errors: string[] = [];

    const [trc20, trx] = await Promise.allSettled([
      fetchExplorerJson(
        `${TRONGRID}/v1/accounts/${address}/transactions/trc20?limit=${Math.min(limit, 50)}&only_confirmed=true`,
      ),
      fetchExplorerJson(
        `${TRONGRID}/v1/accounts/${address}/transactions?limit=${Math.min(limit, 30)}&only_confirmed=true`,
      ),
    ]);

    if (trc20.status === "fulfilled") {
      txs.push(...fromTrc20(trc20.value, limit));
      sources.push("TronGrid TRC-20");
    } else {
      errors.push(`TronGrid TRC20: ${trc20.reason instanceof Error ? trc20.reason.message : "fail"}`);
    }

    if (trx.status === "fulfilled") {
      txs.push(...fromTrx(trx.value, limit));
      sources.push("TronGrid TRX");
    } else {
      errors.push(`TronGrid TRX: ${trx.reason instanceof Error ? trx.reason.message : "fail"}`);
    }

    const seen = new Set<string>();
    const unique: NormalizedTx[] = [];
    for (const tx of txs) {
      const key = `${tx.hash}:${tx.fromNorm}:${tx.toNorm}:${tx.symbol}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(tx);
    }
    unique.sort((a, b) => b.timestamp - a.timestamp);

    if (unique.length === 0 && errors.length) {
      throw new Error(`Tron APIs returned no usable transfers (${errors.join("; ")})`);
    }
    return {
      txs: unique.slice(0, limit * 2),
      source: sources.join(" + ") || "tron-public-api",
      truncated: unique.length >= limit,
    };
  },
};
