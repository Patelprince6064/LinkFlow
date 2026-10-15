import { cn } from "@/lib/utils";

/**
 * Marquee — Magic UI port for Vite + JSX (no TS).
 * Supports horizontal/vertical, reverse, pauseOnHover, repeat.
 * Duration controlled via `[--duration:20s]` class or `duration` prop.
 */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  duration = "40s",
  ...props
}) {
  return (
    <div
      {...props}
      style={{ "--duration": duration, ...props.style }}
      className={cn(
        "group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0}
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "animate-marquee-magic flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused]": pauseOnHover,
            "[animation-direction:reverse]": reverse,
          })}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export default Marquee;
