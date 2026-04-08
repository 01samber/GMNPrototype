import type { CleanRow } from "@/lib/excel/types";
import type { PipelineResult } from "@/lib/ml/pipeline";

export function downloadTextFile(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function rowsToCsv(rows: CleanRow[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]!).filter((k) => !k.startsWith("_"));
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = keys.join(",");
  const lines = rows.map((r) => keys.map((k) => esc((r as never)[k])).join(","));
  return [header, ...lines].join("\n");
}

export function downloadCleanedCsv(rows: CleanRow[]) {
  downloadTextFile(`gmn-cleaned-${new Date().toISOString().slice(0, 10)}.csv`, rowsToCsv(rows), "text/csv;charset=utf-8");
}

export function downloadPipelineJson(result: PipelineResult) {
  const payload = {
    generatedAt: new Date().toISOString(),
    models: result.models.map((m) => ({
      name: m.name,
      test: m.test,
      train: m.train,
    })),
  };
  downloadTextFile("model-results.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}

export async function downloadElementAsPng(el: HTMLElement | null, filename: string) {
  if (!el) return;
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}
