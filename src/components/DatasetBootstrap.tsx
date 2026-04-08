import { useEffect } from "react";
import { useDatasetStore } from "@/store/datasetStore";

/** Loads bundled `public/gmn-completed-2026.xlsx` once; module flag avoids duplicate fetches in React Strict Mode. */
let bundledWorkbookLoadStarted = false;

export function DatasetBootstrap() {
  const loadSample = useDatasetStore((s) => s.loadSample);

  useEffect(() => {
    if (bundledWorkbookLoadStarted) return;
    const { cleaned } = useDatasetStore.getState();
    if (cleaned.length > 0) {
      bundledWorkbookLoadStarted = true;
      return;
    }
    bundledWorkbookLoadStarted = true;
    void loadSample();
  }, [loadSample]);

  return null;
}
