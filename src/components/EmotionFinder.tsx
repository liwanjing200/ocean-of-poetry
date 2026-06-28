import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Emotion, Poem } from '../types';
import { previewLines, pickRandom } from '../lib/poem';

/** Atmospheric doorways instead of a bare tag list. */
const DOORS: { label: string; emotions: Emotion[] }[] = [
  { label: '今夜睡不着', emotions: ['失眠'] },
  { label: '有点想一个人', emotions: ['思念'] },
  { label: '想逃离现实', emotions: ['自由', '旷达'] },
  { label: '心里很乱', emotions: ['低落', '孤独'] },
  { label: '想重新有力量', emotions: ['勇气'] },
  { label: '想谈一场恋爱', emotions: ['恋爱'] },
  { label: '需要被治愈', emotions: ['治愈'] },
  { label: '刚刚告别', emotions: ['离别'] },
];

export default function EmotionFinder({
  poems,
  onOpen,
}: {
  poems: Poem[];
  onOpen: (p: Poem) => void;
}) {
  const [door, setDoor] = useState<(typeof DOORS)[number] | null>(null);
  const [nonce, setNonce] = useState(0);

  const matches = useMemo(
    () => (door ? poems.filter((p) => p.emotions.some((e) => door.emotions.includes(e))) : []),
    [poems, door],
  );
  const poem = useMemo(() => (matches.length ? pickRandom(matches) : null), [matches, nonce]);

  return (
    <section className="flex h-full flex-col">
      <h3 className="font-serif text-lg tracking-wide text-haze-200">你此刻想去哪里？</h3>

      <AnimatePresence mode="wait">
        {!door ? (
          <motion.div
            key="doors"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-4 flex flex-1 flex-col justify-center gap-1"
          >
            {DOORS.map((d) => (
              <button
                key={d.label}
                onClick={() => { setDoor(d); setNonce((n) => n + 1); }}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-left font-serif text-[17px] text-haze-200 transition-colors hover:bg-ink-500/40 hover:text-gold-300"
              >
                <span className="text-gold-500/50 transition-colors group-hover:text-gold-400">·</span>
                {d.label}
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={'poem' + nonce}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 flex flex-1 flex-col"
          >
            <button onClick={() => setDoor(null)} className="mb-3 w-fit text-xs text-haze-500 hover:text-haze-300">
              ← 「{door.label}」· 换个心情
            </button>
            {poem && (
              <button onClick={() => onOpen(poem)} className="block flex-1 text-left">
                <div className="space-y-1.5 font-serif text-[18px] leading-relaxed text-haze-100">
                  {previewLines(poem).map((l, i) => <p key={i}>{l}</p>)}
                </div>
                <p className="mt-3 text-sm text-haze-500">—— {poem.author}《{poem.title}》</p>
                <p className="mt-3 rounded-lg bg-gold-500/[0.07] p-2.5 text-[13px] leading-relaxed text-haze-300">
                  {poem.whyNow}
                </p>
              </button>
            )}
            <button
              onClick={() => setNonce((n) => n + 1)}
              className="mt-4 w-fit rounded-lg border border-mist-400/70 bg-ink-500/30 px-4 py-1.5 text-sm text-haze-300 transition-colors hover:border-gold-500/50 hover:text-gold-300"
            >
              再遇见一句
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
