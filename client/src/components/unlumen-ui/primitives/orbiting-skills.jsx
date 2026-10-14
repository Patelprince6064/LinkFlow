import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * OrbitingSkills — circular orbit around a center child.
 * JSX port (no TS, no "use client" needed for Vite).
 *
 * @param {Array<{label:string, icon?:ReactNode}>} items - badges to orbit
 * @param {number} radius - orbit radius in px (default 96)
 * @param {number} duration - full rotation in seconds (default 18)
 * @param {boolean} showPath - show dashed orbit ring (default true)
 * @param {boolean} followCursor - subtle 3D tilt toward cursor (default true)
 * @param {ReactNode} children - center content (avatar/logo)
 */
export function OrbitingSkills({
  items = [],
  radius = 96,
  duration = 18,
  showPath = true,
  followCursor = true,
  className,
  children,
}) {
  const wrapRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const diameter = radius * 2;

  const handleMove = (e) => {
    if (!followCursor || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -14, y: px * 14 });
  };

  const handleLeave = () => setTilt({ x: 0, y: 0 });

  const count = Math.max(items.length, 1);

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("flex items-center justify-center [perspective:800px]", className)}
      style={{ padding: 44 }}
    >
      <div
        className="relative flex items-center justify-center transition-transform duration-200 ease-out will-change-transform"
        style={{
          width: diameter,
          height: diameter,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* orbit path */}
        {showPath && (
          <div
            aria-hidden
            className="absolute inset-0 rounded-full border border-dashed border-border"
          />
        )}
        {/* soft glow behind center */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-2xl"
        />

        {/* rotating ring */}
        <div
          className="orbit-spin absolute inset-0"
          style={{ animationDuration: `${duration}s` }}
        >
          {items.map((item, i) => {
            const angle = (360 / count) * i;
            return (
              <div
                key={`${item.label}-${i}`}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg) translate(-50%, -50%)`,
                }}
              >
                <div
                  className="orbit-spin-reverse flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground shadow-sm"
                  style={{ animationDuration: `${duration}s` }}
                  title={item.label}
                >
                  {item.icon ? (
                    <span className="text-muted-foreground [&_svg]:size-4">
                      {item.icon}
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* center */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export default OrbitingSkills;
