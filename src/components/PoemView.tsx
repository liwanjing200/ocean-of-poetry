import type { Poem } from '../types';
import { toLines } from '../lib/poem';

/** Full single-poem reader used inside modals. */
export default function PoemView({
  poem, favHas, onToggleFav,
}: {
  poem: Poem;
  favHas: (id: string) => boolean;
  onToggleFav: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-2xl text-haze-100">《{poem.title}》</h3>
        <span className="shrink-0 text-sm text-haze-500">{poem.dynasty} · {poem.author}</span>
      </div>

      <div className="mt-5 space-y-2 font-serif text-[19px] leading-loose text-haze-100">
        {toLines(poem).map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>

      <p className="mt-5 rounded-lg bg-ink-500/40 p-4 text-sm leading-relaxed text-haze-300">
        {poem.note}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {poem.emotions.map((e) => (
          <span key={e} className="rounded bg-gold-500/10 px-2 py-0.5 text-xs text-gold-300">{e}</span>
        ))}
        {poem.themes.map((t) => (
          <span key={t} className="rounded border border-mist-400/60 px-2 py-0.5 text-xs text-haze-400">{t}</span>
        ))}
      </div>

      <button
        onClick={() => onToggleFav(poem.id)}
        className={`mt-5 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
          favHas(poem.id)
            ? 'border-gold-500/60 bg-gold-500/10 text-gold-300'
            : 'border-mist-400/70 text-haze-300 hover:border-gold-500/50 hover:text-gold-300'
        }`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill={favHas(poem.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 20s-7-4.6-7-9.4A3.6 3.6 0 0112 7a3.6 3.6 0 017 3.6C19 15.4 12 20 12 20z" />
        </svg>
        {favHas(poem.id) ? '已收藏' : '收藏'}
      </button>

      <p className="mt-4 text-right text-xs text-haze-500/70">正文来源：chinese-poetry · {poem.source}</p>
    </div>
  );
}
