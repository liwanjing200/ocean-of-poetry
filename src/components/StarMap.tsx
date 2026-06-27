import { useEffect, useRef } from 'react';
import type { Poet } from '../types';

interface Props {
  poets: Poet[];
  selected: string | null;
  /** Names to keep bright; others dim. null = all bright. */
  highlight: Set<string> | null;
  onSelect: (name: string) => void;
}

interface Dust {
  x: number;
  y: number;
  r: number;
  base: number; // base alpha
  tw: number; // twinkle speed
  ph: number; // phase
  drift: number;
}

const GOLD = '184, 151, 90';

/**
 * 2D-canvas star map. Poets are stars at preset coordinates; contemporaries
 * (same dynasty) are linked by faint gold lines. Drag to pan, wheel/pinch to
 * zoom, hover for a breathing glow, click to select. Canvas 2D (not WebGL)
 * keeps it light on phones.
 */
export default function StarMap({ poets, selected, highlight, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Mutable view + interaction state kept in refs (avoid re-render per frame).
  const view = useRef({ panX: 0, panY: 0, zoom: 1 });
  const hover = useRef<string | null>(null);
  const dust = useRef<Dust[]>([]);
  const drag = useRef<{ on: boolean; x: number; y: number; moved: boolean }>({
    on: false, x: 0, y: 0, moved: false,
  });
  const pinch = useRef<{ d: number } | null>(null);
  const selectedRef = useRef(selected);
  const highlightRef = useRef(highlight);
  selectedRef.current = selected;
  highlightRef.current = highlight;

  // Precompute dynasty connections (chain by birth year within a dynasty).
  const links = useRef<[Poet, Poet][]>([]);
  if (links.current.length === 0) {
    const byDyn = new Map<string, Poet[]>();
    for (const p of poets) {
      const a = byDyn.get(p.dynasty) ?? [];
      a.push(p);
      byDyn.set(p.dynasty, a);
    }
    for (const arr of byDyn.values()) {
      arr.sort((a, b) => a.year - b.year);
      for (let i = 0; i < arr.length - 1; i++) links.current.push([arr[i], arr[i + 1]]);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let W = 0, H = 0, DPR = 1;

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (dust.current.length === 0) seedDust();
    }

    function seedDust() {
      const count = W < 640 ? 80 : 160;
      const arr: Dust[] = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: (Math.random() * 2 - 1) * 1.6,
          y: (Math.random() * 2 - 1) * 1.6,
          r: Math.random() * 1.3 + 0.3,
          base: Math.random() * 0.5 + 0.1,
          tw: Math.random() * 0.8 + 0.2,
          ph: Math.random() * Math.PI * 2,
          drift: (Math.random() * 2 - 1) * 0.004,
        });
      }
      dust.current = arr;
    }

    const R = () => Math.min(W, H) * 0.42 * view.current.zoom;
    const toScreen = (wx: number, wy: number) => {
      const r = R();
      return { x: W / 2 + view.current.panX + wx * r, y: H / 2 + view.current.panY + wy * r };
    };

    function frame(t: number) {
      const time = t / 1000;
      ctx.clearRect(0, 0, W, H);

      // background nebula glow near center
      const cx = W / 2 + view.current.panX * 0.4;
      const cy = H / 2 + view.current.panY * 0.4;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
      g.addColorStop(0, 'rgba(40, 60, 110, 0.22)');
      g.addColorStop(0.4, 'rgba(24, 34, 70, 0.12)');
      g.addColorStop(1, 'rgba(5, 6, 12, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // star dust
      for (const d of dust.current) {
        d.ph += d.tw * 0.02;
        d.x += d.drift * 0.02;
        if (d.x > 1.7) d.x = -1.7;
        if (d.x < -1.7) d.x = 1.7;
        const s = toScreen(d.x, d.y);
        if (s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) continue;
        const a = d.base + Math.sin(d.ph) * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 226, 245, ${Math.max(0, a)})`;
        ctx.fill();
      }

      const hl = highlightRef.current;
      const sel = selectedRef.current;
      const hv = hover.current;

      // connection lines
      ctx.lineWidth = 1;
      for (const [a, b] of links.current) {
        const dim = hl && !(hl.has(a.name) && hl.has(b.name));
        const sa = toScreen(a.x, a.y);
        const sb = toScreen(b.x, b.y);
        ctx.beginPath();
        ctx.moveTo(sa.x, sa.y);
        ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = `rgba(${GOLD}, ${dim ? 0.04 : 0.16})`;
        ctx.stroke();
      }

      // poet stars
      for (const p of poets) {
        const s = toScreen(p.x, p.y);
        const dim = hl ? !hl.has(p.name) : false;
        const isSel = sel === p.name;
        const isHv = hv === p.name;
        const breathe = 1 + Math.sin(time * 2 + p.x * 5) * (isHv || isSel ? 0.28 : 0.08);
        const size = (p.mag === 1 ? 4.2 : p.mag === 2 ? 3 : 2.2) * breathe;
        const alpha = dim ? 0.22 : 1;

        // glow
        const glowR = size * (isSel || isHv ? 6 : 4);
        const gg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        gg.addColorStop(0, `rgba(232, 207, 143, ${0.5 * alpha})`);
        gg.addColorStop(1, 'rgba(232, 207, 143, 0)');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 230, ${alpha})`;
        ctx.fill();

        // label
        const fs = p.mag === 1 ? (W < 640 ? 15 : 20) : W < 640 ? 12 : 14;
        ctx.font = `${isSel || isHv ? 600 : 400} ${fs}px 'Songti SC','SimSun',serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle =
          isSel || isHv
            ? `rgba(232, 207, 143, ${alpha})`
            : `rgba(225, 230, 245, ${0.85 * alpha})`;
        ctx.fillText(p.name, s.x, s.y - glowR - 4);
      }

      raf = requestAnimationFrame(frame);
    }

    // ── interaction ──
    function pickAt(px: number, py: number): string | null {
      let best: string | null = null;
      let bestD = 26; // px threshold
      for (const p of poets) {
        const s = toScreen(p.x, p.y);
        const d = Math.hypot(s.x - px, s.y - py);
        if (d < bestD) { bestD = d; best = p.name; }
      }
      return best;
    }
    function localXY(e: { clientX: number; clientY: number }) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function onDown(e: PointerEvent) {
      canvas.setPointerCapture(e.pointerId);
      drag.current = { on: true, x: e.clientX, y: e.clientY, moved: false };
    }
    function onMove(e: PointerEvent) {
      const { x, y } = localXY(e);
      if (drag.current.on) {
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
        view.current.panX += dx;
        view.current.panY += dy;
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
      } else {
        const name = pickAt(x, y);
        hover.current = name;
        canvas.style.cursor = name ? 'pointer' : 'grab';
      }
    }
    function onUp(e: PointerEvent) {
      if (drag.current.on && !drag.current.moved) {
        const { x, y } = localXY(e);
        const name = pickAt(x, y);
        if (name) onSelect(name);
      }
      drag.current.on = false;
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const f = Math.exp(-e.deltaY * 0.0012);
      view.current.zoom = Math.min(3, Math.max(0.5, view.current.zoom * f));
    }
    function dist(t: TouchList) {
      return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const d = dist(e.touches);
        if (pinch.current) {
          view.current.zoom = Math.min(3, Math.max(0.5, view.current.zoom * (d / pinch.current.d)));
        }
        pinch.current = { d };
      }
    }
    function onTouchEnd() { pinch.current = null; }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [poets, onSelect]);

  return (
    <div ref={wrapRef} className="absolute inset-0 touch-none">
      <canvas ref={canvasRef} className="block" style={{ cursor: 'grab' }} />
    </div>
  );
}
