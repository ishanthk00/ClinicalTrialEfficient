"use client";
import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  end: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

export default function StatCounter({
  end,
  decimals = 0,
  suffix = "",
  prefix = "",
}: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          observer.disconnect();
          const duration = 1200;
          const start = performance.now();
          const raf = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(parseFloat((eased * end).toFixed(decimals)));
            if (t < 1) requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, decimals]);

  const display =
    decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
