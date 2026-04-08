/** Minimal markdown-like rendering (headings, lists, paragraphs) — no external markdown deps. */
export function MarkdownLite({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\n+/);
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-1">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines[0]?.startsWith("## ")) {
          return (
            <h2 key={i} className="mt-8 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {lines[0].slice(3)}
            </h2>
          );
        }
        if (lines.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
          return (
            <ul key={i} className="my-3 list-disc space-y-2 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^[-*]\s+/, "")}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {block}
          </p>
        );
      })}
    </div>
  );
}
