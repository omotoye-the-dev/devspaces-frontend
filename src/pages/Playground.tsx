import { useState, type JSX } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Input,
  Textarea,
  Select,
  Avatar,
  Tag,
  Modal,
  Tabs,
  useToast,
  Skeleton,
  EmptyState,
  ErrorState,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSkeleton,
  type ModalSize,
} from "@/components/common";

export default function Playground(): JSX.Element {
  const { success, error, warning, info } = useToast();

  // 1. Button Interactive States
  const [btnLoading, setBtnLoading] = useState(false);

  // 2. Input Interactive States
  const [inputVal, setInputVal] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [emailVal, setEmailVal] = useState("user@invalid-domain");

  // 3. Textarea Interactive States
  const [textareaVal, setTextareaVal] = useState(
    "DevSpace is built for engineers to share deep technical insights.",
  );

  // 4. Select Interactive States
  const [selectedRole, setSelectedRole] = useState("fullstack");
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");

  // 5. Tag Interactive States
  const [activeTags, setActiveTags] = useState<string[]>([
    "TypeScript",
    "React 19",
    "Tailwind v4",
    "Vite",
    "Design System",
  ]);

  // 6. Modal Interactive States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"delete" | "publish" | "report" | "custom">("delete");
  const [modalSize, setModalSize] = useState<ModalSize>("md");

  // 7. Card Interactive States
  const [bookmarked, setBookmarked] = useState(false);

  // 8. Skeleton / Feed Loading Simulation State
  const [isSimulatingSkeleton, setIsSimulatingSkeleton] = useState(false);

  const handleSimulateLoad = (): void => {
    setIsSimulatingSkeleton(true);
    setTimeout(() => {
      setIsSimulatingSkeleton(false);
      success("Simulated fetch complete", {
        description: "Data has been loaded into the components.",
      });
    }, 2000);
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setActiveTags((prev) => prev.filter((t) => t !== tagToRemove));
    info(`Removed tag: ${tagToRemove}`);
  };

  const handleResetTags = (): void => {
    setActiveTags(["TypeScript", "React 19", "Tailwind v4", "Vite", "Design System"]);
    success("Tags reset to defaults");
  };

  return (
    <div className="min-h-screen bg-background text-text font-inter p-4 sm:p-6 md:p-10 space-y-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text/70 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to DevSpace Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Tag variant="primary" dot>
              11 UI Components
            </Tag>
            <Tag variant="teal">Individual Showcase</Tag>
          </div>
        </div>

        {/* Hero Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl shadow-xs">
              D
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-text">
                DevSpace Component Library
              </h1>
              <p className="text-xs text-text/60">
                Every component displayed individually with its variants, sizes, and interactive
                states.
              </p>
            </div>
          </div>

          {/* Quick Jump Links */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="font-bold text-text/50 uppercase tracking-wider text-[10px]">
              Jump to:
            </span>
            {[
              "Button",
              "Input",
              "Textarea",
              "Select",
              "Avatar",
              "Tag",
              "Card",
              "Modal",
              "Tabs",
              "Toast",
              "Skeleton",
              "EmptyState",
              "ErrorState",
            ].map((comp) => (
              <a
                key={comp}
                href={`#${comp.toLowerCase()}`}
                className="px-2 py-1 bg-white border border-border rounded-md hover:border-primary hover:text-primary transition-colors font-medium"
              >
                {comp}
              </a>
            ))}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 1. BUTTON COMPONENT                                                      */}
        {/* ========================================================================= */}
        <section
          id="button"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">1. Button</h2>
              <p className="text-xs text-text/60">
                Variants, sizes, loading spinners, icons, and disabled states.
              </p>
            </div>
            <Tag variant="primary">Button.tsx</Tag>
          </div>

          {/* Variants */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              Variants
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="teal">Teal</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small (sm)</Button>
              <Button size="md">Medium (md)</Button>
              <Button size="lg">Large (lg)</Button>
            </div>
          </div>

          {/* States & Icons */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              States & Icons
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                isLoading={btnLoading}
                onClick={() => {
                  setBtnLoading(true);
                  setTimeout(() => setBtnLoading(false), 1500);
                }}
              >
                {btnLoading ? "Processing..." : "Click for Loading State"}
              </Button>
              <Button disabled>Disabled Button</Button>
              <Button
                variant="primary"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                With Left Icon
              </Button>
              <Button
                variant="secondary"
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                }
              >
                With Right Icon
              </Button>
            </div>
          </div>

          {/* Full Width */}
          <div className="space-y-2 max-w-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              Full Width (fullWidth)
            </h3>
            <Button variant="primary" fullWidth>
              Full Width Action
            </Button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. INPUT COMPONENT                                                       */}
        {/* ========================================================================= */}
        <section
          id="input"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">2. Input</h2>
              <p className="text-xs text-text/60">
                Accessible inputs with label, helper text, error messages, sizes, and icon slots.
              </p>
            </div>
            <Tag variant="primary">Input.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Standard Input"
              placeholder="e.g. Ayomide Olayode"
              helperText="Enter your display name"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />

            <Input
              label="With Left Icon"
              placeholder="Search repositories..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />

            <Input
              label="With Right Icon"
              placeholder="Enter access token"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              }
            />

            <Input
              label="Input with Error State"
              type="email"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              errorMessage="Please enter a valid email address."
            />

            <Input label="Small Input (sm)" inputSize="sm" placeholder="Small size (32px)" />

            <Input label="Large Input (lg)" inputSize="lg" placeholder="Large size (48px)" />

            <Input
              label="Disabled State"
              disabled
              defaultValue="Read-only system token"
              helperText="This field is locked"
            />
          </div>
        </section>

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

        {/* ========================================================================= */}
        {/* 4. SELECT COMPONENT                                                      */}
        {/* ========================================================================= */}
        <section
          id="select"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">4. Select</h2>
              <p className="text-xs text-text/60">
                Custom dropdown with options array, custom chevron indicator, and icon slots.
              </p>
            </div>
            <Tag variant="primary">Select.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Standard Select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              options={[
                { label: "Frontend Engineer", value: "frontend" },
                { label: "Backend Engineer", value: "backend" },
                { label: "Fullstack Engineer", value: "fullstack" },
                { label: "DevOps & Cloud SRE", value: "devops" },
              ]}
              helperText="Select your primary discipline"
            />

            <Select
              label="With Left Icon"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              options={[
                { label: "US East (N. Virginia)", value: "us-east-1" },
                { label: "US West (Oregon)", value: "us-west-2" },
                { label: "EU Central (Frankfurt)", value: "eu-central-1" },
                { label: "Asia Pacific (Tokyo)", value: "ap-northeast-1" },
              ]}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            <Select
              label="Select with Error"
              errorMessage="Please choose a subscription tier."
              options={[
                { label: "Community (Free)", value: "free" },
                { label: "Pro ($19/mo)", value: "pro" },
                { label: "Enterprise", value: "enterprise" },
              ]}
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. AVATAR COMPONENT                                                      */}
        {/* ========================================================================= */}
        <section
          id="avatar"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">5. Avatar</h2>
              <p className="text-xs text-text/60">
                Sizes (xs to xl), status indicators, shapes (circle, rounded, square), and fallback
                initials.
              </p>
            </div>
            <Tag variant="primary">Avatar.tsx</Tag>
          </div>

          {/* Sizes and Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              Sizes & Status Dots (xs, sm, md, lg, xl)
            </h3>
            <div className="flex items-center gap-4">
              <Avatar name="Sarah Connor" size="xs" status="online" />
              <Avatar name="David Miller" size="sm" status="away" />
              <Avatar name="Alex Johnson" size="md" status="online" />
              <Avatar name="Elena Rostova" size="lg" status="busy" />
              <Avatar name="Marcus Chen" size="xl" status="offline" />
            </div>
          </div>

          {/* Shapes */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              Shapes (circle, rounded, square)
            </h3>
            <div className="flex items-center gap-4">
              <Avatar name="Circle Shape" shape="circle" size="lg" status="online" />
              <Avatar name="Rounded Shape" shape="rounded" size="lg" status="online" />
              <Avatar name="Square Shape" shape="square" size="lg" status="online" />
            </div>
          </div>

          {/* Images & Fallbacks */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              Images & Automatic Error Fallback
            </h3>
            <div className="flex items-center gap-4">
              <Avatar
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                name="Jessica Taylor"
                size="lg"
                status="online"
              />
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                name="Michael Brooks"
                size="lg"
                status="busy"
              />
              <Avatar
                src="https://broken-image-link-for-test.xyz/avatar.png"
                name="Ayomide Olayode"
                size="lg"
                status="online"
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. TAG COMPONENT                                                         */}
        {/* ========================================================================= */}
        <section
          id="tag"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">6. Tag (Badges / Pills)</h2>
              <p className="text-xs text-text/60">
                Semantic color variants, status dots, icon slots, and removable interactive tags.
              </p>
            </div>
            <Tag variant="primary">Tag.tsx</Tag>
          </div>

          {/* Variants */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              Variants
            </h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <Tag variant="primary">Primary</Tag>
              <Tag variant="teal">Teal</Tag>
              <Tag variant="neutral">Neutral</Tag>
              <Tag variant="success">Success</Tag>
              <Tag variant="warning">Warning</Tag>
              <Tag variant="danger">Danger</Tag>
              <Tag variant="outline">Outline</Tag>
            </div>
          </div>

          {/* With Status Dots */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              With Status Indicator Dots
            </h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <Tag variant="primary" dot>
                Active
              </Tag>
              <Tag variant="teal" dot>
                Verified
              </Tag>
              <Tag variant="success" dot>
                Published
              </Tag>
              <Tag variant="danger" dot>
                Deprecated
              </Tag>
              <Tag variant="warning" dot>
                Draft
              </Tag>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">Sizes</h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <Tag variant="primary" size="sm">
                Small (sm)
              </Tag>
              <Tag variant="primary" size="md">
                Medium (md)
              </Tag>
              <Tag variant="primary" size="lg">
                Large (lg)
              </Tag>
            </div>
          </div>

          {/* Interactive Removable Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
                Interactive Removable Tags (onRemove)
              </h3>
              {activeTags.length < 5 && (
                <Button size="sm" variant="ghost" onClick={handleResetTags}>
                  Reset Tags
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3 bg-background rounded-md border border-border min-h-12">
              {activeTags.map((t) => (
                <Tag key={t} variant="teal" onRemove={() => handleRemoveTag(t)}>
                  {t}
                </Tag>
              ))}
              {activeTags.length === 0 && (
                <span className="text-xs text-text/40 italic">
                  All tags removed. Click &quot;Reset Tags&quot; to restore.
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. CARD COMPONENT SYSTEM                                                 */}
        {/* ========================================================================= */}
        <section
          id="card"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">7. Card (General Container System)</h2>
              <p className="text-xs text-text/60">
                Flexible containers with header, title, description, content, footer, and media
                slots.
              </p>
            </div>
            <Tag variant="primary">Card.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card Variant: Default */}
            <Card variant="default">
              <CardHeader
                action={
                  <Tag variant="primary" size="sm">
                    Default
                  </Tag>
                }
              >
                <CardTitle as="h4">Default Card</CardTitle>
                <CardDescription>Clean border and subtle shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text/70">
                  Standard container for widgets, forms, and general content panels.
                </p>
              </CardContent>
              <CardFooter bordered>
                <span className="text-[11px] text-text/50">Footer row</span>
                <Button size="sm" variant="secondary">
                  Action
                </Button>
              </CardFooter>
            </Card>

            {/* Card Variant: Interactive */}
            <Card
              variant="interactive"
              onClick={() => {
                const next = !bookmarked;
                setBookmarked(next);
                if (next) success("Card clicked & bookmarked!");
                else info("Bookmark removed");
              }}
            >
              <CardHeader
                action={
                  <Tag variant="teal" size="sm">
                    Interactive
                  </Tag>
                }
              >
                <CardTitle as="h4">Interactive Hover Card</CardTitle>
                <CardDescription>Lifts on hover and clicks with keyboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text/70">
                  Click this card to trigger action states. Supports keyboard Enter/Space.
                </p>
              </CardContent>
              <CardFooter bordered>
                <span className="text-xs font-semibold text-primary">
                  {bookmarked ? "★ Bookmarked" : "☆ Click to bookmark"}
                </span>
              </CardFooter>
            </Card>

            {/* Card Variant: Gradient */}
            <Card variant="gradient">
              <CardHeader
                action={
                  <Tag variant="primary" size="sm">
                    Gradient
                  </Tag>
                }
              >
                <CardTitle as="h4">Gradient Banner Card</CardTitle>
                <CardDescription>Primary color gradient wash</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-text/70">
                  Ideal for callouts, newsletter signups, and featured highlights.
                </p>
              </CardContent>
              <CardFooter bordered>
                <Button size="sm" variant="primary" fullWidth>
                  Explore Gradient
                </Button>
              </CardFooter>
            </Card>

            {/* In-Page Widget: About The Author */}
            <Card className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name="Ayomide Olayode" size="lg" status="online" />
                <div>
                  <h4 className="text-sm font-bold text-text">Ayomide Olayode</h4>
                  <p className="text-xs text-text/50">@ayomide • Fullstack</p>
                </div>
              </div>
              <p className="text-xs text-text/70">
                Writing about React 19, TypeScript architecture, and developer tooling.
              </p>
              <Button size="sm" variant="outline" fullWidth>
                Follow Author
              </Button>
            </Card>

            {/* In-Page Widget: Related Discussions */}
            <Card className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text/50">
                Related Discussions
              </h4>
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-text hover:text-primary cursor-pointer transition-colors">
                  • React 19 Compiler Architecture
                </p>
                <p className="font-semibold text-text hover:text-primary cursor-pointer transition-colors">
                  • Tailwind v4 Theme Engine
                </p>
                <p className="font-semibold text-text hover:text-primary cursor-pointer transition-colors">
                  • Strict TypeScript Best Practices
                </p>
              </div>
            </Card>

            {/* Twin Skeleton Card */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-text/60">Matching CardSkeleton Twin</span>
              <CardSkeleton hasAvatar lines={2} />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. MODAL COMPONENT                                                       */}
        {/* ========================================================================= */}
        <section
          id="modal"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">8. Modal (Dialogs)</h2>
              <p className="text-xs text-text/60">
                Focus trap, Escape key closing, React Portal, body scroll lock, and sizes.
              </p>
            </div>
            <Tag variant="primary">Modal.tsx</Tag>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-text/70">Size Selector:</span>
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

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="danger"
                onClick={() => {
                  setModalType("delete");
                  setModalOpen(true);
                }}
              >
                Open Delete Modal
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setModalType("publish");
                  setModalOpen(true);
                }}
              >
                Open Publish Modal
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setModalType("report");
                  setModalOpen(true);
                }}
              >
                Open Report Modal
              </Button>
            </div>
          </div>

          {/* Active Modal */}
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            size={modalSize}
            title={
              modalType === "delete"
                ? "Delete Article"
                : modalType === "publish"
                  ? "Publish Article to Feed"
                  : "Report Inappropriate Content"
            }
            description={
              modalType === "delete"
                ? "Are you sure you want to delete this article? This action cannot be undone."
                : modalType === "publish"
                  ? "Configure your article distribution before publishing live."
                  : "Help keep DevSpace safe and constructive for all developers."
            }
            footer={
              <>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant={modalType === "delete" ? "danger" : "primary"}
                  onClick={() => {
                    setModalOpen(false);
                    if (modalType === "delete")
                      error("Article Deleted", { description: "Permanently removed." });
                    else if (modalType === "publish")
                      success("Article Published!", { description: "Live on feeds." });
                    else warning("Report submitted for review");
                  }}
                >
                  {modalType === "delete"
                    ? "Delete Permanently"
                    : modalType === "publish"
                      ? "Publish Now"
                      : "Submit Report"}
                </Button>
              </>
            }
          >
            {modalType === "delete" ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                ⚠️ All associated comments, bookmarks, and read metrics will also be deleted.
              </div>
            ) : modalType === "publish" ? (
              <div className="space-y-3">
                <Input label="Canonical URL (Optional)" placeholder="https://..." />
                <Select
                  label="Community Topic"
                  options={[
                    { label: "#react (React & Next.js)", value: "react" },
                    { label: "#typescript (TypeScript)", value: "ts" },
                    { label: "#devops (DevOps & Cloud)", value: "devops" },
                  ]}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <Select
                  label="Reason"
                  options={[
                    { label: "Spam or promotional", value: "spam" },
                    { label: "Harassment or offensive", value: "harassment" },
                    { label: "Misleading info", value: "misleading" },
                  ]}
                />
                <Textarea label="Details" placeholder="Context for moderators..." rows={3} />
              </div>
            )}
          </Modal>
        </section>

        {/* ========================================================================= */}
        {/* 9. TABS COMPONENT                                                        */}
        {/* ========================================================================= */}
        <section
          id="tabs"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">9. Tabs</h2>
              <p className="text-xs text-text/60">
                Accessible in-page view switchers with Line, Pills, and Enclosed variants.
              </p>
            </div>
            <Tag variant="primary">Tabs.tsx</Tag>
          </div>

          {/* Line Variant */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              1. Line Variant (Underline Indicator)
            </h3>
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <Tabs
                defaultValue="articles"
                variant="line"
                items={[
                  {
                    id: "articles",
                    label: "Articles",
                    count: 14,
                    content: (
                      <p className="py-3 text-xs text-text/70">
                        Showing 14 published technical articles.
                      </p>
                    ),
                  },
                  {
                    id: "resources",
                    label: "Resources",
                    count: 6,
                    content: (
                      <p className="py-3 text-xs text-text/70">
                        Showing 6 shared boilerplates and templates.
                      </p>
                    ),
                  },
                  {
                    id: "activity",
                    label: "Activity",
                    content: (
                      <p className="py-3 text-xs text-text/70">
                        Recent community replies and reviews.
                      </p>
                    ),
                  },
                  {
                    id: "about",
                    label: "About",
                    content: (
                      <p className="py-3 text-xs text-text/70">
                        Full biography and verified developer badges.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          {/* Pills Variant */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50">
              2. Pills Variant
            </h3>
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <Tabs
                defaultValue="foryou"
                variant="pills"
                items={[
                  {
                    id: "foryou",
                    label: "For You",
                    content: (
                      <p className="py-3 text-xs text-text/70">Personalized algorithmic feed.</p>
                    ),
                  },
                  {
                    id: "following",
                    label: "Following",
                    count: 8,
                    content: (
                      <p className="py-3 text-xs text-text/70">Posts from developers you follow.</p>
                    ),
                  },
                  {
                    id: "latest",
                    label: "Latest",
                    content: (
                      <p className="py-3 text-xs text-text/70">
                        Chronological feed of new submissions.
                      </p>
                    ),
                  },
                  {
                    id: "trending",
                    label: "Trending",
                    content: (
                      <p className="py-3 text-xs text-text/70">
                        Top discussions from the last 24h.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. TOAST COMPONENT                                                      */}
        {/* ========================================================================= */}
        <section
          id="toast"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">10. Toast (Notifications)</h2>
              <p className="text-xs text-text/60">
                Success, Error, Warning, Info feedback toasts with action triggers and auto-dismiss.
              </p>
            </div>
            <Tag variant="primary">Toast.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="primary"
              onClick={() =>
                success("Article Published!", {
                  description: "Your post is now trending on DevSpace.",
                  action: { label: "View Post", onClick: () => info("Opening article view...") },
                })
              }
            >
              🎉 Trigger Success
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                info("Draft Saved", {
                  description: "Changes automatically saved to local cloud.",
                })
              }
            >
              💾 Trigger Info
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                warning("Unpublished Article", {
                  description: "Article moved to your draft queue.",
                })
              }
            >
              ⚠️ Trigger Warning
            </Button>

            <Button
              variant="danger"
              onClick={() =>
                error("Article Deleted", {
                  description: "The post was permanently deleted.",
                  action: { label: "Undo", onClick: () => success("Article restored!") },
                })
              }
            >
              🗑️ Trigger Error with Undo
            </Button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 11. SKELETON COMPONENT                                                   */}
        {/* ========================================================================= */}
        <section
          id="skeleton"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">11. Skeleton (Loading Placeholders)</h2>
              <p className="text-xs text-text/60">
                Pulse animation shapes (circular, text, rounded, rectangular) and multi-line
                paragraph counts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                isLoading={isSimulatingSkeleton}
                onClick={handleSimulateLoad}
              >
                Simulate 2s Load
              </Button>
              <Tag variant="primary">Skeleton.tsx</Tag>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shapes */}
            <div className="p-4 bg-background/50 rounded-lg border border-border space-y-3">
              <span className="text-xs font-semibold text-text/60">Individual Shapes</span>
              <div className="space-y-3 bg-white p-3 rounded-md border border-border">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" width={28} height={28} />
                  <Skeleton variant="circular" width={36} height={36} />
                  <Skeleton variant="circular" width={44} height={44} />
                </div>
                <Skeleton variant="text" width="90%" height={16} />
                <Skeleton variant="rounded" height={32} className="rounded-md" />
              </div>
            </div>

            {/* Paragraph Count */}
            <div className="p-4 bg-background/50 rounded-lg border border-border space-y-3">
              <span className="text-xs font-semibold text-text/60">
                Multi-line Paragraph (count=3)
              </span>
              <div className="bg-white p-3 rounded-md border border-border space-y-2">
                <Skeleton count={3} />
              </div>
            </div>

            {/* Live Swap Simulation */}
            <div className="p-4 bg-background/50 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text/60">Live Card Swap</span>
                <Tag size="sm" variant="outline">
                  {isSimulatingSkeleton ? "Loading..." : "Loaded"}
                </Tag>
              </div>

              {isSimulatingSkeleton ? (
                <CardSkeleton hasAvatar lines={2} />
              ) : (
                <div className="p-3 bg-white rounded-md border border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar name="Ayomide Olayode" size="sm" status="online" />
                    <span className="text-xs font-bold">Ayomide Olayode</span>
                  </div>
                  <h4 className="text-xs font-bold text-text">Fullstack React 19 Architecture</h4>
                  <p className="text-[11px] text-text/60">
                    Loaded content replaces the skeleton placeholder seamlessly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 12. EMPTYSTATE COMPONENT                                                 */}
        {/* ========================================================================= */}
        <section
          id="emptystate"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">12. EmptyState</h2>
              <p className="text-xs text-text/60">
                Zero-data views with illustrations, titles, descriptions, and CTA action buttons.
              </p>
            </div>
            <Tag variant="primary">EmptyState.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-border p-2">
              <EmptyState
                size="sm"
                bordered
                title="No Articles Published Yet"
                description="Share your technical knowledge and tutorials with the community."
                action={
                  <Button size="sm" variant="primary">
                    Write First Article
                  </Button>
                }
              />
            </div>

            <div className="bg-white rounded-lg border border-border p-2">
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
                title="No Search Results Found"
                description="Try checking for typos or searching for a broader technical topic."
                action={
                  <Button size="sm" variant="secondary">
                    Clear Search Filters
                  </Button>
                }
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 13. ERRORSTATE COMPONENT                                                 */}
        {/* ========================================================================= */}
        <section
          id="errorstate"
          className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text">13. ErrorState</h2>
              <p className="text-xs text-text/60">
                Resilient error handling views with retry triggers, alert semantics, and technical
                diagnostics.
              </p>
            </div>
            <Tag variant="primary">ErrorState.tsx</Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <ErrorState
                size="md"
                title="Failed to Load Community Feed"
                description="DevSpace encountered a network timeout while connecting to the API."
                error="HTTP 503 Service Unavailable: Connection to edge-cluster timed out after 5000ms."
                onRetry={() => success("Reconnected to API!")}
              />
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-border">
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
                title="Resource Not Found (404)"
                description="The article or profile you requested does not exist or has been deleted."
                action={<Button variant="secondary">Return to Home</Button>}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
