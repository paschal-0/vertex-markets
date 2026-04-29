"use client";

import { useEffect, useRef } from "react";

type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  stretch: number;
  age: number;
  life: number;
  shimmer: number;
};

type PointerState = {
  x: number;
  y: number;
  active: boolean;
  seenAt: number;
};

const MAX_DROPS = 420;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function RainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drops: Drop[] = [];
    const pointer: PointerState = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.35,
      active: false,
      seenAt: 0,
    };

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    let lastTs = performance.now();
    let ambientAccumulator = 0;
    let pointerAccumulator = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnDrop = (x: number, y: number, boosted = false) => {
      if (drops.length >= MAX_DROPS) {
        drops.splice(0, drops.length - MAX_DROPS + 1);
      }

      const speedFactor = boosted ? 1.25 : 1;
      const vy = randomBetween(220, 460) * speedFactor;
      const vx = randomBetween(-26, 22) + randomBetween(-10, 10) * (boosted ? 1.2 : 0.7);
      const radius = randomBetween(1.4, boosted ? 4.6 : 3.2);

      drops.push({
        x,
        y,
        vx,
        vy,
        r: radius,
        stretch: randomBetween(0.85, 1.3),
        age: 0,
        life: randomBetween(1.8, boosted ? 3.2 : 2.7),
        shimmer: Math.random() * Math.PI * 2,
      });
    };

    const spawnAmbient = (dt: number) => {
      const spawnRate = Math.max(10, Math.floor(width * 0.02));
      ambientAccumulator += dt * spawnRate;

      while (ambientAccumulator >= 1) {
        ambientAccumulator -= 1;
        spawnDrop(randomBetween(-40, width + 40), randomBetween(-60, -8), false);
      }
    };

    const spawnNearPointer = (dt: number, now: number) => {
      const pointerRecentlySeen = now - pointer.seenAt < 1800;
      if (!pointerRecentlySeen) return;

      const activeBoost = pointer.active ? 40 : 20;
      const burstRate = Math.max(22, activeBoost + width * 0.026);
      pointerAccumulator += dt * burstRate;

      while (pointerAccumulator >= 1) {
        pointerAccumulator -= 1;
        const spread = pointer.active ? 54 : 74;
        const px = pointer.x + randomBetween(-spread, spread);
        const py = pointer.y + randomBetween(-spread * 0.78, spread * 0.45);
        spawnDrop(px, py, true);
      }
    };

    const drawDrop = (drop: Drop) => {
      const alphaProgress = 1 - Math.min(1, drop.age / drop.life);
      const alpha = Math.max(0, alphaProgress * alphaProgress);
      const speed = Math.hypot(drop.vx, drop.vy);
      const length = Math.max(10, Math.min(34, speed * 0.052)) * drop.stretch;
      const angle = Math.atan2(drop.vy, drop.vx);

      ctx.save();
      ctx.translate(drop.x, drop.y);
      ctx.rotate(angle);

      const trail = ctx.createLinearGradient(-length, 0, 0, 0);
      trail.addColorStop(0, `rgba(184, 212, 255, 0)`);
      trail.addColorStop(0.45, `rgba(190, 220, 255, ${0.11 * alpha})`);
      trail.addColorStop(1, `rgba(228, 243, 255, ${0.36 * alpha})`);
      ctx.strokeStyle = trail;
      ctx.lineWidth = Math.max(1.1, drop.r * 0.9);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-length, 0);
      ctx.lineTo(-drop.r * 0.2, 0);
      ctx.stroke();

      ctx.fillStyle = `rgba(198, 228, 255, ${0.24 * alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, drop.r * 1.15, drop.r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(236, 246, 255, ${0.25 * alpha})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, drop.r * 1.05, drop.r * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();

      const glint = Math.sin(drop.shimmer + drop.age * 7.5) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.2 + glint * 0.2) * alpha})`;
      ctx.beginPath();
      ctx.ellipse(-drop.r * 0.28, -drop.r * 0.2, drop.r * 0.24, drop.r * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = (ts: number) => {
      const frameMs = Math.min(34, ts - lastTs);
      const dt = frameMs / 1000;
      lastTs = ts;

      spawnAmbient(dt);
      spawnNearPointer(dt, ts);

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const drop = drops[i];
        drop.age += dt;
        drop.vy += dt * 110;
        drop.x += drop.vx * dt;
        drop.y += drop.vy * dt;
        drop.vx *= 0.998;

        if (
          drop.age >= drop.life ||
          drop.y > height + 70 ||
          drop.x < -80 ||
          drop.x > width + 80
        ) {
          drops.splice(i, 1);
          continue;
        }

        drawDrop(drop);
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.seenAt = performance.now();
      pointer.active = event.pressure > 0 || event.buttons > 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      pointer.seenAt = performance.now();
      for (let i = 0; i < 18; i += 1) {
        spawnDrop(pointer.x + randomBetween(-26, 26), pointer.y + randomBetween(-22, 14), true);
      }
    };

    const onPointerUp = () => {
      pointer.active = false;
      pointer.seenAt = performance.now();
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    resize();
    rafId = window.requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="rain-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="rain-overlay-canvas" />
    </div>
  );
}
