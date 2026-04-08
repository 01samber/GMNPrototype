import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CodeBlock({
  code,
  title,
  className,
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-inner dark:border-zinc-700",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
        <span className="font-mono text-xs font-medium text-emerald-400/90">{title ?? "Python"}</span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          onClick={copy}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="max-h-[min(70vh,520px)] overflow-auto p-4 text-left">
        <code className="font-mono text-[13px] leading-relaxed text-zinc-100 [tab-size:4]">{code}</code>
      </pre>
    </div>
  );
}

export { CodeBlock };
export default CodeBlock;
