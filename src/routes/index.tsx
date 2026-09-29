import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clipboard, Lock, Route as RouteIcon, Waypoints } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Field, Glass, PageHeader } from "@/components/ui/glass";
import { Segmented, Stepper } from "@/components/ui/segmented";
import { analyzeWallet, pickDemoWallet } from "@/lib/server/functions";
import type { ChainId } from "@/lib/trace/types";
import { detectChain } from "@/lib/trace/validate";
import { stashTrace } from "@/lib/trace/result-cache";

export const Route = createFileRoute("/")({ component: Home });

const CHAINS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "tron", label: "Tron" },
] as const;

function Home() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState("");
  const [chain, setChain] = useState<ChainId>("ethereum");
  const [hopCap, setHopCap] = useState(3);
  const [caseId, setCaseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const guessed = detectChain(wallet);

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const usedChain = guessed ?? chain;
      if (guessed && guessed !== chain) setChain(guessed);
      const result = await analyzeWallet({
        data: { wallet, chain: usedChain, hopCap, caseId: caseId || undefined },
      });
      if (result.status === "error" && result.dataSource === "none") {
        setError(result.error ?? "Analysis failed.");
        return;
      }
      stashTrace(result);
      await navigate({ to: "/trace/$traceId", params: { traceId: result.traceId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  async function demo(c: ChainId) {
    setBusy(true);
    setError(null);
    try {
      const picked = await pickDemoWallet({ data: { chain: c } });
      if ("error" in picked) {
        setError(picked.error);
        return;
      }
      setChain(c);
      setWallet(picked.wallet);
      setNote(picked.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load a live demo wallet.");
    } finally {
      setBusy(false);
    }
  }

  async function pasteWallet() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) setWallet(text.trim());
    } catch {
      setError("Clipboard access was blocked. Paste the address into the field.");
    }
  }

  return (
    <AppShell>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10">
        <div>
          <PageHeader
            live
            kicker="SIH 2026 · Blockchain & Cybersecurity"
            title="Attribute an unknown wallet to the nearest VASP."
            description="Enter a suspect address. VASPTrace pulls live chain data, walks the outbound graph, and matches labelled exchange addresses with an explainable heuristic score."
          />

          <Glass live className="mt-8 p-4 sm:p-6">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                void run();
              }}
            >
              <Field label="Wallet address">
                <div className="relative">
                  <input
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    placeholder="0x… or T…"
                    autoComplete="off"
                    spellCheck={false}
                    className="glass-input pr-32 font-mono"
                    suppressHydrationWarning
                  />
                  <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                    {guessed ? (
                      <span className="chip chip-ok capitalize">{guessed}</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void pasteWallet()}
                      className="glass-press inline-flex size-10 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-fg"
                      aria-label="Paste from clipboard"
                    >
                      <Clipboard className="size-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Blockchain">
                  <Segmented
                    ariaLabel="Blockchain"
                    value={chain}
                    onChange={setChain}
                    options={CHAINS}
                  />
                </Field>
                <Field label="Hop depth">
                  <Stepper
                    ariaLabel="Hop depth"
                    value={hopCap}
                    min={2}
                    max={6}
                    suffix="hops"
                    onChange={setHopCap}
                  />
                </Field>
              </div>

              <Field label="Case ID">
                <input
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="optional"
                  className="glass-input font-mono"
                  suppressHydrationWarning
                />
              </Field>

              {note ? <p className="text-sm text-accent">{note}</p> : null}
              {error ? <p className="text-sm text-danger">{error}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" disabled={busy || !wallet.trim()} className="min-h-12 w-full sm:w-auto">
                  {busy ? "Tracing on-chain path…" : "Run attribution"}
                </Button>
                <Button type="button" variant="secondary" disabled={busy} onClick={() => void demo("ethereum")}>
                  Live ETH demo
                </Button>
                <Button type="button" variant="secondary" disabled={busy} onClick={() => void demo("tron")}>
                  Live TRON demo
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-subtle">
                Live demo buttons fetch a recent counterparty of a labelled Binance hub from public explorer APIs. No
                transactions are fabricated. Keys stay on the server.
              </p>
            </form>
            {busy ? <span className="shimmer-bar" aria-hidden="true" /> : null}
          </Glass>
        </div>

        <aside className="reveal space-y-3 lg:pt-16">
          <Glass lite interactive className="rounded-3xl p-5">
            <div className="flex items-start gap-3">
              <span className="icon-well">
                <Waypoints className="size-4 text-accent" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-sm font-semibold">What this tool does</h2>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  <li>1. Validate the address and chain.</li>
                  <li>2. Retrieve native and token transfers from public APIs.</li>
                  <li>3. Breadth-first walk, default 3 hops, outbound-first.</li>
                  <li>4. Match visited addresses to the labelled VASP store.</li>
                  <li>5. Score with hop distance, label reliability, consistency, recurrence.</li>
                  <li>6. Flag mixers, bridges, and high fan-out.</li>
                </ol>
              </div>
            </div>
          </Glass>
          <Glass lite interactive className="rounded-3xl p-5">
            <div className="flex items-start gap-3">
              <span className="icon-well">
                <RouteIcon className="size-4 text-muted" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-sm font-semibold">What it does not do</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  <li>Does not identify a beneficial owner.</li>
                  <li>Does not freeze, block, or submit a live SAHYOG request.</li>
                  <li>Does not present the score as a calibrated probability.</li>
                  <li>Does not invent chain data when an explorer is silent.</li>
                </ul>
              </div>
            </div>
          </Glass>
          <Glass lite className="rounded-3xl p-5">
            <div className="flex items-start gap-3">
              <span className="icon-well bg-warn/10">
                <Lock className="size-4 text-warn" strokeWidth={1.75} />
              </span>
              <p className="text-sm leading-relaxed text-fg">
                Human review is mandatory. Export and the mock SAHYOG draft stay locked until an investigator accepts the
                lead.
              </p>
            </div>
          </Glass>
        </aside>
      </section>
    </AppShell>
  );
}
