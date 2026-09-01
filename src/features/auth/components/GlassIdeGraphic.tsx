import type { JSX } from "react";

export default function GlassIdeGraphic(): JSX.Element {
  return (
    <div className="relative w-full max-w-87.5 mx-auto select-none py-3 font-mono">
      {/* Decorative Dot Grid (Top-Left) */}
      <div className="absolute -top-2 -left-3 grid grid-cols-4 gap-1.5 opacity-25 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={`tl-dot-${i}`} className="w-1.5 h-1.5 rounded-full bg-background" />
        ))}
      </div>

      {/* Decorative Dot Grid (Bottom-Right) */}
      <div className="absolute -bottom-2 -right-3 grid grid-cols-4 gap-1.5 opacity-25 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={`br-dot-${i}`} className="w-1.5 h-1.5 rounded-full bg-background" />
        ))}
      </div>

      {/* Main Glass Code Editor Window */}
      <div className="relative z-10 w-full rounded-xl bg-background/10 backdrop-blur-md border border-background/20 p-5 shadow-[0_12px_32px_0_rgba(0,0,0,0.25)]">
        {/* Top Window Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-background/15">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-background/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-background/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-background/40" />
          </div>
          <span className="text-[10px] tracking-wider text-background/50 font-inter font-medium">
            devspace.tsx
          </span>
        </div>

        {/* Floating Top-Right Code Badge */}
        <div className="absolute -top-3.5 -right-2.5 w-9 h-9 rounded-md bg-background/20 backdrop-blur-md border border-background/35 flex items-center justify-center shadow-lg text-background text-xs font-bold">
          <span className="drop-shadow">&lt;/&gt;</span>
        </div>

        {/* Code Content & Line Numbers */}
        <div className="flex text-xs leading-none">
          {/* Line Numbers */}
          <div className="flex flex-col gap-2.5 text-background/35 pr-3 border-r border-background/15 select-none text-right font-medium">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
          </div>

          {/* Syntax Highlighted Colored Pills */}
          <div className="flex flex-col gap-2.5 pl-3 pt-0.5 w-full">
            {/* Line 1: import */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-10 rounded-full bg-teal" />
              <span className="h-2 w-20 rounded-full bg-background/80" />
            </div>

            {/* Line 2: function */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-14 rounded-full bg-teal" />
              <span className="h-2 w-12 rounded-full bg-teal/70" />
            </div>

            {/* Line 3: const */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-8 rounded-full bg-teal" />
              <span className="h-2 w-12 rounded-full bg-teal/70" />
              <span className="h-2 w-24 rounded-full bg-background/85" />
              <span className="h-2 w-8 rounded-full bg-teal" />
            </div>

            {/* Line 4: nested */}
            <div className="flex items-center gap-1.5 pl-3">
              <span className="h-2 w-20 rounded-full bg-background/60" />
            </div>

            {/* Line 5: nested */}
            <div className="flex items-center gap-1.5 pl-3">
              <span className="h-2 w-12 rounded-full bg-background/60" />
              <span className="h-2 w-16 rounded-full bg-teal" />
            </div>

            {/* Line 6: nested */}
            <div className="flex items-center gap-1.5 pl-3">
              <span className="h-2 w-16 rounded-full bg-background/60" />
              <span className="h-2 w-24 rounded-full bg-teal" />
            </div>

            {/* Line 7: return */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-8 rounded-full bg-teal/80" />
              <span className="h-2 w-16 rounded-full bg-background/70" />
            </div>

            {/* Line 8: close */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-teal" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Cards */}
      <div className="relative -mt-5 flex items-end justify-between px-1 pointer-events-none">
        {/* Left Floating Card: Object / Schema { } */}
        <div className="relative z-20 w-28 rounded-md bg-background/15 backdrop-blur-md border border-background/25 p-2.5 shadow-[0_8px_24px_0_rgba(0,0,0,0.2)]">
          <div className="text-background text-sm font-bold mb-1.5 leading-none drop-shadow">
            &#123;&nbsp;&#125;
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-14 rounded-full bg-background/75" />
            <div className="h-1.5 w-20 rounded-full bg-background/55" />
            <div className="h-1.5 w-12 rounded-full bg-background/35" />
          </div>
        </div>

        {/* Right Floating Card: Terminal >_ */}
        <div className="relative z-20 w-36 rounded-md bg-background/15 backdrop-blur-md border border-background/25 p-2.5 shadow-[0_8px_24px_0_rgba(0,0,0,0.2)]">
          <div className="text-background text-xs font-bold mb-1.5 leading-none drop-shadow">
            &gt;_
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-24 rounded-full bg-teal shadow-[0_0_6px_rgba(20,184,166,0.5)]" />
            <div className="h-1.5 w-16 rounded-full bg-teal/70" />
            <div className="h-1.5 w-12 rounded-full bg-teal/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
