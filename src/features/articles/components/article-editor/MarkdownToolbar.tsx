import { useState, type JSX } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";
import {
  BsTypeBold,
  BsTypeItalic,
  BsTypeStrikethrough,
  BsLink45Deg,
  BsQuote,
  BsCodeSlash,
  BsListUl,
  BsListOl,
  BsCheck2Square,
  BsTable,
  BsImage,
  BsCodeSquare,
  BsThreeDots,
} from "react-icons/bs";

interface MarkdownToolbarProps {
  /** Wraps the current selection with `before`/`after` markdown syntax. */
  insertMarkdown: (before: string, after?: string) => void;
}

export function MarkdownToolbar({ insertMarkdown }: MarkdownToolbarProps): JSX.Element {
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);

  return (
    <div className="border-b border-border bg-slate-50/70 p-2 flex items-center gap-1 sm:gap-1.5 flex-wrap text-text/70">
      {/* Heading dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setHeadingMenuOpen((prev) => !prev)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold hover:bg-slate-200 text-text/80 transition-colors"
        >
          <span>H</span>
          <HiOutlineChevronDown className="w-3 h-3" />
        </button>
        {headingMenuOpen && (
          <div className="absolute top-full left-0 z-20 mt-1 bg-white border border-border rounded-lg shadow-lg py-1 w-28 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                insertMarkdown("# ");
                setHeadingMenuOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100"
            >
              H1 Heading
            </button>
            <button
              type="button"
              onClick={() => {
                insertMarkdown("## ");
                setHeadingMenuOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100"
            >
              H2 Heading
            </button>
            <button
              type="button"
              onClick={() => {
                insertMarkdown("### ");
                setHeadingMenuOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100"
            >
              H3 Heading
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-border mx-0.5" />

      <button
        type="button"
        title="Bold"
        onClick={() => insertMarkdown("**", "**")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsTypeBold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Italic"
        onClick={() => insertMarkdown("*", "*")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsTypeItalic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Strikethrough"
        onClick={() => insertMarkdown("~~", "~~")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsTypeStrikethrough className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Link"
        onClick={() => insertMarkdown("[", "](https://)")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsLink45Deg className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Blockquote"
        onClick={() => insertMarkdown("> ")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsQuote className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Inline Code"
        onClick={() => insertMarkdown("`", "`")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsCodeSlash className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      <button
        type="button"
        title="Unordered List"
        onClick={() => insertMarkdown("- ")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsListUl className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Ordered List"
        onClick={() => insertMarkdown("1. ")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsListOl className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Task List"
        onClick={() => insertMarkdown("- [ ] ")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsCheck2Square className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      <button
        type="button"
        title="Table"
        onClick={() =>
          insertMarkdown(
            "\n| Feature | Support |\n| ------- | ------- |\n| Code    | ✓       |\n\n",
          )
        }
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsTable className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Image"
        onClick={() => insertMarkdown("![Alt Text](", ")")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsImage className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Code Block"
        onClick={() => insertMarkdown("```js\n", "\n```")}
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors"
      >
        <BsCodeSquare className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="More options"
        className="p-1.5 rounded hover:bg-slate-200 text-text/80 transition-colors ml-auto"
      >
        <BsThreeDots className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
