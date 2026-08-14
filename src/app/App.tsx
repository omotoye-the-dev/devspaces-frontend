import { useState, type JSX } from "react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Avatar,
  Tag,
  Modal,
  Tabs,
  ToastProvider,
  useToast,
  Skeleton,
  EmptyState,
  ErrorState,
  Card,
  CardSkeleton,
  type ModalSize,
} from "@/components/ui";

function AppContent(): JSX.Element {
  const { success, error, warning, info } = useToast();

  // Interactive state for form inputs & tags
  const [inputText, setInputText] = useState("");
  const [textareaText, setTextareaText] = useState("");
  const [selectedRole, setSelectedRole] = useState("fullstack");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([
    "TypeScript",
    "React 19",
    "Tailwind CSS",
    "Vite",
    "Design System",
  ]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Card Interactive State
  const [isFollowing, setIsFollowing] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState<
    "deleteArticle" | "publishArticle" | "reportContent" | "suspendUser" | null
  >(null);
  const [modalSize, setModalSize] = useState<ModalSize>("sm");

  // State Demos (Skeleton / Empty / Error)
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [isRetryingFeed, setIsRetryingFeed] = useState(false);
  const [showErrorDemo, setShowErrorDemo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSimulateLoadFeed = (): void => {
    setIsLoadingFeed(true);
    setTimeout(() => {
      setIsLoadingFeed(false);
      success("Feed loaded", { description: "Latest developer discussions are now visible." });
    }, 2000);
  };

  const handleRetryFeed = (): void => {
    setIsRetryingFeed(true);
    setTimeout(() => {
      setIsRetryingFeed(false);
      setShowErrorDemo(false);
      success("Reconnected to DevSpace API!", {
        description: "Articles feed restored successfully.",
      });
    }, 1200);
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
    info(`Tag removed: ${tagToRemove}`, {
      description: "You can click Reset Tags to restore defaults.",
      duration: 3000,
    });
  };

  const handleResetTags = (): void => {
    setTags(["TypeScript", "React 19", "Tailwind CSS", "Vite", "Design System"]);
    success("Tags restored", { description: "Default tech stack tags have been reloaded." });
  };

  const handleSimulateSubmit = (): void => {
    setIsSubmitting(true);
    setFormSubmitted(false);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      success("Workspace Deployed!", {
        description: "Your workspace has been successfully registered to DevSpace Edge.",
        action: {
          label: "View Status",
          onClick: () => info("Deploy status: 100% operational"),
        },
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-text font-inter p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header section */}
        <header className="border-b border-border pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  D
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-text">
                  DevSpace UI Component System
                </h1>
              </div>
              <p className="text-sm text-text/60 mt-1">
                Built with theme tokens in{" "}
                <code className="font-mono bg-border/40 px-1.5 py-0.5 rounded-sm text-xs">
                  src/styles/index.css
                </code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Tag variant="primary" dot>
                v1.3.0
              </Tag>
              <Tag variant="teal">Card System + Skeletons</Tag>
            </div>
          </div>

          {/* Theme Token Preview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
            <div className="p-3 bg-white rounded-md border border-border flex flex-col gap-1.5 shadow-xs">
              <div className="h-6 w-full rounded-sm bg-primary" />
              <span className="text-xs font-semibold text-text">Primary</span>
              <span className="text-[10px] font-mono text-text/50">#6366F1</span>
            </div>
            <div className="p-3 bg-white rounded-md border border-border flex flex-col gap-1.5 shadow-xs">
              <div className="h-6 w-full rounded-sm bg-primary-dark" />
              <span className="text-xs font-semibold text-text">Primary Dark</span>
              <span className="text-[10px] font-mono text-text/50">#4338CA</span>
            </div>
            <div className="p-3 bg-white rounded-md border border-border flex flex-col gap-1.5 shadow-xs">
              <div className="h-6 w-full rounded-sm bg-teal" />
              <span className="text-xs font-semibold text-text">Teal</span>
              <span className="text-[10px] font-mono text-text/50">#14B8A6</span>
            </div>
            <div className="p-3 bg-white rounded-md border border-border flex flex-col gap-1.5 shadow-xs">
              <div className="h-6 w-full rounded-sm bg-background border border-border" />
              <span className="text-xs font-semibold text-text">Background</span>
              <span className="text-[10px] font-mono text-text/50">#F8FAFC</span>
            </div>
            <div className="p-3 bg-white rounded-md border border-border flex flex-col gap-1.5 shadow-xs">
              <div className="h-6 w-full rounded-sm bg-text" />
              <span className="text-xs font-semibold text-text">Text</span>
              <span className="text-[10px] font-mono text-text/50">#0F172A</span>
            </div>
            <div className="p-3 bg-white rounded-md border border-border flex flex-col gap-1.5 shadow-xs">
              <div className="h-6 w-full rounded-sm bg-border border border-border" />
              <span className="text-xs font-semibold text-text">Border</span>
              <span className="text-[10px] font-mono text-text/50">#E2E8F0</span>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* SECTION: GENERAL CARD SYSTEM                             */}
        {/* ========================================================= */}
        <section className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-text">General Card Container System</h2>
              </div>
              <p className="text-xs text-text/60">
                Flexible containers for in-page widgets like About the Author, Related Articles,
                Newsletters, and Discussions.
              </p>
            </div>
            <Tag variant="primary">Card.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. "About the Author" Widget Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text/50">
                  About The Author
                </span>
                <Tag variant="teal" size="sm">
                  Author
                </Tag>
              </div>

              <div className="flex items-center gap-3">
                <Avatar name="Ayomide Olayode" size="lg" status="online" />
                <div>
                  <h4 className="text-sm font-bold text-text">Ayomide Olayode</h4>
                  <p className="text-xs text-text/50">@ayomide • Fullstack Engineer</p>
                </div>
              </div>

              <p className="text-xs text-text/70 leading-relaxed">
                Writing about React 19, TypeScript architecture, and developer tooling. Building
                DevSpace for modern engineering teams.
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag variant="primary" size="sm">
                  TypeScript
                </Tag>
                <Tag variant="teal" size="sm">
                  React 19
                </Tag>
                <Tag variant="neutral" size="sm">
                  Tailwind
                </Tag>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isFollowing ? "secondary" : "primary"}
                  fullWidth
                  onClick={() => {
                    setIsFollowing((prev) => !prev);
                    if (!isFollowing) {
                      success("Following Ayomide", {
                        description: "You will receive notifications for new articles.",
                      });
                    } else {
                      info("Unfollowed Ayomide");
                    }
                  }}
                >
                  {isFollowing ? "Following" : "Follow Author"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => info("Navigating to author profile...")}
                >
                  Profile
                </Button>
              </div>
            </Card>

            {/* 2. "Related / Popular Articles" Widget Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text/50">
                  Related Discussions
                </span>
                <Tag variant="outline" size="sm">
                  Sidebar Widget
                </Tag>
              </div>

              <div className="space-y-3">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    info("Opening article: React 19 Server Actions");
                  }}
                  className="group block space-y-1 p-2 rounded-md hover:bg-background transition-colors"
                >
                  <h5 className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                    • React 19 Compiler and Server Action Best Practices
                  </h5>
                  <div className="flex items-center gap-2 text-[11px] text-text/50">
                    <span>8 min read</span>
                    <span>•</span>
                    <span className="text-primary font-medium">#react</span>
                  </div>
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    info("Opening article: Tailwind v4 Theme Engine");
                  }}
                  className="group block space-y-1 p-2 rounded-md hover:bg-background transition-colors"
                >
                  <h5 className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                    • Why Tailwind CSS v4 Replaced tailwind.config with @theme
                  </h5>
                  <div className="flex items-center gap-2 text-[11px] text-text/50">
                    <span>5 min read</span>
                    <span>•</span>
                    <span className="text-teal font-medium">#tailwind</span>
                  </div>
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    info("Opening article: Strict TypeScript Patterns");
                  }}
                  className="group block space-y-1 p-2 rounded-md hover:bg-background transition-colors"
                >
                  <h5 className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                    • 5 Strict TypeScript Rules Every Team Should Enforce
                  </h5>
                  <div className="flex items-center gap-2 text-[11px] text-text/50">
                    <span>6 min read</span>
                    <span>•</span>
                    <span className="text-primary font-medium">#typescript</span>
                  </div>
                </a>
              </div>
            </Card>

            {/* 3. Community Newsletter / Callout Card */}
            <Card variant="gradient" className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>DevSpace Digest</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-text">Weekly Engineering Insights</h4>
                <p className="text-xs text-text/60 leading-relaxed">
                  Join 18,000+ developers getting our handpicked technical articles and architecture
                  breakdowns every Monday.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Input placeholder="developer@domain.com" inputSize="sm" />
                <Button
                  size="sm"
                  variant="primary"
                  fullWidth
                  onClick={() =>
                    success("Subscribed!", {
                      description: "Welcome to the DevSpace weekly engineering digest.",
                    })
                  }
                >
                  Subscribe Free
                </Button>
              </div>

              <p className="text-[10px] text-text/40 text-center">
                Zero spam. Unsubscribe anytime with 1 click.
              </p>
            </Card>

            {/* 4. Quick Discussion / Activity Card */}
            <Card variant="default" className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-text/50">
                  Recent Activity
                </span>
                <span className="text-[11px] font-mono text-text/50">Live</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Avatar name="Sarah Connor" size="xs" status="online" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs text-text/80 leading-snug">
                      <strong className="text-text font-semibold">Sarah</strong> commented on{" "}
                      <em>React 19 Actions</em>
                    </p>
                    <span className="text-[10px] text-text/40">4 mins ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Avatar name="Marcus Chen" size="xs" status="away" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs text-text/80 leading-snug">
                      <strong className="text-text font-semibold">Marcus</strong> upvoted{" "}
                      <em>Tailwind v4 Theme</em>
                    </p>
                    <span className="text-[10px] text-text/40">18 mins ago</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 5. Generic Container with Custom Content */}
            <Card variant="interactive" className="space-y-3">
              <div className="flex items-center justify-between">
                <Tag variant="primary" size="sm">
                  Interactive Card
                </Tag>
                <span className="text-xs text-text/50">Hover / Click Me</span>
              </div>
              <h4 className="text-sm font-bold text-text">Any Custom Content Container</h4>
              <p className="text-xs text-text/60 leading-relaxed">
                You can place any components or JSX directly inside &lt;Card&gt;. It will
                automatically respect the design system theme tokens.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-xs font-semibold text-primary">Explore Feature →</span>
                <Tag variant="teal" size="sm">
                  Ready
                </Tag>
              </div>
            </Card>

            {/* 6. Matching CardSkeleton Twin */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-text/60">Matching Twin Skeleton</span>
                <Tag size="sm" variant="outline">
                  CardSkeleton
                </Tag>
              </div>
              <CardSkeleton hasAvatar lines={3} />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION: SKELETON LOADING STATES                          */}
        {/* ========================================================= */}
        <section className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-text">Skeleton Component</h2>
              </div>
              <p className="text-xs text-text/60">
                Smooth pulse loading placeholders for avatars, article cards, and text paragraphs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                isLoading={isLoadingFeed}
                onClick={handleSimulateLoadFeed}
              >
                Simulate 2s Loading
              </Button>
              <Tag variant="primary">Skeleton.tsx</Tag>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-background/50 rounded-lg border border-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text/60">Article Card Placeholder</span>
                <Tag size="sm" variant="outline">
                  {isLoadingFeed ? "Loading..." : "Live Preview"}
                </Tag>
              </div>

              {isLoadingFeed ? (
                <CardSkeleton hasAvatar lines={2} />
              ) : (
                <div className="p-4 bg-white rounded-md border border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar name="Ayomide Olayode" size="sm" status="online" />
                    <div>
                      <h4 className="text-xs font-semibold text-text">Ayomide Olayode</h4>
                      <p className="text-[11px] text-text/50">Posted 3 hours ago • 6 min read</p>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-text">
                    Mastering Modern Fullstack Architecture with React 19 & Vite
                  </h3>
                  <p className="text-xs text-text/70 line-clamp-2">
                    Discover how to build high performance modular interfaces using design tokens,
                    strict TypeScript contracts, and micro-interactions.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Tag variant="primary" size="sm">
                      Architecture
                    </Tag>
                    <Tag variant="teal" size="sm">
                      React 19
                    </Tag>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-border flex flex-col gap-3">
              <span className="text-xs font-semibold text-text/60">Profile Header Placeholder</span>
              <div className="p-4 bg-white rounded-md border border-border flex flex-col items-center text-center space-y-3">
                <Skeleton variant="circular" width={64} height={64} />
                <div className="space-y-1.5 w-full flex flex-col items-center">
                  <Skeleton width={140} height={16} />
                  <Skeleton width={180} height={12} />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton width={70} height={28} className="rounded-md" />
                  <Skeleton width={70} height={28} className="rounded-md" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-border flex flex-col gap-3">
              <span className="text-xs font-semibold text-text/60">Primitive Shapes & Counts</span>
              <div className="p-4 bg-white rounded-md border border-border space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-text/50">
                    Multi-line Paragraph
                  </span>
                  <Skeleton count={3} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-text/50">
                    Circular Avatars
                  </span>
                  <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="circular" width={48} height={48} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION: EMPTY STATE COMPONENT                            */}
        {/* ========================================================= */}
        <section className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal" />
                <h2 className="text-lg font-bold text-text">EmptyState Component</h2>
              </div>
              <p className="text-xs text-text/60">
                Informative zero-data feedback screens with call-to-actions, illustrations, and
                sizes.
              </p>
            </div>
            <Tag variant="teal">EmptyState.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-2 bg-white rounded-lg border border-border">
              <EmptyState
                size="sm"
                bordered
                title="No Articles Published Yet"
                description="Share your engineering insights, tutorials, or open source projects with the community."
                action={
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => success("Navigating to article editor...")}
                  >
                    Write First Article
                  </Button>
                }
              />
            </div>

            <div className="p-2 bg-white rounded-lg border border-border">
              <EmptyState
                size="sm"
                bordered
                icon={
                  <svg
                    className="w-5 h-5 text-text/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                }
                title="Your Reading List is Empty"
                description="Bookmark insightful articles from the feed to read them offline later."
                action={
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => info("Opening trending feed...")}
                  >
                    Explore Trending
                  </Button>
                }
              />
            </div>

            <div className="p-2 bg-white rounded-lg border border-border flex flex-col justify-between">
              <EmptyState
                size="sm"
                bordered
                icon={
                  <svg
                    className="w-5 h-5 text-text/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                title={searchQuery ? `No results for "${searchQuery}"` : "No Search Matches"}
                description="Try checking for spelling errors or searching with broader keywords."
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      info("Search filters reset");
                    }}
                  >
                    Clear Filters
                  </Button>
                }
              />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION: ERROR STATE COMPONENT                            */}
        {/* ========================================================= */}
        <section className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <h2 className="text-lg font-bold text-text">ErrorState Component</h2>
              </div>
              <p className="text-xs text-text/60">
                Resilient error handling views with retry triggers, status icons, and technical
                diagnostics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={showErrorDemo ? "primary" : "outline"}
                onClick={() => setShowErrorDemo((prev) => !prev)}
              >
                {showErrorDemo ? "Show Normal View" : "Simulate API Failure"}
              </Button>
              <Tag variant="danger">ErrorState.tsx</Tag>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-background/50 rounded-lg border border-border flex flex-col justify-center">
              <ErrorState
                size="md"
                title="Failed to Load Community Feed"
                description="DevSpace encountered a network timeout while connecting to the edge API."
                error="HTTP 503 Service Unavailable: Request timed out after 5000ms on cluster edge-us-east-1"
                onRetry={handleRetryFeed}
                action={
                  isRetryingFeed ? (
                    <Button size="md" variant="secondary" isLoading>
                      Reconnecting...
                    </Button>
                  ) : undefined
                }
              />
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-border flex flex-col justify-center">
              <ErrorState
                size="md"
                icon={
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                title="Article Not Found (404)"
                description="The article you requested might have been deleted, unpublished, or the link is incorrect."
                action={
                  <Button variant="secondary" onClick={() => info("Returning to homepage...")}>
                    Back to Feed
                  </Button>
                }
              />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* COMPOSITION COMPONENT: TOAST NOTIFICATIONS                */}
        {/* ========================================================= */}
        <section className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal" />
                <h2 className="text-lg font-bold text-text">Toast Notification System</h2>
              </div>
              <p className="text-xs text-text/60">
                Feedback notifications with auto-dismiss timers, action triggers, and semantic
                variants.
              </p>
            </div>
            <Tag variant="teal">Toast.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="primary"
              onClick={() =>
                success("Article Published!", {
                  description: "Your article 'Building with React 19' is now live on DevSpace.",
                  action: {
                    label: "View Post",
                    onClick: () => info("Opening article view..."),
                  },
                })
              }
            >
              🎉 Success Toast
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                info("Draft Saved", {
                  description: "All changes automatically synced to local cloud storage.",
                })
              }
            >
              💾 Info Toast
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                warning("Unpublished Article", {
                  description: "Article was removed from public feed and moved to drafts.",
                })
              }
            >
              ⚠️ Warning Toast
            </Button>

            <Button
              variant="danger"
              onClick={() =>
                error("Article Deleted", {
                  description: "The article has been permanently removed.",
                  action: {
                    label: "Undo",
                    onClick: () => success("Article restored!"),
                  },
                })
              }
            >
              🗑️ Error Toast with Undo
            </Button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* COMPOSITION COMPONENT: MODAL DIALOGS                      */}
        {/* ========================================================= */}
        <section className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-text">Modal Dialog Component</h2>
              </div>
              <p className="text-xs text-text/60">
                Accessible dialog with Focus Trap, Escape key dismissal, Portal rendering, and body
                scroll lock.
              </p>
            </div>
            <Tag variant="primary">Modal.tsx</Tag>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-text/70">Dialog Size:</span>
              <div className="flex items-center gap-1.5">
                {(["sm", "md", "lg", "xl"] as ModalSize[]).map((sz) => (
                  <Button
                    key={sz}
                    size="sm"
                    variant={modalSize === sz ? "primary" : "secondary"}
                    onClick={() => setModalSize(sz)}
                  >
                    {sz.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="danger" onClick={() => setActiveModal("deleteArticle")}>
                Delete Article Modal
              </Button>
              <Button variant="primary" onClick={() => setActiveModal("publishArticle")}>
                Publish Article Modal
              </Button>
              <Button variant="secondary" onClick={() => setActiveModal("reportContent")}>
                Report Content Modal
              </Button>
              <Button variant="outline" onClick={() => setActiveModal("suspendUser")}>
                Suspend User Modal
              </Button>
            </div>
          </div>

          {/* Delete Article Confirmation Modal */}
          <Modal
            open={activeModal === "deleteArticle"}
            onClose={() => setActiveModal(null)}
            size={modalSize}
            title="Delete Article"
            description="Are you sure you want to delete this article? This action cannot be undone."
            footer={
              <>
                <Button variant="secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setActiveModal(null);
                    error("Article Deleted", {
                      description: "The article was permanently deleted.",
                      action: {
                        label: "Undo",
                        onClick: () => success("Article restored!"),
                      },
                    });
                  }}
                >
                  Delete Article
                </Button>
              </>
            }
          >
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                All associated comments, bookmarks, and read metrics will also be archived.
              </span>
            </div>
          </Modal>

          {/* Publish Article Modal */}
          <Modal
            open={activeModal === "publishArticle"}
            onClose={() => setActiveModal(null)}
            size={modalSize === "sm" ? "md" : modalSize}
            title="Publish Article to DevSpace"
            description="Configure your distribution settings before making this article public."
            footer={
              <>
                <Button variant="secondary" onClick={() => setActiveModal(null)}>
                  Save Draft
                </Button>
                <Button
                  variant="teal"
                  onClick={() => {
                    setActiveModal(null);
                    success("Article Published Successfully!", {
                      description: "Your post is now trending on DevSpace feeds.",
                    });
                  }}
                >
                  Publish Now
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input
                label="Canonical URL (Optional)"
                placeholder="https://myblog.com/posts/..."
                helperText="Link to the original version if cross-posting"
              />
              <Select
                label="Primary Community Hub"
                defaultValue="webdev"
                options={[
                  { label: "#webdev (Web Development)", value: "webdev" },
                  { label: "#react (React & Next.js)", value: "react" },
                  { label: "#typescript (TypeScript)", value: "typescript" },
                  { label: "#devops (DevOps & Cloud)", value: "devops" },
                ]}
              />
            </div>
          </Modal>

          {/* Report Content Modal */}
          <Modal
            open={activeModal === "reportContent"}
            onClose={() => setActiveModal(null)}
            size={modalSize}
            title="Report Content"
            description="Help keep DevSpace safe and constructive for all developers."
            footer={
              <>
                <Button variant="secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setActiveModal(null);
                    warning("Report Submitted", {
                      description: "Our moderation team will review this report within 24 hours.",
                    });
                  }}
                >
                  Submit Report
                </Button>
              </>
            }
          >
            <div className="space-y-3">
              <Select
                label="Reason for report"
                options={[
                  { label: "Spam or promotional content", value: "spam" },
                  { label: "Harassment or offensive language", value: "harassment" },
                  { label: "Misleading technical information", value: "misleading" },
                  { label: "Copyright infringement", value: "copyright" },
                ]}
              />
              <Textarea
                label="Additional details"
                placeholder="Provide context for our moderators..."
                rows={3}
              />
            </div>
          </Modal>

          {/* Suspend User Modal */}
          <Modal
            open={activeModal === "suspendUser"}
            onClose={() => setActiveModal(null)}
            size={modalSize}
            title="Suspend User Account"
            description="Suspend this user from publishing articles or commenting on DevSpace."
            footer={
              <>
                <Button variant="secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setActiveModal(null);
                    error("User Suspended", {
                      description: "Account privileges have been temporarily revoked.",
                    });
                  }}
                >
                  Confirm Suspension
                </Button>
              </>
            }
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-md border border-border">
                <Avatar name="Suspended User" status="busy" size="md" />
                <div>
                  <h4 className="text-sm font-semibold text-text">@alex_spammer</h4>
                  <p className="text-xs text-text/50">Joined 2 days ago • 14 flagged comments</p>
                </div>
              </div>
              <Select
                label="Suspension Duration"
                options={[
                  { label: "24 Hours (Warning)", value: "24h" },
                  { label: "7 Days (Temporary)", value: "7d" },
                  { label: "30 Days (Extended)", value: "30d" },
                  { label: "Permanent Ban", value: "permanent" },
                ]}
              />
            </div>
          </Modal>
        </section>

        {/* ========================================================= */}
        {/* COMPOSITION COMPONENT: TABS (PROFILE & FEED)              */}
        {/* ========================================================= */}
        <section className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-text">Generic Tabs Component</h2>
              </div>
              <p className="text-xs text-text/60">
                Accessible tabs with keyboard arrow navigation, compound structure, and multiple
                display styles.
              </p>
            </div>
            <Tag variant="primary">Tabs.tsx</Tag>
          </div>

          {/* Feed Tabs Demo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
                1. Feed Tabs (For You, Following, Latest, Trending)
              </h3>
              <Tag variant="outline" size="sm">
                Variant: Line
              </Tag>
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <Tabs
                defaultValue="for-you"
                variant="line"
                items={[
                  {
                    id: "for-you",
                    label: "For You",
                    badge: (
                      <Tag variant="primary" size="sm">
                        Personalized
                      </Tag>
                    ),
                    content: (
                      <div className="py-4 space-y-3">
                        <div className="p-4 bg-white rounded-md border border-border flex items-center justify-between">
                          <div className="space-y-1">
                            <Tag variant="teal" size="sm">
                              React 19
                            </Tag>
                            <h4 className="text-sm font-semibold text-text">
                              Deep Dive into React 19 Server Actions and Component Lifecycle
                            </h4>
                            <p className="text-xs text-text/60">
                              By Ayomide Olayode • 8 min read • 42 comments
                            </p>
                          </div>
                          <Button size="sm" variant="secondary">
                            Read Article
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: "following",
                    label: "Following",
                    count: 12,
                    content: (
                      <div className="py-4 text-xs text-text/70">
                        Showing recent posts from 12 developers you follow.
                      </div>
                    ),
                  },
                  {
                    id: "latest",
                    label: "Latest",
                    count: "New",
                    content: (
                      <div className="py-4 text-xs text-text/70">
                        Real-time chronological feed of community submissions.
                      </div>
                    ),
                  },
                  {
                    id: "trending",
                    label: "Trending",
                    icon: (
                      <svg
                        className="w-4 h-4 text-amber-500 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    ),
                    content: (
                      <div className="py-4 text-xs text-text/70">
                        Highest engagement discussions over the last 24 hours.
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          {/* Profile Tabs Demo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
                2. Profile Tabs (Articles, Resources, Activity, About)
              </h3>
              <Tag variant="outline" size="sm">
                Variant: Pills
              </Tag>
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <Tabs
                defaultValue="articles"
                variant="pills"
                items={[
                  {
                    id: "articles",
                    label: "Articles",
                    count: 8,
                    content: (
                      <div className="py-4 text-xs text-text/70">
                        Author has published <strong>8 technical articles</strong> with 14.2k reads.
                      </div>
                    ),
                  },
                  {
                    id: "resources",
                    label: "Resources",
                    count: 4,
                    content: (
                      <div className="py-4 text-xs text-text/70">
                        4 shared developer tools, boilerplates, and cheat sheets.
                      </div>
                    ),
                  },
                  {
                    id: "activity",
                    label: "Activity",
                    count: 32,
                    content: (
                      <div className="py-4 text-xs text-text/70">
                        Recent discussions, pull request reviews, and upvotes.
                      </div>
                    ),
                  },
                  {
                    id: "about",
                    label: "About",
                    content: (
                      <div className="py-4 text-xs text-text/70 space-y-1">
                        <p>
                          <strong>Bio:</strong> Fullstack Engineer passionate about TypeScript,
                          React, and UX.
                        </p>
                        <p>
                          <strong>Location:</strong> London, UK • <strong>Member since:</strong>{" "}
                          2024
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTEGRATED LIVE PLAYGROUND                                */}
        {/* ========================================================= */}
        <section className="bg-linear-to-br from-white to-background rounded-lg border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Avatar name="Dev Space" status="online" size="md" />
              <div>
                <h2 className="text-lg font-bold text-text">Live Integrated Form Playground</h2>
                <p className="text-xs text-text/60">
                  Interactive form combining all primitives, cards, feedback states, and toasts.
                </p>
              </div>
            </div>
            <Tag variant="teal" dot>
              Interactive
            </Tag>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSimulateSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Workspace Name"
                placeholder="e.g. acme-platform"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                required
              />
              <Select
                label="Environment Target"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                options={[
                  { label: "Production (Global Edge)", value: "production" },
                  { label: "Staging (Preview)", value: "staging" },
                  { label: "Local Development", value: "local" },
                ]}
              />
            </div>

            <Textarea
              label="Deployment Notes"
              placeholder="What changes are included in this release?"
              defaultValue="Added complete Card component system (Card, CardHeader, CardTitle, CardContent, CardFooter, CardMedia, CardSkeleton)."
              rows={3}
              showCount
              maxLength={150}
              value={textareaText}
              onChange={(e) => setTextareaText(e.target.value)}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-text select-none">
                  Assigned Tech Tags
                </label>
                {tags.length < 5 && (
                  <button
                    type="button"
                    onClick={handleResetTags}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    Reset Tags
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-md border border-border min-h-11.5">
                {tags.map((t) => (
                  <Tag key={t} variant="teal" onRemove={() => handleRemoveTag(t)}>
                    {t}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Avatar name="Ayomide Olayode" size="sm" status="online" />
                <span className="text-xs text-text/70">
                  Signed in as <strong className="text-text font-medium">Ayomide</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setInputText("");
                    setTextareaText("");
                    setFormSubmitted(false);
                    info("Form cleared");
                  }}
                >
                  Clear Form
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Deploy Workspace
                </Button>
              </div>
            </div>

            {formSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-emerald-800 text-xs">
                <svg
                  className="w-4 h-4 text-emerald-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  Workspace submitted successfully! All theme variables and components reacted
                  flawlessly.
                </span>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <ToastProvider position="bottom-right">
      <AppContent />
    </ToastProvider>
  );
}
