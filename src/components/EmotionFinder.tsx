import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Emotion, Poem } from '../types';
import { previewLines, pickRandom } from '../lib/poem';

const EMOTIONS: Emotion[] = [
  '孤独', '思念', '失眠', '恋爱', '自由', '低落', '治愈', '勇气', '离别', '旷达',
];

export default function EmotionFinder({
  poems,
  onOpen,
}: {
  poems: Poem[];
  onOpen: (p: Poem) => void;
}) {
  const [emotion, setEmotion] = useState<Emotion>('思念');
  const [nonce, setNonce] = useState(0);

  const matches = useMemo(
    () => poems.filter((p) => p.emotions.includes(emotion)),
    [poems, emotion],
  );
  const poem = useMemo(
    () => (matches.length ? pickRandom(matches) : null),
    [matches, nonce],
  );

  return (
    <section className="flex h-full flex-col">
      <h3 className="font-serif text-lg tracking-wide text-haze-200">按情绪寻找诗句</h3>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {EMOTIONS.map((e) => (
          <button
            key={e}
            onClick={() => { setEmotion(e); setNonce((n) => n + 1); }}
            className={`rounded-md px-2.5 py-1 text-[13px] transition-colors ${
              emotion === e
                ? 'bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/40'
                : 'text-haze-400 hover:bg-ink-500/40 hover:text-haze-200'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="mt-5 flex-1">
        {poem ? (
          <motion.button
            key={poem.id + nonce}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onOpen(poem)}
            className="block w-full text-left"
          >
            <div className="space-y-1.5 font-serif text-[18px] leading-relaxed text-haze-100">
              {previewLines(poem).map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
            <p className="mt-3 text-sm text-haze-500">
              —— {poem.author}《{poem.title}》
            </p>
          </motion.button>
        ) : (
          <p className="text-sm text-haze-500">暂无相关诗句</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-haze-500">
        <span className="text-xs">{matches.length} 首 · 含「{emotion}」</span>
        <button
          onClick={() => setNonce((n) => n + 1)}
          className="ml-auto rounded-lg border border-mist-400/70 bg-ink-500/30 px-4 py-1.5 text-sm text-haze-300 transition-colors hover:border-gold-500/50 hover:text-gold-300"
        >
          换一句
        </button>
      </div>
    </section>
  );
}
