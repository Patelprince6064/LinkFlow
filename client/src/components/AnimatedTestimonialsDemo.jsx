import { AnimatedTestimonials } from "./ui/animated-testimonials";

/**
 * AnimatedTestimonialsDemo — same three LinkHub testimonials as the old
 * static grid, now auto-rotating with prev/next controls.
 */
const testimonials = [
  {
    quote:
      "Replaced two tools on day one. Vanity slugs for launches + the bio page for my profile — analytics tells me what to post next.",
    name: "Maya R.",
    role: "Newsletter creator",
  },
  {
    quote:
      "QR codes that just track as clicks is such a small thing that saves so much time at events. Print, scan, done.",
    name: "Devon K.",
    role: "Indie maker",
  },
  {
    quote:
      "The per-link analytics are refreshingly simple. Timeline, referrers, devices — exactly what I need, nothing I don't.",
    name: "Sofia L.",
    role: "Social media manager",
  },
];

export function AnimatedTestimonialsDemo() {
  return <AnimatedTestimonials testimonials={testimonials} autoplay />;
}

export default AnimatedTestimonialsDemo;
