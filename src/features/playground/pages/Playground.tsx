import type { JSX } from "react";
import { PlaygroundHeader } from "@/features/playground/sections/PlaygroundHeader";
import { ButtonSection } from "@/features/playground/sections/ButtonSection";
import { InputSection } from "@/features/playground/sections/InputSection";
import { TextareaSection } from "@/features/playground/sections/TextareaSection";
import { SelectSection } from "@/features/playground/sections/SelectSection";
import { AvatarSection } from "@/features/playground/sections/AvatarSection";
import { TagSection } from "@/features/playground/sections/TagSection";
import { CardSection } from "@/features/playground/sections/CardSection";
import { ModalSection } from "@/features/playground/sections/ModalSection";
import { TabsSection } from "@/features/playground/sections/TabsSection";
import { ToastSection } from "@/features/playground/sections/ToastSection";
import { SkeletonSection } from "@/features/playground/sections/SkeletonSection";
import { EmptyStateSection } from "@/features/playground/sections/EmptyStateSection";
import { ErrorStateSection } from "@/features/playground/sections/ErrorStateSection";

/** Living style guide: every shared UI component with its variants and states. */
export default function Playground(): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-text font-inter p-4 sm:p-6 md:p-10 space-y-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <PlaygroundHeader />

        <ButtonSection />
        <InputSection />
        <TextareaSection />
        <SelectSection />
        <AvatarSection />
        <TagSection />
        <CardSection />
        <ModalSection />
        <TabsSection />
        <ToastSection />
        <SkeletonSection />
        <EmptyStateSection />
        <ErrorStateSection />
      </div>
    </div>
  );
}
