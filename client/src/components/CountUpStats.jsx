import { CountUp } from "@/components/unlumen-ui/primitives/count-up";

/**
 * CountUpStats — LinkHub-flavored version of the CountUp demo.
 * Same props pattern: duration / separator / digitEffect.
 */
export function CountUpStats({
  duration = 2,
  separator = ",",
  digitEffect = "none",
}) {
  const stats = [
    { value: 25480, label: "links shortened", decimals: 0 },
    { value: 99.9, label: "redirect uptime %", decimals: 1 },
    { value: 120400, label: "clicks tracked", decimals: 0 },
  ];

  return (
    <div className="flex flex-wrap items-end justify-center gap-10 sm:gap-14">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-1">
          <CountUp
            to={s.value}
            decimals={s.decimals}
            duration={duration}
            separator={separator}
            digitEffect={digitEffect}
            className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl"
          />
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default CountUpStats;
