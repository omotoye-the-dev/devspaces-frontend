import type { JSX } from "react";
import { HiOutlineFire } from "react-icons/hi2";
import { LuFileText, LuMessageSquare, LuPackage } from "react-icons/lu";
import type { TrendingFilter } from "@/features/home/types";

export const PAGE_SIZE = 10;
export const TRENDING_FILTERS: { label: TrendingFilter; icon: JSX.Element }[] = [
  { label: "All", icon: <HiOutlineFire className="w-3.5 h-3.5" /> },
  { label: "Posts", icon: <LuFileText className="w-3.5 h-3.5" /> },
  { label: "Discussions", icon: <LuMessageSquare className="w-3.5 h-3.5" /> },
  { label: "Resources", icon: <LuPackage className="w-3.5 h-3.5" /> },
];
