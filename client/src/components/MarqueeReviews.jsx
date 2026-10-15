import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

const reviews = [
  {
    name: "Maya R.",
    username: "@mayacreates",
    body: "Replaced two tools on day one. Vanity slugs for launches + the bio page for my profile.",
    initials: "MR",
  },
  {
    name: "Devon K.",
    username: "@devonbuilds",
    body: "QR codes that just track as clicks saves so much time at events. Print, scan, done.",
    initials: "DK",
  },
  {
    name: "Sofia L.",
    username: "@sofiagrows",
    body: "Timeline, referrers, devices — exactly what I need, nothing I don't.",
    initials: "SL",
  },
  {
    name: "Alex P.",
    username: "@alexpromos",
    body: "Custom slugs like /r/launch-2026 look so much better in ads than random strings.",
    initials: "AP",
  },
  {
    name: "Priya N.",
    username: "@priyashares",
    body: "Bio page went live in minutes. The live theme preview is genuinely delightful.",
    initials: "PN",
  },
  {
    name: "Tom H.",
    username: "@tomhosts",
    body: "Per-link analytics with 90-day ranges. Zero-filled charts mean no confusing gaps.",
    initials: "TH",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

function ReviewCard({ name, username, body, initials }) {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4 transition-colors",
        "border-border bg-card hover:bg-accent"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
        >
          {initials}
        </span>
        <div className="flex min-w-0 flex-col">
          <figcaption className="truncate text-sm font-medium text-foreground">
            {name}
          </figcaption>
          <p className="truncate text-xs font-medium text-muted-foreground">
            {username}
          </p>
        </div>
        <Star className="ml-auto h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
      </div>
      <blockquote className="mt-2 text-sm leading-6 text-muted-foreground">
        {body}
      </blockquote>
    </figure>
  );
}

export function MarqueeReviews() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover duration="30s" className="[--duration:30s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover duration="30s" className="[--duration:30s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}

// Keep the original Magic UI export name working too
export function MarqueeDemo() {
  return <MarqueeReviews />;
}

export default MarqueeReviews;
