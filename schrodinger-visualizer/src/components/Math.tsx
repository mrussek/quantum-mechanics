"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

/** Inline math: renders LaTeX inline with surrounding text. */
export function M({ children }: { children: string }) {
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Display math: renders a centered LaTeX block equation. */
export function Eq({
  children,
  label,
}: {
  children: string;
  label?: string;
}) {
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: true,
  });
  return (
    <div className="my-4 flex items-center gap-4 overflow-x-auto">
      <div className="flex-1 text-center" dangerouslySetInnerHTML={{ __html: html }} />
      {label && (
        <span className="text-xs text-gray-500 shrink-0">({label})</span>
      )}
    </div>
  );
}
