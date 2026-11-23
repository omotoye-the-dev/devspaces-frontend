import { type JSX } from "react";
import { Button, Tag, ErrorState, useToast } from "@/shared/ui";

export function ErrorStateSection(): JSX.Element {
  const { success } = useToast();

  return (
    <>
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
    </>
  );
}
