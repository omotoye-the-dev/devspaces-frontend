import type { JSX } from "react";
import { FiUpload } from "react-icons/fi";

import type { UseResourceEditorResult } from "@/features/resources/hooks/useResourceEditor";

/** Logo upload card and engagement stats. */
export function ResourceEditorSidebar({
  editor,
}: {
  editor: UseResourceEditorResult;
}): JSX.Element {
  const { resource, title, logoPreview, handleLogoChange } = editor;

  return (
    <>
      <div className="space-y-6">
        {/* Logo / Cover Image Card */}
        <div className="bg-white border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
          <h3 className="text-sm font-bold text-text">Resource Logo / Icon</h3>
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl bg-slate-50/50 gap-3">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt={title}
                className="w-20 h-20 rounded-xl object-cover border border-border shadow-xs"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-xs">
                {title.slice(0, 2).toUpperCase() || "DS"}
              </div>
            )}

            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <FiUpload className="w-3.5 h-3.5" />
              <span>Upload New Logo</span>
            </label>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white border border-border rounded-2xl p-5 space-y-3 shadow-2xs">
          <h3 className="text-sm font-bold text-text">Stats & Engagement</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
              <p className="text-xs text-text/50 font-medium">Upvotes</p>
              <p className="text-lg font-bold text-text mt-0.5">{resource?.upvoteCount ?? 0}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
              <p className="text-xs text-text/50 font-medium">Downvotes</p>
              <p className="text-lg font-bold text-text mt-0.5">{resource?.downvoteCount ?? 0}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
              <p className="text-xs text-text/50 font-medium">Downloads</p>
              <p className="text-lg font-bold text-text mt-0.5">{resource?.downloadCount ?? 0}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-border/60">
              <p className="text-xs text-text/50 font-medium">Bookmarks</p>
              <p className="text-lg font-bold text-text mt-0.5">{resource?.saveCount ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
