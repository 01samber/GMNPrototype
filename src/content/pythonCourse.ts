/**
 * Python equivalents for the browser tutorial — pandas, matplotlib, sklearn.
 * The web app draws charts with Recharts (EDA, KPI, ML pages); here you recreate the same *ideas*
 * with matplotlib/seaborn. Numbers differ slightly from the TypeScript implementation.
 */

export type PythonSectionId = "data" | "viz" | "ml";

export interface PythonLesson {
  id: string;
  section: PythonSectionId;
  title: string;
  summary: string;
  /** Maps to React/TS modules for curious readers */
  mapsTo?: string;
  code: string;
}

export const PYTHON_SECTION_ORDER: PythonSectionId[] = ["data", "viz", "ml"];

export const PYTHON_SECTION_LABELS: Record<
  PythonSectionId,
  { title: string; description: string }
> = {
  data: {
    title: "Data pipeline",
    description:
      "Load quarters, normalize headers, coerce types — mirrors src/lib/excel/ (parseWorkbook, normalize, clean).",
  },
  viz: {
    title: "Charts & KPIs",
    description:
      "Histograms, scatter, heatmap, rollups — the browser renders these with Recharts on /eda and /kpi; here you code them in Python.",
  },
  ml: {
    title: "Modeling",
    description:
      "Metrics, preprocessing, models, diagnostics — aligns with src/lib/ml/ and the Models page (Recharts for predicted vs actual).",
  },
};

export const PYTHON_SETUP = `\
# Python 3.10+ recommended
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate

pip install pandas numpy scikit-learn openpyxl matplotlib seaborn
`;

