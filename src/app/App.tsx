import type { JSX } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Button, Tag, ToastProvider } from "@/components/ui";
import Playground from "@/pages/Playground";

function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-background text-text font-inter flex flex-col justify-between p-6 sm:p-10 md:p-16">
      {/* Top navigation bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl shadow-xs">
            D
          </span>
          <span className="font-extrabold text-xl tracking-tight text-text">DevSpace</span>
        </div>

        <div className="flex items-center gap-3">
          <Tag variant="primary" dot>
            v1.3.0
          </Tag>
          <Link to="/playground">
            <Button size="sm" variant="outline">
              UI Components
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto w-full text-center space-y-6 py-16 sm:py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>The Modern Developer Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-text leading-tight">
          DevSpace
        </h1>

        <p className="text-base sm:text-xl text-text/70 max-w-2xl mx-auto leading-relaxed">
          The collaborative ecosystem for developers to write insightful articles, discover curated
          engineering resources, and showcase projects.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/playground">
            <Button
              size="lg"
              variant="primary"
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
              UI Component System
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text/50 gap-4">
        <p>© {new Date().getFullYear()} DevSpace Platform. Built with React 19 & Tailwind CSS.</p>
        <div className="flex items-center gap-4">
          <Link to="/playground" className="hover:text-primary transition-colors">
            Component Playground
          </Link>
        </div>
      </footer>
    </main>
  );
}

export default function App(): JSX.Element {
  return (
    <ToastProvider position="bottom-right">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/playground" element={<Playground />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
