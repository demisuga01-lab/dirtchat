"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [code]);

  return (
    <div className="my-2 overflow-hidden rounded-md border border-border bg-muted/50">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface InlineCodeProps {
  text: string;
}

function InlineCode({ text }: InlineCodeProps) {
  return (
    <code className="rounded bg-muted/80 px-1 py-0.5 text-sm font-medium text-foreground">
      {text}
    </code>
  );
}

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className }: MessageContentProps) {
  const segments = parseContent(content);

  return (
    <div className={cn("whitespace-pre-wrap break-words", className)}>
      {segments.map((segment, i) => {
        if (segment.type === "code") {
          return (
            <CodeBlock
              key={i}
              language={segment.language ?? ""}
              code={segment.code}
            />
          );
        }
        if (segment.type === "inline_code") {
          return <InlineCode key={i} text={segment.text} />;
        }
        return <span key={i}>{segment.text}</span>;
      })}
    </div>
  );
}

interface TextSegment {
  type: "text";
  text: string;
}

interface CodeSegment {
  type: "code";
  language: string | null;
  code: string;
}

interface InlineCodeSegment {
  type: "inline_code";
  text: string;
}

type Segment = TextSegment | CodeSegment | InlineCodeSegment;

function parseContent(content: string): Segment[] {
  const segments: Segment[] = [];
  let remaining = content;

  while (remaining.length > 0) {
    const fencedMatch = remaining.match(/^```(\w*)\n([\s\S]*?)```/);
    if (fencedMatch) {
      if (fencedMatch.index! > 0) {
        const before = remaining.slice(0, fencedMatch.index);
        segments.push(...parseInlineText(before));
      }
      segments.push({
        type: "code",
        language: fencedMatch[1] || null,
        code: fencedMatch[2].replace(/\n$/, ""),
      });
      remaining = remaining.slice(fencedMatch.index! + fencedMatch[0].length);
      continue;
    }

    const nextFence = remaining.indexOf("```");
    if (nextFence >= 0) {
      const before = remaining.slice(0, nextFence);
      segments.push(...parseInlineText(before));
      const after = remaining.slice(nextFence);
      const endFence = after.indexOf("```", 3);
      if (endFence >= 0) {
        const header = after.slice(3, endFence).trim();
        const code = after.slice(endFence + 3).split("\n")[0] || "";
        segments.push({
          type: "code",
          language: header || null,
          code,
        });
        remaining = "";
      } else {
        remaining = before;
        break;
      }
      continue;
    }

    segments.push(...parseInlineText(remaining));
    remaining = "";
  }

  return segments;
}

function parseInlineText(text: string): Segment[] {
  const segments: Segment[] = [];
  const parts = text.split(/(`[^`]+`)/g);

  for (const part of parts) {
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      segments.push({
        type: "inline_code",
        text: part.slice(1, -1),
      });
    } else {
      segments.push({ type: "text", text: part });
    }
  }

  return segments;
}
