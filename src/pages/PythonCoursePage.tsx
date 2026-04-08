import { motion } from "framer-motion";
import { lazy, Suspense, useMemo, useState } from "react";
import { BarChart3, BookOpen, ExternalLink, LayoutGrid, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  PYTHON_LESSONS,
  PYTHON_SECTION_LABELS,
  PYTHON_SECTION_ORDER,
  PYTHON_SETUP,
  type PythonSectionId,
} from "@/content/pythonCourse";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const CodeBlockLazy = lazy(() => import("@/components/CodeBlock"));

function CodeBlockSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 dark:border-zinc-700">
      <div className="flex h-10 items-center border-b border-zinc-800 bg-zinc-900/80 px-3">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="space-y-2 p-4">
        <div className="h-3 w-full animate-pulse rounded bg-zinc-800/80" />
        <div className="h-3 w-[92%] animate-pulse rounded bg-zinc-800/60" />
        <div className="h-3 w-[88%] animate-pulse rounded bg-zinc-800/60" />
        <div className="h-3 w-[70%] animate-pulse rounded bg-zinc-800/40" />
      </div>
    </div>
  );
}

const sectionIcon: Record<PythonSectionId, typeof LayoutGrid> = {
  data: LayoutGrid,
  viz: BarChart3,
  ml: Sparkles,
};

export default function PythonCoursePage() {
  const [section, setSection] = useState<PythonSectionId>("data");
  const lessonsInSection = useMemo(
    () => PYTHON_LESSONS.filter((l) => l.section === section),
    [section]
  );
  const [lessonId, setLessonId] = useState(PYTHON_LESSONS[0]!.id);

  const activeLesson = useMemo(() => {
    const inSection = lessonsInSection.find((l) => l.id === lessonId);
    return inSection ?? lessonsInSection[0] ?? PYTHON_LESSONS[0]!;
  }, [lessonId, lessonsInSection]);

  const selectSection = (s: PythonSectionId) => {
    setSection(s);
    const first = PYTHON_LESSONS.find((l) => l.section === s);
    if (first) setLessonId(first.id);
  };

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/25 bg-linear-to-br from-emerald-950/30 via-zinc-950/40 to-sky-950/20 p-8 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-sky-950/30">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
        <Badge variant="secondary" className="mb-3 border-emerald-800/40 bg-emerald-950/50 text-emerald-200">
          Tutorial · Python track
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">
          Python course — data, charts, KPIs &amp; models
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Notebooks here mirror the live app:{" "}
          <strong className="text-zinc-800 dark:text-zinc-200">pandas/sklearn</strong> for the same pipeline the
          browser runs in TypeScript, while{" "}
          <strong className="text-zinc-800 dark:text-zinc-200">matplotlib &amp; seaborn</strong> stand in for the{" "}
          <strong className="text-zinc-800 dark:text-zinc-200">Recharts</strong> graphs on{" "}
          <Link className="font-medium text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-400" to="/eda">
            EDA
          </Link>
          ,{" "}
          <Link className="font-medium text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-400" to="/kpi">
            KPI
          </Link>
          , and{" "}
          <Link className="font-medium text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-400" to="/models">
            Models
          </Link>
          . Code blocks load on demand for faster first paint.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link
            className="inline-flex items-center gap-1.5 font-medium text-sky-800 hover:underline dark:text-sky-400"
            to="/tutorial"
          >
            <BookOpen className="h-4 w-4" />
            Tutorial chapters
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 font-medium text-sky-800 hover:underline dark:text-sky-400"
            to="/models"
          >
            <ExternalLink className="h-4 w-4" />
            Browser ML workbench
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {PYTHON_SECTION_ORDER.map((id) => {
          const meta = PYTHON_SECTION_LABELS[id];
          const Icon = sectionIcon[id];
          const active = section === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectSection(id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                active
                  ? "border-emerald-600/60 bg-emerald-950/35 shadow-md ring-1 ring-emerald-500/30 dark:bg-emerald-950/50"
                  : "border-zinc-200 bg-white/80 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    active ? "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300" : "bg-zinc-200/80 dark:bg-zinc-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{meta.title}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{meta.description}</p>
            </button>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="border-emerald-900/30 bg-emerald-950/15 dark:bg-emerald-950/25">
          <CardHeader>
            <CardTitle className="text-base text-emerald-950 dark:text-emerald-100">Environment setup</CardTitle>
            <CardDescription className="text-emerald-900/80 dark:text-emerald-200/80">
              Includes matplotlib &amp; seaborn for the visualization lessons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<CodeBlockSkeleton />}>
              <CodeBlockLazy title="Terminal · pip" code={PYTHON_SETUP} />
            </Suspense>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <CardTitle className="text-base">Lessons in this track</CardTitle>
          <CardDescription>
            Pick a lesson; only the active code panel is loaded (lazy) to keep the page light.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={lessonId} onValueChange={setLessonId} className="w-full">
            <div className="overflow-x-auto pb-3">
              <TabsList className="inline-flex h-auto min-w-min flex-wrap justify-start gap-1 bg-zinc-100 p-1 dark:bg-zinc-900">
                {lessonsInSection.map((l) => (
                  <TabsTrigger
                    key={l.id}
                    value={l.id}
                    className="max-w-[220px] whitespace-normal px-3 py-2 text-left text-xs leading-snug data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-950 sm:text-sm"
                  >
                    {l.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={lessonId} className="mt-2 space-y-4 outline-none">
              <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex flex-wrap items-start gap-2">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{activeLesson.title}</h2>
                  {activeLesson.mapsTo ? (
                    <Badge variant="outline" className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                      App: {activeLesson.mapsTo}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{activeLesson.summary}</p>
              </div>
              <Suspense key={lessonId} fallback={<CodeBlockSkeleton />}>
                <CodeBlockLazy code={activeLesson.code} title={`${activeLesson.title} · python`} />
              </Suspense>
              <p className="text-xs text-zinc-500">
                Run lessons 1–3 before visualization cells so <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">df</code>{" "}
                exists. Modeling lessons assume lesson 8 (split) is executed before baselines and estimators.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How the web app implements the same ideas</CardTitle>
          <CardDescription>
            React + TypeScript for UI; Recharts for interactive SVG charts. Python reproduces analysis for notebooks
            and backend-style scripts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>EDA charts</strong> — histogram bins and scatter sampling in{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">EDAPage.tsx</code> (Recharts{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">BarChart</code>,{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">ScatterChart</code>).
            </li>
            <li>
              <strong>Correlation</strong> — Pearson matrix from{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">correlation.ts</code>, colored table in EDA.
            </li>
            <li>
              <strong>KPIs</strong> — rollups in{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">computeExecutiveKpis</code> (
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">lib/kpi/executive.ts</code>), cards on{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">/kpi</code>.
            </li>
            <li>
              <strong>Models</strong> — training in <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">pipeline.ts</code>;
              predicted vs actual scatter on the Models page matches lesson 15 conceptually.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
