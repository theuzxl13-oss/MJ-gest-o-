import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const tones = {
  gold: 'bg-gold/15 text-gold-dark border-gold/30',
  green: 'bg-brand/10 text-brand border-brand/20',
  gray: 'bg-graphite/5 text-graphite/70 border-graphite/10',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  blue: 'bg-sky-50 text-sky-800 border-sky-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  white: 'bg-white/90 text-forest border-white',
};

export function Badge({ children, tone = 'gray', className }: { children: ReactNode; tone?: keyof typeof tones; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}
