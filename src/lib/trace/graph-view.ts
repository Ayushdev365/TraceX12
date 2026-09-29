import type { GraphEdge, GraphNode, TraceResult } from "./types";

export type BundledEdge = {
  id: string;
  fromNorm: string;
  toNorm: string;
  count: number;
  amountDisplay: string;
  symbol: string;
  timestamp: number;
  firstTimestamp: number;
  lastTimestamp: number;
  txHash: string;
  sampleId: string;
  explorerUrl: string;
  onPath: boolean;
  isRisk: boolean;
};

export function pathAddressSet(result: TraceResult): Set<string> {
  return new Set(result.attributed?.path ?? []);
}

export function attributedPairKeys(result: TraceResult): Set<string> {
  const path = result.attributed?.path ?? [];
  const hops = new Set<string>();
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i];
    const b = path[i + 1];
    if (!a || !b) continue;
    hops.add(`${a}::${b}`);
    hops.add(`${b}::${a}`);
  }
  return hops;
}

/** Isolate is optional. Default is the complete investigation graph. */
export function nodesToRender(
  nodes: GraphNode[],
  path: Set<string>,
  isolatePath: boolean,
): GraphNode[] {
  if (!isolatePath || path.size < 2) return nodes;
  return nodes.filter((n) => path.has(n.addressNorm));
}

export function bundleEdges(
  edges: GraphEdge[],
  visible: Set<string>,
  pathPairs: Set<string>,
  riskNodes: Set<string> = new Set(),
): BundledEdge[] {
  const map = new Map<string, BundledEdge>();
  for (const e of edges) {
    if (!visible.has(e.fromNorm) || !visible.has(e.toNorm)) continue;
    const key = `${e.fromNorm}->${e.toNorm}`;
    const cur = map.get(key);
    if (!cur) {
      map.set(key, {
        id: `bundle:${key}`,
        fromNorm: e.fromNorm,
        toNorm: e.toNorm,
        count: 1,
        amountDisplay: e.amountDisplay,
        symbol: e.symbol,
        timestamp: e.timestamp,
        firstTimestamp: e.timestamp,
        lastTimestamp: e.timestamp,
        txHash: e.txHash,
        sampleId: e.id,
        explorerUrl: e.explorerUrl,
        onPath: pathPairs.has(`${e.fromNorm}::${e.toNorm}`),
        isRisk: riskNodes.has(e.fromNorm) || riskNodes.has(e.toNorm),
      });
      continue;
    }
    cur.count += 1;
    cur.firstTimestamp = Math.min(cur.firstTimestamp, e.timestamp);
    if (e.timestamp >= cur.lastTimestamp) {
      cur.lastTimestamp = e.timestamp;
      cur.timestamp = e.timestamp;
      cur.amountDisplay = e.amountDisplay;
      cur.symbol = e.symbol;
      cur.txHash = e.txHash;
      cur.sampleId = e.id;
      cur.explorerUrl = e.explorerUrl;
    }
  }
  return [...map.values()];
}

export function layoutPositions(
  nodes: GraphNode[],
  path: Set<string>,
): Map<string, { x: number; y: number }> {
  const byHop = new Map<number, GraphNode[]>();
  for (const n of nodes) {
    const list = byHop.get(n.hop) ?? [];
    list.push(n);
    byHop.set(n.hop, list);
  }

  const X_GAP = 310;
  const maxCount = Math.max(1, ...[...byHop.values()].map((list) => list.length));
  const yGap = maxCount > 14 ? 96 : maxCount > 8 ? 104 : 116;
  const pos = new Map<string, { x: number; y: number }>();

  for (const [hop, list] of byHop) {
    list.sort((a, b) => {
      const rank = (n: GraphNode) => {
        if (path.has(n.addressNorm)) return 0;
        if (n.role === "vasp" || n.role === "both") return 1;
        if (n.role === "risk") return 2;
        return 3;
      };
      return rank(a) - rank(b);
    });
    list.forEach((n, i) => {
      pos.set(n.addressNorm, { x: hop * X_GAP, y: i * yGap });
    });
  }
  return pos;
}
