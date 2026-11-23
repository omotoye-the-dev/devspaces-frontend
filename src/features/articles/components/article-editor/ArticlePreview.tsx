import type { JSX } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticlePreviewProps {
  titleValue: string;
  tagNamesValue: string[];
  contentValue: string;
  computedReadingTime: number;
  wordCount: number;
}

export function ArticlePreview({
  titleValue,
  tagNamesValue,
  contentValue,
  computedReadingTime,
  wordCount,
}: ArticlePreviewProps): JSX.Element {
  return (
    <div className="lg:col-span-4 bg-white border border-border rounded-xl shadow-2xs overflow-hidden flex flex-col min-h-175">
      <div className="px-4 py-3 border-b border-border bg-slate-50/50 flex items-center justify-between">
        <span className="text-xs font-bold text-text/70 uppercase tracking-wider">Preview</span>
      </div>

      <div className="p-5 flex-1 space-y-4 font-inter leading-relaxed text-sm overflow-y-auto">
        {/* Formatted Title */}
        <h1 className="text-2xl font-bold text-text tracking-tight">
          {titleValue.trim() ? titleValue : "Your title will appear here"}
        </h1>

        {/* Formatted Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tagNamesValue.length > 0 ? (
            tagNamesValue.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-600"
              >
                #{t}
              </span>
            ))
          ) : (
            <>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-400">
                #tag1
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-400">
                #tag2
              </span>
            </>
          )}
        </div>

        {/* Formatted Content Body */}
        <div
          className="prose prose-slate  w-full
                max-w-none overflow-y-auto max-h-175
                wrap-break-word text-xs sm:text-sm text-text/80 space-y-3"
        >
          {contentValue.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-indigo-500 bg-indigo-50/40 px-3 py-2 italic text-indigo-950 my-2 overflow rounded-r">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isBlock = Boolean(className);
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match ? match[1] : "js";
                  if (isBlock) {
                    return (
                      <div className="relative rounded-lg bg-slate-900 text-slate-100 p-3 font-mono text-xs my-3 overflow-x-auto not-italic">
                        <span className="absolute top-2 right-2 text-[10px] uppercase font-bold text-slate-400 select-none font-inter not-italic">
                          {lang}
                        </span>
                        <code className="not-italic">{children}</code>
                      </div>
                    );
                  }
                  return (
                    <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs not-italic">
                      {children}
                    </code>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 border border-border rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-slate-50 p-2 border-b border-border font-bold text-text">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="p-2 border-b border-border/60 text-text/80">{children}</td>
                ),
              }}
            >
              {contentValue}
            </ReactMarkdown>
          ) : (
            <div className="space-y-3 pt-2 text-text/50">
              <p>Your content preview will appear here as you write.</p>

              <blockquote className="border-l-3 border-indigo-500 bg-indigo-50/40 px-3 py-2 italic text-indigo-950 rounded-r">
                &gt; Blockquotes look like this.
              </blockquote>

              <h2 className="text-base font-bold text-text pt-1">## Heading 2</h2>
              <h3 className="text-sm font-bold text-text">### Heading 3</h3>

              <p>Lists look great in your articles:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Item one</li>
                <li>Item two</li>
                <ul className="list-circle pl-4 space-y-1 text-xs">
                  <li>Nested item</li>
                </ul>
                <li>Item three</li>
              </ul>

              <p>Here's how code looks:</p>
              <div className="relative rounded-lg bg-slate-900 text-slate-100 p-3 font-mono text-xs my-2 not-italic">
                <span className="absolute top-2 right-2 text-[10px] uppercase font-bold text-slate-400 select-none font-inter not-italic">
                  js
                </span>
                <pre className="m-0 not-italic">
                  {`function hello(name) {\n  console.log('Hello, ' + name + '!');\n}`}
                </pre>
              </div>

              <p className="pt-1">Tables are supported too:</p>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-2 font-bold">Feature</th>
                      <th className="p-2 font-bold">Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="p-2">Code Blocks</td>
                      <td className="p-2 text-teal">✓</td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="p-2">Tables</td>
                      <td className="p-2 text-teal">✓</td>
                    </tr>
                    <tr>
                      <td className="p-2">Mermaid Diagrams</td>
                      <td className="p-2 text-teal">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Footer */}
      <div className="border-t border-border px-4 py-2.5 bg-slate-50/50 flex items-center justify-between text-xs text-text/50 font-mono">
        <span>Reading time: {computedReadingTime} min</span>
        <span>Words: {wordCount}</span>
      </div>
    </div>
  );
}
