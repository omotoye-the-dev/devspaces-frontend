import type { JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiHome, HiArrowLeft, HiOutlineBookOpen, HiOutlineDocumentText } from "react-icons/hi2";
import { MdOutlineSearch } from "react-icons/md";
import { Button } from "@/components/common";

export function NotFoundPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12 font-inter select-none">
      {/* 404 Visual Graphic / Badge */}
      <div className="relative mb-6">
        <div className="text-8xl sm:text-9xl font-extrabold font-mono text-primary/10 tracking-widest select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-xs flex items-center gap-2">
            <span className="font-mono font-bold text-primary text-sm sm:text-base">
              &lt;Error status={404} /&gt;
            </span>
          </div>
        </div>
      </div>

      {/* Title and Description */}
      <h1 className="text-2xl sm:text-4xl font-bold text-text tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-sm sm:text-base text-text/60 max-w-md mx-auto mb-8 leading-relaxed">
        Oops! The page you're looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <Button
          variant="primary"
          size="md"
          leftIcon={<HiHome className="w-4 h-4" />}
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
        <Button
          variant="secondary"
          size="md"
          leftIcon={<HiArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>

      {/* Quick Links Container */}
      <div className="w-full max-w-md bg-white border border-border rounded-xl p-5 text-left shadow-xs">
        <h2 className="text-xs font-bold text-text/40 uppercase tracking-wider mb-3">
          Popular Destinations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text/80 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <HiHome className="w-4 h-4 text-text/40" />
            <span>Home Feed</span>
          </Link>
          <Link
            to="/articles"
            className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text/80 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <HiOutlineDocumentText className="w-4 h-4 text-text/40" />
            <span>Articles</span>
          </Link>
          <Link
            to="/resources"
            className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text/80 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <HiOutlineBookOpen className="w-4 h-4 text-text/40" />
            <span>Resources</span>
          </Link>
          <Link
            to="/playground"
            className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-text/80 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <MdOutlineSearch className="w-4 h-4 text-text/40" />
            <span>Playground</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
