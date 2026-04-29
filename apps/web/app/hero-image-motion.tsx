"use client";

import type { CSSProperties, MouseEventHandler } from "react";
import { useMemo, useRef } from "react";

export function HeroImageMotion() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const baseStyle = useMemo(
    () =>
      ({
        "--mx": "0",
        "--my": "0"
      }) as CSSProperties,
    []
  );

  const handleMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const node = sectionRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    node.style.setProperty("--mx", (Math.max(-1, Math.min(1, x)) * 0.55).toFixed(3));
    node.style.setProperty("--my", (Math.max(-1, Math.min(1, y)) * 0.55).toFixed(3));
  };

  const handleLeave = () => {
    const node = sectionRef.current;
    if (!node) return;

    node.style.setProperty("--mx", "0");
    node.style.setProperty("--my", "0");
  };

  return (
    <div
      ref={sectionRef}
      className="hero-image-section"
      style={baseStyle}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="hero-orbit-sweep" aria-hidden="true" />
      <div className="hero-chart-shimmer" aria-hidden="true" />
      <div className="hero-chart-ping" aria-hidden="true" />

      <div className="hero-image-float">
        <img src="/Hero.png" alt="Trading Platform Hero" className="hero-image" />
      </div>

      <div className="hero-glint-pass" aria-hidden="true" />
    </div>
  );
}
