import { profitToComparablePoints } from "./normalize";
import type { CleanRow, ParsedRawRow, QualityReport } from "./types";

function dayDiffDays(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const a = new Date(start + "T12:00:00").getTime();
  const b = new Date(end + "T12:00:00").getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}

function str(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number.parseFloat(String(v).replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function buildCleanRows(raw: ParsedRawRow[]): CleanRow[] {
  const tradeFreqMap = new Map<string, number>();
  const subFreqMap = new Map<string, number>();
  const woSeen = new Map<string, number>();

  for (const r of raw) {
    const tr = str(r.trade) ?? "";
    const st = str(r.subtrade) ?? "";
    const wo = str(r.workOrder) ?? "";
    tradeFreqMap.set(tr, (tradeFreqMap.get(tr) ?? 0) + 1);
    subFreqMap.set(st, (subFreqMap.get(st) ?? 0) + 1);
    woSeen.set(wo, (woSeen.get(wo) ?? 0) + 1);
  }

  const costs = raw.map((r) => num(r.cost)).filter((x): x is number => x != null && Number.isFinite(x));
  costs.sort((a, b) => a - b);
  const q1 = costs.length ? costs[Math.floor(0.25 * (costs.length - 1))]! : 0;
  const q3 = costs.length ? costs[Math.floor(0.75 * (costs.length - 1))]! : 0;
  const iqr = q3 - q1;
  const hi = q3 + 1.5 * iqr;

  return raw.map((r) => {
    const workOrder = str(r.workOrder) ?? "";
    const trade = str(r.trade);
    const subtrade = str(r.subtrade);
    const receivedDate = str(r.receivedDate);
    const eta = str(r.eta);
    const invoiceDate = str(r.invoiceDate);
    const quoteSentOn = str(r.quoteSentOn);
    const nte = num(r.nte);
    const nteApproved = num(r.nteApproved);
    const cost = num(r.cost);
    let profitRaw = num(r.profitPercent);
    const profitPercent = profitToComparablePoints(profitRaw);

    const daysToEta = dayDiffDays(receivedDate, eta);
    const daysToInvoice = dayDiffDays(receivedDate, invoiceDate);
    const quoteDelayDays = dayDiffDays(receivedDate, quoteSentOn);

    const adminNotes = str(r.adminNotes);
    const tlNotes = str(r.tlNotes);

    const status = str(r.status) ?? "Unknown";
    const state = str(r.state);
    const stateGroup = state && state.length === 2 ? state : state ?? "UNK";

    const costVsNteApproved =
      cost != null && nteApproved != null && nteApproved !== 0 ? cost / nteApproved : null;
    const nteApprovedVsNte =
      nte != null && nteApproved != null && nte !== 0 ? nteApproved - nte : null;

    const dup = (woSeen.get(workOrder) ?? 0) > 1;
    const suspiciousProfit =
      profitPercent != null && (profitPercent > 150 || profitPercent < -150);

    const outlierCost = cost != null && iqr > 0 && cost > hi;

    return {
      id: r.id,
      sheetSource: str(r._sheetSource) ?? "",
      workOrder,
      dispatcher: str(r.dispatcher),
      receivedDate,
      eta,
      store: str(r.store),
      trade,
      subtrade,
      address: str(r.address),
      city: str(r.city),
      state,
      nte,
      nteApproved,
      cost,
      profitPercent,
      description: str(r.description),
      status,
      quoteSentOn,
      adminNotes,
      tlNotes,
      invoiceDate,
      daysToEta,
      daysToInvoice,
      quoteDelayDays,
      hasAdminNotes: !!(adminNotes && adminNotes.length > 0),
      hasTlNotes: !!(tlNotes && tlNotes.length > 0),
      costVsNteApproved,
      nteApprovedVsNte,
      tradeFreq: tradeFreqMap.get(trade ?? "") ?? 0,
      subtradeFreq: subFreqMap.get(subtrade ?? "") ?? 0,
      stateGroup,
      statusGroup: status,
      _suspiciousProfit: suspiciousProfit,
      _duplicateWo: dup,
      _outlierCost: outlierCost,
    };
  });
}

export function computeQualityReport(rows: CleanRow[]): QualityReport {
  const n = rows.length;
  const wos = new Set(rows.map((r) => r.workOrder));
  const woCounts = new Map<string, number>();
  for (const r of rows) woCounts.set(r.workOrder, (woCounts.get(r.workOrder) ?? 0) + 1);
  let dupGroups = 0;
  for (const c of woCounts.values()) if (c > 1) dupGroups++;

  let missingReceived = 0,
    missingCost = 0,
    missingProfit = 0,
    unknownStatus = 0,
    outlierCost = 0;

  for (const r of rows) {
    if (!r.receivedDate) missingReceived++;
    if (r.cost == null) missingCost++;
    if (r.profitPercent == null) missingProfit++;
    if (r.status === "Unknown") unknownStatus++;
    const oc = r._outlierCost;
    if (oc) outlierCost++;
  }

  const penalties =
    (missingReceived / Math.max(1, n)) * 18 +
    (missingCost / Math.max(1, n)) * 12 +
    (missingProfit / Math.max(1, n)) * 8 +
    (unknownStatus / Math.max(1, n)) * 14 +
    (dupGroups / Math.max(1, wos.size)) * 10 +
    (outlierCost / Math.max(1, n)) * 5;

  const cleanScore = Math.max(0, Math.min(100, Math.round(100 - penalties)));

  return {
    totalRows: n,
    uniqueWorkOrders: wos.size,
    duplicateRowGroups: dupGroups,
    missingReceived,
    missingCost,
    missingProfit,
    unknownStatus,
    outlierCostCount: outlierCost,
    cleanScore,
  };
}
