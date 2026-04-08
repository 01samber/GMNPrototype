import { motion } from "framer-motion";
import { ArrowRight, Code2, Database, LineChart, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  {
    to: "/tutorial",
    title: "Start tutorial",
    desc: "Chapters, progress, and guided learning path.",
    icon: Sparkles,
  },
  {
    to: "/python-course",
    title: "Python course",
    desc: "Copy-paste pandas and scikit-learn for every step and model.",
    icon: Code2,
  },
  {
    to: "/explorer",
    title: "Explore dataset",
    desc: "Sheets, previews, quality flags, and filters.",
    icon: Database,
  },
  {
    to: "/models",
    title: "View models",
    desc: "Train, compare, and interpret regressions.",
    icon: LineChart,
  },
  {
    to: "/kpi",
    title: "KPI dashboard",
    desc: "Executive KPIs and operational bottlenecks.",
    icon: Target,
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-sky-50 via-white to-zinc-50 p-10 shadow-sm dark:border-zinc-800 dark:from-sky-950/40 dark:via-zinc-950 dark:to-zinc-950">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-400">
            Enterprise ML learning lab
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            Learn machine learning from A → Z on real GMN operations data
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            This platform teaches practical ML using the bundled <strong>GMN Completed 2026</strong> workbook (loaded
            automatically — no upload): data quality, cleaning, EDA, feature engineering, multiple regressions,
            evaluation, KPI storytelling, and exportable artifacts — entirely in the browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/tutorial">
                Start tutorial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/explorer">Explore dataset</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {links.map(({ to, title, desc, icon: Icon }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-sky-700 dark:text-sky-400" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </div>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link to={to}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
