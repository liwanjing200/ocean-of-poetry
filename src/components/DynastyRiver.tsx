import { useMemo } from 'react';
import type { Poem } from '../types';
import { poets, DYNASTIES } from '../data/poets';

export default function DynastyRiver({
  poems,
  active,
  onPick,
}: {
  poems: Poem[];
  active: string | null;
  onPick: (dynasty: string | null) => void;
}) {
  const stats = useMemo(() => {
    const poemCount = new Map<string, number>();
    for (const p of poems) poemCount.set(p.dynasty, (poemCount.get(p.dynasty) ?? 0) + 1);
    const poetCount = new Map<string, number>();
    for (const p of poets) poetCount.set(p.dynasty, (poetCount.get(p.dynasty) ?? 0) + 1);
    return { poemCount, poetCount };
  }, [poems]);

  const themes = new Set(poems.flatMap((p) => p.themes));

  return (
    <section className="flex h-full flex-col">
      <h3 className="font-serif text-lg tracking-wide text-haze-200">穿越千年的诗词长河</h3>

      <div className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-2">
        {DYNASTIES.map((d, i) => {
          const has = (stats.poemCount.get(d) ?? 0) > 0;
          return (
            <span key={d} className="flex items-center">
              <button
                disabled={!has}
                onClick={() => onPick(active === d ? null : d)}
                className={`rounded-md px-2.5 py-1 text-sm transition-colors ${
                  !has
                    ? 'cursor-default text-haze-500/40'
                    : active === d
                      ? 'bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/40'
                      : 'text-haze-300 hover:text-gold-300'
                }`}
              >
                {d}
              </button>
              {i < DYNASTIES.length - 1 && <span className="px-0.5 text-haze-500/40">·</span>}
            </span>
          );
        })}
      </div>

      {/* faint river of light */}
      <div className="relative mt-6 h-12 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(184,151,90,0.18),transparent_70%)]" />
        <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-2">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="block rounded-full bg-gold-300"
              style={{
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                opacity: 0.25 + 0.5 * Math.abs(Math.sin(i)),
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-4 gap-2 pt-6 text-center">
        <Stat n={poets.length} label="诗人" />
        <Stat n={poems.length} label="诗作" />
        <Stat n={themes.size} label="主题" />
        <Stat n={new Set(poems.map((p) => p.dynasty)).size} label="朝代" />
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-serif text-2xl text-gold-300">{n.toLocaleString()}</div>
      <div className="mt-1 text-xs text-haze-500">{label}</div>
    </div>
  );
}
