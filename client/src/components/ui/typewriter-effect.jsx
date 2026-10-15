import { cn } from "@/lib/utils";

/**
 * TypewriterEffectSmooth — Vite-compatible port of the Aceternity
 * `../ui/typewriter-effect` component. Zero animation deps
 * (the original uses motion/react; this uses CSS stagger + rAF-free).
 *
 * @param {{ text: string; className?: string }[]} words
 */
export function TypewriterEffectSmooth({ words, className, cursorClassName }) {
  const fullText = (words ?? []).map((w) => w.text).join(" ");
  let charIndex = 0;
  const STAGGER = 0.055; // seconds per character

  const renderWords = () =>
    (words ?? []).map((word, wi) => (
      <span key={`word-${wi}`} className="inline-block whitespace-pre">
        {word.text.split("").map((char) => {
          const delay = charIndex * STAGGER;
          charIndex += 1;
          return (
            <span
              key={`char-${charIndex}`}
              aria-hidden
              style={{ animationDelay: `${delay.toFixed(3)}s` }}
              className={cn("type-char inline-block", word.className)}
            >
              {char}
            </span>
          );
        })}
        {/* word separator (no animation, keeps wrapping natural) */}
        {wi < words.length - 1 ? <span aria-hidden> </span> : null}
      </span>
    ));

  return (
    <span
      role="heading"
      aria-level={2}
      aria-label={fullText}
      className={cn("inline", className)}
    >
      {renderWords()}
      <span
        aria-hidden
        style={{ animationDelay: `${(charIndex * STAGGER + 0.15).toFixed(3)}s` }}
        className={cn("type-cursor", cursorClassName)}
      />
    </span>
  );
}

export default TypewriterEffectSmooth;
