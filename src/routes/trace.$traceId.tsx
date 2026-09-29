import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Glass, StatCard } from "@/components/ui/glass";
import { TraceGraph } from "@/components/trace-graph";
import { getSahyogDraft, getTrace, reviewTrace, summarizeTrace } from "@/lib/server/functions";
import { runGraphIntel } from "@/lib/trace/graph-intel";
import { takeStashedTrace } from "@/lib/trace/result-cache";
import type { GraphEdge, GraphIntelResult, GraphNode, ScoreBreakdown, TraceResult } from "@/lib/trace/types";
import { explorerUrl, formatUnix, shortenAddress, txExplorerUrl } from "@/lib/utils";

export const Route = createFileRoute("/trace/$traceId")({ component: TracePage });

function bandLabel(band: TraceResult["confidenceBand"]) {
  if (band === "high") return "High (heuristic)";
  if (band === "moderate") return "Moderate (heuristic)";
  if (band === "low") return "Low (heuristic)";
  if (band === "insufficient") return "Insufficient evidence";
  return "No attribution";
}

function ScoreRing({ score }: { score: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c;
  return (
    <svg viewBox="0 0 40 40" className="score-ring size-10 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r={r} className="text-white/10" stroke="currentColor" />
      <circle
        cx="20"
        cy="20"
        r={r}
        className="text-accent"
        stroke="currentColor"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function ScoreBars({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <ul className="score-meter mt-3">
      {Object.entries(breakdown).map(([k, v]) => {
        const max = v.max || 1;
        const pct = Math.max(0, Math.min(100, (Math.abs(v.awarded) / Math.abs(max)) * 100));
        return (
          <li key={k}>
            <div className="score-meter-row">
              <span className="text-sm text-muted">{k.replace(/[A-Z]/g, (m) => " " + m.toLowerCase())}</span>
              <span className="font-mono text-xs tabular-nums text-fg">
                {v.awarded}/{v.max || "—"}
              </span>
            </div>
            <div className="score-meter-track">
              <div
                className="score-meter-fill"
                style={{ width: `${pct}%`, background: v.awarded < 0 ? "var(--color-danger)" : undefined }}
              />
            </div>
            <p className="mt-1 text-xs text-subtle">{v.note}</p>
          </li>
        );
      })}
    </ul>
  );
}

function TracePage() {
  const { traceId } = Route.useParams();
  const [result, setResult] = useState<TraceResult | null>(() => takeStashedTrace(traceId));
  const hasResult = useRef(Boolean(result));
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [pathOnly, setPathOnly] = useState(false);
  const [hopFilter, setHopFilter] = useState<number | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [brief, setBrief] = useState<string | null>(null);
  const [briefSource, setBriefSource] = useState<"ai" | "evidence" | null>(null);
  const [graphFs, setGraphFs] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [intel, setIntel] = useState<GraphIntelResult | null>(null);
  const [intelStage, setIntelStage] = useState<string | null>(null);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [showGnn, setShowGnn] = useState(false);

  useEffect(() => {
    let live = true;
    getTrace({ data: { id: traceId } })
      .then((row) => {
        if (!live) return;
        if (row) {
          hasResult.current = true;
          setResult(row);
          return;
        }
        if (!hasResult.current) setError("Trace not found.");
      })
      .catch((err: unknown) => {
        if (!hasResult.current) setError(err instanceof Error ? err.message : "Failed to load trace.");
      });
    return () => {
      live = false;
    };
  }, [traceId]);

  const jsonHref = useMemo(() => {
    if (!result) return null;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    return URL.createObjectURL(blob);
  }, [result]);

  async function decide(decision: TraceResult["reviewDecision"]) {
    setBusy("review");
    try {
      const next = await reviewTrace({ data: { id: traceId, decision } });
      if (next) setResult(next);
    } finally {
      setBusy(null);
    }
  }

  async function briefing() {
    setBusy("brief");
    try {
      const out = await summarizeTrace({ data: { id: traceId } });
      if (out.ok) {
        setBrief(out.text);
        setBriefSource(out.source);
      } else {
        const { buildEvidenceBriefing } = await import("@/lib/trace/briefing");
        if (result) {
          setBrief(buildEvidenceBriefing(result));
          setBriefSource("evidence");
        }
      }
    } catch {
      if (result) {
        const { buildEvidenceBriefing } = await import("@/lib/trace/briefing");
        setBrief(buildEvidenceBriefing(result));
        setBriefSource("evidence");
      }
    } finally {
      setBusy(null);
    }
  }

  async function downloadDraft() {
    setBusy("draft");
    try {
      const out = await getSahyogDraft({ data: { id: traceId } });
      if ("error" in out) {
        setBrief(out.error ?? "Could not generate the disclosure draft.");
        return;
      }
      const blob = new Blob([JSON.stringify(out.draft, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sahyog-mock-${traceId.slice(0, 8)}.json`;
      a.click();
    } finally {
      setBusy(null);
    }
  }

  async function runIntel() {
    if (!result) return;
    setIntelError(null);
    setIntelStage("Preparing subgraph");
    await new Promise((r) => setTimeout(r, 40));
    try {
      if (!result.nodes.length) {
        setIntelError("Advanced analysis unavailable — the investigation graph is empty.");
        setIntelStage(null);
        return;
      }
      setIntelStage("Generating features");
      await new Promise((r) => setTimeout(r, 40));
      setIntelStage("Running message-passing inference");
      await new Promise((r) => setTimeout(r, 40));
      const out = runGraphIntel(result);
      setIntelStage("Calculating graph similarity");
      await new Promise((r) => setTimeout(r, 40));
      setIntel(out);
      setShowGnn(true);
      setIntelStage(null);
    } catch {
      setIntelError("Advanced analysis unavailable");
      setIntelStage(null);
    }
  }

  function viewEvidencePath() {
    setPathOnly(false);
    setHopFilter(null);
    const first = result?.attributed?.sampleTxs[0];
    if (first) setSelectedEdge(first);
    const vaspNode = result?.nodes.find((n) => n.addressNorm === result.attributed?.path.at(-1));
    if (vaspNode) setSelected(vaspNode);
    setFocusToken((n) => n + 1);
  }

  if (error && !result) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }
  if (!result) {
    return (
      <AppShell wide>
        <div className="space-y-4">
          <div className="skel h-16" />
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="skel h-24" />
            <div className="skel h-24" />
            <div className="skel h-24" />
            <div className="skel h-24" />
          </div>
          <div className="skel h-[420px]" />
        </div>
      </AppShell>
    );
  }

  const attr = result.attributed;
  const gaps = result.dataGaps ?? [];

  return (
    <AppShell wide>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Trace {result.traceId.slice(0, 8)}</p>
          <h1 className="mt-2 font-mono text-lg tracking-tight text-fg sm:text-xl">{result.wallet}</h1>
          <p className="mt-1 text-sm text-muted">
            {result.chain === "ethereum" ? "Ethereum" : "Tron"} · {result.hopCap}-hop cap · {result.txsAnalyzed}{" "}
            transfers · {result.addressesVisited} addresses · {result.elapsedMs} ms · {result.dataSource}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/report/$traceId" params={{ traceId }} className="glass-btn">
            Open report
          </Link>
          {jsonHref ? (
            <a href={jsonHref} download={`vasptrace-${traceId.slice(0, 8)}.json`} className="glass-btn">
              Download JSON
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attributed VASP" value={attr ? attr.vaspName : "No reliable VASP attribution found"} />
        <StatCard
          label="Heuristic score"
          value={attr ? `${attr.score}/100` : "—"}
          hint={bandLabel(result.confidenceBand)}
          trailing={attr ? <ScoreRing score={attr.score} /> : null}
        />
        <StatCard label="Hop distance" value={attr ? String(attr.hopDistance) : "—"} />
        <StatCard label="Review" value={result.reviewDecision} />
      </div>

      {result.completeness !== "full" ? (
        <Glass lite className="gap-banner mt-4 rounded-3xl p-4">
          <p className="text-sm font-medium text-warn">
            {result.completeness === "empty" ? "No transfers retrieved." : "Partial blockchain data."}
            {attr ? " Attribution based on partial data." : ""}
          </p>
          <p className="text-sm leading-relaxed text-muted">
            Some transfer data could not be retrieved from the current provider. The graph and score use only the
            retrieved subset.
          </p>
          {gaps.length ? (
            <ul className="mt-1 space-y-1 text-xs text-subtle">
              {gaps.slice(0, 4).map((g) => (
                <li key={`${g.address}-${g.code}`}>
                  {g.provider}
                  {g.code ? ` · HTTP ${g.code}` : ""} · {g.detail}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-subtle">{result.completenessNote}</p>
          )}
        </Glass>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.85fr)]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Transaction graph</h2>
            <button type="button" className="chip" onClick={() => setGraphFs(true)}>
              Expand
            </button>
          </div>
          <TraceGraph
            result={result}
            selectedNodeId={selected?.addressNorm ?? null}
            selectedEdgeId={selectedEdge?.id ?? null}
            pathOnly={pathOnly && Boolean(attr)}
            hopFilter={hopFilter}
            intel={intel}
            showGnn={showGnn}
            focusToken={focusToken}
            fullscreen={graphFs}
            onSelectNode={(n) => {
              setSelected(n);
              if (n) setSelectedEdge(null);
            }}
            onSelectEdge={(e) => {
              setSelectedEdge(e);
              if (e) {
                const node = result.nodes.find((n) => n.addressNorm === e.toNorm || n.addressNorm === e.fromNorm);
                if (node) setSelected(node);
              }
            }}
            onPathOnly={setPathOnly}
            onToggleGnn={setShowGnn}
            onHopFilter={setHopFilter}
            onFullscreen={setGraphFs}
          />
        </div>

        <div className="space-y-3">
          <Glass lite className="rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="label-caps">Why this attribution?</h2>
              {attr ? (
                <button type="button" className="chip" onClick={viewEvidencePath}>
                  View evidence path
                </button>
              ) : null}
            </div>
            {attr ? (
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                {attr.why.map((line) => (
                  <li key={line}>
                    <button type="button" className="why-item w-full rounded-xl px-2 py-1.5 text-left" onClick={viewEvidencePath}>
                      {line}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                No labelled VASP was reached with enough evidence inside the hop cap. This is reported as inconclusive
                rather than forced.
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-subtle">{result.heuristicDisclaimer}</p>
          </Glass>

          {attr ? (
            <Glass lite className="rounded-3xl p-5">
              <h3 className="text-sm font-semibold">Score breakdown</h3>
              <ScoreBars breakdown={attr.breakdown} />
            </Glass>
          ) : null}

          {result.candidates.length > 1 ? (
            <Glass lite className="rounded-3xl p-5">
              <h3 className="text-sm font-semibold">Candidate comparison</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {result.candidates.slice(0, 4).map((c, i) => (
                  <li key={c.vaspId} className="flex items-center justify-between gap-3">
                    <span className="text-muted">
                      {i + 1}. {c.vaspName}
                      <span className="mt-0.5 block text-xs text-subtle">
                        hop {c.hopDistance} · {c.interactionCount} transfer{c.interactionCount === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="font-mono tabular-nums text-fg">{c.score}</span>
                  </li>
                ))}
              </ul>
            </Glass>
          ) : null}

          {result.riskFlags.length ? (
            <Glass lite className="rounded-3xl p-5">
              <h3 className="text-sm font-semibold">Risk flags</h3>
              <ul className="mt-3 space-y-3">
                {result.riskFlags.map((f) => (
                  <li key={f.title + (f.address ?? "")}>
                    <p className="text-sm text-fg">
                      {f.title} <span className="chip chip-danger ml-1">{f.kind}</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{f.detail}</p>
                  </li>
                ))}
              </ul>
            </Glass>
          ) : (
            <p className="text-sm text-muted">No mixer, bridge, or high-fan-out flags on the retrieved path.</p>
          )}
        </div>
      </div>

      {selected || selectedEdge ? (
        <Glass lite className="mt-6 rounded-3xl p-5">
          {selectedEdge ? (
            <>
              <h3 className="text-sm font-semibold">Selected transfer</h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Field label="Hash" value={shortenAddress(selectedEdge.txHash, 10, 8)} href={selectedEdge.explorerUrl} />
                <Field label="Amount" value={selectedEdge.amountDisplay} />
                <Field label="From" value={selectedEdge.from} mono />
                <Field label="To" value={selectedEdge.to} mono />
                <Field label="Token" value={selectedEdge.isToken ? selectedEdge.symbol : selectedEdge.symbol} />
                <Field label="Time" value={formatUnix(selectedEdge.timestamp)} />
              </dl>
            </>
          ) : selected ? (
            <>
              <h3 className="text-sm font-semibold">Selected node</h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Field label="Address" value={selected.address} mono />
                <Field label="Chain" value={result.chain} />
                <Field label="Label" value={selected.label ?? "Unlabelled"} />
                <Field label="Hop" value={String(selected.hop)} />
                <Field label="Role" value={selected.role} />
                <Field label="Transfers in window" value={String(selected.txCount)} />
                <Field label="Fan-out / fan-in" value={`${selected.fanOut} / ${selected.fanIn}`} />
                <Field label="Source" value={selected.source ?? "—"} />
                <Field label="Explorer" value="Open" href={explorerUrl(result.chain, selected.address)} />
              </dl>
            </>
          ) : null}
        </Glass>
      ) : null}

      {attr?.sampleTxs.length ? (
        <div className="table-wrap mt-6">
          <div className="border-b border-white/8 px-4 py-3 text-sm font-semibold">Connecting transfers</div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th className="font-medium">From</th>
                  <th className="font-medium">To</th>
                  <th className="font-medium">Amount</th>
                  <th className="font-medium">Time</th>
                  <th className="font-medium">Tx</th>
                </tr>
              </thead>
              <tbody>
                {attr.sampleTxs.map((e) => (
                  <tr
                    key={e.id}
                    className={selectedEdge?.id === e.id ? "why-item is-active" : "cursor-pointer"}
                    onClick={() => {
                      setSelectedEdge(e);
                      setPathOnly(true);
                      setFocusToken((n) => n + 1);
                    }}
                  >
                    <td className="font-mono text-xs">{shortenAddress(e.from)}</td>
                    <td className="font-mono text-xs">{shortenAddress(e.to)}</td>
                    <td>{e.amountDisplay}</td>
                    <td className="text-muted">{formatUnix(e.timestamp)}</td>
                    <td>
                      <a
                        className="text-accent hover:underline"
                        href={txExplorerUrl(result.chain, e.txHash)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        explorer
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Glass lite className="mt-6 rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Advanced Graph Intelligence</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              Optional structural analysis of the investigation subgraph already retrieved. It does not wait on extra
              chain calls and does not replace the heuristic VASP match.
            </p>
          </div>
          <Button variant="secondary" disabled={Boolean(intelStage)} onClick={() => void runIntel()}>
            {intelStage ? intelStage : intel ? "Re-run analysis" : "Run graph analysis"}
          </Button>
        </div>
        {intelStage ? <p className="mt-3 text-sm text-accent">{intelStage}…</p> : null}
        {intelError ? <p className="mt-3 text-sm text-warn">{intelError}</p> : null}
        {intel ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <p className="text-xs leading-relaxed text-subtle sm:col-span-2">{intel.disclaimer}</p>
            <p className="text-sm text-muted">
              {intel.nodesAnalyzed} nodes · {intel.edgesAnalyzed} edges · {intel.layers} layers · {intel.elapsedMs} ms
            </p>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={showGnn} onChange={(e) => setShowGnn(e.target.checked)} />
              Show structural neighbors on graph
            </label>
            <ul className="space-y-2 text-sm">
              {intel.structuralNeighbors.map((n) => (
                <li key={n.addressNorm} className="flex justify-between gap-3">
                  <button
                    type="button"
                    className="font-mono text-xs text-accent hover:underline"
                    onClick={() => {
                      const node = result.nodes.find((x) => x.addressNorm === n.addressNorm);
                      if (node) {
                        setSelected(node);
                        setShowGnn(true);
                        setFocusToken((v) => v + 1);
                      }
                    }}
                  >
                    {shortenAddress(n.addressNorm)}
                  </button>
                  <span className="text-xs text-subtle">
                    hop {n.hop} · sim {n.similarityToSeed.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <ul className="space-y-2 text-sm">
              {intel.similarPairs.slice(0, 4).map((p) => (
                <li key={`${p.a}-${p.b}`} className="text-xs text-muted">
                  {shortenAddress(p.a)} ↔ {shortenAddress(p.b)} · cosine {p.cosine.toFixed(3)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Glass>

      <Glass live className="mt-6 rounded-3xl p-5">
        <h3 className="text-sm font-semibold">Human review</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Accepting a lead unlocks the mock SAHYOG disclosure draft. Rejecting it records that the investigator did not
          rely on this attribution. Nothing is submitted to any government API.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={busy === "review"} onClick={() => void decide("accepted")}>
            Accept lead
          </Button>
          <Button variant="secondary" disabled={busy === "review"} onClick={() => void decide("rejected")}>
            Reject
          </Button>
          <Button variant="ghost" disabled={busy === "review"} onClick={() => void decide("inconclusive")}>
            Mark inconclusive
          </Button>
          <Button
            variant="secondary"
            disabled={result.reviewDecision !== "accepted" || busy === "draft"}
            onClick={() => void downloadDraft()}
          >
            Mock SAHYOG draft
          </Button>
          <Button variant="ghost" disabled={busy === "brief"} onClick={() => void briefing()}>
            Plain-language briefing
          </Button>
        </div>
        {brief ? (
          <div className="mt-4 space-y-2">
            {briefSource === "evidence" ? (
              <>
                <p className="text-xs text-muted">AI briefing unavailable — showing evidence-based summary.</p>
                <p className="text-xs text-subtle">AI briefing: unavailable · Evidence summary: available</p>
              </>
            ) : briefSource === "ai" ? (
              <p className="text-xs text-subtle">AI briefing: available</p>
            ) : null}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{brief}</p>
          </div>
        ) : null}
      </Glass>
    </AppShell>
  );
}

function Field({
  label,
  value,
  mono,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  return (
    <div>
      <p className="label-caps">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="mt-1 inline-block text-accent hover:underline">
          {value}
        </a>
      ) : (
        <p className={`mt-1 break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
      )}
    </div>
  );
}
