import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildCleanRows, computeQualityReport } from "@/lib/excel/clean";
import { parseGmnWorkbookArrayBuffer } from "@/lib/excel/parseWorkbook";
import type { CleanRow, QualityReport, RawImportResult } from "@/lib/excel/types";
import { runTrainingPipeline, type PipelineResult } from "@/lib/ml/pipeline";
import type { TargetKey } from "@/lib/ml/features";

interface DatasetState {
  fileName: string | null;
  raw: RawImportResult | null;
  cleaned: CleanRow[];
  quality: QualityReport | null;
  mlTarget: TargetKey;
  testRatio: number;
  seed: number;
  pipeline: PipelineResult | null;
  loadStatus: "idle" | "loading" | "error";
  loadError: string | null;
  loadArrayBuffer: (buf: ArrayBuffer, name: string) => void;
  loadSample: () => Promise<void>;
  setMlTarget: (t: TargetKey) => void;
  setTestRatio: (r: number) => void;
  setSeed: (s: number) => void;
  runMl: () => void;
  clear: () => void;
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set, get) => ({
      fileName: null,
      raw: null,
      cleaned: [],
      quality: null,
      mlTarget: "cost",
      testRatio: 0.22,
      seed: 42,
      pipeline: null,
      loadStatus: "idle",
      loadError: null,

      loadArrayBuffer: (buf, name) => {
        set({ loadStatus: "loading", loadError: null });
        try {
          const raw = parseGmnWorkbookArrayBuffer(buf, name);
          const cleaned = buildCleanRows(raw.rows);
          const quality = computeQualityReport(cleaned);
          set({
            fileName: name,
            raw,
            cleaned,
            quality,
            pipeline: null,
            loadStatus: "idle",
            loadError: null,
          });
          get().runMl();
        } catch (e) {
          set({
            loadStatus: "error",
            loadError: e instanceof Error ? e.message : "Failed to parse workbook",
          });
        }
      },

      loadSample: async () => {
        set({ loadStatus: "loading", loadError: null });
        try {
          const res = await fetch("./gmn-completed-2026.xlsx", { cache: "no-store" });
          if (!res.ok) throw new Error("Sample file not found in /public");
          const buf = await res.arrayBuffer();
          get().loadArrayBuffer(buf, "gmn-completed-2026.xlsx");
        } catch (e) {
          set({
            loadStatus: "error",
            loadError: e instanceof Error ? e.message : "Could not load sample",
          });
        }
      },

      setMlTarget: (mlTarget) => set({ mlTarget, pipeline: null }),
      setTestRatio: (testRatio) => set({ testRatio, pipeline: null }),
      setSeed: (seed) => set({ seed, pipeline: null }),

      runMl: () => {
        const { cleaned, mlTarget, testRatio, seed } = get();
        if (cleaned.length < 80) {
          set({ pipeline: null });
          return;
        }
        try {
          const pipeline = runTrainingPipeline(cleaned, {
            target: mlTarget,
            testRatio,
            seed,
            knnK: 9,
            ridgeLambda: 1.2,
          });
          set({ pipeline });
        } catch {
          set({ pipeline: null });
        }
      },

      clear: () =>
        set({
          fileName: null,
          raw: null,
          cleaned: [],
          quality: null,
          pipeline: null,
          loadStatus: "idle",
          loadError: null,
        }),
    }),
    {
      name: "gmn-ml-tutorial-data",
      partialize: (s) => ({
        fileName: s.fileName,
        mlTarget: s.mlTarget,
        testRatio: s.testRatio,
        seed: s.seed,
      }),
    }
  )
);
