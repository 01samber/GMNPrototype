import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const terms = [
  { term: "MAE / MSE / RMSE", def: "Error metrics for regression; RMSE penalizes large outliers more than MAE." },
  { term: "R²", def: "Fraction of variance explained by the model vs predicting the mean — can be negative on test data." },
  { term: "One-hot encoding", def: "Represents categories as binary columns to use them in linear models." },
  { term: "Standardization", def: "Scaling features to comparable variance — important for k-NN and ridge." },
  { term: "Target leakage", def: "Using information that would not be available at prediction time (often from the target itself)." },
  { term: "Holdout test", def: "Rows withheld from training to estimate real-world generalization." },
  { term: "Residual", def: "Actual minus predicted — used to diagnose bias and heteroscedasticity." },
  { term: "Ensemble", def: "Combining multiple models (e.g., random forest) to reduce variance." },
];

export default function GlossaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Glossary</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Quick definitions used throughout this tutorial.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {terms.map((t) => (
          <Card key={t.term}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t.term}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">{t.def}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
