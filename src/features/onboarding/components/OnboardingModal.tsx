import { useEffect, useRef, useState, type ChangeEvent, type JSX } from "react";
import { HiOutlineCamera, HiCheck } from "react-icons/hi2";
import { Modal, Button, Input, Textarea, Avatar } from "@/components/common";
import { getTags } from "@/features/articles/api/tagApi";
import { updateInterestedTags, updateProfile } from "@/features/onboarding/api/onboardingApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils/cn";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

type OnboardingStep = "tags" | "profile";

export function OnboardingModal({ open, onComplete }: OnboardingModalProps): JSX.Element {
  const currentUser = useAuthStore((state) => state.user);

  const [step, setStep] = useState<OnboardingStep>("tags");
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  const [bio, setBio] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;

    setIsLoadingTags(true);
    getTags({ pageSize: 24 })
      .then((tags) => {
        if (active) {
          setAvailableTags(
            tags
              .filter((t) => t.id)
              .map((t) => ({ id: t.id as string, name: t.name })),
          );
        }
      })
      .catch(() => {
        if (active) setAvailableTags([]);
      })
      .finally(() => {
        if (active) setIsLoadingTags(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return <></>;

  const toggleTag = (id: string): void => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const finishOnboarding = async (profileFields: Partial<{
    bio: string;
    xUrl: string;
    githubUrl: string;
    linkedInUrl: string;
    websiteUrl: string;
    avatar: File;
  }> = {}): Promise<void> => {
    setIsSubmitting(true);
    try {
      await updateInterestedTags(selectedTagIds);
      await updateProfile({ ...profileFields, isProfileCompleted: true });
      toast.success("Welcome to DevSpace!");
      onComplete();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Something went wrong finishing setup. You can update this later from your profile.",
        ),
      );
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsContinue = (): void => {
    setStep("profile");
  };

  const handleTagsSkip = async (): Promise<void> => {
    await finishOnboarding();
  };

  const handleProfileSubmit = async (): Promise<void> => {
    await finishOnboarding({
      bio: bio.trim() || undefined,
      xUrl: xUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      linkedInUrl: linkedInUrl.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      avatar: avatarFile ?? undefined,
    });
  };

  const handleProfileSkip = async (): Promise<void> => {
    await finishOnboarding();
  };

  return (
    <Modal open={open} onClose={() => {}} closeOnOverlayClick={false} closeOnEscape={false} size="lg" showCloseButton={false}>
      <div className="space-y-5">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className={cn("h-1.5 flex-1 rounded-full", step === "tags" ? "bg-primary" : "bg-primary/40")} />
          <div className={cn("h-1.5 flex-1 rounded-full", step === "profile" ? "bg-primary" : "bg-border")} />
        </div>

        {step === "tags" ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-text tracking-tight">
                What are you interested in?
              </h2>
              <p className="text-sm text-text/60">
                Pick a few topics so we can personalize your feed. You can change these anytime.
              </p>
            </div>

            {isLoadingTags ? (
              <div className="py-8 text-center text-sm text-text/50">Loading topics...</div>
            ) : availableTags.length === 0 ? (
              <div className="py-8 text-center text-sm text-text/50">No topics available right now.</div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto hover-scrollbar pr-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium transition-all duration-150 cursor-pointer border",
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-text/70 border-border hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      {isSelected && <HiCheck className="w-3.5 h-3.5" />}
                      <span>#{tag.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => void handleTagsSkip()} disabled={isSubmitting}>
                Skip for now
              </Button>
              <Button variant="primary" onClick={handleTagsContinue} disabled={isSubmitting}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-text tracking-tight">
                Tell us about yourself
              </h2>
              <p className="text-sm text-text/60">
                Add a photo, bio, and links so other developers can get to know you.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  size="xl"
                  name={currentUser?.firstName || currentUser?.username}
                  src={avatarPreview ?? currentUser?.avatarUrl ?? undefined}
                  href={false}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload avatar"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  <HiOutlineCamera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-xs text-text/50">
                Click the camera icon to upload a profile photo.
              </p>
            </div>

            <Textarea
              label="Bio"
              placeholder="Tell the community a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="X (Twitter)"
                placeholder="https://x.com/username"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
              />
              <Input
                label="GitHub"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <Input
                label="LinkedIn"
                placeholder="https://linkedin.com/in/username"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
              />
              <Input
                label="Website"
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => void handleProfileSkip()} disabled={isSubmitting}>
                Skip for now
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleProfileSubmit()}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Finish setup
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
