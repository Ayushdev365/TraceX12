import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Glass, PageHeader } from "@/components/ui/glass";
import { getDataset } from "@/lib/server/functions";
import { explorerUrl, shortenAddress } from "@/lib/utils";

export const Route = createFileRoute("/dataset")({ component: DatasetPage });

type Dataset = Awaited<ReturnType<typeof getDataset>>;

function DatasetPage() {
  const [data, setData] = useState<Dataset | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDataset()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load dataset."));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    return data.addresses.filter((a) => {
      if (!needle) return true;
      return (
        a.address.toLowerCase().includes(needle) ||
        a.label.toLowerCase().includes(needle) ||
        a.vasp_id.includes(needle) ||
        a.source.toLowerCase().includes(needle)
      );
    });
  }, [data, q]);

  return (
    <AppShell>
      <PageHeader
        kicker="Provenance"
        title="Labelled dataset"
        description="Every VASP address carries provenance: source, URL, verification status, date, and reliability tier. Coverage is partial. Stale or conflicting labels should be treated as review items, not ground truth."
      />
      {data?.meta ? (
        <p className="mt-4 text-xs text-subtle">
          Version {data.meta.version} · updated {data.meta.updated_at} · {data.addresses.length} labelled addresses ·{" "}
          {data.risks.length} risk entities
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <div className="relative mt-8 max-w-lg">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by address, VASP, label, or source"
          className="glass-input pl-10"
          suppressHydrationWarning
        />
      </div>

      <div className="table-wrap mt-6">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="font-medium">VASP</th>
                <th className="font-medium">Chain</th>
                <th className="font-medium">Label</th>
                <th className="font-medium">Address</th>
                <th className="font-medium">Source</th>
                <th className="font-medium">Reliability</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={`${a.chain}-${a.address}`}>
                  <td>{a.vasp_id}</td>
                  <td className="capitalize">{a.chain}</td>
                  <td>{a.label}</td>
                  <td>
                    <a
                      className="font-mono text-xs text-accent hover:underline"
                      href={explorerUrl(a.chain === "tron" ? "tron" : "ethereum", a.address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortenAddress(a.address, 10, 6)}
                    </a>
                  </td>
                  <td className="text-muted">
                    {a.source_url ? (
                      <a href={a.source_url} className="hover:underline" target="_blank" rel="noreferrer">
                        {a.source}
                      </a>
                    ) : (
                      a.source
                    )}
                  </td>
                  <td>
                    <span className="chip">{a.reliability}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">Risk entities</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {(data?.risks ?? []).map((r) => (
          <li key={r.address}>
            <Glass lite className="rounded-2xl px-4 py-3 text-sm text-muted">
              <span className="text-fg">{r.name}</span> · {r.entity_type} · {r.chain} ·{" "}
              <span className="font-mono text-xs">{shortenAddress(r.address)}</span>
            </Glass>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
