import assert from "node:assert/strict";
import test from "node:test";
import { bundleEdges, layoutPositions, nodesToRender, pathAddressSet } from "./graph-view.ts";
import type { GraphEdge, GraphNode, TraceResult } from "./types.ts";

function node(partial: Partial<GraphNode> & Pick<GraphNode, "addressNorm" | "hop" | "role">): GraphNode {
  return {
    id: partial.addressNorm,
    address: partial.addressNorm,
    addressNorm: partial.addressNorm,
    hop: partial.hop,
    role: partial.role,
    label: partial.label ?? null,
    vaspId: partial.vaspId ?? null,
    vaspName: partial.vaspName ?? null,
    reliability: null,
    source: null,
    sourceUrl: null,
    txCount: 1,
    fanOut: 1,
    fanIn: 0,
  };
}

function edge(from: string, to: string, i: number): GraphEdge {
  return {
    id: `${from}-${to}-${i}`,
    from,
    to,
    fromNorm: from,
    toNorm: to,
    txHash: `0x${i}`,
    amountDisplay: `${i} ETH`,
    symbol: "ETH",
    timestamp: 1_700_000_000 + i,
    isToken: false,
    explorerUrl: "https://example.test",
  };
}

test("full graph keeps every backend node; isolate is optional", () => {
  const nodes = [
    node({ addressNorm: "seed", hop: 0, role: "unknown_wallet" }),
    node({ addressNorm: "mid-a", hop: 1, role: "intermediate" }),
    node({ addressNorm: "mid-b", hop: 1, role: "intermediate" }),
    node({ addressNorm: "risk", hop: 1, role: "risk" }),
    node({ addressNorm: "vasp", hop: 2, role: "vasp", vaspName: "Binance" }),
    node({ addressNorm: "other", hop: 2, role: "intermediate" }),
  ];
  const path = new Set(["seed", "mid-a", "vasp"]);
  const full = nodesToRender(nodes, path, false);
  assert.equal(full.length, 6);
  assert.deepEqual(
    full.map((n) => n.addressNorm),
    nodes.map((n) => n.addressNorm),
  );
  const isolated = nodesToRender(nodes, path, true);
  assert.equal(isolated.length, 3);
});

test("parallel transfers between the same wallets collapse to one edge", () => {
  const edges = Array.from({ length: 40 }, (_, i) => edge("seed", "vasp", i));
  const visible = new Set(["seed", "vasp"]);
  const bundled = bundleEdges(edges, visible, new Set(["seed::vasp"]));
  assert.equal(bundled.length, 1);
  assert.equal(bundled[0]?.count, 40);
  assert.equal(bundled[0]?.onPath, true);
});

test("attributed path is a property of existing nodes, not a two-node substitute", () => {
  const result = {
    attributed: { path: ["seed", "mid-a", "vasp"] },
    nodes: [
      node({ addressNorm: "seed", hop: 0, role: "unknown_wallet" }),
      node({ addressNorm: "mid-a", hop: 1, role: "intermediate" }),
      node({ addressNorm: "branch", hop: 1, role: "intermediate" }),
      node({ addressNorm: "vasp", hop: 2, role: "vasp" }),
    ],
  } as TraceResult;
  const path = pathAddressSet(result);
  const rendered = nodesToRender(result.nodes, path, false);
  assert.equal(rendered.length, 4);
  assert.ok(rendered.some((n) => n.addressNorm === "branch"));
});

test("layout assigns unique coordinates so hop columns can branch", () => {
  const nodes = [
    node({ addressNorm: "seed", hop: 0, role: "unknown_wallet" }),
    node({ addressNorm: "a", hop: 1, role: "intermediate" }),
    node({ addressNorm: "b", hop: 1, role: "intermediate" }),
    node({ addressNorm: "c", hop: 1, role: "risk" }),
    node({ addressNorm: "vasp", hop: 2, role: "vasp" }),
    node({ addressNorm: "d", hop: 2, role: "intermediate" }),
  ];
  const pos = layoutPositions(nodes, new Set(["seed", "a", "vasp"]));
  assert.equal(pos.size, 6);
  const keys = [...pos.values()].map((p) => `${p.x},${p.y}`);
  assert.equal(new Set(keys).size, 6);
  assert.equal(pos.get("seed")?.x, 0);
  assert.ok((pos.get("a")?.x ?? 0) < (pos.get("vasp")?.x ?? 0));
  assert.equal(pos.get("a")?.x, pos.get("b")?.x);
});
