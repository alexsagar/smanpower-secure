import type { SVGProps } from "react";

type SocialBrandIconProps = SVGProps<SVGSVGElement> & {
  platform: string;
};

function BaseIcon({
  platform,
  children,
  ...props
}: SVGProps<SVGSVGElement> & { platform: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-brand-icon={platform}
      {...props}
    >
      {children}
    </svg>
  );
}

export function isKnownSocialPlatform(platform: string) {
  switch (platform.toLowerCase()) {
    case "linkedin":
    case "facebook":
    case "instagram":
    case "x":
    case "twitter":
    case "youtube":
    case "tiktok":
      return true;
    default:
      return false;
  }
}

export function SocialBrandIcon({ platform, ...props }: SocialBrandIconProps) {
  switch (platform.toLowerCase()) {
    case "linkedin":
      return (
        <BaseIcon platform="linkedin" {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <path d="M8 10v6" />
          <circle cx="8" cy="8" r="0.8" fill="currentColor" stroke="none" />
          <path d="M12 16v-3.2a1.8 1.8 0 1 1 3.6 0V16" />
          <path d="M12 13a2.6 2.6 0 0 1 2.6-2.6" />
        </BaseIcon>
      );
    case "facebook":
      return (
        <BaseIcon platform="facebook" {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <path d="M13.5 20v-6.5" />
          <path d="M11 10.5h5" />
          <path d="M13.5 10.5V8.8a1.8 1.8 0 0 1 1.8-1.8H17" />
        </BaseIcon>
      );
    case "instagram":
      return (
        <BaseIcon platform="instagram" {...props}>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="16.8" cy="7.2" r="0.8" fill="currentColor" stroke="none" />
        </BaseIcon>
      );
    case "x":
      return (
        <BaseIcon platform="x" {...props}>
          <path d="M5 5l14 14" />
          <path d="M19 5L9.5 15.5" />
          <path d="M14.5 5L5 19" />
        </BaseIcon>
      );
    case "twitter":
      return (
        <BaseIcon platform="twitter" {...props}>
          <path d="M20 7.5c-.6.3-1.2.5-1.9.6.7-.4 1.2-1 1.4-1.8-.7.4-1.4.7-2.1.9A3.1 3.1 0 0 0 12 10.4c0 .2 0 .5.1.7-2.6-.1-4.9-1.4-6.4-3.4-.3.5-.4 1-.4 1.6 0 1.1.6 2.1 1.5 2.7-.5 0-1-.2-1.4-.4 0 1.6 1.1 2.9 2.6 3.2-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.7 2.2 3.2 2.2A6.3 6.3 0 0 1 5 18.3a8.9 8.9 0 0 0 4.8 1.4c5.8 0 9-4.8 9-9v-.4c.6-.4 1.1-1 1.5-1.8Z" />
        </BaseIcon>
      );
    case "youtube":
      return (
        <BaseIcon platform="youtube" {...props}>
          <path d="M20 9.4a2.3 2.3 0 0 0-1.6-1.6C17 7.4 12 7.4 12 7.4s-5 0-6.4.4A2.3 2.3 0 0 0 4 9.4 24.8 24.8 0 0 0 3.6 12c0 .9.1 1.8.4 2.6a2.3 2.3 0 0 0 1.6 1.6c1.4.4 6.4.4 6.4.4s5 0 6.4-.4a2.3 2.3 0 0 0 1.6-1.6c.3-.8.4-1.7.4-2.6 0-.9-.1-1.8-.4-2.6Z" />
          <path d="m10 9.8 4.7 2.2L10 14.2Z" fill="currentColor" stroke="none" />
        </BaseIcon>
      );
    case "tiktok":
      return (
        <BaseIcon platform="tiktok" {...props}>
          <path d="M14 6.2c.6 1.7 1.9 2.9 3.8 3.3" />
          <path d="M14 6v8.1a3.1 3.1 0 1 1-2.2-3" />
          <path d="M14 9.2c1.2.9 2.5 1.4 4 1.5" />
        </BaseIcon>
      );
    default:
      return null;
  }
}
