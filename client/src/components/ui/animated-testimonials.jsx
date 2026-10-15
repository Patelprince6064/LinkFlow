import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AnimatedTestimonials — Vite-compatible port of the Aceternity
 * `animated-testimonials` component. Zero animation deps
 * (the original uses motion/react; this uses CSS transitions).
 *
 * @param {{ quote: string; name: string; role: string; src?: string }[]} testimonials
 * @param {boolean} autoplay - auto-advance (pauses on hover, off for reduced-motion)
 */
export function AnimatedTestimonials({
  testimonials = [],
  autoplay = true,
  autoplayDelay = 5000,
  className,
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const go = useCallback(
    (dir) => setActive((p) => (p + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (!autoplay || paused || count < 2) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => setActive((p) => (p + 1) % count), autoplayDelay);
    return () => clearInterval(id);
  }, [autoplay, autoplayDelay, count, paused, active]);

  if (count === 0) return null;
  const current = testimonials[active];

  const initials = (name) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .replace(".", "")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div
      className={cn("mx-auto w-full max-w-4xl", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
        {/* Avatar stack */}
        <div className="relative mx-auto h-60 w-60 sm:h-72 sm:w-72">
          {testimonials.map((t, i) => {
            const offset = (i - active + count) % count;
            const isFront = offset === 0;
            return (
              <div
                key={t.name}
                aria-hidden={!isFront}
                className="absolute inset-0 transition-all duration-500 ease-out"
                style={{
                  opacity: isFront ? 1 : Math.max(0, 0.45 - offset * 0.18),
                  transform: `scale(${isFront ? 1 : 0.9 - offset * 0.03}) translateY(${offset * 16}px) rotate(${isFront ? 0 : i % 2 === 0 ? -7 : 7}deg)`,
                  zIndex: count - offset,
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-3xl border border-border bg-gradient-to-br from-primary via-primary/80 to-primary/50 shadow-xl shadow-black/10">
                  <span className="text-6xl font-bold tracking-tight text-primary-foreground sm:text-7xl">
                    {initials(t.name)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quote */}
        <div className="flex min-h-[15rem] flex-col justify-between text-center md:text-left">
          <div key={active}>
            <div
              className="animate-fade-up flex justify-center gap-1 md:justify-start"
              aria-label="5 out of 5 stars"
            >
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="mt-4 text-base leading-7 text-foreground sm:text-lg">
              {current.quote.split(" ").map((word, i) => (
                <span key={`${active}-${i}`}>
                  <span
                    aria-hidden
                    className="animate-fade-up inline-block"
                    style={{ animationDelay: `${0.1 + i * 0.025}s` }}
                  >
                    {word}
                  </span>{" "}
                </span>
              ))}
              <span className="sr-only">{current.quote}</span>
            </blockquote>
            <p
              className="animate-fade-up mt-5 text-sm"
              style={{ animationDelay: "0.35s" }}
            >
              <span className="font-semibold text-foreground">{current.name}</span>
              <span className="text-muted-foreground"> · {current.role}</span>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 md:justify-start">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Testimonials">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Show testimonial from ${t.name}`}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === active ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimatedTestimonials;
