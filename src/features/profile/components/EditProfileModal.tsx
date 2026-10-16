import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type JSX } from "react";
import { HiOutlineCamera } from "react-icons/hi2";
import { Modal, Button, Input, Textarea, Avatar } from "@/components/common";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { useAuthStore } from "@/stores/useAuthStore";
import { updateProfile } from "@/features/onboarding/api/onboardingApi";
import { getProfileAvatar, getProfileLinks, type UserProfile } from "@/lib/api/user.api";

export interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onUpdated: (updated: UserProfile) => void;
}

export function EditProfileModal({
  open,
  onClose,
  profile,
  onUpdated,
}: EditProfileModalProps): JSX.Element | null {
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const links = getProfileLinks(profile);
    setFirstName((profile?.firstName as string | undefined) || "");
    setLastName((profile?.lastName as string | undefined) || "");
    setBio((profile?.bio as string | undefined) || "");
    setXUrl(links.xUrl || "");
    setGithubUrl(links.githubUrl || "");
    setLinkedInUrl(links.linkedInUrl || "");
    setWebsiteUrl(links.websiteUrl || "");
    setAvatarFile(null);
    setAvatarPreview(null);
  }, [open, profile]);

  if (!open) return null;

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        xUrl: xUrl.trim(),
        githubUrl: githubUrl.trim(),
        linkedInUrl: linkedInUrl.trim(),
        websiteUrl: websiteUrl.trim(),
        avatar: avatarFile ?? undefined,
      });

      setUser({
        id: currentUser?.id,
        email: currentUser?.email,
        username: currentUser?.username,
        userName: currentUser?.userName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatarUrl: getProfileAvatar(updated) ?? currentUser?.avatarUrl ?? null,
        role: currentUser?.role,
      });

      toast.success("Profile updated successfully");
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to update profile"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Edit Profile"
      description="Update your name, bio, links, and avatar."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              size="xl"
              name={firstName || currentUser?.username}
              src={avatarPreview ?? getProfileAvatar(profile) ?? undefined}
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
            Click the camera icon to change your profile photo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
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

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
