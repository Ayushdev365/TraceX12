import type { ChainId, ChainAdapter } from "../types";
import { ethereumAdapter } from "./ethereum";
import { tronAdapter } from "./tron";

const adapters: Record<ChainId, ChainAdapter> = {
  ethereum: ethereumAdapter,
  tron: tronAdapter,
};

export function getAdapter(chain: ChainId): ChainAdapter {
  const adapter = adapters[chain];
  if (!adapter) throw new Error(`No chain adapter registered for ${chain}`);
  return adapter;
}

export { ethereumAdapter, tronAdapter };
