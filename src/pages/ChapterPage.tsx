import { useParams, Link } from "react-router-dom";
import { chapterBySlug } from "@/content/chapters";
import { MarkdownLite } from "@/components/MarkdownLite";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHAPTERS } from "@/content/chapters";

export default function ChapterPage() {
  const { slug } = useParams();
  const ch = slug ? chapterBySlug(slug) : undefined;
  if (!ch) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600">Chapter not found.</p>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/tutorial">Back to tutorial</Link>
        </Button>
      </div>
    );
  }

  const idx = CHAPTERS.findIndex((c) => c.slug === ch.slug);
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1]! : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="secondary">Chapter {ch.id}</Badge>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {ch.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{ch.summary}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/tutorial">All chapters</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lesson</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownLite text={ch.body} />
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-semibold">Senior engineer note</p>
            <p className="mt-1 opacity-95">
              Tie every chart back to operational reality: what would change tomorrow if this number moved?
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
            <p className="font-semibold">Try this</p>
            <p className="mt-1 opacity-95">
              Open the Dataset explorer and validate one column mentioned in this chapter against the same
              fields in the bundled workbook (or cross-check in Excel if you keep a local copy).
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-4">
        {prev ? (
          <Button asChild variant="secondary">
            <Link to={`/tutorial/${prev.slug}`}>← {prev.title}</Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild>
            <Link to={`/tutorial/${next.slug}`}>{next.title} →</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
