import { CheckCircle2, Circle, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CHAPTERS } from "@/content/chapters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUIStore } from "@/store/uiStore";

export default function TutorialOverviewPage() {
  const chapterDone = useUIStore((s) => s.chapterDone);
  const markChapter = useUIStore((s) => s.markChapter);
  const doneCount = CHAPTERS.filter((c) => chapterDone[c.slug]).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tutorial curriculum
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Twelve chapters progress from raw workbook understanding through modeling, evaluation, KPIs, and
          governance. Mark chapters complete as you finish them — progress is saved locally in your browser.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            Progress {doneCount}/{CHAPTERS.length}
          </Badge>
          <button
            type="button"
            className="text-xs font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-400"
            onClick={() => CHAPTERS.forEach((c) => markChapter(c.slug, true))}
          >
            Mark all complete
          </button>
          <button
            type="button"
            className="text-xs font-medium text-zinc-500 underline-offset-4 hover:underline"
            onClick={() => CHAPTERS.forEach((c) => markChapter(c.slug, false))}
          >
            Reset
          </button>
        </div>
      </div>

      <Card className="border-emerald-900/25 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-800 dark:text-emerald-300">
            <Code2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base">Python code for every step</CardTitle>
            <CardDescription>
              Full pandas / scikit-learn snippets that mirror the tutorial: load quarters, clean, features,
              train/test split, baseline, ridge, k-NN, tree, and random forest — with copy buttons.
            </CardDescription>
            <Link
              className="inline-block pt-2 text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-400"
              to="/python-course"
            >
              Open Python course →
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {CHAPTERS.map((ch) => {
          const done = !!chapterDone[ch.slug];
          return (
            <Card key={ch.slug} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                    )}
                    <CardTitle className="text-base">
                      Chapter {ch.id}: {ch.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-1">{ch.summary}</CardDescription>
                  <p className="mt-2 text-xs text-zinc-500">~{ch.durationMin} min</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400"
                    to={`/tutorial/${ch.slug}`}
                  >
                    Open chapter →
                  </Link>
                  <button
                    type="button"
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                    onClick={() => markChapter(ch.slug, !done)}
                  >
                    {done ? "Mark incomplete" : "Mark complete"}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="border-t border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{ch.summary}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
