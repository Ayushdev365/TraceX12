import assert from "node:assert/strict";
import { test } from "node:test";
import { runGraphIntel } from "./graph-intel.ts";
import type { TraceResult } from "./types.ts";

function stub(): TraceResult {
  return {
    traceId: "t1",
    caseId: null,
    wallet: "0xaaa",
    walletNorm: "0xaaa",
    chain: "ethereum",
    hopCap: 3,
    status: "complete",
    dataSource: "test",
    completeness: "full",
    completenessNote: "",
    datasetVersion: "test",
    datasetUpdatedAt: null,
    attributed: null,
    candidates: [],
    confidenceBand: "none",
    heuristicDisclaimer: "",
    nodes: [
      {
        id: "0xaaa",
        address: "0xaaa",
        addressNorm: "0xaaa",
        hop: 0,
        role: "unknown_wallet",
        label: null,
        vaspId: null,
        vaspName: null,
        reliability: null,
        source: null,
        sourceUrl: null,
        txCount: 2,
        fanOut: 2,
        fanIn: 0,
      },
      {
        id: "0xbbb",
        address: "0xbbb",
        addressNorm: "0xbbb",
        hop: 1,
        role: "vasp",
        label: "Binance 14",
        vaspId: "binance",
        vaspName: "Binance",
        reliability: "high",
        source: "test",
        sourceUrl: null,
        txCount: 1,
        fanOut: 0,
        fanIn: 1,
      },
    ],
    edges: [
      {
        id: "h:0xaaa:0xbbb",
        from: "0xaaa",
        to: "0xbbb",
        fromNorm: "0xaaa",
        toNorm: "0xbbb",
        txHash: "h",
        amountDisplay: "1 ETH",
        symbol: "ETH",
        timestamp: 1,
        isToken: false,
        explorerUrl: "https://example.com",
      },
    ],
    riskFlags: [],
    txsAnalyzed: 1,
    addressesVisited: 2,
    elapsedMs: 1,
    createdAt: new Date().toISOString(),
    reviewDecision: "pending",
    limitations: [],
  };
}

test("message passing returns real subgraph stats, not invented VASP labels", () => {
  const out = runGraphIntel(stub());
  assert.equal(out.nodesAnalyzed, 2);
  assert.equal(out.edgesAnalyzed, 1);
  assert.equal(out.layers, 2);
  assert.ok(out.elapsedMs >= 0);
  assert.equal(out.nodeInsights.length, 2);
  const seed = out.nodeInsights.find((n) => n.addressNorm === "0xaaa");
  assert.ok(seed);
  assert.equal(seed.similarityToSeed, 1);
  assert.ok(out.disclaimer.includes("not a trained VASP classifier"));
  assert.ok(!out.similarPairs.some((p) => Number.isNaN(p.cosine)));
});
