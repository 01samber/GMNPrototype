import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDatasetStore } from "@/store/datasetStore";

export default function FeatureEngineeringPage() {
  const cleaned = useDatasetStore((s) => s.cleaned);
  const sample = cleaned.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Feature engineering
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Derived fields encode business semantics: cycle times, discipline ratios, and portfolio frequency signals.
          These features power EDA charts and ML models (with leakage guards per target).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Cycle times",
            body: "Days_to_ETA, Days_to_Invoice, Quote_delay — computed from parsed ISO dates. Missing dates produce nulls (preserved, not zero-filled).",
          },
          {
            title: "Discipline ratios",
            body: "Cost / NTE Approved highlights spend vs approval; excluded automatically when predicting Cost to avoid leakage.",
          },
          {
            title: "Frequency encodings",
            body: "Trade and subtrade frequencies capture portfolio-wide popularity — useful for capacity narratives.",
          },
          {
            title: "Notes flags",
            body: "Has Admin / TL Notes proxies documentation intensity — weak signal but helpful for data hygiene stories.",
          },
        ].map((x) => (
          <Card key={x.title}>
            <CardHeader>
              <CardTitle className="text-base">{x.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">{x.body}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Before / after (sample)</CardTitle>
          <CardDescription>First rows after cleaning &amp; derivation</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto text-xs">
          {sample.length ? (
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
                  <th className="py-2 pr-2">WO</th>
                  <th className="py-2 pr-2">daysToEta</th>
                  <th className="py-2 pr-2">daysToInv</th>
                  <th className="py-2 pr-2">quoteDel</th>
                  <th className="py-2 pr-2">cost/NTE_A</th>
                  <th className="py-2 pr-2">tradeFreq</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800/60">
                    <td className="py-2 pr-2 font-mono">{r.workOrder}</td>
                    <td className="py-2 pr-2 tabular-nums">{r.daysToEta ?? "—"}</td>
                    <td className="py-2 pr-2 tabular-nums">{r.daysToInvoice ?? "—"}</td>
                    <td className="py-2 pr-2 tabular-nums">{r.quoteDelayDays ?? "—"}</td>
                    <td className="py-2 pr-2 tabular-nums">
                      {r.costVsNteApproved != null ? r.costVsNteApproved.toFixed(2) : "—"}
                    </td>
                    <td className="py-2 pr-2 tabular-nums">{r.tradeFreq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-zinc-500">Load data to preview engineered columns.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
