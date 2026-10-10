'use client';

import { asset } from '@/lib/config';
import { cn } from '@/lib/utils';

/** Logomarca: usa a imagem cadastrada no painel ou a marca padrão em SVG. */
export function Logo({ src, light = false, className }: { src?: string | null; light?: boolean; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={asset(src)} alt="MJ Gestão & Ambiental" className={cn('h-11 w-auto object-contain', className)} />;
  }
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0" aria-hidden="true">
        <circle cx="24" cy="24" r="23" fill={light ? '#FFFFFF' : '#103B2B'} />
        <circle cx="24" cy="24" r="20.5" fill="none" stroke="#B69A5B" strokeWidth="0.8" />
        <path
          d="M13 32V16l6.5 9 6.5-9v16"
          fill="none"
          stroke={light ? '#103B2B' : '#FFFFFF'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M33 16v12.5c0 2.6-1.8 4-4 4" fill="none" stroke="#B69A5B" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M33.5 12.5c2.8-.4 4.6.6 5 2.6-2.7.6-4.4-.2-5-2.6z" fill="#B69A5B" />
      </svg>
      <span className="leading-none">
        <span className={cn('block font-serif text-[1.15rem] font-semibold tracking-wide', light ? 'text-white' : 'text-forest')}>
          MJ Gestão
        </span>
        <span className={cn('mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.32em]', light ? 'text-gold-light' : 'text-gold-dark')}>
          & Ambiental
        </span>
      </span>
    </span>
  );
}
