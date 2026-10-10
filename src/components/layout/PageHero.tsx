import type { ReactNode } from 'react';
import { asset } from '@/lib/config';

/** Cabeçalho das páginas internas. */
export function PageHero({
  eyebrow,
  title,
  description,
  image = '/images/hero/pattern.svg',
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-forest text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(image)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-forest/40" aria-hidden="true" />
      <div className="container relative py-20 md:py-28">
        <p className="eyebrow mb-5 text-gold-light">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl leading-tight text-white md:text-5xl lg:text-[3.5rem]">{title}</h1>
        {description && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