export const PYTHON_LESSONS: PythonLesson[] = [
  {
    id: "load-excel",
    section: "data",
    title: "1. Load quarter sheets (Q1–Q4)",
    mapsTo: "parseWorkbook.ts",
    summary: "Read the same workbook structure as the web app: multiple sheets, trim names, concatenate.",
    code: `\
import pandas as pd
from pathlib import Path

path = Path("gmn-completed-2026.xlsx")

def is_quarter_sheet(name: str) -> bool:
    t = str(name).strip().lower()
    return t in {"q1", "q2", "q3", "q4"}

xl = pd.ExcelFile(path, engine="openpyxl")
frames = []
for sheet in xl.sheet_names:
    if not is_quarter_sheet(sheet):
        continue
    df = pd.read_excel(path, sheet_name=sheet, engine="openpyxl")
    df.columns = [str(c).strip() for c in df.columns]
    df["__sheet__"] = sheet.strip()
    frames.append(df)

raw = pd.concat(frames, ignore_index=True)
print(raw.shape, raw.columns[:8].tolist())
`,
  },
  {
    id: "clean-basic",
    section: "data",
    title: "2. Clean column names & coerce types",
    mapsTo: "normalize.ts, clean.ts",
    summary:
      "Map messy headers to stable names, parse dates, and numeric columns — mirrors the TypeScript normalizer.",
    code: `\
# Assumes variable raw from lesson 1 (concatenated quarter sheets).
import pandas as pd
import numpy as np

COL_MAP = {
    "work order": "work_order",
    "dispatcher": "dispatcher",
    "received date": "received_date",
    "eta": "eta",
    "trade": "trade",
    "nte approved": "nte_approved",
    "cost": "cost",
    "profit %": "profit_pct",
    "status": "status",
    "state": "state",
    "invoice date": "invoice_date",
    "quote sent on ?": "quote_sent_on",
}

def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = [str(c).strip().lower() for c in out.columns]
    out = out.rename(columns={k: v for k, v in COL_MAP.items() if k in out.columns})
    return out

df = normalize_headers(raw)

for c in ["received_date", "eta", "invoice_date", "quote_sent_on"]:
    if c in df.columns:
        df[c] = pd.to_datetime(df[c], errors="coerce")

for c in ["nte", "nte_approved", "cost"]:
    if c in df.columns:
        df[c] = pd.to_numeric(df[c], errors="coerce")

if "profit_pct" in df.columns:
    df["profit_pct"] = pd.to_numeric(df["profit_pct"].astype(str).str.replace("%", ""), errors="coerce")

df = df.dropna(subset=["work_order"], how="any")
print(df.dtypes)
`,
  },
  {
    id: "features",
    section: "data",
    title: "3. Derived features",
    mapsTo: "features.ts",
    summary:
      "Cycle times and ratios — exclude leaky columns when the target is Cost (as in the browser).",
    code: `\
import numpy as np

# After parsing dates to datetime (Lesson 2)
df["days_to_eta"] = (df["eta"] - df["received_date"]).dt.days
df["days_to_invoice"] = (df["invoice_date"] - df["received_date"]).dt.days

# Example: cost / nte_approved — do NOT use as feature when predicting cost (target leakage)
df["cost_vs_nte_appr"] = df["cost"] / df["nte_approved"].replace(0, np.nan)

trade_counts = df["trade"].value_counts()
df["trade_freq"] = df["trade"].map(trade_counts).fillna(0)
`,
  },
  {
    id: "eda-plots",
    section: "viz",
    title: "4. EDA: histogram & scatter",
    mapsTo: "EDAPage.tsx (BarChart, ScatterChart)",
    summary:
      "The app builds a cost histogram and an NTE Approved vs Cost scatter in Recharts; matplotlib draws the same views and saves PNG/SVG for reports.",
    code: `\
import matplotlib.pyplot as plt

# --- Cost histogram (same idea as the EDA “Cost distribution” bar chart) ---
costs = df["cost"].dropna()
fig, ax = plt.subplots(figsize=(9, 4))
ax.hist(costs, bins=14, color="#0284c7", edgecolor="white")
ax.set_xlabel("Cost")
ax.set_ylabel("Count")
ax.set_title("Cost distribution (line-level)")
fig.tight_layout()
fig.savefig("eda_cost_histogram.png", dpi=140)

# --- Scatter: NTE Approved vs Cost (sampled like the browser) ---
sub = df.dropna(subset=["nte_approved", "cost"]).head(2500)
fig, ax = plt.subplots(figsize=(9, 4))
ax.scatter(sub["nte_approved"], sub["cost"], alpha=0.35, s=10, c="#0d9488", edgecolors="none")
ax.set_xlabel("NTE Approved")
ax.set_ylabel("Cost")
ax.set_title("NTE Approved vs Cost")
fig.tight_layout()
fig.savefig("eda_scatter_nte_cost.png", dpi=140)
plt.show()
`,
  },
  {
    id: "correlation-viz",
    section: "viz",
    title: "5. Correlation matrix (table + heatmap)",
    mapsTo: "correlation.ts, EDAPage.tsx table",
    summary:
      "The app computes Pearson r in correlation.ts and colors table cells; seaborn imshow reproduces the heatmap for slides.",
    code: `\
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

cols = [c for c in ["cost", "nte_approved", "nte", "profit_pct", "days_to_eta"] if c in df.columns]
num = df[cols].apply(pd.to_numeric, errors="coerce").dropna()
cm = num.corr(method="pearson")

fig, ax = plt.subplots(figsize=(6.5, 5.5))
sns.heatmap(cm, annot=True, fmt=".2f", cmap="Blues", vmin=-1, vmax=1, ax=ax, square=True)
ax.set_title("Pearson correlation (numeric, paired rows)")
fig.tight_layout()
fig.savefig("eda_correlation_heatmap.png", dpi=140)
plt.show()
`,
  },
  {
    id: "executive-kpis",
    section: "viz",
    title: "6. Executive KPI rollups",
    mapsTo: "lib/kpi/executive.ts, KPIDashboardPage.tsx",
    summary:
      "KPI cards in the app come from computeExecutiveKpis(CleanRow[]). Below is the same roll-up logic in pandas — totals, rates, and top categories.",
    code: `\
import pandas as pd

n = len(df)
missing_recv_pct = df["received_date"].isna().mean() * 100
unique_wo = df["work_order"].nunique()

costs = df["cost"].dropna()
avg_cost = costs.mean()
median_cost = costs.median()

profits = df["profit_pct"].dropna()
avg_profit = profits.mean()

sum_nte = df["nte"].fillna(0).sum()
sum_nte_appr = df["nte_approved"].fillna(0).sum()
approval_gap = sum_nte_appr - sum_nte

invoice_rate = df["invoice_date"].notna().mean() * 100 if "invoice_date" in df.columns else 0
quote_rate = df["quote_sent_on"].notna().mean() * 100 if "quote_sent_on" in df.columns else 0

eta_delay = df["days_to_eta"].dropna()
avg_eta_delay = eta_delay.mean() if len(eta_delay) else None

def top_counts(col: str, k: int = 8):
    s = df[col].fillna("(blank)").astype(str).str.strip().replace("", "(blank)")
    return s.value_counts().head(k)

kpi = pd.Series({
    "total_lines": n,
    "unique_work_orders": unique_wo,
    "missing_received_pct": missing_recv_pct,
    "avg_cost": avg_cost,
    "median_cost": median_cost,
    "avg_profit_pct": avg_profit,
    "sum_nte": sum_nte,
    "sum_nte_approved": sum_nte_appr,
    "approval_gap": approval_gap,
    "invoice_rate_pct": invoice_rate,
    "quote_rate_pct": quote_rate,
    "avg_days_to_eta": avg_eta_delay,
})
print(kpi.round(3))
print("\\nTop trades:\\n", top_counts("trade", 8))
`,
  },
  {
    id: "metrics",
    section: "ml",
    title: "7. Regression metrics (MAE, MSE, RMSE, R²)",
    mapsTo: "MLWorkbenchPage metrics",
    summary: "Same definitions as in the ML workbench metrics panel.",
    code: `\
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

def regression_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    return {"mae": mae, "mse": mse, "rmse": rmse, "r2": r2}

# Example
# print(regression_metrics(y_test, y_pred))
`,
  },
  {
    id: "split-pipeline",
    section: "ml",
    title: "8. Train/test split + preprocessing",
    mapsTo: "pipeline.ts, features.ts",
    summary:
      "Numeric matrix + one-hot for categories; StandardScaler for distance-based models (k-NN) and ridge.",
    code: `\
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

TARGET = "cost"  # or "profit_pct", "nte_approved"

num_cols = ["nte", "nte_approved", "profit_pct", "days_to_eta", "trade_freq"]
cat_cols = ["status", "trade"]

X = df[num_cols + cat_cols]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.22, random_state=42
)

preprocess = ColumnTransformer(
    transformers=[
        ("num", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
        ]), num_cols),
        ("cat", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("oh", OneHotEncoder(handle_unknown="ignore", max_categories=15)),
        ]), cat_cols),
    ]
)
`,
  },
  {
    id: "baseline",
    section: "ml",
    title: "9. Baseline — predict train mean",
    mapsTo: "pipeline.ts baseline",
    summary: "Same idea as “Baseline (train mean)” in the web app.",
    code: `\
import numpy as np

y_pred_test = np.full(shape=y_test.shape, fill_value=y_train.mean())
# Compare with regression_metrics(y_test, y_pred_test)
`,
  },
  {
    id: "ridge",
    section: "ml",
    title: "10. Ridge regression",
    mapsTo: "ridge in pipeline",
    summary: "L2-regularized linear model — aligns with the app’s ridge closed form on scaled features.",
    code: `\
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline

ridge = Pipeline([
    ("prep", preprocess),
    ("model", Ridge(alpha=1.2)),
])
ridge.fit(X_train, y_train)
y_pred = ridge.predict(X_test)
# regression_metrics(y_test, y_pred)
`,
  },
  {
    id: "knn",
    section: "ml",
    title: "11. k-NN regression",
    mapsTo: "k-NN in pipeline",
    summary: "Local averaging in scaled feature space — set n_neighbors similar to the UI (e.g. 9).",
    code: `\
from sklearn.neighbors import KNeighborsRegressor

knn = Pipeline([
    ("prep", preprocess),
    ("model", KNeighborsRegressor(n_neighbors=9, weights="distance")),
])
knn.fit(X_train, y_train)
y_pred = knn.predict(X_test)
`,
  },
  {
    id: "tree",
    section: "ml",
    title: "12. Decision tree regression",
    mapsTo: "CART in pipeline",
    summary: "Nonlinear splits — limit max_depth to reduce overfitting on noisy ops data.",
    code: `\
from sklearn.tree import DecisionTreeRegressor

tree = Pipeline([
    ("prep", preprocess),
    ("model", DecisionTreeRegressor(max_depth=9, min_samples_leaf=32, random_state=42)),
])
tree.fit(X_train, y_train)
y_pred = tree.predict(X_test)
`,
  },
  {
    id: "forest",
    section: "ml",
    title: "13. Random forest regression",
    mapsTo: "Random forest in pipeline",
    summary: "Ensemble of trees — increase n_estimators for stability; watch train vs test gap.",
    code: `\
from sklearn.ensemble import RandomForestRegressor

rf = Pipeline([
    ("prep", preprocess),
    ("model", RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_leaf=20,
        random_state=42,
        n_jobs=-1,
    )),
])
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)

# Feature importances (after pipeline, use rf.named_steps["model"].feature_importances_)
`,
  },
  {
    id: "compare",
    section: "ml",
    title: "14. Compare models in a table",
    mapsTo: "MLWorkbenchPage comparison table",
    summary: "Loop models and collect test RMSE — pick champion by holdout error, not training fit.",
    code: `\
models = {
    "ridge": ridge,
    "knn": knn,
    "tree": tree,
    "rf": rf,
}

rows = []
for name, model in models.items():
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    m = regression_metrics(y_test, pred)
    rows.append({"model": name, **m})

import pandas as pd
leader = pd.DataFrame(rows).sort_values("rmse")
print(leader)
`,
  },
  {
    id: "pred-vs-actual",
    section: "ml",
    title: "15. Predicted vs actual (model chart)",
    mapsTo: "MLWorkbenchPage.tsx (ScatterChart residuals)",
    summary:
      "The Models page plots predicted vs true on the test set in Recharts. Matplotlib draws the same diagnostic: points near the diagonal mean good calibration.",
    code: `\
import matplotlib.pyplot as plt
import numpy as np

# After fitting (example: ridge)
y_pred = ridge.predict(X_test)

fig, ax = plt.subplots(figsize=(6, 6))
ax.scatter(y_test, y_pred, alpha=0.35, s=14, c="#0284c7", edgecolors="none")
lo = float(min(y_test.min(), y_pred.min()))
hi = float(max(y_test.max(), y_pred.max()))
ax.plot([lo, hi], [lo, hi], "k--", lw=1, label="Perfect prediction")
ax.set_xlabel("Actual (test)")
ax.set_ylabel("Predicted")
ax.set_title("Predicted vs actual — champion model")
ax.legend()
ax.set_aspect("equal", adjustable="box")
fig.tight_layout()
fig.savefig("ml_pred_vs_actual.png", dpi=140)
plt.show()

# Residuals
resid = np.asarray(y_test) - y_pred
fig2, ax2 = plt.subplots(figsize=(8, 3))
ax2.hist(resid, bins=30, color="#0d9488", edgecolor="white")
ax2.set_xlabel("Residual (actual − predicted)")
ax2.set_title("Residual distribution")
fig2.tight_layout()
fig2.savefig("ml_residuals_hist.png", dpi=140)
`,
  },
];
