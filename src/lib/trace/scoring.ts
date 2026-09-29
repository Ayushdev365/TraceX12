import type {
  GraphEdge,
  LabelledAddress,
  Reliability,
  RiskFlag,
  ScoreBreakdown,
  VaspCandidate,
} from "./types";

const REL_POINTS: Record<Reliability, number> = { high: 25, medium: 18, low: 10 };

function hopPoints(hop: number): { awarded: number; note: string } {
  const table: Record<number, number> = { 0: 40, 1: 35, 2: 28, 3: 20, 4: 12, 5: 6, 6: 3 };
  const awarded = table[hop] ?? 2;
  return {
    awarded,
    note:
      hop === 0
        ? "Investigated wallet is itself a labelled VASP address."
        : `Nearest labelled address reached in ${hop} hop${hop === 1 ? "" : "s"}.`,
  };
}

function riskPenalty(flags: RiskFlag[], pathSet: Set<string>): { awarded: number; note: string } {
  let penalty = 0;
  const reasons: string[] = [];
  for (const flag of flags) {
    const onPath = !flag.address || pathSet.has(flag.address.toLowerCase()) || pathSet.has(flag.address);
    if (!onPath && flag.kind !== "high_fan_out" && flag.kind !== "high_fan_in") continue;
    if (flag.kind === "mixer" || flag.kind === "sanctioned") {
      penalty += 15;
      reasons.push(flag.title);
    } else if (flag.kind === "bridge") {
      penalty += 8;
      reasons.push(flag.title);
    } else if (flag.kind === "high_fan_out" || flag.kind === "high_fan_in") {
      penalty += 4;
      reasons.push(flag.title);
    }
  }
  const awarded = -Math.min(30, penalty);
  return {
    awarded,
    note: awarded === 0 ? "No path-level risk penalty applied." : `Penalty for: ${reasons.join("; ")}.`,
  };
}

export function scoreCandidate(input: {
  vaspId: string;
  vaspName: string;
  hopDistance: number;
  matched: LabelledAddress[];
  interactionCount: number;
  path: string[];
  sampleTxs: GraphEdge[];
  outbound: boolean;
  flags: RiskFlag[];
  timestampsOrdered: boolean;
  amountPlausible: boolean;
}): VaspCandidate {
  const prox = hopPoints(input.hopDistance);
  const bestRel = input.matched.reduce<Reliability>((acc, m) => {
    if (m.reliability === "high") return "high";
    if (m.reliability === "medium" && acc === "low") return "medium";
    return acc;
  }, "low");
  const relAward = REL_POINTS[bestRel];

  let consistency = 0;
  const consNotes: string[] = [];
  if (input.timestampsOrdered) {
    consistency += 10;
    consNotes.push("timestamps are time-ordered");
  }
  if (input.amountPlausible) {
    consistency += 8;
    consNotes.push("amounts are internally consistent");
  }
  if (input.outbound) {
    consistency += 2;
    consNotes.push("primary flow is outbound toward the VASP");
  }
  consistency = Math.min(20, consistency);

  const rec = Math.min(10, input.interactionCount >= 5 ? 10 : input.interactionCount >= 3 ? 8 : input.interactionCount >= 2 ? 6 : 3);
  const cluster = Math.min(5, input.matched.length >= 3 ? 5 : input.matched.length === 2 ? 3 : 1);

  const pathSet = new Set(input.path.map((p) => p.toLowerCase()));
  const risk = riskPenalty(input.flags, pathSet);

  const breakdown: ScoreBreakdown = {
    graphProximity: { awarded: prox.awarded, max: 40, note: prox.note },
    labelReliability: {
      awarded: relAward,
      max: 25,
      note: `Best label reliability on this cluster is ${bestRel} (${input.matched[0]?.source ?? "public label"}).`,
    },
    txConsistency: {
      awarded: consistency,
      max: 20,
      note: consNotes.length ? consNotes.join("; ") : "Insufficient consistency evidence.",
    },
    recurringInteraction: {
      awarded: rec,
      max: 10,
      note: `${input.interactionCount} connecting transfer(s) to this VASP cluster.`,
    },
    clusterEvidence: {
      awarded: cluster,
      max: 5,
      note: `${input.matched.length} labelled address(es) of ${input.vaspName} on the path.`,
    },
    riskPenalty: { awarded: risk.awarded, max: 0, note: risk.note },
  };

  const score = Math.max(
    0,
    Math.min(
      100,
      prox.awarded + relAward + consistency + rec + cluster + risk.awarded,
    ),
  );

  const why: string[] = [];
  if (input.hopDistance === 0) {
    why.push(`The investigated wallet is itself a labelled ${input.vaspName} address (${input.matched[0]?.label}).`);
  } else {
    why.push(
      `A labelled ${input.vaspName} address (${input.matched[0]?.label}) was reached within ${input.hopDistance} hop${input.hopDistance === 1 ? "" : "s"}.`,
    );
  }
  why.push(
    `${input.interactionCount} transaction${input.interactionCount === 1 ? "" : "s"} connect the investigated wallet/path to this labelled cluster.`,
  );
  if (input.timestampsOrdered) {
    why.push("Transaction timing along the traced path is consistent with a directed flow.");
  }
  why.push(
    `The address label comes from ${input.matched[0]?.source ?? "the labelled dataset"} (${bestRel} reliability).`,
  );
  if (!input.outbound && input.hopDistance > 0) {
    why.push("The strongest link observed is inbound (funds received from the VASP), which is weaker evidence of a cash-out than an outbound deposit.");
  }
  if (risk.awarded < 0) {
    why.push(`Confidence is reduced because ${risk.note.replace(/^Penalty for: /, "").toLowerCase()}`);
  }

  return {
    vaspId: input.vaspId,
    vaspName: input.vaspName,
    score,
    hopDistance: input.hopDistance,
    matchedAddresses: input.matched,
    interactionCount: input.interactionCount,
    path: input.path,
    sampleTxs: input.sampleTxs.slice(0, 8),
    breakdown,
    why,
    outbound: input.outbound,
  };
}

export function bandForScore(score: number | null, hasCandidate: boolean): "high" | "moderate" | "low" | "insufficient" | "none" {
  if (!hasCandidate || score === null) return "none";
  if (score >= 80) return "high";
  if (score >= 60) return "moderate";
  if (score >= 40) return "low";
  return "insufficient";
}

export const ATTRIBUTION_FLOOR = 40;
