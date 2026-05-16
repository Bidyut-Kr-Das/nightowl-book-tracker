"use client";

import { useEffect, useRef } from "react";

export default function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      maxOpacity: number;
      life: number;
      maxLife: number;
    }

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + 10,
        size: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.15,
        opacity: 0,
        maxOpacity: Math.random() * 0.35 + 0.05,
        life: 0,
        maxLife: Math.random() * 800 + 400,
      };
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Spawn particles sparingly
      if (particles.length < 30 && Math.random() < 0.03) {
        particles.push(createParticle());
      }

      particles = particles.filter((p) => {
        p.life++;
        p.x += p.speedX;
        p.y += p.speedY;

        // Fade in and out
        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.1) {
          p.opacity = p.maxOpacity * (lifeRatio / 0.1);
        } else if (lifeRatio > 0.8) {
          p.opacity = p.maxOpacity * ((1 - lifeRatio) / 0.2);
        } else {
          p.opacity = p.maxOpacity;
        }

        // Draw particle with warm glow
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(210, 170, 100, ${p.opacity})`;
        ctx!.fill();

        // Soft glow
        const gradient = ctx!.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size * 4
        );
        gradient.addColorStop(0, `rgba(210, 170, 100, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(210, 170, 100, 0)`);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();

        return p.life < p.maxLife;
      });

      animationId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
