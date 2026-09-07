import {
  BUTTON_FACEBOOK,
  BUTTON_INSTAGRAM,
  BUTTON_TELEGRAM,
} from "@/lib/telegram";

/**
 * Button's real social channels, as circular icon buttons.
 *
 * Only the three Button actually runs. Adding placeholder icons for networks
 * they are not on would be an obvious tell that nobody maintains the site —
 * and Telegram matters more here than anywhere else, because it is where the
 * orders already happen (CLAUDE.md §3).
 */

const CHANNELS = [
  {
    name: "Instagram",
    href: `https://instagram.com/${BUTTON_INSTAGRAM}`,
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    name: "Telegram",
    href: `https://t.me/${BUTTON_TELEGRAM}`,
    path: <path d="M21 4.5 2.8 11.3c-.7.3-.7.9 0 1.1l4.6 1.4 1.7 5.2c.2.6.6.7 1 .3l2.5-2.3 4.7 3.5c.6.4 1 .2 1.2-.5L22.3 5.3c.2-.8-.3-1.1-1.3-.8Z" />,
  },
  {
    name: "Facebook",
    href: `https://facebook.com/${BUTTON_FACEBOOK}`,
    path: <path d="M14 9V7.2c0-.8.3-1.2 1.3-1.2H17V3h-2.6C11.8 3 11 4.4 11 6.8V9H9v3h2v9h3v-9h2.3l.4-3H14Z" />,
  },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {CHANNELS.map((channel) => (
        <li key={channel.name}>
          <a
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={channel.name}
            title={channel.name}
            className="flex size-10 items-center justify-center rounded-full border border-border text-fg transition-colors hover:border-brand hover:bg-brand hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[18px]"
              aria-hidden="true"
            >
              {channel.path}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
