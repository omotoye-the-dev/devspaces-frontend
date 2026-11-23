import { useState, type JSX } from "react";
import type { UseFormRegister } from "react-hook-form";
import { toast } from "@/shared/hooks/useToast";
import type { ArticleFormData } from "@/features/articles/schemas/articleSchema";
import { HiOutlineChevronDown, HiOutlineInformationCircle } from "react-icons/hi2";

interface PublicationSidebarProps {
  register: UseFormRegister<ArticleFormData>;
  visibilityValue: ArticleFormData["visibility"];
  onVisibilityChange: (visibility: ArticleFormData["visibility"]) => void;
  excerptValue: string;
}

export function PublicationSidebar({
  register,
  visibilityValue,
  onVisibilityChange,
  excerptValue,
}: PublicationSidebarProps): JSX.Element {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="lg:col-span-3 space-y-4">
      <div className="bg-white border border-border rounded-xl p-4 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-text uppercase tracking-wider border-b border-border/60 pb-2.5">
          Publication
        </h3>

        {/* Status Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text">Status</label>
          <div className="relative">
            <select
              {...register("status")}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-slate-50 text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8"
            >
              <option value="draft">• Draft</option>
              <option value="published">• Published</option>
              {/* <option value="scheduled">• Scheduled</option> */}
              {/* <option value="archived">• Archived</option> */}
            </select>
            <HiOutlineChevronDown className="w-3.5 h-3.5 text-text/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Scheduled For — shown only when status is "scheduled" */}
        {/* {statusValue === "scheduled" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text">Scheduled for</label>
                  <input
                    type="datetime-local"
                    {...register("scheduledFor")}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-slate-50 text-text font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {errors.scheduledFor && (
                    <p className="text-xs text-red-500 font-medium">{errors.scheduledFor.message}</p>
                  )}
                </div>
              )} */}

        {/* Publish To Radio Options */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-medium text-text">Publish to</label>

          <div className="space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-border">
              <input
                type="radio"
                value="public"
                checked={visibilityValue === "public"}
                onChange={() => onVisibilityChange("public")}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-text block">Public</span>
                <span className="text-[11px] text-text/50 block">Anyone can discover and read</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-border">
              <input
                type="radio"
                value="unlisted"
                checked={visibilityValue === "unlisted"}
                onChange={() => onVisibilityChange("unlisted")}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-text block">Unlisted</span>
                <span className="text-[11px] text-text/50 block">
                  Anyone with the link can read
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Series Selector */}
        <div className="space-y-1.5 pt-1">
          <label className="flex items-center gap-1 text-xs font-medium text-text">
            Series
            <HiOutlineInformationCircle
              className="w-3.5 h-3.5 text-text/40 cursor-pointer"
              title="Organize related articles into a collection"
            />
          </label>
          <div className="relative">
            <select
              {...register("series")}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-slate-50 text-text font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8"
            >
              <option value="">Select a series (optional)</option>
              <option value="react-guides">Getting Started with React</option>
              <option value="ts-patterns">Advanced TypeScript Patterns</option>
              <option value="fullstack-devspace">Fullstack DevSpace Guide</option>
            </select>
            <HiOutlineChevronDown className="w-3.5 h-3.5 text-text/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Excerpt Textarea */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 text-xs font-medium text-text">
              Excerpt
              <HiOutlineInformationCircle
                className="w-3.5 h-3.5 text-text/40 cursor-pointer"
                title="Summary shown on article feeds & search cards"
              />
            </label>
          </div>
          <textarea
            rows={3}
            maxLength={160}
            placeholder="Write a short summary of your article..."
            {...register("excerpt")}
            className="w-full text-xs p-2.5 rounded-lg border border-border bg-slate-50 placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
          <div className="text-right text-[10px] font-mono text-text/40">
            {excerptValue.length}/160
          </div>
        </div>

        {/* Cover Image Alt Text */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-xs font-medium text-text">
            Cover image alt text
            <HiOutlineInformationCircle
              className="w-3.5 h-3.5 text-text/40 cursor-pointer"
              title="Accessible text for screen readers"
            />
          </label>
          <input
            type="text"
            placeholder="Describe your cover image..."
            {...register("coverImageAlt")}
            className="w-full text-xs p-2.5 rounded-lg border border-border bg-slate-50 placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-[10px] text-text/50">Helps with accessibility and SEO.</p>
        </div>

        {/* Advanced Collapsible */}
        <div className="pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs font-semibold text-text/70 hover:text-text transition-colors py-1"
          >
            <span className="flex items-center gap-1">
              Advanced
              <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text/40" />
            </span>
            <HiOutlineChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {showAdvanced && (
            <div className="pt-3 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-text">Custom Slug</label>
                <input
                  type="text"
                  {...register("slug")}
                  className="w-full text-xs p-2 rounded-lg border border-border bg-slate-50 text-text font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-save Info Card */}
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Auto-save is on</span>
        </div>
        <p className="text-[11px] text-emerald-950/70 leading-relaxed">
          Your changes are saved automatically as you type.
        </p>
        <button
          type="button"
          onClick={() => toast.info("Autosave is enabled automatically.")}
          className="text-[11px] font-semibold text-emerald-700 hover:underline pt-0.5 inline-block"
        >
          Manage autosave settings
        </button>
      </div>
    </div>
  );
}
