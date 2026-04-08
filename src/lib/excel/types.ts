/** Normalized keys after header mapping (trimmed Excel headers). */
export type RowRecord = Record<string, unknown> & { _sheetSource: string };

export interface SheetSummary {
  name: string;
  trimmedName: string;
  rowCount: number;
  colCount: number;
  /** Heuristic: few rows or mostly blank first column */
  isSparse: boolean;
  hasWorkOrderColumn: boolean;
}

export interface ParseWarning {
  code: string;
  message: string;
  sheet?: string;
}

export type ParsedRawRow = RowRecord & { id: string };

export interface RawImportResult {
  fileName: string;
  sheets: SheetSummary[];
  /** Primary sheet = most populated quarter sheet */
  primarySheet: string | null;
  rows: ParsedRawRow[];
  warnings: ParseWarning[];
}

export interface CleanRow {
  id: string;
  sheetSource: string;
  workOrder: string;
  dispatcher: string | null;
  receivedDate: string | null;
  eta: string | null;
  store: string | null;
  trade: string | null;
  subtrade: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  nte: number | null;
  nteApproved: number | null;
  cost: number | null;
  profitPercent: number | null;
  description: string | null;
  status: string;
  quoteSentOn: string | null;
  adminNotes: string | null;
  tlNotes: string | null;
  invoiceDate: string | null;
  /** Derived */
  daysToEta: number | null;
  daysToInvoice: number | null;
  quoteDelayDays: number | null;
  hasAdminNotes: boolean;
  hasTlNotes: boolean;
  costVsNteApproved: number | null;
  nteApprovedVsNte: number | null;
  tradeFreq: number;
  subtradeFreq: number;
  stateGroup: string;
  statusGroup: string;
  /** Flags */
  _suspiciousProfit: boolean;
  _duplicateWo: boolean;
  _outlierCost: boolean;
}

export interface QualityReport {
  totalRows: number;
  uniqueWorkOrders: number;
  duplicateRowGroups: number;
  missingReceived: number;
  missingCost: number;
  missingProfit: number;
  unknownStatus: number;
  outlierCostCount: number;
  cleanScore: number;
}
