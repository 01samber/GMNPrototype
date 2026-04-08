import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CleanRow } from "@/lib/excel/types";
import { useDatasetStore } from "@/store/datasetStore";

export default function BusinessInsightsPage() {
  const cleaned = useDatasetStore((s) => s.cleaned);
  const loadStatus = useDatasetStore((s) => s.loadStatus);
  const loadError = useDatasetStore((s) => s.loadError);

  const insights = useMemo(() => {
    if (!cleaned.length) {
      return {
        hiCost: [] as { trade: string; avgCost: number; avgProfit: number; n: number }[],
        hiProfit: [] as { trade: string; avgCost: number; avgProfit: number; n: number }[],
        delays: [] as CleanRow[],
      };
    }
    const byTrade = new Map<string, { cost: number; n: number; profit: number[] }>();
    for (const r of cleaned) {
      const t = r.trade ?? "(blank)";
      const cur = byTrade.get(t) ?? { cost: 0, n: 0, profit: [] };
      cur.n++;
      if (r.cost != null) cur.cost += r.cost;
      if (r.profitPercent != null) cur.profit.push(r.profitPercent);
      byTrade.set(t, cur);
    }
    const tradeRows = [...byTrade.entries()].map(([trade, v]) => ({
      trade,
      avgCost: v.n ? v.cost / v.n : 0,
      avgProfit: v.profit.length ? v.profit.reduce((a, b) => a + b, 0) / v.profit.length : 0,
      n: v.n,
    }));
    const hiCost = [...tradeRows].sort((a, b) => b.avgCost - a.avgCost).slice(0, 5);
    const hiProfit = [...tradeRows].sort((a, b) => b.avgProfit - a.avgProfit).slice(0, 5);
    const delays = [...cleaned]
      .filter((r) => r.daysToInvoice != null)
      .sort((a, b) => (b.daysToInvoice ?? 0) - (a.daysToInvoice ?? 0))
      .slice(0, 3);
    return { hiCost, hiProfit, delays };
  }, [cleaned]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Business recommendations
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Heuristic segments for executive discussion — not automated decisions. Validate with domain owners.
        </p>
      </div>

      {!cleaned.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-zinc-500">
            {loadStatus === "loading"
              ? "Loading workbook…"
              : loadError
                ? `Could not load data: ${loadError}`
                : "Insights will appear once the workbook has finished loading."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Highest average cost trades</CardTitle>
              <CardDescription>Where spend intensity concentrates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {insights.hiCost.map((x) => (
                <div key={x.trade} className="flex justify-between gap-2 border-b border-zinc-100 py-1 dark:border-zinc-800/80">
                  <span className="truncate">{x.trade}</span>
                  <span className="shrink-0 tabular-nums text-zinc-600">${x.avgCost.toFixed(0)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strongest avg profit % trades</CardTitle>
              <CardDescription>Where margin index looks healthiest on average</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {insights.hiProfit.map((x) => (
                <div key={x.trade} className="flex justify-between gap-2 border-b border-zinc-100 py-1 dark:border-zinc-800/80">
                  <span className="truncate">{x.trade}</span>
                  <span className="shrink-0 tabular-nums text-zinc-600">{x.avgProfit.toFixed(1)} pts</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Longest invoice cycle samples</CardTitle>
              <CardDescription>Invoice date minus received date (days)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {insights.delays.map((r) => (
                <div key={r.id} className="border-b border-zinc-100 py-1 dark:border-zinc-800/80">
                  <p className="font-mono text-xs">{r.workOrder}</p>
                  <p className="text-zinc-600">{r.daysToInvoice} days</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
