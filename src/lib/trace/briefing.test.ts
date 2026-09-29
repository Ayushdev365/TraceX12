import assert from "node:assert/strict";
import test from "node:test";
import { buildEvidenceBriefing } from "./briefing.ts";
import type { TraceResult } from "./types.ts";

function stub(over: Partial<TraceResult> = {}): TraceResult {
  return {
    traceId: "t1",
    caseId: null,
    wallet: "0xabc",
    walletNorm: "0xabc",
    chain: "ethereum",
    hopCap: 2,
    status: "complete",
    dataSource: "Ethplorer",
    completeness: "partial",
    completenessNote: "truncated",
    datasetVersion: "1",
    datasetUpdatedAt: null,
    attributed: {
      vaspId: "binance",
      vaspName: "Binance",
      score: 91,
      hopDistance: 1,
      matchedAddresses: [],
      interactionCount: 31,
      outbound: true,
      path: ["0xabc", "0xbinance"],
      sampleTxs: [],
      breakdown: {
        graphProximity: { awarded: 35, max: 40, note: "" },
        labelReliability: { awarded: 25, max: 25, note: "" },
        txConsistency: { awarded: 20, max: 20, note: "" },
        recurringInteraction: { awarded: 10, max: 10, note: "" },
        clusterEvidence: { awarded: 1, max: 5, note: "" },
        riskPenalty: { awarded: 0, max: 0, note: "" },
      },
      why: ["A labelled Binance address was reached within 1 hop."],
    },
    candidates: [],
    confidenceBand: "high",
    heuristicDisclaimer: "heuristic",
    nodes: [{ id: "0xabc", address: "0xabc", addressNorm: "0xabc", hop: 0, role: "unknown_wallet", label: null, vaspId: null, vaspName: null, reliability: null, source: null, sourceUrl: null, txCount: 1, fanOut: 1, fanIn: 0 }],
    edges: [],
    riskFlags: [{ kind: "high_fan_out", severity: "medium", title: "High fan-out address", detail: "many counterparties" }],
    txsAnalyzed: 40,
    addressesVisited: 12,
    elapsedMs: 10,
    createdAt: new Date().toISOString(),
    reviewDecision: "pending",
    limitations: [],
    ...over,
  };
}

test("evidence briefing uses retrieved facts and never mentions HTTP 403", () => {
  const text = buildEvidenceBriefing(stub());
  assert.match(text, /Binance/);
  assert.match(text, /1 hop/);
  assert.match(text, /31 transfer/);
  assert.match(text, /partial/);
  assert.match(text, /investigative lead/);
  assert.doesNotMatch(text, /403/);
  assert.doesNotMatch(text, /Briefing model error/);
});

test("inconclusive briefing does not invent a VASP", () => {
  const text = buildEvidenceBriefing(
    stub({
      attributed: null,
      status: "inconclusive",
      confidenceBand: "none",
      riskFlags: [],
    }),
  );
  assert.match(text, /did not reach a labelled VASP/);
  assert.doesNotMatch(text, /Binance/);
  assert.doesNotMatch(text, /403/);
});
