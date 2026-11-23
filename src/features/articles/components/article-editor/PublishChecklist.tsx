import type { JSX } from "react";
import { toast } from "@/shared/hooks/useToast";
import { HiOutlineCheck, HiOutlineLightBulb } from "react-icons/hi2";

export interface ChecklistItem {
  label: string;
  isMet: boolean;
}

interface PublishChecklistProps {
  checklist: ChecklistItem[];
}

export function PublishChecklist({ checklist }: PublishChecklistProps): JSX.Element {
  const completedChecklistCount = checklist.filter((c) => c.isMet).length;

  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text">Before you publish</h4>

        <div className="flex items-center gap-4">
          {/* Circle Meter */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={113}
                strokeDashoffset={113 - (113 * completedChecklistCount) / 4}
                strokeLinecap="round"
                className="text-teal transition-all duration-300"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-teal">
              {completedChecklistCount}/4
            </span>
          </div>

          {/* Checklist items */}
          <div className="space-y-1.5 text-xs">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.isMet ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-teal text-white flex items-center justify-center shrink-0">
                    <HiOutlineCheck className="w-2.5 h-2.5 stroke-3" />
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={item.isMet ? "text-text font-medium" : "text-text/50"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tip Box */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
            <HiOutlineLightBulb className="w-4 h-4 text-indigo-600" />
            <span>Tip</span>
          </div>
          <p className="text-[11px] text-indigo-900/80 leading-relaxed">
            Great technical articles include code examples, clear explanations, and takeaways.
          </p>
        </div>
        <a
          href="#guidelines"
          onClick={(e) => {
            e.preventDefault();
            toast.info("Writing guidelines: keep content engaging, well-formatted, and accurate!");
          }}
          className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 pt-1"
        >
          View writing guidelines &rarr;
        </a>
      </div>
    </div>
  );
}
