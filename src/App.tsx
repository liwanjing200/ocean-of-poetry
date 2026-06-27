import { useMemo, useRef, useState, useCallback } from 'react';
import type { Poem, Poet, Theme } from './types';
import { poems, poets, poetByName } from './data/poets';
import { useFavorites } from './hooks/useFavorites';
import { useMediaQuery } from './hooks/useMediaQuery';
import { toLines } from './lib/poem';
import LeftNav, { type NavKey } from './components/LeftNav';
import StarMap from './components/StarMap';
import DetailCard from './components/DetailCard';
import DailyPoem from './components/DailyPoem';
import EmotionFinder from './components/EmotionFinder';
import DynastyRiver from './components/DynastyRiver';
import Modal from './components/Modal';
import PoemView from './components/PoemView';

type Filter =
  | { kind: 'dynasty'; value: string }
  | { kind: 'theme'; value: Theme }
  | null;

type ModalState =
  | null
  | { type: 'about' }
  | { type: 'favorites' }
  | { type: 'poets' }
  | { type: 'themes' }
  | { type: 'search' }
  | { type: 'poet'; poet: Poet }
  | { type: 'poem'; poem: Poem };

const ALL_THEMES: Theme[] = ['月', '江', '山', '酒', '春', '雨', '故乡', '夜', '战争', '自然', '人生'];

