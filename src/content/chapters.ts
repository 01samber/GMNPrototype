export interface Chapter {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMin: number;
  body: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "1",
    slug: "dataset-intro",
    title: "Dataset introduction",
    durationMin: 12,
    summary:
      "Understand the GMN operational workbook: quarter sheets, line-level grain, and key business columns.",
    body: `## What you are looking at
Each row is typically a **line** on a work order. The same Work Order ID can appear multiple times when there are revisions, vendor changes, or multi-line jobs.

## Why “Q1 ” matters
Your workbook may include multiple quarter tabs. In your file, **Q1** is often the most populated. Other tabs may be sparse — the parser still reads them safely, but sparse sheets contribute fewer rows.

## Columns to trust (and question)
- **Received Date** anchors time-series and SLA analytics.
- **Cost vs NTE Approved** is a core financial discipline signal.
- **Profit %** may arrive as percent points or fractions depending on export settings — cleaning normalizes this.

## Senior engineer note
Before modeling, always verify **grain** (row vs work order), **date coverage**, and **status semantics**.`,
  },
  {
    id: "2",
    slug: "data-cleaning",
    title: "Data cleaning & quality",
    durationMin: 18,
    summary: "Trim headers, parse dates, coerce numeric fields, detect duplicates, and handle sparse sheets.",
    body: `## Cleaning checklist
1. Trim header names (extra spaces like "Q1 ").
2. Drop blank rows and blank Work Order lines.
3. Parse Excel serial dates and ISO strings consistently.
4. Coerce **NTE**, **NTE Approved**, **Cost**, **Profit %** with safe parsing.
5. Flag duplicate Work Order IDs (multi-line vs true duplicates).

## Common mistakes
- Treating missing **Status** as “completed”.
- Using **Cost** without checking **NTE Approved** context.
- Ignoring sparse quarter sheets that still contain a few valid rows.`,
  },
  {
    id: "3",
    slug: "eda",
    title: "Exploratory data analysis",
    durationMin: 20,
    summary: "Distributions, outliers, correlations, and operational slices (trade, state, dispatcher).",
    body: `## EDA goals
- Quantify missingness and skew.
- Identify outliers (cost heavy tails).
- Compare **Trade** and **State** mixes with operational intuition.

## Business interpretation
If cost outliers cluster in a trade or region, that is often a **process** problem, not a modeling trick.`,
  },
  {
    id: "4",
    slug: "feature-engineering",
    title: "Feature engineering",
    durationMin: 22,
    summary: "Build derived signals: delays, ratios, frequency encodings, and missingness indicators.",
    body: `## Examples used in this app
- **Days_to_ETA** and **Days_to_Invoice** summarize cycle time.
- **Cost / NTE Approved** captures spend discipline (when not used as a leakage feature for cost models).
- **Frequency** features encode how common a trade/subtrade is portfolio-wide.

## Leakage warning
Never train **Cost** models using features computed **from Cost** (e.g., cost ratios). This tutorial automatically removes leaky columns depending on the selected target.`,
  },
  {
    id: "5",
    slug: "linear-regression",
    title: "Linear regression (baseline + ridge)",
    durationMin: 16,
    summary: "Interpretable baseline, coefficients, and regularization to stabilize messy operations data.",
    body: `## When linear models help
Great for first-pass benchmarking and stakeholder explanations.

## Ridge regression
Adds L2 penalty to reduce variance when many correlated features exist (common in categorical-heavy data).`,
  },
  {
    id: "6",
    slug: "decision-tree",
    title: "Decision tree regression",
    durationMin: 14,
    summary: "Nonlinear splits, interactions, and interpretability via decision paths.",
    body: `## Strengths
Captures thresholds (“if NTE Approved > X and Status in …”) that linear models miss.

## Weaknesses
Can overfit noisy operational data; keep depth constrained and validate on holdout data.`,
  },
  {
    id: "7",
    slug: "random-forest",
    title: "Random forest regression",
    durationMin: 16,
    summary: "Ensemble of trees with bagging; strong default for tabular nonlinear patterns.",
    body: `## Why it works
Averaging many trees reduces variance while retaining flexibility.

## Practical note
Use holdout metrics and residual plots — forests can still memorize outliers if trees are too deep.`,
  },
  {
    id: "8",
    slug: "knn",
    title: "k-Nearest neighbors regression",
    durationMin: 12,
    summary: "Local similarity model; useful sanity check and nonlinear baseline.",
    body: `## When KNN shines
Smooth local structure, especially after scaling.

## Watchouts
Curse of dimensionality: performance can degrade if too many weak/irrelevant features are included.`,
  },
  {
    id: "9",
    slug: "model-evaluation",
    title: "Model evaluation & comparison",
    durationMin: 18,
    summary: "MAE/MSE/RMSE/R², residual analysis, and choosing a champion model responsibly.",
    body: `## What good looks like
Lower error on **held-out** rows — but always compare against a naive baseline (mean predictor).

## Ethics / operations
Models prioritize and explain; they do not replace finance sign-off.`,
  },
  {
    id: "10",
    slug: "kpi-dashboard",
    title: "KPI dashboard & business insights",
    durationMin: 14,
    summary: "Executive KPIs: volume, margin signals, approvals, invoice coverage, and bottlenecks.",
    body: `## KPI framing
Pair quantitative KPIs with **exceptions**: top trades by cost, states with delays, dispatchers with unknown status rates.`,
  },
  {
    id: "11",
    slug: "best-practices",
    title: "Mistakes & best practices",
    durationMin: 10,
    summary: "Leakage, label ambiguity, sparse sheets, and governance for ML in operations.",
    body: `## Top pitfalls
- Target leakage via engineered ratios that include the target.
- Ignoring **Unknown** statuses in “completion” metrics.
- Evaluating on the same rows you tuned on.`,
  },
  {
    id: "12",
    slug: "summary",
    title: "Course summary & next steps",
    durationMin: 8,
    summary: "Export artifacts, document assumptions, and iterate with stakeholders.",
    body: `## Deliverables checklist
- Cleaned export (CSV)
- Model comparison JSON
- Charts + written interpretation for leadership`,
  },
];

export function chapterBySlug(slug: string) {
  return CHAPTERS.find((c) => c.slug === slug);
}
