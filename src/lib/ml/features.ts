import type { CleanRow } from "@/lib/excel/types";

export type TargetKey = "cost" | "profitPercent" | "nteApproved";

export interface FeatureConfig {
  target: TargetKey;
  maxRows: number;
  topTrade: number;
  topDispatcher: number;
  topState: number;
  topStatus: number;
}

const defaultConfig: FeatureConfig = {
  target: "cost",
  maxRows: 6000,
  topTrade: 12,
  topDispatcher: 12,
  topState: 12,
  topStatus: 10,
};

function topCategories(values: (string | null)[], k: number): string[] {
  const m = new Map<string, number>();
  for (const v of values) {
    const key = v && v.trim() ? v.trim() : "(blank)";
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([name]) => name);
}

/** Build dense design matrix for regression models + feature name list */
export function buildFeatureMatrix(rows: CleanRow[], cfg: Partial<FeatureConfig> = {}) {
  const c = { ...defaultConfig, ...cfg };

  const eligible = rows.filter((r) => {
    const t = r[c.target];
    return t != null && Number.isFinite(t);
  });

  const sampled =
    eligible.length > c.maxRows
      ? shuffle(eligible, 42).slice(0, c.maxRows)
      : eligible;

  const trades = topCategories(
    sampled.map((r) => r.trade),
    c.topTrade
  );
  const dispatchers = topCategories(
    sampled.map((r) => r.dispatcher),
    c.topDispatcher
  );
  const states = topCategories(
    sampled.map((r) => r.stateGroup),
    c.topState
  );
  const statuses = topCategories(
    sampled.map((r) => r.status),
    c.topStatus
  );

  const oneHot = (val: string | null, dict: string[]) => {
    const key = val && val.trim() ? val.trim() : "(blank)";
    return dict.map((d) => (d === key ? 1 : 0));
  };

  const featureNames: string[] = ["bias", "nte"];
  if (c.target !== "nteApproved") featureNames.push("nteApproved_feat");
  if (c.target !== "profitPercent") featureNames.push("profit_feat");
  featureNames.push(
    "daysToEta",
    "daysToInvoice",
    "quoteDelayDays",
    "hasAdminNotes",
    "hasTlNotes",
    "tradeFreq_log",
    "subtradeFreq_log"
  );
  if (c.target !== "cost") featureNames.push("costVsNteApproved");
  featureNames.push("nteApprovedVsNte");
  featureNames.push(
    ...trades.map((t) => `trade_${t}`),
    ...dispatchers.map((d) => `disp_${d}`),
    ...states.map((s) => `st_${s}`),
    ...statuses.map((s) => `status_${s}`)
  );

  const X: number[][] = [];
  const y: number[] = [];

  for (const r of sampled) {
    const tgt = r[c.target];
    if (tgt == null || !Number.isFinite(tgt)) continue;

    const nte = r.nte ?? 0;
    const nteA = r.nteApproved ?? 0;
    const profit = r.profitPercent ?? 0;

    const row: number[] = [
      1,
      nte,
      ...(c.target !== "nteApproved" ? [nteA] : []),
      ...(c.target !== "profitPercent" ? [profit] : []),
      r.daysToEta ?? 0,
      r.daysToInvoice ?? 0,
      r.quoteDelayDays ?? 0,
      r.hasAdminNotes ? 1 : 0,
      r.hasTlNotes ? 1 : 0,
      Math.log1p(r.tradeFreq),
      Math.log1p(r.subtradeFreq),
      ...(c.target !== "cost" ? [r.costVsNteApproved ?? 0] : []),
      r.nteApprovedVsNte ?? 0,
      ...oneHot(r.trade, trades),
      ...oneHot(r.dispatcher, dispatchers),
      ...oneHot(r.stateGroup, states),
      ...oneHot(r.status, statuses),
    ];

    if (row.some((v) => !Number.isFinite(v))) continue;
    X.push(row);
    y.push(tgt);
  }

  return {
    X,
    y,
    featureNames,
    meta: { trades, dispatchers, states, statuses, target: c.target, rowCount: X.length },
  };
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function trainTestSplit(
  X: number[][],
  y: number[],
  testRatio: number,
  seed: number
): { XTrain: number[][]; yTrain: number[]; XTest: number[][]; yTest: number[] } {
  const idx = shuffle(
    X.map((_, i) => i),
    seed
  );
  const nTest = Math.max(1, Math.floor(X.length * testRatio));
  const testIdx = new Set(idx.slice(0, nTest));
  const XTrain: number[][] = [],
    XTest: number[][] = [],
    yTrain: number[] = [],
    yTest: number[] = [];
  for (let i = 0; i < X.length; i++) {
    if (testIdx.has(i)) {
      XTest.push(X[i]!);
      yTest.push(y[i]!);
    } else {
      XTrain.push(X[i]!);
      yTrain.push(y[i]!);
    }
  }
  return { XTrain, yTrain, XTest, yTest };
}

export function standardizeFeatures(XTrain: number[][], XTest: number[][] | null) {
  const p = XTrain[0]?.length ?? 0;
  const mean = new Array(p).fill(0);
  const std = new Array(p).fill(0);
  const n = XTrain.length;
  for (let j = 1; j < p; j++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += XTrain[i]![j]!;
    mean[j] = s / n;
  }
  for (let j = 1; j < p; j++) {
    let s2 = 0;
    for (let i = 0; i < n; i++) s2 += (XTrain[i]![j]! - mean[j]!) ** 2;
    std[j] = Math.sqrt(s2 / n) || 1;
  }
  const scale = (row: number[]) =>
    row.map((v, j) => (j === 0 ? v : (v - mean[j]!) / std[j]!));

  const XTr = XTrain.map(scale);
  const XTe = XTest ? XTest.map(scale) : null;
  return { XTrain: XTr, XTest: XTe, mean, std };
}
