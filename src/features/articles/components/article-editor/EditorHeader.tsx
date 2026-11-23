import type { JSX } from "react";
import { Button } from "@/shared/ui";
import { HiOutlineArrowLeft } from "react-icons/hi2";

interface EditorHeaderProps {
  isEditing: boolean;
  statusValue: string;
  isSaving: boolean;
  isPublishing: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function EditorHeader({
  isEditing,
  statusValue,
  isSaving,
  isPublishing,
  onSaveDraft,
  onPublish,
}: EditorHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3.5 sm:px-6 sm:py-3.5 rounded-xl border border-border shadow-2xs">
      <div className="flex items-center gap-3">
        <Button
          href="/"
          variant="ghost"
          size="sm"
          leftIcon={<HiOutlineArrowLeft className="w-4 h-4 text-text/70" />}
          className="font-medium hover:bg-slate-100"
        >
          <span className="font-bold text-sm text-text">
            {isEditing ? "Edit Article" : "Create Article"}
          </span>
        </Button>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* <div
              className={`hidden md:flex items-center gap-1.5 text-xs font-medium mr-2 px-2.5 py-1 rounded-full border ${
                statusValue === "published"
                  ? "text-blue-600 bg-blue-50 border-blue-100"
                  : "text-emerald-600 bg-emerald-50 border-emerald-100"
              }`}
            >
               <span
                className={`w-4 h-4 rounded-full text-white flex items-center justify-center text-[10px] ${
                  statusValue === "published" ? "bg-blue-500" : "bg-emerald-500"
                }`}
              >
                <HiOutlineCheck className="w-3 h-3 stroke-3" />
              </span> 
            </div> */}

        {/* <Button
              type="button"
              variant="secondary"
              size="sm"
              className="bg-white border-border hover:bg-slate-50 text-text/80 font-medium"
            >
              Preview
            </Button> */}

        {statusValue !== "draft" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isSaving}
            onClick={onSaveDraft}
            className="border-primary/40 text-primary hover:bg-primary/5 font-medium"
          >
            Save Draft
          </Button>
        )}

        <div className="relative inline-flex">
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={statusValue === "draft" ? isSaving : isPublishing}
            onClick={statusValue === "draft" ? onSaveDraft : onPublish}
            // rightIcon={<HiOutlineChevronDown className="w-3.5 h-3.5 ml-0.5" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            {statusValue === "draft" ? "Save Draft" : "Publish"}
          </Button>
        </div>
      </div>
    </header>
  );
}
