import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Poem } from '../types';
import { previewLines, seededIndex, todayKey } from '../lib/poem';

export default function DailyPoem({ poems }: { poems: Poem[] }) {
  const [idx, setIdx] = useState(() => seededIndex(todayKey(), poems.length));
  const p = poems[idx];
  const lines = previewLines(p);

  return (
    <section className="flex h-full flex-col">
      <h3 className="font-serif text-lg tracking-wide text-haze-200">今日一诗</h3>
      <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex-1">
        <div className="space-y-1.5 font-serif text-[19px] leading-relaxed text-haze-100">
          {lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
        <p className="mt-4 text-sm text-haze-500">
          —— {p.author}《{p.title}》
        </p>
      </motion.div>
      <button
        onClick={() => setIdx(Math.floor(Math.random() * poems.length))}
        className="mt-5 w-fit rounded-lg border border-mist-400/70 bg-ink-500/30 px-5 py-2 text-sm text-haze-300 transition-colors hover:border-gold-500/50 hover:text-gold-300"
      >
        换一首
      </button>
    </section>
  );
}
