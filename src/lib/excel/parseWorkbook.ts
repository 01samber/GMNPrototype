import * as XLSX from "xlsx";
import { headerToKey, parseExcelDate, parseNumberLoose } from "./normalize";
import type { ParseWarning, ParsedRawRow, RawImportResult, RowRecord, SheetSummary } from "./types";

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isQuarterSheetName(name: string): boolean {
  const t = name.trim().toLowerCase();
  return t === "q1" || t === "q2" || t === "q3" || t === "q4";
}

function pickStr(v: unknown): string | null {
  if (v == null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function rowToObject(headers: string[], row: unknown[], sheetSource: string): RowRecord {
  const o: RowRecord = { _sheetSource: sheetSource };
  headers.forEach((h, i) => {
    const key = headerToKey(h);
    if (key) o[key] = row[i];
  });
  return o;
}

function toRawRow(o: RowRecord, sheetSource: string): ParsedRawRow | null {
  const wo = pickStr(o.workOrder);
  if (!wo) return null;
  return {
    id: newId(),
    ...o,
    _sheetSource: sheetSource,
    workOrder: wo,
    dispatcher: pickStr(o.dispatcher),
    receivedDate: parseExcelDate(o.receivedDate),
    eta: parseExcelDate(o.eta),
    store: pickStr(o.store),
    trade: pickStr(o.trade),
    subtrade: pickStr(o.subtrade),
    address: pickStr(o.address),
    city: pickStr(o.city),
    state: pickStr(o.state),
    nte: parseNumberLoose(o.nte),
    nteApproved: parseNumberLoose(o.nteApproved),
    cost: parseNumberLoose(o.cost),
    profitPercent: parseNumberLoose(o.profitPercent),
    description: pickStr(o.description),
    status: pickStr(o.status) ?? "Unknown",
    quoteSentOn: parseExcelDate(o.quoteSentOn),
    adminNotes: pickStr(o.adminNotes),
    tlNotes: pickStr(o.tlNotes),
    invoiceDate: parseExcelDate(o.invoiceDate),
  };
}

export function parseGmnWorkbookArrayBuffer(buf: ArrayBuffer, fileName: string): RawImportResult {
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const warnings: ParseWarning[] = [];
  const sheets: SheetSummary[] = [];
  const rows: ParsedRawRow[] = [];

  for (const sheetName of wb.SheetNames) {
    if (!isQuarterSheetName(sheetName)) {
      warnings.push({
        code: "sheet_skipped",
        message: `Skipped non-quarter sheet "${sheetName}" (only Q1–Q4 are ingested).`,
        sheet: sheetName,
      });
      continue;
    }

    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;

    const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: null,
      raw: true,
    });

    if (!data.length) {
      sheets.push({
        name: sheetName,
        trimmedName: sheetName.trim(),
        rowCount: 0,
        colCount: 0,
        isSparse: true,
        hasWorkOrderColumn: false,
      });
      warnings.push({ code: "empty_sheet", message: `Sheet "${sheetName}" is empty.`, sheet: sheetName });
      continue;
    }

    const headerRow = (data[0] as unknown[]).map((h) => String(h ?? "").replace(/\s+/g, " ").trim());
    const hasWorkOrder = headerRow.some((h) => headerToKey(h) === "workOrder");
    let dataRows = 0;
    for (let r = 1; r < data.length; r++) {
      const line = data[r] as unknown[];
      if (!line || line.every((c) => c == null || String(c).trim() === "")) continue;
      dataRows++;
    }

    const isSparse = dataRows < 3;
    sheets.push({
      name: sheetName,
      trimmedName: sheetName.trim(),
      rowCount: dataRows,
      colCount: headerRow.length,
      isSparse,
      hasWorkOrderColumn: hasWorkOrder,
    });

    if (!hasWorkOrder) {
      warnings.push({
        code: "no_workorder",
        message: `Sheet "${sheetName}" has no recognizable Work Order column — skipped.`,
        sheet: sheetName,
      });
      continue;
    }

    if (isSparse) {
      warnings.push({
        code: "sparse_sheet",
        message: `Sheet "${sheetName}" looks sparse (${dataRows} rows). Rows were still parsed if valid.`,
        sheet: sheetName,
      });
    }

    for (let r = 1; r < data.length; r++) {
      const line = data[r] as unknown[];
      if (!line || line.every((c) => c == null || String(c).trim() === "")) continue;
      const obj = rowToObject(headerRow, line, sheetName.trim());
      const rec = toRawRow(obj, sheetName.trim());
      if (rec) rows.push(rec);
    }
  }

  const quarterSheets = sheets.filter((s) => isQuarterSheetName(s.name) && !s.isSparse && s.rowCount > 0);
  const primarySheet =
    quarterSheets.length === 0
      ? null
      : [...quarterSheets].sort((a, b) => b.rowCount - a.rowCount)[0]!.name;

  return {
    fileName,
    sheets,
    primarySheet,
    rows,
    warnings,
  };
}
