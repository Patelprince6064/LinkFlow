import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";

/**
 * TypewriterEffectSmoothDemo — the Aceternity sample, adapted for LinkHub:
 * - No "use client" (Vite + React, not Next.js)
 * - Words rewritten for the final CTA ("Claim your short links today.")
 * - Buttons kept as the existing LinkHub register/login Links so the
 *   dark-panel CTA in the screenshot keeps working + routing intact.
 */
export function TypewriterEffectSmoothDemo() {
  const words = [
    { text: "Claim" },
    { text: "your" },
    { text: "short" },
    { text: "links" },
    { text: "today.", className: "text-sky-300" },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center text-center">
      <p className="relative text-xs text-primary-foreground/70 sm:text-sm">
        Free to start · no credit card · live in two minutes
      </p>
      <TypewriterEffectSmooth
        words={words}
        className="relative mt-3 block text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl"
      />
      <p className="relative mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
        Register, verify your email, and create your first branded link and bio page in
        under two minutes.
      </p>
      <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/register"
          className="btn-arrow inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-background px-7 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
        >
          Get started for free <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-primary-foreground/25 px-7 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/10 sm:w-auto"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

export default TypewriterEffectSmoothDemo;
