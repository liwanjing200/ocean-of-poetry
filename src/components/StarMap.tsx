import { useEffect, useRef } from 'react';
import type { Poet } from '../types';
import { previewLines } from '../lib/poem';

export interface HoverInfo {
  name: string;
  line: string;
  x: number; // relative to map container
  y: number;
}

interface Props {
  poets: Poet[];
  selected: string | null;
  /** Names to keep bright; others dim. null = all bright. */
  highlight: Set<string> | null;
  /** When set, that dynasty's stars slowly regroup to the center. */
  focusDynasty: string | null;
  onSelect: (name: string) => void;
  onHover: (info: HoverInfo | null) => void;
}

interface Dust {
  x: number; y: number; r: number;
  a0: number; a1: number; ph: number; sp: number; drift: number;
}
interface Node {
  poet: Poet;
  cx: number; cy: number; // current (animated) world pos
  tx: number; ty: number; // target world pos
  alpha: number; talpha: number;
  lum: number; // 诗海光度 → size
}

const GOLD = '184, 151, 90';

/** Map 诗海光度 (poet.luminosity, ~1–19) to a star core radius. */
function lumRadius(lum: number): number {
  return 2 + Math.sqrt(lum) * 0.85;
}

export default function StarMap({
  poets, selected, highlight, focusDynasty, onSelect, onHover,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const view = useRef({ panX: 0, panY: 0, zoom: 1, vx: 0, vy: 0 });
  const hover = useRef<string | null>(null);
  const dust = useRef<Dust[]>([]);
  const nodes = useRef<Node[]>([]);
  const drag = useRef({ on: false, x: 0, y: 0, lx: 0, ly: 0, moved: false });
  const pinch = useRef<{ d: number } | null>(null);
  const meteor = useRef<{ x: number; y: number; vx: number; vy: number; life: number } | null>(null);
  const nextMeteor = useRef(120);

  const selRef = useRef(selected); selRef.current = selected;
  const hlRef = useRef(highlight); hlRef.current = highlight;
  const onHoverRef = useRef(onHover); onHoverRef.current = onHover;

  // Build nodes once.
  if (nodes.current.length === 0) {
    nodes.current = poets.map((p) => ({
      poet: p, cx: p.x, cy: p.y, tx: p.x, ty: p.y,
      alpha: 1, talpha: 1, lum: lumRadius(p.luminosity),
    }));
  }

  const links = useRef<[number, number][]>([]);
  if (links.current.length === 0) {
    const byDyn = new Map<string, number[]>();
    nodes.current.forEach((n, i) => {
      const a = byDyn.get(n.poet.dynasty) ?? [];
      a.push(i);
      byDyn.set(n.poet.dynasty, a);
    });
    for (const arr of byDyn.values()) {
      arr.sort((a, b) => nodes.current[a].poet.year - nodes.current[b].poet.year);
      for (let i = 0; i < arr.length - 1; i++) links.current.push([arr[i], arr[i + 1]]);
    }
  }

  // Recompute targets when the focused dynasty changes (animated regroup).
  useEffect(() => {
    const ns = nodes.current;
    if (!focusDynasty) {
      for (const n of ns) { n.tx = n.poet.x; n.ty = n.poet.y; n.talpha = 1; }
      return;
    }
    const inDyn = ns.filter((n) => n.poet.dynasty === focusDynasty);
    inDyn.sort((a, b) => a.poet.year - b.poet.year);
    inDyn.forEach((n, i) => {
      const ang = (i / inDyn.length) * Math.PI * 2 - Math.PI / 2;
      const rad = inDyn.length <= 1 ? 0 : 0.45 + 0.12 * Math.sin(i * 1.3);
      n.tx = Math.cos(ang) * rad;
      n.ty = Math.sin(ang) * rad * 0.82;
      n.talpha = 1;
    });
    for (const n of ns) {
      if (n.poet.dynasty !== focusDynasty) {
        // push outward toward the rim and fade
        const m = Math.hypot(n.poet.x, n.poet.y) || 1;
        n.tx = (n.poet.x / m) * 1.45;
        n.ty = (n.poet.y / m) * 1.45;
        n.talpha = 0.12;
      }
    }
  }, [focusDynasty]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let W = 0, H = 0, DPR = 1;

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth; H = wrap.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seedDust();
    }
    function seedDust() {
      const count = W < 640 ? 110 : 220;
      const layers = [
        { r: [0.3, 0.7], a: [0.12, 0.32], sp: 0.5 },
        { r: [0.5, 1.1], a: [0.2, 0.5], sp: 1 },
        { r: [0.9, 1.7], a: [0.35, 0.85], sp: 1.6 },
      ];
      const arr: Dust[] = [];
      for (let i = 0; i < count; i++) {
        const L = layers[i % 3];
        arr.push({
          x: (Math.random() * 2 - 1) * 1.7, y: (Math.random() * 2 - 1) * 1.7,
          r: L.r[0] + Math.random() * (L.r[1] - L.r[0]),
          a0: L.a[0], a1: L.a[1], ph: Math.random() * 6.28,
          sp: L.sp * (0.5 + Math.random()), drift: (Math.random() * 2 - 1) * 0.003,
        });
      }
      dust.current = arr;
    }

    const R = () => Math.min(W, H) * 0.42 * view.current.zoom;
    const toScreen = (wx: number, wy: number) => {
      const r = R();
      return { x: W / 2 + view.current.panX + wx * r, y: H / 2 + view.current.panY + wy * r };
    };
    function blob(x: number, y: number, r: number, col: string) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(5,6,12,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }

    function frame(tms: number) {
      const t = tms / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, W, H);

      // inertia + position easing
      if (!drag.current.on) {
        view.current.panX += view.current.vx;
        view.current.panY += view.current.vy;
        view.current.vx *= 0.92; view.current.vy *= 0.92;
        if (Math.abs(view.current.vx) < 0.01) view.current.vx = 0;
        if (Math.abs(view.current.vy) < 0.01) view.current.vy = 0;
      }
      for (const n of nodes.current) {
        n.cx += (n.tx - n.cx) * 0.07;
        n.cy += (n.ty - n.cy) * 0.07;
        n.alpha += (n.talpha - n.alpha) * 0.07;
      }

      const cx = W / 2 + view.current.panX * 0.4;
      const cy = H / 2 + view.current.panY * 0.4;

      // milky-way band
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.5); ctx.scale(1, 0.28);
      blob(0, 0, Math.max(W, H) * 0.62, 'rgba(60,80,140,0.15)');
      ctx.restore();
      // nebula clouds
      blob(cx - W * 0.04, cy, Math.max(W, H) * 0.4, 'rgba(40,64,120,0.18)');
      blob(cx + W * 0.08, cy - H * 0.06, W * 0.2, 'rgba(70,86,150,0.1)');
      blob(cx, cy + H * 0.08, W * 0.16, 'rgba(150,120,70,0.06)');

      // star dust
      for (const d of dust.current) {
        d.x += d.drift * 0.02;
        if (d.x > 1.8) d.x = -1.8; if (d.x < -1.8) d.x = 1.8;
        const s = toScreen(d.x, d.y);
        if (s.x < -10 || s.x > W + 10 || s.y < -10 || s.y > H + 10) continue;
        const a = d.a0 + (d.a1 - d.a0) * (0.5 + 0.5 * Math.sin(t * d.sp + d.ph));
        ctx.beginPath(); ctx.arc(s.x, s.y, d.r, 0, 6.2832);
        ctx.fillStyle = `rgba(222,228,247,${a})`; ctx.fill();
      }

      const hl = hlRef.current; const sel = selRef.current; const hv = hover.current;

      // connection lines
      ctx.lineWidth = 1;
      for (const [ai, bi] of links.current) {
        const a = nodes.current[ai], b = nodes.current[bi];
        const dim = hl && !(hl.has(a.poet.name) && hl.has(b.poet.name));
        const sa = toScreen(a.cx, a.cy), sb = toScreen(b.cx, b.cy);
        const al = Math.min(a.alpha, b.alpha);
        ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = `rgba(${GOLD}, ${(dim ? 0.04 : 0.16) * al})`; ctx.stroke();
      }

      // poet stars
      for (const n of nodes.current) {
        const p = n.poet; const s = toScreen(n.cx, n.cy);
        const dim = hl ? !hl.has(p.name) : false;
        const isSel = sel === p.name; const isHv = hv === p.name;
        const breathe = 1 + Math.sin(t * 2 + p.x * 5) * (isHv || isSel ? 0.28 : 0.08);
        const size = n.lum * breathe;
        const alpha = n.alpha * (dim ? 0.25 : 1);
        const glowR = size * (isSel || isHv ? 6 : 4);
        const gg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        gg.addColorStop(0, `rgba(232,207,143,${0.5 * alpha})`);
        gg.addColorStop(1, 'rgba(232,207,143,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(s.x, s.y, glowR, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.arc(s.x, s.y, size, 0, 6.2832);
        ctx.fillStyle = `rgba(255,248,230,${alpha})`; ctx.fill();

        const major = p.mag === 1;
        const fs = major ? (W < 640 ? 15 : 19) : W < 640 ? 12 : 14;
        ctx.font = `${isSel || isHv ? 600 : 400} ${fs}px 'Songti SC','SimSun',serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isSel || isHv
          ? `rgba(232,207,143,${alpha})`
          : `rgba(225,230,245,${0.82 * alpha})`;
        ctx.fillText(p.name, s.x, s.y - glowR - 4);
      }

      // meteor
      const m = meteor.current;
      if (m) {
        m.life++;
        const mx = m.x + m.life * m.vx, my = m.y + m.life * m.vy;
        const tx = mx - m.vx * 16, ty = my - m.vy * 16;
        const grad = ctx.createLinearGradient(tx, ty, mx, my);
        grad.addColorStop(0, 'rgba(232,207,143,0)');
        grad.addColorStop(1, 'rgba(255,250,235,0.9)');
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(mx, my); ctx.stroke();
        if (m.life > 70 || mx > W || my > H) meteor.current = null;
      } else if (--nextMeteor.current <= 0) {
        meteor.current = { x: Math.random() * W * 0.5, y: Math.random() * H * 0.3, vx: 7 + Math.random() * 3, vy: 4 + Math.random() * 2, life: 0 };
        nextMeteor.current = 360 + Math.random() * 360;
      }

      // vignette
      const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.max(W, H) * 0.78);
      v.addColorStop(0, 'rgba(5,6,12,0)'); v.addColorStop(1, 'rgba(5,6,12,0.65)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    }

    // ── interaction ──
    function pickAt(px: number, py: number): Node | null {
      let best: Node | null = null; let bestD = 28;
      for (const n of nodes.current) {
        if (n.alpha < 0.3) continue;
        const s = toScreen(n.cx, n.cy);
        const d = Math.hypot(s.x - px, s.y - py);
        if (d < bestD) { bestD = d; best = n; }
      }
      return best;
    }
    function local(e: { clientX: number; clientY: number }) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function onDown(e: PointerEvent) {
      canvas.setPointerCapture(e.pointerId);
      drag.current = { on: true, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false };
      view.current.vx = 0; view.current.vy = 0;
    }
    function onMove(e: PointerEvent) {
      const { x, y } = local(e);
      if (drag.current.on) {
        const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
        if (Math.abs(e.clientX - drag.current.lx) + Math.abs(e.clientY - drag.current.ly) > 3) drag.current.moved = true;
        view.current.panX += dx; view.current.panY += dy;
        view.current.vx = dx; view.current.vy = dy;
        drag.current.x = e.clientX; drag.current.y = e.clientY;
        onHoverRef.current(null);
      } else {
        const n = pickAt(x, y);
        hover.current = n?.poet.name ?? null;
        canvas.style.cursor = n ? 'pointer' : 'grab';
        if (n) onHoverRef.current({ name: n.poet.name, line: previewLines(n.poet.poems[0])[0] ?? '', x, y });
        else onHoverRef.current(null);
      }
    }
    function onUp(e: PointerEvent) {
      if (drag.current.on && !drag.current.moved) {
        const { x, y } = local(e);
        const n = pickAt(x, y);
        if (n) onSelect(n.poet.name);
      }
      drag.current.on = false;
    }
    function onLeave() { hover.current = null; onHoverRef.current(null); }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      view.current.zoom = Math.min(3, Math.max(0.5, view.current.zoom * Math.exp(-e.deltaY * 0.0012)));
    }
    function dist(t: TouchList) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const d = dist(e.touches);
        if (pinch.current) view.current.zoom = Math.min(3, Math.max(0.5, view.current.zoom * (d / pinch.current.d)));
        pinch.current = { d };
      }
    }
    function onTouchEnd() { pinch.current = null; }

    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSelect]);

  return (
    <div ref={wrapRef} className="absolute inset-0 touch-none">
      <canvas ref={canvasRef} className="block" style={{ cursor: 'grab' }} />
    </div>
  );
}