export default function App() {
  const fav = useFavorites();
  useMediaQuery('(max-width: 880px)'); // re-render on breakpoint change
  const [nav, setNav] = useState<NavKey>('map');
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [query, setQuery] = useState('');

  const dailyRef = useRef<HTMLDivElement>(null);
  const emotionRef = useRef<HTMLDivElement>(null);
  const riverRef = useRef<HTMLDivElement>(null);

  const selectedPoet = selected ? poetByName.get(selected) ?? null : null;

  // Highlight set derived from the active filter.
  const highlight = useMemo<Set<string> | null>(() => {
    if (!filter) return null;
    const names = new Set<string>();
    if (filter.kind === 'dynasty') {
      for (const p of poets) if (p.dynasty === filter.value) names.add(p.name);
    } else {
      for (const poem of poems)
        if (poem.themes.includes(filter.value)) names.add(poem.author);
    }
    return names;
  }, [filter]);

  const onSelectPoet = useCallback((name: string) => {
    setSelected(name);
    if (window.matchMedia('(max-width: 880px)').matches) {
      const poet = poetByName.get(name);
      if (poet) setModal({ type: 'poet', poet });
    }
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const onNav = (k: NavKey) => {
    setNav(k);
    switch (k) {
      case 'map': setFilter(null); setModal(null); break;
      case 'poets': setModal({ type: 'poets' }); break;
      case 'themes': setModal({ type: 'themes' }); break;
      case 'favorites': setModal({ type: 'favorites' }); break;
      case 'about': setModal({ type: 'about' }); break;
      case 'emotions': scrollTo(emotionRef); break;
      case 'dynasties': scrollTo(riverRef); break;
      case 'daily': scrollTo(dailyRef); break;
    }
  };

  const searchResults = useMemo<Poem[]>(() => {
    const q = query.trim();
    if (!q) return [];
    return poems
      .filter(
        (p) =>
          p.title.includes(q) ||
          p.author.includes(q) ||
          p.paragraphs.some((l) => l.includes(q)),
      )
      .slice(0, 40);
  }, [query]);

  const favPoems = poems.filter((p) => fav.has(p.id));

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1500px] px-4 py-4 md:px-6 md:py-5">
      {/* ── header ── */}
      <header className="mb-4 flex flex-wrap items-center gap-4">
        <button onClick={() => onNav('map')} className="flex items-center gap-3">
          <Logo />
          <div className="text-left leading-tight">
            <div className="font-serif text-xl tracking-[0.2em] text-gold-300">千年诗海</div>
            <div className="text-[10px] tracking-[0.3em] text-haze-500">OCEAN OF POETRY</div>
          </div>
        </button>

        <form
          onSubmit={(e) => { e.preventDefault(); if (query.trim()) setModal({ type: 'search' }); }}
          className="order-3 w-full md:order-2 md:ml-auto md:w-80"
        >
          <div className="flex items-center gap-2 rounded-xl border border-mist-400/60 bg-ink-600/60 px-4 py-2">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-haze-500">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setModal({ type: 'search' })}
              placeholder="搜索诗句 / 诗人 / 关键词"
              className="w-full bg-transparent text-sm text-haze-100 placeholder:text-haze-500 focus:outline-none"
            />
          </div>
        </form>
      </header>

      {/* ── main grid ── */}
      <div className="grid gap-4 md:grid-cols-[170px_1fr] lg:grid-cols-[180px_1fr_360px]">
        <aside className="order-2 md:order-1">
          {/* desktop vertical nav; mobile horizontal scroll */}
          <div className="hidden md:block">
            <LeftNav active={nav} onSelect={onNav} />
          </div>
          <div className="md:hidden -mx-4 overflow-x-auto px-4">
            <div className="flex gap-2">
              <MobileNav active={nav} onSelect={onNav} />
            </div>
          </div>
        </aside>

        {/* star map */}
        <main className="order-1 md:order-2">
          <div className="relative h-[52vh] min-h-[340px] overflow-hidden rounded-2xl border border-mist-400/40 bg-ink-700/50 md:h-[58vh]">
            <StarMap poets={poets} selected={selected} highlight={highlight} onSelect={onSelectPoet} />
            <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
              <p className="font-serif text-sm text-haze-300/80">每一首诗，都是一颗星辰</p>
              <p className="mt-1 font-serif text-xs text-haze-500">在千年的诗海中，遇见你的诗</p>
            </div>
            <div className="pointer-events-none absolute bottom-4 right-4 text-right text-[11px] leading-relaxed text-haze-500/70">
              <div>拖拽探索诗海</div>
              <div>滚轮 / 双指缩放</div>
            </div>
            {filter && (
              <button
                onClick={() => { setFilter(null); setNav('map'); }}
                className="pointer-events-auto absolute left-4 top-4 rounded-full border border-gold-500/40 bg-ink-700/70 px-3 py-1 text-xs text-gold-300"
              >
                筛选：{filter.value} ✕
              </button>
            )}
          </div>
        </main>

        {/* detail card (desktop only; mobile uses modal) */}
        <aside className="order-3 hidden lg:block">
          <div className="h-[58vh] overflow-y-auto rounded-2xl border border-mist-400/40 bg-ink-600/50">
            <DetailCard
              poet={selectedPoet}
              favHas={fav.has}
              onToggleFav={fav.toggle}
              onExplore={(p) => setModal({ type: 'poet', poet: p })}
            />
          </div>
        </aside>
      </div>

      {/* ── bottom modules ── */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Panel innerRef={dailyRef}><DailyPoem poems={poems} /></Panel>
        <Panel innerRef={emotionRef}>
          <EmotionFinder poems={poems} onOpen={(p) => setModal({ type: 'poem', poem: p })} />
        </Panel>
        <Panel innerRef={riverRef}>
          <DynastyRiver
            poems={poems}
            active={filter?.kind === 'dynasty' ? filter.value : null}
            onPick={(d) => { setFilter(d ? { kind: 'dynasty', value: d } : null); setNav(d ? 'dynasties' : 'map'); }}
          />
        </Panel>
      </div>

      <footer className="mt-6 pb-6 text-center text-xs text-haze-500/60">
        诗词正文来源 chinese-poetry（CC BY-NC）· 情绪/主题/释义为编者标注 · 非商业用途
      </footer>

      {/* ── modals ── */}
      <Modal open={modal?.type === 'poem'} onClose={() => setModal(null)}>
        {modal?.type === 'poem' && (
          <PoemView poem={modal.poem} favHas={fav.has} onToggleFav={fav.toggle} />
        )}
      </Modal>

      <Modal open={modal?.type === 'poet'} onClose={() => setModal(null)} title={modal?.type === 'poet' ? `${modal.poet.name} · 诗作` : ''}>
        {modal?.type === 'poet' && (
          <PoetPoems poet={modal.poet} onOpen={(p) => setModal({ type: 'poem', poem: p })} />
        )}
      </Modal>

      <Modal open={modal?.type === 'poets'} onClose={() => setModal(null)} title="诗人">
        <PoetList onPick={(name) => { setSelected(name); const p = poetByName.get(name); setModal(p ? { type: 'poet', poet: p } : null); }} />
      </Modal>

      <Modal open={modal?.type === 'themes'} onClose={() => setModal(null)} title="按主题漫游">
        <div className="flex flex-wrap gap-2">
          {ALL_THEMES.map((t) => (
            <button
              key={t}
              onClick={() => { setFilter({ kind: 'theme', value: t }); setNav('themes'); setModal(null); }}
              className="rounded-lg border border-mist-400/60 bg-ink-500/40 px-4 py-2 text-haze-200 hover:border-gold-500/50 hover:text-gold-300"
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-haze-500">选择主题后，星图中相关诗人会被点亮。</p>
      </Modal>

      <Modal open={modal?.type === 'favorites'} onClose={() => setModal(null)} title={`我的收藏 · ${favPoems.length}`}>
        {favPoems.length === 0 ? (
          <p className="text-sm text-haze-500">还没有收藏。点击诗作旁的 ♡ 收藏你喜欢的诗句。</p>
        ) : (
          <PoemList poems={favPoems} onOpen={(p) => setModal({ type: 'poem', poem: p })} />
        )}
      </Modal>

      <Modal open={modal?.type === 'search'} onClose={() => setModal(null)} title={`搜索 “${query.trim()}”`}>
        {searchResults.length === 0 ? (
          <p className="text-sm text-haze-500">没有找到相关诗句。</p>
        ) : (
          <PoemList poems={searchResults} onOpen={(p) => setModal({ type: 'poem', poem: p })} />
        )}
      </Modal>

      <Modal open={modal?.type === 'about'} onClose={() => setModal(null)} title="关于 · 千年诗海">
        <div className="space-y-3 text-sm leading-relaxed text-haze-300">
          <p>千年诗海是一片可以漫游的中国古诗词星海。每一位诗人是一颗星，同时代的诗人以淡金的光线相连，构成一个个星座。</p>
          <p>第一版精选 <span className="text-gold-300">{poems.length}</span> 首诗词，涵盖 <span className="text-gold-300">{poets.length}</span> 位诗人、{new Set(poems.map((p) => p.dynasty)).size} 个朝代。</p>
          <p className="text-haze-500">诗词正文来源于开源数据集 chinese-poetry（繁体经转换为简体），并做异体字规整；情绪、主题与现代释义为编者标注，仅供欣赏参考，非商业用途。</p>
        </div>
      </Modal>
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
      <circle cx="20" cy="20" r="18" fill="none" stroke="#b8975a" strokeWidth="0.8" opacity="0.5" />
      <path d="M20 6l3.2 9 9.3.3-7.4 5.7 2.6 9-7.7-5.3-7.7 5.3 2.6-9-7.4-5.7 9.3-.3z" fill="#e8cf8f" opacity="0.9" />
    </svg>
  );
}

function Panel({ children, innerRef }: { children: React.ReactNode; innerRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={innerRef} className="min-h-[220px] rounded-2xl border border-mist-400/40 bg-ink-600/40 p-6">
      {children}
    </div>
  );
}

function MobileNav({ active, onSelect }: { active: NavKey; onSelect: (k: NavKey) => void }) {
  const items: { key: NavKey; label: string }[] = [
    { key: 'map', label: '星图' }, { key: 'poets', label: '诗人' },
    { key: 'themes', label: '主题' }, { key: 'emotions', label: '情绪' },
    { key: 'dynasties', label: '朝代' }, { key: 'favorites', label: '收藏' },
    { key: 'daily', label: '每日' }, { key: 'about', label: '关于' },
  ];
  return (
    <>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onSelect(it.key)}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm ${
            active === it.key ? 'bg-gold-500/15 text-gold-300' : 'bg-ink-500/40 text-haze-300'
          }`}
        >
          {it.label}
        </button>
      ))}
    </>
  );
}

function PoetPoems({ poet, onOpen }: { poet: Poet; onOpen: (p: Poem) => void }) {
  return (
    <div>
      <p className="mb-4 text-sm text-haze-500">{poet.dynasty}代 · {poet.life} · 收录 {poet.poems.length} 首</p>
      <PoemList poems={poet.poems} onOpen={onOpen} />
    </div>
  );
}

function PoemList({ poems: list, onOpen }: { poems: Poem[]; onOpen: (p: Poem) => void }) {
  return (
    <ul className="divide-y divide-mist-400/30">
      {list.map((p) => (
        <li key={p.id}>
          <button onClick={() => onOpen(p)} className="block w-full py-3 text-left hover:opacity-80">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-serif text-lg text-haze-100">《{p.title}》</span>
              <span className="shrink-0 text-xs text-haze-500">{p.author}</span>
            </div>
            <p className="mt-1 truncate font-serif text-sm text-haze-400">{toLines(p)[0]}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function PoetList({ onPick }: { onPick: (name: string) => void }) {
  const byDyn = useMemo(() => {
    const m = new Map<string, Poet[]>();
    for (const p of poets) { const a = m.get(p.dynasty) ?? []; a.push(p); m.set(p.dynasty, a); }
    return m;
  }, []);
  return (
    <div className="space-y-5">
      {['先秦', '唐', '五代', '宋', '清'].map((d) =>
        byDyn.has(d) ? (
          <div key={d}>
            <div className="mb-2 text-xs tracking-widest text-haze-500">{d}</div>
            <div className="flex flex-wrap gap-2">
              {byDyn.get(d)!.map((p) => (
                <button
                  key={p.name}
                  onClick={() => onPick(p.name)}
                  className="rounded-lg border border-mist-400/50 bg-ink-500/40 px-3 py-1.5 text-sm text-haze-200 hover:border-gold-500/50 hover:text-gold-300"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
