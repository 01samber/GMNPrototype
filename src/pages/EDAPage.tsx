import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { correlationMatrix } from "@/lib/stats/correlation";
import { useDatasetStore } from "@/store/datasetStore";

function hist(values: number[], bins: number) {
  if (!values.length) return [];
  let min = Math.min(...values),
    max = Math.max(...values);
  if (min === max) max = min + 1;
  const w = (max - min) / bins;
  const counts = new Array(bins).fill(0) as number[];
  for (const v of values) {
    let i = Math.floor((v - min) / w);
    if (i >= bins) i = bins - 1;
    if (i < 0) i = 0;
    counts[i]!++;
  }
  return counts.map((c, i) => ({
    label: `${(min + i * w).toFixed(0)}–${(min + (i + 1) * w).toFixed(0)}`,
    count: c,
  }));
}

export default function EDAPage() {
  const cleaned = useDatasetStore((s) => s.cleaned);
  const loadStatus = useDatasetStore((s) => s.loadStatus);
  const loadError = useDatasetStore((s) => s.loadError);

  const costHist = useMemo(
    () => hist(cleaned.map((r) => r.cost).filter((x): x is number => x != null), 14),
    [cleaned]
  );

  const scatter = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (const r of cleaned) {
      if (r.nteApproved != null && r.cost != null) pts.push({ x: r.nteApproved, y: r.cost });
      if (pts.length > 2500) break;
    }
    return pts;
  }, [cleaned]);

  const corr = useMemo(() => {
    const paired = cleaned.filter(
      (r) =>
        r.cost != null &&
        r.nteApproved != null &&
        r.nte != null &&
        r.profitPercent != null &&
        r.daysToEta != null
    );
    if (paired.length < 40) return null;
    const slice = paired.slice(0, 4000);
    const cols = [
      { key: "cost", values: slice.map((r) => r.cost!) },
      { key: "nteApproved", values: slice.map((r) => r.nteApproved!) },
      { key: "nte", values: slice.map((r) => r.nte!) },
      { key: "profit", values: slice.map((r) => r.profitPercent!) },
      { key: "daysToEta", values: slice.map((r) => r.daysToEta!) },
    ];
    return correlationMatrix(cols);
  }, [cleaned]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Exploratory data analysis
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Distributions, outliers (via spread), and correlation structure for numeric fields. All charts update
          from the bundled workbook.
        </p>
      </div>

      {!cleaned.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-zinc-500">
            {loadStatus === "loading"
              ? "Loading workbook…"
              : loadError
                ? `Could not load data: ${loadError}`
                : "Charts will appear once the workbook has finished loading."}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost distribution</CardTitle>
                <CardDescription>Histogram of line-level cost (where present)</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costHist}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-35} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0284c7" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">NTE Approved vs Cost</CardTitle>
                <CardDescription>Scatter for discipline / leakage awareness (sampled)</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                    <XAxis type="number" dataKey="x" name="NTE Approved" tick={{ fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name="Cost" tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={scatter} fill="#0d9488" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {corr ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Correlation matrix (numeric sample)</CardTitle>
                <CardDescription>Pearson correlation — interpret with care when missingness differs by column</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[360px] text-center text-xs">
                  <thead>
                    <tr>
                      <th className="p-2" />
                      {corr.keys.map((k) => (
                        <th key={k} className="p-2 font-medium text-zinc-600 dark:text-zinc-400">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {corr.matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium text-zinc-600 dark:text-zinc-400">{corr.keys[i]}</td>
                        {row.map((v, j) => (
                          <td key={j} className="p-2">
                            <span
                              className="inline-flex min-w-[2.5rem] justify-center rounded px-1 py-0.5 tabular-nums"
                              style={{
                                background:
                                  i === j
                                    ? "rgba(14, 165, 233, 0.15)"
                                    : `rgba(14, 165, 233, ${Math.min(0.85, Math.abs(v)) * 0.5})`,
                              }}
                            >
                              {v.toFixed(2)}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
