/** Placeholder inserted between the markers when nothing is selected. */
const PLACEHOLDER = "text";

/** Block prefixes that belong at the start of a line. Only one applies to a line at a time. */
const LINE_PREFIX = /^(#{1,6} |> |- \[[ xX]\] |[-*+] |\d+\. )/;

const isLinePrefix = (before: string, after: string): boolean =>
  after === "" && LINE_PREFIX.test(before) && before.match(LINE_PREFIX)?.[0] === before;

/** Puts the new value in place, then re-focuses the textarea with `[selStart, selEnd]` selected. */
function commit(
  textarea: HTMLTextAreaElement,
  onChange: (value: string) => void,
  nextValue: string,
  selStart: number,
  selEnd: number,
): void {
  onChange(nextValue);
  // Wait for React to commit the new value before restoring the selection.
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(selStart, selEnd);
  }, 0);
}

/**
 * Applies a line prefix (heading, quote, list) to every line the selection touches,
 * replacing any other prefix on those lines. Clicking again removes it.
 */
function applyLinePrefix(
  textarea: HTMLTextAreaElement,
  onChange: (value: string) => void,
  prefix: string,
): void {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  // A selection ending right after a newline does not include the next line.
  const endAt = end > start && value[end - 1] === "\n" ? end - 1 : end;
  const nextBreak = value.indexOf("\n", endAt);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;

  const lines = value.slice(lineStart, lineEnd).split("\n");
  const ordered = /^\d+\. $/.test(prefix);
  const has = (line: string): boolean => {
    const current = line.match(LINE_PREFIX)?.[0];
    return ordered ? /^\d+\. $/.test(current ?? "") : current === prefix;
  };
  const removing = lines.every((line) => line.trim() === "" || has(line));

  let n = 0;
  const nextLines = lines.map((line) => {
    const text = line.replace(LINE_PREFIX, "");
    if (removing) return text;
    if (line.trim() === "" && lines.length > 1) return line;
    n += 1;
    return (ordered ? `${n}. ` : prefix) + text;
  });

  const block = nextLines.join("\n");
  const nextValue = value.slice(0, lineStart) + block + value.slice(lineEnd);
  commit(textarea, onChange, nextValue, lineStart, lineStart + block.length);
}

/**
 * Wraps the selection in inline markers (`**`, `*`, `~~`, `` ` ``, links...). If the
 * selection is already wrapped with the same markers, they are removed instead.
 */
function applyWrap(
  textarea: HTMLTextAreaElement,
  onChange: (value: string) => void,
  before: string,
  after: string,
): void {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);

  // `*` must not match the inside of `**`, so look one marker further out.
  const exact = (text: string, at: number, marker: string): boolean =>
    text.startsWith(marker, at) &&
    !(marker === "*" && (text[at - 1] === "*" || text[at + 1] === "*"));

  if (after) {
    // Markers just outside the selection: **[world]**
    const outside =
      start >= before.length &&
      exact(value, start - before.length, before) &&
      exact(value, end, after);
    if (outside) {
      const nextValue =
        value.slice(0, start - before.length) + selected + value.slice(end + after.length);
      commit(textarea, onChange, nextValue, start - before.length, end - before.length);
      return;
    }

    // Markers inside the selection: [**world**]
    const inside =
      selected.length >= before.length + after.length &&
      exact(selected, 0, before) &&
      exact(selected, selected.length - after.length, after);
    if (inside) {
      const inner = selected.slice(before.length, selected.length - after.length);
      const nextValue = value.slice(0, start) + inner + value.slice(end);
      commit(textarea, onChange, nextValue, start, start + inner.length);
      return;
    }
  }

  // Plain insertions (tables, snippets) go in as-is, with no placeholder.
  const text = after ? selected || PLACEHOLDER : selected;
  const nextValue = value.slice(0, start) + before + text + after + value.slice(end);
  commit(textarea, onChange, nextValue, start + before.length, start + before.length + text.length);
}

/**
 * Applies markdown formatting to the textarea's selection and passes the new
 * value to `onChange`.
 * - Line prefixes (`# `, `## `, `> `, `- `, `1. `, `- [ ] `) go at the start of
 *   every selected line, wherever the cursor is, and toggle off when re-applied.
 * - Inline markers (`**`, `*`, `~~`, `` ` ``) wrap the selection and toggle off
 *   when re-applied. With nothing selected, a placeholder is inserted.
 *
 * @example
 * insertMarkdown(textareaRef.current, setDescription, "**", "**"); // bold
 * insertMarkdown(textareaRef.current, setDescription, "- ");       // bullet
 */
export function insertMarkdown(
  textarea: HTMLTextAreaElement | null,
  onChange: (value: string) => void,
  before: string,
  after: string = "",
): void {
  if (!textarea) return;
  if (isLinePrefix(before, after)) {
    applyLinePrefix(textarea, onChange, before);
  } else {
    applyWrap(textarea, onChange, before, after);
  }
}
