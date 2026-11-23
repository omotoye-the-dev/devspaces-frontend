import { useState, type JSX } from "react";
import {
  Button,
  Avatar,
  Tag,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSkeleton,
  useToast,
} from "@/shared/ui";

export function CardSection(): JSX.Element {
  const { success, info } = useToast();

  const [bookmarked, setBookmarked] = useState(false);
  return (
    <>
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
              Flexible containers with header, title, description, content, footer, and media slots.
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
    </>
  );
}
