import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, left = 6, right = 4): string {
  if (address.length <= left + right + 1) return address;
  return `${address.slice(0, left)}…${address.slice(-right)}`;
}

export function formatUnix(ts: number | null | undefined): string {
  if (!ts) return "—";
  const ms = ts > 1e12 ? ts : ts * 1000;
  return new Date(ms).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

export function explorerUrl(chain: "ethereum" | "tron", address: string): string {
  return chain === "tron"
    ? `https://tronscan.org/#/address/${address}`
    : `https://etherscan.io/address/${address}`;
}

export function txExplorerUrl(chain: "ethereum" | "tron", hash: string): string {
  return chain === "tron"
    ? `https://tronscan.org/#/transaction/${hash}`
    : `https://etherscan.io/tx/${hash}`;
}
