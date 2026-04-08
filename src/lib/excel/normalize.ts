/**
 * Map messy Excel header strings → stable camelCase keys.
 * Trims whitespace and tolerates inconsistent punctuation (e.g. "Profit %", "Profit  %").
 */

export function headerToKey(header: string): string | null {
  const h = header.replace(/\s+/g, " ").trim();
  if (!h) return null;
  const lower = h.toLowerCase();

  const pairs: [RegExp, string][] = [
    [/^work\s*order$/i, "workOrder"],
    [/^dispatcher$/i, "dispatcher"],
    [/^received\s*date$/i, "receivedDate"],
    [/^eta$/i, "eta"],
    [/^store$/i, "store"],
    [/^trade$/i, "trade"],
    [/^subtrade$/i, "subtrade"],
    [/^address$/i, "address"],
    [/^city$/i, "city"],
    [/^state$/i, "state"],
    [/^nte$/i, "nte"],
    [/^nte\s*approved$/i, "nteApproved"],
    [/^cost$/i, "cost"],
    [/^profit\s*%$/i, "profitPercent"],
    [/^description$/i, "description"],
    [/^status$/i, "status"],
    [/^quote\s*sent\s*on\s*\??$/i, "quoteSentOn"],
    [/^admin\s*notes$/i, "adminNotes"],
    [/^tl\s*notes$/i, "tlNotes"],
    [/^invoice\s*date$/i, "invoiceDate"],
  ];

  for (const [re, key] of pairs) {
    if (re.test(lower)) return key;
  }
  return null;
}

/** Parse Excel serial date or ISO-ish string to yyyy-mm-dd or null */
export function parseExcelDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    const utc = Math.round((value - 25569) * 86400 * 1000);
    const d = new Date(utc);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  if (!s) return null;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

/** Parse currency / percent / number cells safely */
export function parseNumberLoose(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  let s = String(value).trim();
  if (!s) return null;
  const neg = s.startsWith("(") && s.endsWith(")");
  s = s.replace(/[,$\s]/g, "");
  if (s.endsWith("%")) {
    s = s.slice(0, -1);
    const n = Number.parseFloat(s);
    if (!Number.isFinite(n)) return null;
    const v = n / 100;
    return neg ? -v : v;
  }
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n)) return null;
  return neg ? -n : n;
}

/** Profit column often stored as percent points (e.g. 12.3) or fraction — normalize to comparable points */
export function profitToComparablePoints(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (Math.abs(value) <= 1) return value * 100;
  return value;
}
