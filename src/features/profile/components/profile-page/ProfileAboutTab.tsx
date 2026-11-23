import type { JSX } from "react";
import { Button } from "@/shared/ui";
import { FiLink, FiGithub, FiTwitter, FiLinkedin, FiEdit2 } from "react-icons/fi";

interface ProfileAboutTabProps {
  displayName: string;
  bio: string;
  isOwnProfile: boolean;
  onEditProfile: () => void;
  website?: string;
  github?: string;
  twitter?: string;
  linkedInUrl?: string;
}

export function ProfileAboutTab({
  displayName,
  bio,
  isOwnProfile,
  onEditProfile,
  website,
  github,
  twitter,
  linkedInUrl,
}: ProfileAboutTabProps): JSX.Element {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-text mb-2">About {displayName}</h3>
          {bio ? (
            <p className="text-sm text-text/70 leading-relaxed max-w-3xl">{bio}</p>
          ) : (
            <p className="text-sm text-text/40 italic">No bio provided yet.</p>
          )}
        </div>

        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FiEdit2 className="w-3.5 h-3.5" />}
            onClick={onEditProfile}
            className="shrink-0"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {(website || github || twitter || linkedInUrl) && (
        <div className="border-t border-border/60 pt-4">
          <h4 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-2.5">Links</h4>
          <div className="flex flex-wrap gap-2">
            {website && (
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-blue-600 border border-border/60 hover:border-blue-300 transition-colors"
              >
                <FiLink className="w-3.5 h-3.5" />
                <span>Website</span>
              </a>
            )}
            {github && (
              <a
                href={github.startsWith("http") ? github : `https://${github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-text border border-border/60 hover:border-text/30 transition-colors"
              >
                <FiGithub className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}
            {twitter && (
              <a
                href={
                  twitter.startsWith("http") ? twitter : `https://x.com/${twitter.replace("@", "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-[#1DA1F2] border border-border/60 hover:border-sky-300 transition-colors"
              >
                <FiTwitter className="w-3.5 h-3.5" />
                <span>X (Twitter)</span>
              </a>
            )}
            {linkedInUrl && (
              <a
                href={linkedInUrl.startsWith("http") ? linkedInUrl : `https://${linkedInUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-[#0A66C2] border border-border/60 hover:border-blue-300 transition-colors"
              >
                <FiLinkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
