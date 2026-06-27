import { type ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Modal({
  open, onClose, title, children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-mist-400/60 bg-ink-700/95 p-7 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="font-serif text-xl text-gold-300">{title}</div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-haze-500 hover:bg-ink-500/60 hover:text-haze-100"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
