import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Glass, PageHeader } from "@/components/ui/glass";

export const Route = createFileRoute("/method")({ component: MethodPage });

const SECTIONS = [
  {
    n: "01",
    title: "Traversal",
    body: "Depth-limited BFS, default 3 hops (configurable 2–6). Outbound counterparties are preferred because the problem is cash-out to a VASP. Labelled VASP nodes are terminals. Mixer/sanctioned contracts are not expanded through. Expansion is capped to respect public API rate limits.",
  },
  {
    n: "02",
    title: "Scoring (heuristic)",
    body: "Graph proximity 40 · label reliability 25 · timing/amount consistency 20 · recurring interaction 10 · cluster evidence 5 · minus mixer/bridge/fan-out penalties. A result below 40 is reported as No reliable VASP attribution found. The number is not a calibrated probability.",
  },
  {
    n: "03",
    title: "Data",
    body: "Ethereum: Ethplorer public API, Blockscout fallback. Tron: TronGrid TRC-20 and TRX. Labelled addresses are public Etherscan nametags and community Tron exchange labels, each with a source URL. Transfers are never fabricated when an API is silent.",
  },
  {
    n: "04",
    title: "SAHYOG",
    body: "The MVP emits a structured mock disclosure payload after human acceptance. It is not a live SAHYOG API integration and is labelled as such in the file.",
  },
] as const;

function MethodPage() {
  return (
    <AppShell>
      <PageHeader
        kicker="Deterministic first"
        title="Method"
        description="Deterministic graph attribution first. Language models, if used, only summarise evidence that already exists."
      />

      <section className="reveal mt-8 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Glass lite interactive key={section.n} className="rounded-3xl p-5 sm:p-6">
            <p className="font-mono text-xs tracking-widest text-accent/80">{section.n}</p>
            <h2 className="mt-3 text-fg font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
          </Glass>
        ))}
      </section>
    </AppShell>
  );
}
