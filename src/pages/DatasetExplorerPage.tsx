import { useMemo, useState } from "react";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { downloadCleanedCsv } from "@/lib/export/downloads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDatasetStore } from "@/store/datasetStore";

const PAGE = 40;
const BUNDLED_NAME = "gmn-completed-2026.xlsx";

export default function DatasetExplorerPage() {
  const raw = useDatasetStore((s) => s.raw);
  const cleaned = useDatasetStore((s) => s.cleaned);
  const quality = useDatasetStore((s) => s.quality);
  const loadStatus = useDatasetStore((s) => s.loadStatus);
  const loadError = useDatasetStore((s) => s.loadError);
  const loadSample = useDatasetStore((s) => s.loadSample);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!q.trim()) return cleaned;
    const s = q.toLowerCase();
    return cleaned.filter(
      (r) =>
        r.workOrder.toLowerCase().includes(s) ||
        (r.trade ?? "").toLowerCase().includes(s) ||
        (r.dispatcher ?? "").toLowerCase().includes(s) ||
        (r.status ?? "").toLowerCase().includes(s)
    );
  }, [cleaned, q]);

  const pageRows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  const reload = () => {
    void loadSample().then(() => toast.success("Workbook reloaded"));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dataset explorer
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Inspect quarter sheets, preview cleaned rows, and review data-quality warnings. Sparse sheets (Q2–Q4)
          are parsed safely — they may still contribute rows when present. This site uses one bundled workbook
          only — there is no file upload.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" /> Data source
          </CardTitle>
          <CardDescription>
            The app always loads <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{BUNDLED_NAME}</code>{" "}
            from the site (same workbook as in the tutorial). Data stays in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {loadStatus === "loading" ? (
            <span className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading workbook…
            </span>
          ) : cleaned.length ? (
            <Badge variant="secondary" className="font-normal">
              Loaded {cleaned.length.toLocaleString()} rows
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadStatus === "loading"}
            onClick={reload}
          >
            <RefreshCw className={loadStatus === "loading" ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Reload workbook
          </Button>
          {cleaned.length ? (
            <Button type="button" variant="outline" onClick={() => downloadCleanedCsv(cleaned)}>
              Download cleaned CSV
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {loadError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{loadError}</p>
            <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={reload}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {raw ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Sheet coverage</CardTitle>
              <CardDescription>Populated vs sparse quarter tabs</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 pr-2">Sheet</th>
                    <th className="py-2 pr-2">Rows</th>
                    <th className="py-2 pr-2">Cols</th>
                    <th className="py-2">Sparse</th>
                  </tr>
                </thead>
                <tbody>
                  {raw.sheets.map((s) => (
                    <tr key={s.name} className="border-b border-zinc-100 dark:border-zinc-800/80">
                      <td className="py-2 pr-2 font-mono text-xs">{s.name}</td>
                      <td className="py-2 pr-2 tabular-nums">{s.rowCount}</td>
                      <td className="py-2 pr-2 tabular-nums">{s.colCount}</td>
                      <td className="py-2">
                        {s.isSparse ? (
                          <Badge variant="warning">Sparse</Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-zinc-500">
                Primary sheet (most rows):{" "}
                <span className="font-mono">{raw.primarySheet ?? "—"}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quality snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {quality ? (
                <>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-500">Clean score</span>
                    <span className="font-semibold tabular-nums">{quality.cleanScore}/100</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-500">Unique WOs</span>
                    <span className="tabular-nums">{quality.uniqueWorkOrders.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-500">WOs with duplicates</span>
                    <span className="tabular-nums">{quality.duplicateRowGroups}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-500">Missing received</span>
                    <span className="tabular-nums">{quality.missingReceived}</span>
                  </div>
                </>
              ) : (
                <p className="text-zinc-500">Load data to see metrics.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : loadStatus === "loading" ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-zinc-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading quarter sheets from {BUNDLED_NAME}…
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-zinc-500">
            No rows available yet. Use &quot;Reload workbook&quot; if loading did not finish.
          </CardContent>
        </Card>
      )}

      {cleaned.length ? (
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-base">Cleaned row preview</CardTitle>
              <CardDescription>
                Showing {filtered.length.toLocaleString()} / {cleaned.length.toLocaleString()} rows
              </CardDescription>
            </div>
            <div className="flex w-full max-w-md flex-col gap-2 sm:w-auto">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Work order, trade, dispatcher, status…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
                  {[
                    "WO",
                    "Trade",
                    "Dispatcher",
                    "Recv",
                    "Cost",
                    "NTE Appr",
                    "Profit%",
                    "Status",
                    "Flags",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap py-2 pr-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 align-top dark:border-zinc-800/60">
                    <td className="py-2 pr-3 font-mono">{r.workOrder}</td>
                    <td className="max-w-[120px] truncate py-2 pr-3">{r.trade ?? "—"}</td>
                    <td className="max-w-[100px] truncate py-2 pr-3">{r.dispatcher ?? "—"}</td>
                    <td className="py-2 pr-3 font-mono">{r.receivedDate ?? "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.cost != null ? r.cost.toFixed(0) : "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.nteApproved != null ? r.nteApproved.toFixed(0) : "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.profitPercent != null ? r.profitPercent.toFixed(1) : "—"}</td>
                    <td className="py-2 pr-3">{r.status}</td>
                    <td className="py-2 pr-3 text-[10px] text-amber-800 dark:text-amber-200">
                      {r._duplicateWo ? "dup " : ""}
                      {r._suspiciousProfit ? "profit " : ""}
                      {r._outlierCost ? "cost-out " : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-zinc-500">
                Page {page + 1} of {pages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
