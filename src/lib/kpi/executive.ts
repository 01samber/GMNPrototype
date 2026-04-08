import type { CleanRow } from "@/lib/excel/types";

export interface ExecutiveKpiBundle {
  totalLines: number;
  uniqueWo: number;
  missingPct: number;
  avgCost: number | null;
  medianCost: number | null;
  avgProfit: number | null;
  sumNte: number;
  sumNteApproved: number;
  approvalGap: number;
  invoiceRate: number;
  quoteRate: number;
  avgEtaDelay: number | null;
  topTrades: { name: string; n: number }[];
  topStates: { name: string; n: number }[];
  topDispatchers: { name: string; n: number }[];
}

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

function topMap(rows: CleanRow[], key: (r: CleanRow) => string | null, k = 8) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const v = key(r);
    const name = v && v.trim() ? v.trim() : "(blank)";
    m.set(name, (m.get(name) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([name, n]) => ({ name, n }));
}

export function computeExecutiveKpis(rows: CleanRow[]): ExecutiveKpiBundle {
  const n = rows.length;
  let missing = 0;
  const costs: number[] = [];
  const profits: number[] = [];
  let sumNte = 0,
    sumNteA = 0,
    nNte = 0;
  let invoiced = 0,
    quoted = 0;
  const etaDelays: number[] = [];

  for (const r of rows) {
    if (!r.receivedDate) missing++;
    if (r.cost != null) costs.push(r.cost);
    if (r.profitPercent != null) profits.push(r.profitPercent);
    if (r.nte != null) {
      sumNte += r.nte;
      nNte++;
    }
    if (r.nteApproved != null) sumNteA += r.nteApproved;
    if (r.invoiceDate) invoiced++;
    if (r.quoteSentOn) quoted++;
    if (r.daysToEta != null && Number.isFinite(r.daysToEta)) etaDelays.push(r.daysToEta);
  }

  const uniqueWo = new Set(rows.map((r) => r.workOrder)).size;

  return {
    totalLines: n,
    uniqueWo,
    missingPct: n ? (missing / n) * 100 : 0,
    avgCost: costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : null,
    medianCost: median(costs),
    avgProfit: profits.length ? profits.reduce((a, b) => a + b, 0) / profits.length : null,
    sumNte,
    sumNteApproved: sumNteA,
    approvalGap: sumNteA - sumNte,
    invoiceRate: n ? (invoiced / n) * 100 : 0,
    quoteRate: n ? (quoted / n) * 100 : 0,
    avgEtaDelay: etaDelays.length
      ? etaDelays.reduce((a, b) => a + b, 0) / etaDelays.length
      : null,
    topTrades: topMap(rows, (r) => r.trade),
    topStates: topMap(rows, (r) => r.state),
    topDispatchers: topMap(rows, (r) => r.dispatcher),
  };
}
