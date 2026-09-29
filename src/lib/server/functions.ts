import { createServerFn } from "@tanstack/react-start";
import type { ChainId, TraceResult } from "@/lib/trace/types";
import { LEAD_NOT_PROOF } from "@/lib/trace/types";

export const analyzeWallet = createServerFn({ method: "POST" })
  .validator((input: { wallet: string; chain: ChainId; hopCap?: number; caseId?: string }) => input)
  .handler(async ({ data }) => {
    const { runAttribution } = await import("@/lib/trace/engine");
    return runAttribution(data);
  });

export const getTrace = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { loadTrace } = await import("@/lib/trace/engine");
    return loadTrace(data.id);
  });

export const listRecentTraces = createServerFn({ method: "GET" }).handler(async () => {
  const { listTraces } = await import("@/lib/trace/engine");
  return listTraces(40);
});

export const getDataset = createServerFn({ method: "GET" }).handler(async () => {
  const { listDataset } = await import("@/lib/trace/engine");
  return listDataset();
});

export const reviewTrace = createServerFn({ method: "POST" })
  .validator((input: { id: string; decision: TraceResult["reviewDecision"]; note?: string }) => input)
  .handler(async ({ data }) => {
    const { setReview, loadTrace } = await import("@/lib/trace/engine");
    await setReview(data.id, data.decision, data.note);
    return loadTrace(data.id);
  });

export const pickDemoWallet = createServerFn({ method: "POST" })
  .validator((input: { chain: ChainId }) => input)
  .handler(async ({ data }) => {
    const { pickLiveDemo } = await import("@/lib/trace/engine");
    return pickLiveDemo(data.chain);
  });

export const getSahyogDraft = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { loadTrace, buildSahyogDraft } = await import("@/lib/trace/engine");
    const trace = await loadTrace(data.id);
    if (!trace) return { error: "Trace not found" as const };
    if (trace.reviewDecision !== "accepted") {
      return { error: "Investigator must accept the lead before a disclosure draft is generated." as const };
    }
    return { draft: buildSahyogDraft(trace) };
  });

export const summarizeTrace = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { loadTrace } = await import("@/lib/trace/engine");
    const { buildEvidenceBriefing } = await import("@/lib/trace/briefing");
    const trace = await loadTrace(data.id);
    if (!trace) return { ok: false as const, error: "Trace not found." };

    const fallback = buildEvidenceBriefing(trace);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: true as const, text: fallback, source: "evidence" as const };
    }

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content:
                "You write plain-language investigative briefings for Indian cyber-cell officers. Use ONLY the JSON facts provided. Do not invent transactions, identities, or certainty. Always restate that this is an investigative lead, not legal proof. Do not identify a beneficial owner.",
            },
            {
              role: "user",
              content: JSON.stringify({
                wallet: trace.wallet,
                chain: trace.chain,
                vasp: trace.attributed?.vaspName ?? null,
                score: trace.attributed?.score ?? null,
                why: trace.attributed?.why ?? [],
                hops: trace.attributed?.hopDistance ?? null,
                flags: trace.riskFlags.map((f) => f.title),
                txs: trace.txsAnalyzed,
                disclaimer: LEAD_NOT_PROOF,
              }),
            },
          ],
        }),
      });
      if (res.ok) {
        const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = body.choices?.[0]?.message?.content?.trim();
        if (text) return { ok: true as const, text, source: "ai" as const };
      } else {
        console.warn("[vasptrace] briefing model unavailable", res.status);
      }
    } catch (err) {
      console.warn("[vasptrace] briefing model failed", err instanceof Error ? err.message : "error");
    }

    return { ok: true as const, text: fallback, source: "evidence" as const };
  });
