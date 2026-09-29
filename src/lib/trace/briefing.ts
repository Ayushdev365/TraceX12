import type { TraceResult } from "./types";

/** Deterministic investigator summary from retrieved trace facts only. */
export function buildEvidenceBriefing(trace: TraceResult): string {
  const lines: string[] = [];
  const attr = trace.attributed;
  const wallet = trace.wallet;

  if (attr) {
    const hops = attr.hopDistance;
    const hopPhrase = hops === 0 ? "as a labelled VASP address (hop 0)" : `within ${hops} hop${hops === 1 ? "" : "s"}`;
    lines.push(`Investigated wallet ${wallet} reached a labelled ${attr.vaspName} address ${hopPhrase}.`);
    if (attr.interactionCount > 0) {
      lines.push(
        `The attributed route contains ${attr.interactionCount} transfer${attr.interactionCount === 1 ? "" : "s"} in the retrieved window.`,
      );
    }
    lines.push(
      `The heuristic score is ${attr.score}/100, based on graph proximity, label reliability, transaction consistency and path evidence. This is not a calibrated probability.`,
    );
  } else {
    lines.push(
      `Investigated wallet ${wallet} did not reach a labelled VASP with enough evidence inside the ${trace.hopCap}-hop cap. Status: ${trace.status}.`,
    );
  }

  lines.push(
    `Retrieved graph: ${trace.nodes.length} address${trace.nodes.length === 1 ? "" : "es"} and ${trace.edges.length} transfer${trace.edges.length === 1 ? "" : "s"} from ${trace.dataSource || "the explorer"}.`,
  );

  if (trace.riskFlags.length) {
    lines.push(`Risk notes on the retrieved graph: ${trace.riskFlags.map((f) => f.title).join("; ")}.`);
  }

  if (trace.completeness !== "full") {
    lines.push(
      "Blockchain data is partial, so this attribution should be treated as an investigative lead rather than definitive proof.",
    );
  } else {
    lines.push("This output is an investigative lead and not legal proof.");
  }

  return lines.join("\n");
}
