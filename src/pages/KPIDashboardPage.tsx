import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeExecutiveKpis } from "@/lib/kpi/executive";
import { useDatasetStore } from "@/store/datasetStore";

export default function KPIDashboardPage() {
  const cleaned = useDatasetStore((s) => s.cleaned);
  const quality = useDatasetStore((s) => s.quality);
  const loadStatus = useDatasetStore((s) => s.loadStatus);
  const loadError = useDatasetStore((s) => s.loadError);

  const kpi = useMemo(() => (cleaned.length ? computeExecutiveKpis(cleaned) : null), [cleaned]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Executive KPI dashboard
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Portfolio rollups after cleaning. Use these KPIs in leadership reviews — always pair with exception lists.
        </p>
      </div>

      {!kpi ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-zinc-500">
            {loadStatus === "loading"
              ? "Loading workbook…"
              : loadError
                ? `Could not load data: ${loadError}`
                : "KPIs will appear once the workbook has finished loading."}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total lines", value: kpi.totalLines.toLocaleString() },
              { label: "Unique work orders", value: kpi.uniqueWo.toLocaleString() },
              { label: "Missing received date %", value: `${kpi.missingPct.toFixed(1)}%` },
              { label: "Clean score", value: quality ? `${quality.cleanScore}/100` : "—" },
              { label: "Avg cost", value: kpi.avgCost != null ? `$${kpi.avgCost.toFixed(0)}` : "—" },
              { label: "Median cost", value: kpi.medianCost != null ? `$${kpi.medianCost.toFixed(0)}` : "—" },
              { label: "Avg profit % (pts)", value: kpi.avgProfit != null ? kpi.avgProfit.toFixed(1) : "—" },
              { label: "Σ NTE (raw)", value: `$${kpi.sumNte.toLocaleString()}` },
              { label: "Σ NTE Approved", value: `$${kpi.sumNteApproved.toLocaleString()}` },
              { label: "Approval gap", value: `$${kpi.approvalGap.toLocaleString()}` },
              { label: "Invoice coverage", value: `${kpi.invoiceRate.toFixed(1)}%` },
              { label: "Quote coverage", value: `${kpi.quoteRate.toFixed(1)}%` },
              {
                label: "Avg ETA delay (days)",
                value: kpi.avgEtaDelay != null ? kpi.avgEtaDelay.toFixed(1) : "—",
              },
            ].map((x) => (
              <Card key={x.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{x.label}</CardDescription>
                  <CardTitle className="text-xl tabular-nums">{x.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top trades by volume</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpi.topTrades} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="n" fill="#0284c7" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top dispatchers by volume</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpi.topDispatchers} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="n" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
