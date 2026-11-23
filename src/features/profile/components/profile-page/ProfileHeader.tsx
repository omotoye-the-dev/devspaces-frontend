import type { JSX } from "react";
import { Avatar, Button } from "@/shared/ui";
import {
  FiMapPin,
  FiLink,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiShare2,
  FiMail,
  FiUsers,
  FiUserPlus,
  FiFileText,
  FiBookOpen,
  FiCheck,
} from "react-icons/fi";

interface ProfileHeaderProps {
  avatarUrl?: string;
  displayName: string;
  username?: string;
  bio: string;
  location: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedInUrl?: string;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isFollowLoading: boolean;
  onFollowToggle: () => void;
  onShare: () => void;
  onMessage: () => void;
  followersCount: number;
  followingCount: number;
  articlesCount: number;
  resourcesCount: number;
}

/** Banner, avatar, bio, social links, actions and the 2x2 stats grid. */
export function ProfileHeader({
  avatarUrl,
  displayName,
  username,
  bio,
  location,
  website,
  github,
  twitter,
  linkedInUrl,
  isOwnProfile,
  isFollowing,
  isFollowLoading,
  onFollowToggle,
  onShare,
  onMessage,
  followersCount,
  followingCount,
  articlesCount,
  resourcesCount,
}: ProfileHeaderProps): JSX.Element {
  return (
    <section className="relative bg-white border border-border/70 rounded-2xl md:rounded-3xl shadow-xs overflow-hidden">
      {/* Soft atmospheric gradient banner */}
      <div className="h-28 sm:h-32 bg-linear-to-r from-blue-100/60 via-purple-100/40 to-indigo-100/30" />

      <div className="px-6 pb-6 sm:px-8 sm:pb-8 -mt-14 sm:-mt-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
            {/* Shared Avatar Component with 2xl size & status dot */}
            <Avatar
              src={avatarUrl}
              alt={displayName}
              name={displayName}
              size="2xl"
              status="online"
              href={false}
              className="ring-4 ring-white shadow-md shrink-0"
            />

            {/* User Identity & Info */}
            <div className="space-y-2 flex-1 min-w-0">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                    {displayName}
                  </h1>
                </div>
                {username && (
                  <p className="text-xs sm:text-sm font-medium text-text/50">@{username}</p>
                )}
              </div>

              {bio && (
                <p className="text-xs sm:text-sm text-text/80 leading-relaxed max-w-2xl">{bio}</p>
              )}

              {/* Social & Meta Links */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text/60 pt-0.5">
                {location && (
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-3.5 h-3.5 text-text/40 shrink-0" />
                    <span>{location}</span>
                  </span>
                )}

                {website && (
                  <>
                    {location && <span className="text-border/80 hidden sm:inline">|</span>}
                    <a
                      href={`https://${website.replace(/^https?:\/\//, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                    >
                      <FiLink className="w-3.5 h-3.5 shrink-0" />
                      <span>{website}</span>
                    </a>
                  </>
                )}

                {github && (
                  <>
                    {(location || website) && (
                      <span className="text-border/80 hidden sm:inline">|</span>
                    )}
                    <a
                      href={`https://${github.replace(/^https?:\/\//, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-text/70 hover:text-text font-medium"
                    >
                      <FiGithub className="w-3.5 h-3.5 shrink-0" />
                      <span>{github}</span>
                    </a>
                  </>
                )}

                {twitter && (
                  <>
                    {(location || website || github) && (
                      <span className="text-border/80 hidden sm:inline">|</span>
                    )}
                    <a
                      href={
                        twitter.startsWith("http")
                          ? twitter
                          : `https://x.com/${twitter.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#1DA1F2] hover:underline font-medium"
                    >
                      <FiTwitter className="w-3.5 h-3.5 shrink-0" />
                      <span>{twitter}</span>
                    </a>
                  </>
                )}

                {linkedInUrl && (
                  <>
                    {(location || website || github || twitter) && (
                      <span className="text-border/80 hidden sm:inline">|</span>
                    )}
                    <a
                      href={linkedInUrl.startsWith("http") ? linkedInUrl : `https://${linkedInUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#0A66C2] hover:underline font-medium"
                    >
                      <FiLinkedin className="w-3.5 h-3.5 shrink-0" />
                      <span>LinkedIn</span>
                    </a>
                  </>
                )}
              </div>

              {/* Action Buttons using shared Button component */}
              <div className="flex items-center gap-2.5 pt-2">
                {!isOwnProfile && (
                  <Button
                    variant={isFollowing ? "secondary" : "primary"}
                    size="sm"
                    isLoading={isFollowLoading}
                    onClick={onFollowToggle}
                    leftIcon={
                      isFollowing ? (
                        <FiCheck className="w-4 h-4" />
                      ) : (
                        <FiUserPlus className="w-4 h-4" />
                      )
                    }
                    className="rounded-xl px-5 h-9 font-semibold"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}

                {isOwnProfile && (
                  <Button
                    href="/articles/new"
                    variant="primary"
                    size="sm"
                    className="rounded-xl px-5 h-9 font-semibold"
                  >
                    Write Article
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onShare}
                  aria-label="Share profile"
                  title="Share profile"
                  className="h-9 w-9 p-0 rounded-xl"
                >
                  <FiShare2 className="w-4 h-4" />
                </Button>

                {!isOwnProfile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onMessage}
                    aria-label="Send message"
                    title="Send message"
                    className="h-9 w-9 p-0 rounded-xl"
                  >
                    <FiMail className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right: 2x2 Stats Grid */}
          <div className="lg:pl-8 lg:border-border/60 shrink-0 w-full sm:w-auto">
            <div className="grid grid-cols-2 divide-x divide-y shadow-2xl divide-border/60  rounded-2xl bg-white/80 overflow-hidden text-center min-w-60 sm:min-w-67.5">
              {/* Followers */}
              <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1">
                <FiUsers className="w-4.5 h-4.5 text-text/40" />
                <span className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                  {followersCount}
                </span>
                <span className="text-[11px] font-medium text-text/50">Followers</span>
              </div>

              {/* Following */}
              <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1">
                <FiUserPlus className="w-4.5 h-4.5 text-text/40" />
                <span className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                  {followingCount}
                </span>
                <span className="text-[11px] font-medium text-text/50">Following</span>
              </div>

              {/* Articles */}
              <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1">
                <FiFileText className="w-4.5 h-4.5 text-text/40" />
                <span className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                  {articlesCount}
                </span>
                <span className="text-[11px] font-medium text-text/50">Articles</span>
              </div>

              {/* Resources */}
              <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1">
                <FiBookOpen className="w-4.5 h-4.5 text-text/40" />
                <span className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                  {resourcesCount}
                </span>
                <span className="text-[11px] font-medium text-text/50">Resources</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
