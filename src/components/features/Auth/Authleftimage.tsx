import GlassIdeGraphic from "./GlassIdeGraphic";

export default function Authleftimage() {
  return (
    <div className=" hidden relative overflow-hidden lg:flex flex-col justify-between h-screen max-h-screen  top-0 bg-linear-to-b from-primary via-primary-dark to-teal p-6 lg:p-8 text-background font-inter">
      {/* Top Brand Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono font-bold text-lg leading-none tracking-tighter">&lt;/&gt;</span>
        <span className="font-bold text-xl tracking-tight text-background">DevSpace</span>
      </div>

      {/* Main Center Content */}
      <div className="w-full my-6 py-2 space-y-4">
        {/* Main Headline */}
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-background tracking-wide leading-wider">
            Learn. Build. Share.
          </h1>
          <p className="text-background/80 text-xs sm:text-sm max-w-sm mt-1.5 leading-relaxed">
            DevSpace is a community of developers sharing knowledge, tutorials, and real-world solutions.
          </p>
        </div>

        {/* Center Graphic */}
        <div className="w-full flex justify-center py-1">
          <GlassIdeGraphic />
        </div>
      </div>

      {/* Bottom Feature Highlights (Learn, Build, Share) */}
      <div className="grid grid-cols-3 gap-2  shrink-0">
        {/* Learn */}
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-sm bg-background/15 backdrop-blur-sm  flex items-center justify-center text-background shrink-0 shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-0.5"> 
            <h3 className="font-bold text-xs text-background">Learn</h3>
            <p className="text-[10px] text-background/75 leading-tight">
              Explore in-depth articles and guides.
            </p>
          </div>
        </div>

        {/* Build */}
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-sm bg-background/15 backdrop-blur-sm border border-background/20 flex items-center justify-center text-background shrink-0 shadow-xs">
            <svg className="w-4 h-4 font-mono font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-xs text-background">Build</h3>
            <p className="text-[10px] text-background/75 leading-tight">
              Level up your skills with practical tutorials.
            </p>
          </div>
        </div>

        {/* Share */}
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-sm bg-background/15 backdrop-blur-sm border border-background/20 flex items-center justify-center text-background shrink-0 shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-xs text-background">Share</h3>
            <p className="text-[10px] text-background/75 leading-tight">
              Share your knowledge with community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
