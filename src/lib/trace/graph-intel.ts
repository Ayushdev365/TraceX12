import type { GraphEdge, GraphIntelResult, GraphNode, TraceResult } from "./types";

const DIM = 8;
const LAYERS = 2;
const PAGERANK_STEPS = 8;

function l2(v: number[]): number {
  let s = 0;
  for (const x of v) s += x * x;
  return Math.sqrt(s) || 1;
}

function normalize(v: number[]): number[] {
  const n = l2(v);
  return v.map((x) => x / n);
}

function cosine(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += (a[i] ?? 0) * (b[i] ?? 0);
  return s;
}

function mean(vectors: number[][]): number[] {
  const out = Array.from({ length: DIM }, () => 0);
  if (!vectors.length) return out;
  for (const v of vectors) {
    for (let i = 0; i < DIM; i += 1) out[i] += v[i] ?? 0;
  }
  for (let i = 0; i < DIM; i += 1) out[i] /= vectors.length;
  return out;
}

function buildAdj(nodes: GraphNode[], edges: GraphEdge[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const n of nodes) adj.set(n.addressNorm, new Set());
  for (const e of edges) {
    if (!adj.has(e.fromNorm) || !adj.has(e.toNorm)) continue;
    adj.get(e.fromNorm)?.add(e.toNorm);
    adj.get(e.toNorm)?.add(e.fromNorm);
  }
  return adj;
}

function featuresFor(node: GraphNode, hopCap: number, degree: number, seed: string): number[] {
  return normalize([
    1,
    hopCap ? node.hop / hopCap : 0,
    Math.log1p(degree) / 5,
    Math.log1p(node.fanOut) / 5,
    Math.log1p(node.fanIn) / 5,
    node.role === "vasp" || node.role === "both" ? 1 : 0,
    node.role === "risk" || node.role === "both" ? 1 : 0,
    node.addressNorm === seed ? 1 : 0,
  ]);
}

function messagePass(
  nodes: GraphNode[],
  adj: Map<string, Set<string>>,
  initial: Map<string, number[]>,
  layers: number,
): Map<string, number[]> {
  let cur = initial;
  for (let layer = 0; layer < layers; layer += 1) {
    const next = new Map<string, number[]>();
    for (const n of nodes) {
      const self = cur.get(n.addressNorm) ?? Array.from({ length: DIM }, () => 0);
      const neigh = [...(adj.get(n.addressNorm) ?? [])].map(
        (id) => cur.get(id) ?? Array.from({ length: DIM }, () => 0),
      );
      next.set(n.addressNorm, normalize(mean([self, ...neigh])));
    }
    cur = next;
  }
  return cur;
}

function pageRank(nodes: GraphNode[], adj: Map<string, Set<string>>): Map<string, number> {
  const n = nodes.length || 1;
  const damp = 0.85;
  let rank = new Map(nodes.map((node) => [node.addressNorm, 1 / n]));
  for (let step = 0; step < PAGERANK_STEPS; step += 1) {
    const next = new Map<string, number>();
    for (const node of nodes) next.set(node.addressNorm, (1 - damp) / n);
    for (const node of nodes) {
      const nbrs = [...(adj.get(node.addressNorm) ?? [])];
      const share = (rank.get(node.addressNorm) ?? 0) / (nbrs.length || 1);
      if (!nbrs.length) {
        for (const other of nodes) {
          next.set(other.addressNorm, (next.get(other.addressNorm) ?? 0) + damp * share);
        }
      } else {
        for (const id of nbrs) {
          next.set(id, (next.get(id) ?? 0) + damp * share);
        }
      }
    }
    rank = next;
  }
  return rank;
}

/**
 * Unsupervised 2-layer mean-aggregation message passing on the investigation subgraph.
 * Not a trained classifier. Does not identify a VASP or beneficial owner.
 */
export function runGraphIntel(result: TraceResult): GraphIntelResult {
  const started = Date.now();
  const nodes = result.nodes;
  const edges = result.edges;
  const seed = result.walletNorm;
  const adj = buildAdj(nodes, edges);

  const initial = new Map<string, number[]>();
  for (const node of nodes) {
    const degree = adj.get(node.addressNorm)?.size ?? 0;
    initial.set(node.addressNorm, featuresFor(node, result.hopCap, degree, seed));
  }

  const embeddings = messagePass(nodes, adj, initial, LAYERS);
  const ranks = pageRank(nodes, adj);
  const seedEmb = embeddings.get(seed) ?? Array.from({ length: DIM }, () => 0);

  const nodeInsights = nodes.map((node) => {
    const degree = adj.get(node.addressNorm)?.size ?? 0;
    return {
      addressNorm: node.addressNorm,
      hop: node.hop,
      degree,
      centrality: ranks.get(node.addressNorm) ?? 0,
      similarityToSeed: cosine(seedEmb, embeddings.get(node.addressNorm) ?? seedEmb),
    };
  });

  const similarPairs: GraphIntelResult["similarPairs"] = [];
  for (let i = 0; i < nodeInsights.length; i += 1) {
    for (let j = i + 1; j < nodeInsights.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b) continue;
      const score = cosine(embeddings.get(a.addressNorm) ?? seedEmb, embeddings.get(b.addressNorm) ?? seedEmb);
      similarPairs.push({ a: a.addressNorm, b: b.addressNorm, cosine: score });
    }
  }
  similarPairs.sort((x, y) => y.cosine - x.cosine);

  const structuralNeighbors = nodeInsights
    .filter((n) => n.addressNorm !== seed)
    .sort((a, b) => b.similarityToSeed - a.similarityToSeed)
    .slice(0, 6);

  return {
    method: "2-layer mean-aggregation message passing on the investigation subgraph",
    disclaimer:
      "This is unsupervised structural analysis of the already-retrieved investigation graph. It is not a trained VASP classifier, not a calibrated probability, and does not independently identify a VASP or beneficial owner.",
    nodesAnalyzed: nodes.length,
    edgesAnalyzed: edges.length,
    elapsedMs: Date.now() - started,
    layers: LAYERS,
    nodeInsights,
    similarPairs: similarPairs.slice(0, 6),
    structuralNeighbors,
  };
}
