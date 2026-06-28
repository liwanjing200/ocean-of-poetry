import { motion } from 'framer-motion';
import type { Poet } from '../types';
import { toLines } from '../lib/poem';

interface Props {
  poet: Poet | null;
  favHas: (id: string) => boolean;
  onToggleFav: (id: string) => void;
  onExplore: (poet: Poet) => void;
}

/** Faint moon + abstract robed-figure silhouette, as a tasteful placeholder. */
function Decoration() {
  return (
    <svg
      viewBox="0 0 120 200" className="pointer-events-none absolute right-0 top-0 h-full w-28 opacity-70"
      aria-hidden
    >
      <defs>
        <radialGradient id="moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f3ead0" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#cbb988" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#cbb988" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9aa6c4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#34405c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="92" cy="34" r="22" fill="url(#moon)" />
      <path
        d="M70 200c0-46 6-78 14-104 4-13 14-22 16-22s12 9 16 22c8 26 14 58 14 104z"
        fill="url(#robe)"
      />
    </svg>
  );
}

/** 诗海光度 as 1–5 small dots. */
function Luminosity({ value }: { value: number }) {
  const lit = Math.max(1, Math.min(5, Math.round(value / 4)));
  return (
    <span className="inline-flex items-center gap-1 align-middle" title={`诗海光度 ${value}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: i < lit ? '#e8cf8f' : 'rgba(184,151,90,0.25)' }}
        />
      ))}
    </span>
  );
}

export default function DetailCard({ poet, favHas, onToggleFav, onExplore }: Props) {
  if (!poet) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 text-3xl text-gold-400/80">✦</div>
        <p className="font-serif text-lg text-haze-300">轻触星图上的诗人</p>
        <p className="mt-2 text-sm text-haze-500">在千年的诗海中，遇见一颗星辰</p>
      </div>
    );
  }

  const main = poet.poems[0];
  const lines = main ? toLines(main) : [];

  return (
    <motion.div
      key={poet.name}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-full flex-col px-7 py-7"
    >
      <Decoration />
      <div className="relative z-10">
        <h2 className="font-serif text-4xl tracking-wide text-gold-300">{poet.name}</h2>
        <p className="mt-2 flex items-center gap-3 text-sm text-haze-300">
          <span>{poet.dynasty}代 · {poet.life}</span>
          <Luminosity value={poet.luminosity} />
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {poet.styles.map((s) => (
            <span
              key={s}
              className="rounded-md border border-mist-400/70 bg-ink-500/40 px-2.5 py-1 text-xs text-haze-300"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {main && (
        <motion.div
          key={main.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="relative z-10 mt-6 flex-1 overflow-y-auto"
        >
          {/* layer 1 — 原诗 */}
          <p className="text-xs tracking-widest text-haze-500">代 表 诗 作</p>
          <h3 className="mt-2 font-serif text-2xl text-haze-100">《{main.title}》</h3>
          <div className="mt-4 space-y-1.5 font-serif text-[17px] leading-relaxed text-haze-100/90">
            {lines.slice(0, 6).map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>

          {/* layer 2 — 现代解释 */}
          <div className="mt-5 border-l-2 border-mist-400/50 pl-3">
            <p className="text-[11px] tracking-widest text-haze-500">现代解释</p>
            <p className="mt-1 text-sm leading-relaxed text-haze-300">{main.note}</p>
          </div>

          {/* layer 3 — 为什么此刻适合读它 */}
          <div className="mt-3 rounded-lg bg-gold-500/[0.07] p-3">
            <p className="text-[11px] tracking-widest text-gold-400/80">为什么此刻适合读它</p>
            <p className="mt-1 text-sm leading-relaxed text-haze-200">{main.whyNow}</p>
          </div>
        </motion.div>
      )}

      <div className="relative z-10 mt-5 flex items-center gap-4 pt-2">
        {main && (
          <button
            onClick={() => onToggleFav(main.id)}
            aria-label="收藏"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
              favHas(main.id)
                ? 'border-gold-500/60 bg-gold-500/10 text-gold-300'
                : 'border-mist-400/70 text-haze-500 hover:text-gold-300'
            }`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill={favHas(main.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20s-7-4.6-7-9.4A3.6 3.6 0 0112 7a3.6 3.6 0 017 3.6C19 15.4 12 20 12 20z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onExplore(poet)}
          className="flex-1 rounded-lg border border-mist-400/70 bg-ink-500/40 py-2.5 text-sm text-haze-200 transition-colors hover:border-gold-500/50 hover:text-gold-300"
        >
          探索更多诗作　→
        </button>
      </div>
    </motion.div>
  );
}
