import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function inferDecimals(value) {
  if (!Number.isFinite(value)) return 0;
  const s = String(value);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

function formatValue(value, decimals, separator) {
  const fixed = Number(value).toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const sign = intPart.startsWith("-") ? "-" : "";
  const digits = sign ? intPart.slice(1) : intPart;
  const grouped = separator
    ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : digits;
  return decPart !== undefined ? `${sign}${grouped}.${decPart}` : `${sign}${grouped}`;
}

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * CountUp — viewport-triggered animated number. Zero deps.
 * JSX port (no TS, Vite-friendly).
 *
 * @param {number} to - end value
 * @param {number} [from=0] - start value
 * @param {"up"|"down"} [direction="up"] - kept for API compat; animation always runs from -> to
 * @param {number} [duration=2] - seconds
 * @param {string} [separator=","] - thousands separator ("" to disable)
 * @param {number} [decimals] - decimal places (defaults to decimals in `to`)
 * @param {"none"|"slide"|"roll"|"blur"} [digitEffect="none"] - per-digit tick animation
 */
export function CountUp({
  to,
  from = 0,
  direction = "up",
  duration = 2,
  separator = ",",
  decimals,
  digitEffect = "none",
  className,
  ...rest
}) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const [inView, setInView] = useState(false);
  const [display, setDisplay] = useState(from ?? 0);

  const decimalsCount = decimals ?? inferDecimals(to);
  void direction;

  // Trigger once when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(to);
      setInView(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  // Animate from -> to
  useEffect(() => {
    if (!inView) return;
    const start = from ?? 0;
    const end = to;
    if (duration <= 0 || start === end) {
      setDisplay(end);
      return;
    }
    let startTs = null;
    const step = (ts) => {
      if (startTs === null) startTs = ts;
      const t = Math.min((ts - startTs) / (duration * 1000), 1);
      const eased = easeOutExpo(t);
      setDisplay(start + (end - start) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else setDisplay(end);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, from, to, duration]);

  const formatted = formatValue(display, decimalsCount, separator);
  const animated = digitEffect !== "none";

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      aria-label={formatValue(to, decimalsCount, separator)}
      {...rest}
    >
      {animated ? (
        <span aria-hidden="true">
          {formatted.split("").map((ch, i) =>
            /\d/.test(ch) ? (
              <span
                key={`${i}-${ch}`}
                className={cn(
                  "inline-block",
                  digitEffect === "blur" ? "digit-blur" : "digit-slide"
                )}
              >
                {ch}
              </span>
            ) : (
              <span key={`${i}-${ch}`} className="inline-block">
                {ch}
              </span>
            )
          )}
        </span>
      ) : (
        formatted
      )}
    </span>
  );
}

export default CountUp;
