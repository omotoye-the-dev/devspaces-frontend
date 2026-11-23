import { useState, type JSX } from "react";
import { Textarea, Tag } from "@/shared/ui";

export function TextareaSection(): JSX.Element {
  const [textareaVal, setTextareaVal] = useState(
    "DevSpace is built for engineers to share deep technical insights.",
  );
  return (
    <>
      {/* ========================================================================= */}
      {/* 3. TEXTAREA COMPONENT                                                    */}
      {/* ========================================================================= */}
      <section
        id="textarea"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">3. Textarea</h2>
            <p className="text-xs text-text/60">
              Multi-line text input with character counting, validation feedback, and resizing.
            </p>
          </div>
          <Tag variant="primary">Textarea.tsx</Tag>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textarea
            label="With Character Counter (showCount)"
            placeholder="Write your article summary..."
            helperText="Markdown supported"
            showCount
            maxLength={150}
            value={textareaVal}
            onChange={(e) => setTextareaVal(e.target.value)}
            rows={4}
          />

          <Textarea
            label="With Error State"
            placeholder="Provide context..."
            errorMessage="Reason is mandatory and cannot be empty."
            rows={4}
          />
        </div>
      </section>
    </>
  );
}
