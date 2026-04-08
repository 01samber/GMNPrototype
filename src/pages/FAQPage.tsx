import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faq = [
  {
    q: "Is my Excel file uploaded to a server?",
    a: "No. The site ships with one bundled workbook and runs fully in your browser — there is no upload step. Parsing and modeling happen locally on your machine.",
  },
  {
    q: "Why do some quarter sheets show as sparse?",
    a: "Exports often populate the active quarter first. The parser still reads other tabs but may find few valid rows.",
  },
  {
    q: "Which model should I trust most?",
    a: "Compare test RMSE against the baseline and inspect residuals. Tree ensembles often fit nonlinear ops data, but can overfit outliers.",
  },
  {
    q: "Can I use this in production?",
    a: "This is an educational platform. Production systems need monitoring, governance, and often server-side data integration.",
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">FAQ</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Answers instructors and executives ask first.</p>
      </div>
      {faq.map((x) => (
        <Card key={x.q}>
          <CardHeader>
            <CardTitle className="text-base">{x.q}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">{x.a}</CardContent>
        </Card>
      ))}
    </div>
  );
}
