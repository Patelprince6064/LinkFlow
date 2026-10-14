import {
  BarChart3,
  Link2,
  Palette,
  QrCode,
  ShieldCheck,
  Zap,
  Link as LinkIcon,
} from "lucide-react";
import { OrbitingSkills } from "@/components/unlumen-ui/primitives/orbiting-skills";

// LinkHub-flavored items — same pattern as your snippet, but on-brand.
const ICON_SKILLS = [
  { label: "Short links", icon: <Link2 className="size-4" /> },
  { label: "QR codes", icon: <QrCode className="size-4" /> },
  { label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { label: "Bio pages", icon: <Palette className="size-4" /> },
  { label: "Instant 302s", icon: <Zap className="size-4" /> },
  { label: "Secure", icon: <ShieldCheck className="size-4" /> },
];

const TEXT_SKILLS = [
  { label: "Slugs" },
  { label: "QR" },
  { label: "Bio" },
  { label: "Clicks" },
  { label: "Referrers" },
  { label: "Devices" },
];

function Avatar({ children }) {
  return (
    <div className="flex size-20 items-center justify-center rounded-full border border-border bg-background shadow-md">
      {children}
    </div>
  );
}

export function OrbitingShowcase({
  radius = 96,
  duration = 18,
  showPath = true,
  followCursor = true,
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-20">
      {/* With Lucide icons */}
      <div className="flex flex-col items-center gap-4">
        <OrbitingSkills
          items={ICON_SKILLS}
          radius={radius}
          duration={duration}
          showPath={showPath}
          followCursor={followCursor}
        >
          <Avatar>
            <LinkIcon className="size-8 text-foreground/70" />
          </Avatar>
        </OrbitingSkills>
        <p className="text-xs text-muted-foreground">Everything orbits your links</p>
      </div>

      {/* Text only */}
      <div className="flex flex-col items-center gap-4">
        <OrbitingSkills
          items={TEXT_SKILLS}
          radius={radius}
          duration={duration}
          showPath={showPath}
          followCursor={followCursor}
        >
          <Avatar>
            <Palette className="size-8 text-foreground/70" />
          </Avatar>
        </OrbitingSkills>
        <p className="text-xs text-muted-foreground">Shorten · share · measure</p>
      </div>
    </div>
  );
}

export default OrbitingShowcase;
