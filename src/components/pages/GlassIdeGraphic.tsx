import type { JSX } from "react";

export default function GlassIdeGraphic(): JSX.Element {
  return (
    <div className="relative w-full max-w-[320px] mx-auto select-none py-2 font-mono">
      {/* Decorative Dot Grid (Top-Left) */}
      <div className="absolute -top-1 -left-3 grid grid-cols-4 gap-1 opacity-20 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={`tl-dot-${i}`} className="w-1 h-1 rounded-full bg-background" />
        ))}
      </div>

      {/* Decorative Dot Grid (Bottom-Right) */}
      <div className="absolute -bottom-1 -right-3 grid grid-cols-4 gap-1 opacity-20 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={`br-dot-${i}`} className="w-1 h-1 rounded-full bg-background" />
        ))}
      </div>

      {/* Main Glass Code Editor Window */}
      <div className="relative z-10 w-full rounded-lg bg-background/10 backdrop-blur-md border border-background/20 p-4 shadow-[0_8px_24px_0_rgba(0,0,0,0.2)]">
        {/* Top Window Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-background/10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-background/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-background/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-background/40" />
          </div>
        </div>

        {/* Floating Top-Right Code Badge */}
        <div className="absolute -top-2.5 -right-1.5 w-8 h-8 rounded-sm bg-background/20 backdrop-blur-md border border-background/30 flex items-center justify-center shadow-md text-background text-[11px] font-bold">
          <span className="drop-shadow">&lt;/&gt;</span>
        </div>

        {/* Code Content & Line Numbers */}
        <div className="flex text-[9px] leading-none">
          {/* Line Numbers */}
          <div className="flex flex-col gap-1.5 text-background/35 pr-2 border-r border-background/10 select-none text-right">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
          </div>

          {/* Syntax Highlighted Colored Pills */}
          <div className="flex flex-col gap-1.5 pl-2 pt-0.5 w-full">
            {/* Line 1 */}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-8 rounded-full bg-teal" />
              <span className="h-1.5 w-16 rounded-full bg-background/80" />
            </div>

            {/* Line 2 */}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-12 rounded-full bg-teal" />
              <span className="h-1.5 w-10 rounded-full bg-teal/70" />
            </div>

            {/* Line 3 */}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-5 rounded-full bg-teal" />
              <span className="h-1.5 w-10 rounded-full bg-teal/70" />
              <span className="h-1.5 w-20 rounded-full bg-background/80" />
              <span className="h-1.5 w-6 rounded-full bg-teal" />
            </div>

            {/* Line 4 */}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-16 rounded-full bg-background/60" />
            </div>

            {/* Line 5 */}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-10 rounded-full bg-background/60" />
              <span className="h-1.5 w-14 rounded-full bg-teal" />
            </div>

            {/* Line 6 */}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-12 rounded-full bg-background/60" />
              <span className="h-1.5 w-20 rounded-full bg-teal" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Cards */}
      <div className="relative -mt-3.5 flex items-end justify-between px-1 pointer-events-none">
        {/* Left Floating Card: Object / Schema { } */}
        <div className="relative z-20 w-24 rounded-sm bg-background/15 backdrop-blur-md border border-background/25 p-2 shadow-[0_6px_20px_0_rgba(0,0,0,0.2)]">
          <div className="text-background text-xs font-bold mb-1 leading-none drop-shadow">
            &#123;&nbsp;&#125;
          </div>
          <div className="space-y-1">
            <div className="h-1 w-12 rounded-full bg-background/70" />
            <div className="h-1 w-16 rounded-full bg-background/50" />
            <div className="h-1 w-10 rounded-full bg-background/30" />
          </div>
        </div>

        {/* Right Floating Card: Terminal >_ */}
        <div className="relative z-20 w-32 rounded-sm bg-background/15 backdrop-blur-md border border-background/25 p-2 shadow-[0_6px_20px_0_rgba(0,0,0,0.2)]">
          <div className="text-background text-[11px] font-bold mb-1 leading-none drop-shadow">
            &gt;_
          </div>
          <div className="space-y-1">
            <div className="h-1 w-20 rounded-full bg-teal shadow-[0_0_4px_rgba(20,184,166,0.4)]" />
            <div className="h-1 w-16 rounded-full bg-teal/70" />
            <div className="h-1 w-12 rounded-full bg-teal/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
