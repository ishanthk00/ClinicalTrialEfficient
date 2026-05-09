"use client";

import { useRef, useEffect, ReactNode } from "react";
import Link from "next/link";

interface Props {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** How far (px) the cursor must be before attraction kicks in */
  radius?: number;
  /** Translation multiplier — higher = stronger pull */
  strength?: number;
}

export default function MagneticButton({
  href,
  onClick,
  children,
  className,
  style,
  radius = 130,
  strength = 0.38,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        const f = (1 - dist / radius) * strength;
        el.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
      } else {
        el.style.transform = "";
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [radius, strength]);

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        className={className ?? "magnetic-btn"}
        style={style}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      className={className ?? "magnetic-btn"}
      style={style}
    >
      {children}
    </button>
  );
}
