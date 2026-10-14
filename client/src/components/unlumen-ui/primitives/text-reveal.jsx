import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Blur-driven text reveal — viewport-triggered, zero-config.
 * No external animation deps: IntersectionObserver + CSS transitions.
 *
 * @param {string} text - full string to reveal
 * @param {string} as - element tag (h1, h2, h3, p, span, div)
 * @param {"words"|"characters"} splitBy
 * @param {number} staggerDelay - seconds between units
 * @param {number} duration - seconds per unit transition
 * @param {boolean} once - if true, animate only first entry
 */
export function TextReveal({
  text,
  as = "p",
  splitBy = "words",
  staggerDelay = 0.05,
  duration = 0.5,
  once = true,
  className,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const units = useMemo(() => {
    if (!text) return [];
    if (splitBy === "characters") return Array.from(text);
    return text.split(/(\s+)/);
  }, [text, splitBy]);

  let wordIndex = -1;
  let charIndex = -1;

  const Tag = as || "p";

  return (
    <Tag ref={ref} className={cn(className)} aria-label={text} {...rest}>
      {units.map((unit, i) => {
        // Preserve whitespace in word mode without animating it
        if (splitBy === "words" && /^\s+$/.test(unit)) {
          return <span key={i}>{unit}</span>;
        }
        if (splitBy === "words") wordIndex += 1;
        else charIndex += 1;

        const order = splitBy === "words" ? wordIndex : charIndex;
        const isSpaceChar = splitBy === "characters" && unit === " ";

        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              display: isSpaceChar ? "inline" : "inline-block",
              whiteSpace: isSpaceChar ? "pre" : undefined,
              opacity: visible ? 1 : 0,
              filter: visible ? "blur(0px)" : "blur(8px)",
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transitionProperty: "opacity, filter, transform",
              transitionDuration: `${duration}s`,
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              transitionDelay: `${order * staggerDelay}s`,
              willChange: "opacity, filter, transform",
            }}
          >
            {isSpaceChar ? "\u00A0" : unit}
          </span>
        );
      })}
    </Tag>
  );
}

export default TextReveal;
