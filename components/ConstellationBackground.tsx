"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient interactive night-sky background.
 *
 * Behavior:
 * - N stars drift very slowly around a resting point.
 * - Stars within PULL_RADIUS of the cursor are magnetically drawn toward it.
 * - Stars outside PULL_RADIUS are unaffected and spring back to their resting point.
 * - Nearby stars are connected with faint lines, redrawn each frame based on
 *   live (pulled) positions, so dragging stars together visibly forms new
 *   constellation shapes — this is the "signature" interaction of the site.
 *
 * Respects prefers-reduced-motion: falls back to a static starfield, no pull.
 */

type Star = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  twinkleSeed: number;
};

const PULL_RADIUS = 140;
const PULL_STRENGTH = 0.12;
const SPRING_BACK = 0.06;
const DAMPING = 0.82;
const LINK_DISTANCE = 110;
const STAR_COUNT_DESKTOP = 140;
const STAR_COUNT_MOBILE = 70;

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const initStars = () => {
      const count =
        window.innerWidth < 640 ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        stars.push({
          baseX: x,
          baseY: y,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.4 + 0.6,
          twinkleSeed: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };
    initStars();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);
      const stars = starsRef.current;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        if (!prefersReducedMotion) {
          const dx = mouse.current.x - s.x;
          const dy = mouse.current.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < PULL_RADIUS) {
            const pull = (1 - dist / PULL_RADIUS) * PULL_STRENGTH;
            s.vx += dx * pull * 0.05;
            s.vy += dy * pull * 0.05;
          } else {
            s.vx += (s.baseX - s.x) * SPRING_BACK;
            s.vy += (s.baseY - s.y) * SPRING_BACK;
          }

          s.vx *= DAMPING;
          s.vy *= DAMPING;
          s.x += s.vx;
          s.y += s.vy;
        }

        const twinkle =
          0.55 + Math.sin(frame * 0.02 + s.twinkleSeed) * 0.35;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 240, 233, ${twinkle})`;
        ctx.fill();
      }

      // constellation links between nearby stars
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i];
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(232, 185, 92, ${
              0.12 * (1 - dist / LINK_DISTANCE)
            })`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-full w-full"
    />
  );
}
