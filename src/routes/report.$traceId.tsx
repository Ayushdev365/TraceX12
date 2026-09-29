import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { Button } from "@/components/ui/button";
import { getTrace } from "@/lib/server/functions";
import type { TraceResult } from "@/lib/trace/types";
import { LEAD_NOT_PROOF } from "@/lib/trace/types";
import { formatUnix, shortenAddress } from "@/lib/utils";

export const Route = createFileRoute("/report/$traceId")({ component: ReportPage });

function ReportPage() {
  const { traceId } = Route.useParams();
  const [result, setResult] = useState<TraceResult | null>(null);

  useEffect(() => {
    void getTrace({ data: { id: traceId } }).then(setResult);
  }, [traceId]);

  if (!result) {
    return <p className="p-8 text-muted">Loading report…</p>;
  }

  const attr = result.attributed;

  return (
    <article className="relative mx-auto max-w-3xl px-5 py-8 text-fg print:bg-white print:text-black">
      <Atmosphere />
      <div className="relative z-10">
      <div className="no-print mb-6 flex flex-wrap gap-2">
        <Link to="/trace/$traceId" params={{ traceId }} className="glass-btn">
          Back to trace
        </Link>
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          Print / save PDF
        </Button>
      </div>

      <header className="border-b border-white/10 pb-4 print:border-black/15">
        <p className="kicker">VASPTrace investigation report</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Wallet-to-VASP attribution</h1>
        <p className="mt-2 text-sm text-danger print:text-black">{LEAD_NOT_PROOF}</p>
      </header>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <Item k="Case ID" v={result.caseId ?? "—"} />
        <Item k="Trace ID" v={result.traceId} />
        <Item k="Wallet" v={result.wallet} />
        <Item k="Blockchain" v={result.chain} />
        <Item k="Generated" v={result.createdAt} />
        <Item k="Dataset version" v={result.datasetVersion} />
        <Item k="Data source" v={result.dataSource} />
        <Item k="Hop cap" v={String(result.hopCap)} />
        <Item k="Transfers analysed" v={String(result.txsAnalyzed)} />
        <Item k="Review" v={result.reviewDecision} />
      </dl>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Attribution</h2>
        {attr ? (
          <div className="mt-3 space-y-2 text-sm leading-relaxed">
            <p>
              Nearest VASP: <strong>{attr.vaspName}</strong> · heuristic score {attr.score}/100 · hop {attr.hopDistance}
            </p>
            <p className="text-muted">{result.heuristicDisclaimer}</p>
            <ul className="list-disc space-y-1 pl-5">
              {attr.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <h3 className="pt-2 font-medium">Scoring breakdown</h3>
            <ul className="space-y-1">
              {Object.entries(attr.breakdown).map(([k, v]) => (
                <li key={k}>
                  {k}: {v.awarded}/{v.max || "—"} — {v.note}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-sm">No reliable VASP attribution found.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Traced path</h2>
        <ol className="mt-3 space-y-1 font-mono text-xs">
          {result.nodes.map((n) => (
            <li key={n.addressNorm}>
              hop {n.hop} · {n.address} · {n.label ?? n.role}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Transaction summary</h2>
        <ul className="mt-3 space-y-1 text-xs">
          {result.edges.slice(0, 40).map((e) => (
            <li key={e.id}>
              {shortenAddress(e.from)} → {shortenAddress(e.to)} · {e.amountDisplay} · {formatUnix(e.timestamp)} · {e.txHash}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Risk flags</h2>
        {result.riskFlags.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {result.riskFlags.map((f) => (
              <li key={f.title + (f.address ?? "")}>
                {f.title}: {f.detail}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm">None on the retrieved path.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Provenance</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {(attr?.matchedAddresses ?? []).map((m) => (
            <li key={m.address}>
              {m.label} · {m.address} · {m.source} · {m.reliability} · {m.sourceUrl}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Limitations and human-review statement</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {result.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          Investigator decision recorded: <strong>{result.reviewDecision}</strong>. This report is not legal proof and
          must not be used to freeze assets without independent review.
        </p>
      </section>
      </div>
    </article>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="label-caps">{k}</dt>
      <dd className="mt-1 break-all font-mono text-xs">{v}</dd>
    </div>
  );
}
