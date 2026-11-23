/** Placeholder inserted between the markers when nothing is selected. */
const PLACEHOLDER = "text";

/**
 * Wraps the textarea's current selection in markdown syntax (e.g. `**` for bold),
 * passes the new value to `onChange`, then re-focuses the textarea with the
 * wrapped text selected. If nothing is selected, a placeholder is inserted.
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

  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selectedText = value.substring(start, end) || PLACEHOLDER;
  const nextValue =
    value.substring(0, start) + before + selectedText + after + value.substring(end);

  onChange(nextValue);

  // Wait for React to commit the new value before restoring the selection.
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
  }, 0);
}
