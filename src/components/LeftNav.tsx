import type { JSX } from 'react';

export type NavKey =
  | 'map' | 'poets' | 'themes' | 'emotions'
  | 'dynasties' | 'favorites' | 'daily' | 'about';

const ICONS: Record<NavKey, JSX.Element> = {
  map: <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />,
  poets: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0113 0" /></>,
  themes: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17M3.5 12h17" /></>,
  emotions: <><circle cx="12" cy="12" r="8.5" /><circle cx="9" cy="10" r="1" /><circle cx="15" cy="10" r="1" /><path d="M8.5 14.5a4.5 4.5 0 007 0" /></>,
  dynasties: <><path d="M4 19h16M6 19V9l6-4 6 4v10" /><path d="M10 19v-5h4v5" /></>,
  favorites: <path d="M12 20s-7-4.6-7-9.4A3.6 3.6 0 0112 7a3.6 3.6 0 017 3.6C19 15.4 12 20 12 20z" />,
  daily: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
  about: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></>,
};

const ITEMS: { key: NavKey; label: string }[] = [
  { key: 'map', label: '诗海星图' },
  { key: 'poets', label: '诗人' },
  { key: 'themes', label: '主题' },
  { key: 'emotions', label: '情绪' },
  { key: 'dynasties', label: '朝代' },
  { key: 'favorites', label: '我的收藏' },
  { key: 'daily', label: '每日一诗' },
  { key: 'about', label: '关于' },
];

export default function LeftNav({
  active, onSelect,
}: { active: NavKey; onSelect: (k: NavKey) => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((it) => (
        <button
          key={it.key}
          onClick={() => onSelect(it.key)}
          className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
            active === it.key
              ? 'bg-ink-500/70 text-gold-300'
              : 'text-haze-300 hover:bg-ink-500/40 hover:text-haze-100'
          }`}
        >
          <svg
            viewBox="0 0 24 24" width="18" height="18"
            fill="none" stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round"
            className={active === it.key ? 'text-gold-400' : 'text-haze-500 group-hover:text-haze-300'}
          >
            {ICONS[it.key]}
          </svg>
          <span className="text-[15px] tracking-wide">{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
