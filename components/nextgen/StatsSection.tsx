"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface StatDef {
  value: number;
  label: string;
  suffix?: string;
}

interface StatsSectionProps {
  stats: StatDef[];
}

interface StatItemProps extends StatDef {
  animate: boolean;
  index: number;
}

function StatItem({ value, label, suffix = "", animate, index }: StatItemProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const delay = index * 120;
    const timer = setTimeout(() => {
      const duration = 1800;
      const steps = 60;
      const stepValue = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [animate, value, index]);

  return (
    <div className="text-center group px-4 py-2 relative">
      {/* Séparateur vertical décoratif */}
      <div
        className="absolute inset-y-4 left-0 w-px hidden md:block"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(200,169,110,.25) 40%, rgba(200,169,110,.25) 60%, transparent)" }}
        aria-hidden="true"
      />

      <div
        className="font-display font-bold leading-none mb-2 group-hover:scale-105 transition-transform duration-300"
        style={{ fontSize: "clamp(2.8rem, 5vw, 4rem)", color: "var(--color-gold)" }}
      >
        {animate ? count.toLocaleString("fr-FR") : value.toLocaleString("fr-FR")}{suffix}
      </div>
      <div className="text-xs uppercase tracking-widest font-medium" style={{ color: "rgba(255,255,255,.45)" }}>
        {label}
      </div>
    </div>
  );
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0F1F17 0%, #12251B 50%, #0F1F17 100%)", padding: "3.5rem 0" }}
    >
      {/* Shimmer bar top */}
      <div className="absolute top-0 left-0 right-0 h-px shimmer-bar" aria-hidden="true" />

      {/* Gold ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200,169,110,.05) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              animate={isInView}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Shimmer bar bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px shimmer-bar" aria-hidden="true" />
    </section>
  );
}
