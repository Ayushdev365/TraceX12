import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Glass, PageHeader } from "@/components/ui/glass";
import { listRecentTraces } from "@/lib/server/functions";
import { formatUnix, shortenAddress } from "@/lib/utils";

export const Route = createFileRoute("/cases")({ component: CasesPage });

type Row = Awaited<ReturnType<typeof listRecentTraces>>[number];

function CasesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRecentTraces()
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load cases."));
  }, []);

  return (
    <AppShell>
      <PageHeader
        kicker="Workspace"
        title="Cases"
        description="Recent traces stored for this workspace. Rows are investigation references, not personal records. There is no sign-in on this MVP."
      />
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <div className="table-wrap mt-8">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="font-medium">Created</th>
                <th className="font-medium">Case</th>
                <th className="font-medium">Wallet</th>
                <th className="font-medium">Chain</th>
                <th className="font-medium">Result</th>
                <th className="font-medium">Review</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14">
                    <Glass lite className="mx-auto max-w-md rounded-2xl p-6 text-center">
                      <p className="text-sm text-muted">No traces yet. Run an attribution from Investigate.</p>
                    </Glass>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="text-muted">{formatUnix(Date.parse(row.created_at) / 1000)}</td>
                    <td className="font-mono text-xs">{row.case_id ?? "—"}</td>
                    <td>
                      <Link
                        to="/trace/$traceId"
                        params={{ traceId: row.id }}
                        className="font-mono text-xs text-accent hover:underline"
                      >
                        {shortenAddress(row.wallet_address, 8, 6)}
                      </Link>
                    </td>
                    <td className="capitalize">{row.chain}</td>
                    <td>
                      {row.attributed_vasp_id
                        ? `${row.attributed_vasp_id} · ${row.confidence_score ?? "—"}`
                        : row.status}
                    </td>
                    <td>
                      <span className="chip">{row.review_decision}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
