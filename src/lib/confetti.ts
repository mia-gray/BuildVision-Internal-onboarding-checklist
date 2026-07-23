/**
 * Tiny, dependency-free confetti burst on a throwaway full-screen canvas.
 * Respects prefers-reduced-motion (no-op). Safe to call in the browser only.
 */
export function burstConfetti(opts: { particleCount?: number; durationMs?: number } = {}): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const count = opts.particleCount ?? 160;
  const duration = opts.durationMs ?? 2600;
  const colors = ["#6E56CF", "#4838f8", "#A78BFA", "#22C55E", "#F5B301", "#EC4899"];

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  interface P {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vrot: number;
    size: number;
    color: string;
    shape: number;
  }

  // Two launch points (lower-left + lower-right) firing up and inward.
  const parts: P[] = Array.from({ length: count }, (_, i) => {
    const fromLeft = i % 2 === 0;
    const originX = fromLeft ? W * 0.15 : W * 0.85;
    const angle = fromLeft ? -Math.PI / 3 : (-Math.PI * 2) / 3;
    const speed = 9 + Math.random() * 9;
    return {
      x: originX,
      y: H * 0.6,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
      vy: Math.sin(angle) * speed - Math.random() * 4,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      size: 6 + Math.random() * 6,
      color: colors[i % colors.length],
      shape: Math.floor(Math.random() * 3),
    };
  });

  const start = performance.now();
  const gravity = 0.22;
  const drag = 0.99;

  function frame(now: number) {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, W, H);
    const fade = Math.max(0, 1 - elapsed / duration);
    for (const p of parts) {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = fade;
      ctx!.fillStyle = p.color;
      if (p.shape === 0) ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      else if (p.shape === 1) {
        ctx!.beginPath();
        ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size * 0.4, p.size);
      }
      ctx!.restore();
    }
    if (elapsed < duration) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
