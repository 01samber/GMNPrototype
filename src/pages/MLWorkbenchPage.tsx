import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { downloadPipelineJson } from "@/lib/export/downloads";
import type { TargetKey } from "@/lib/ml/features";
import { useDatasetStore } from "@/store/datasetStore";

export default function MLWorkbenchPage() {
  const cleaned = useDatasetStore((s) => s.cleaned);
  const loadStatus = useDatasetStore((s) => s.loadStatus);
  const loadError = useDatasetStore((s) => s.loadError);
  const pipeline = useDatasetStore((s) => s.pipeline);
  const mlTarget = useDatasetStore((s) => s.mlTarget);
  const testRatio = useDatasetStore((s) => s.testRatio);
  const seed = useDatasetStore((s) => s.seed);
  const setMlTarget = useDatasetStore((s) => s.setMlTarget);
  const setTestRatio = useDatasetStore((s) => s.setTestRatio);
  const setSeed = useDatasetStore((s) => s.setSeed);
  const runMl = useDatasetStore((s) => s.runMl);

  const best = useMemo(() => {
    if (!pipeline?.models.length) return null;
    const nonBase = pipeline.models.filter((m) => m.name !== "Baseline (train mean)");
    if (!nonBase.length) return pipeline.models[0]!;
    return [...nonBase].sort((a, b) => a.test.rmse - b.test.rmse)[0]!;
  }, [pipeline]);

  const scatterData = useMemo(() => {
    if (!best || !pipeline) return [];
    const yT = pipeline.yTestTrue;
    const yP = best.yTestPred;
    return yT.map((y, i) => ({ x: y, y: yP[i]!, resid: y - yP[i]! }));
  }, [best, pipeline]);

  const [busy, setBusy] = useState(false);

  const train = () => {
    setBusy(true);
    try {
      runMl();
      toast.success("Training complete");
    } catch {
      toast.error("Training failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Model laboratory
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Ridge linear regression, k-NN, decision tree, and random forest (client-side). Includes a mean baseline.
          Training uses standardized numeric features and one-hot encodings for high-cardinality categorical fields.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Training controls</CardTitle>
          <CardDescription>
            Avoid target leakage: the feature builder automatically drops columns that would leak the selected target.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Target variable</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={mlTarget}
              onChange={(e) => setMlTarget(e.target.value as TargetKey)}
            >
              <option value="cost">Cost</option>
              <option value="profitPercent">Profit %</option>
              <option value="nteApproved">NTE Approved</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Test ratio ({Math.round(testRatio * 100)}%)</Label>
            <input
              type="range"
              min={0.1}
              max={0.4}
              step={0.02}
              value={testRatio}
              onChange={(e) => setTestRatio(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Random seed</Label>
            <input
              type="number"
              className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" disabled={busy || cleaned.length < 80} onClick={train}>
              {busy ? "Training…" : "Train / refresh"}
            </Button>
            <p className="text-xs text-zinc-500">{cleaned.length.toLocaleString()} cleaned rows available</p>
          </div>
        </CardContent>
      </Card>

      {!pipeline || cleaned.length < 80 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-zinc-500">
            {loadStatus === "loading"
              ? "Loading workbook…"
              : loadError
                ? `Could not load data: ${loadError}`
                : cleaned.length < 80
                  ? "Need at least ~80 rows with valid targets. Wait for the workbook to finish loading or pick a target with fewer missing values."
                  : "Train models using the controls above."}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Model comparison (test set)</CardTitle>
                <CardDescription>Lower RMSE is better; compare vs baseline.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => pipeline && downloadPipelineJson(pipeline)}>
                Download JSON
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
                    <th className="py-2 pr-3">Model</th>
                    <th className="py-2 pr-3">MAE</th>
                    <th className="py-2 pr-3">RMSE</th>
                    <th className="py-2 pr-3">R²</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.models.map((m) => (
                    <tr key={m.name} className="border-b border-zinc-100 dark:border-zinc-800/80">
                      <td className="py-2 pr-3 font-medium">
                        {m.name}
                        {best?.name === m.name ? (
                          <Badge className="ml-2" variant="secondary">
                            best RMSE
                          </Badge>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 tabular-nums">{m.test.mae.toFixed(3)}</td>
                      <td className="py-2 pr-3 tabular-nums">{m.test.rmse.toFixed(3)}</td>
                      <td className="py-2 pr-3 tabular-nums">{m.test.r2.toFixed(3)}</td>
                      <td className="py-2 text-xs text-zinc-500">
                        {m.name.includes("linear") && m.importances?.length
                          ? `Top feature: ${m.importances[0]?.name}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {best && scatterData.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actual vs predicted ({best.name})</CardTitle>
                  <CardDescription>Ideal points hug the diagonal</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                      <XAxis type="number" dataKey="x" name="Actual" tick={{ fontSize: 10 }} />
                      <YAxis type="number" dataKey="y" name="Pred" tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Scatter data={scatterData} fill="#0284c7" name="pred vs actual" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Residuals ({best.name})</CardTitle>
                  <CardDescription>Should be roughly centered around 0</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scatterData.map((d, i) => ({ i, r: d.resid }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                      <XAxis dataKey="i" tick={{ fontSize: 9 }} hide />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="r" name="residual" stroke="#7c3aed" dot={false} strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : best ? (
            <p className="text-sm text-zinc-500">Not enough test predictions to plot (try adjusting test ratio or target).</p>
          ) : null}
        </>
      )}
    </div>
  );
}
