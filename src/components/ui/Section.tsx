import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

export function Section({
  id,
  className,
  children,
  tone = 'default',
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  tone?: 'default' | 'white' | 'forest';
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-20 md:py-28',
        tone === 'white' && 'bg-white',
        tone === 'forest' && 'bg-forest text-white',
        className,
      )}
    >
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  light?: boolean;
}) {
  return (
    <Reveal className={cn('mb-12 max-w-3xl md:mb-16', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && <p className={cn('eyebrow mb-4', light && 'text-gold-light', align === 'center' && 'justify-center')}>{eyebrow}</p>}
      <h2 className={cn('text-3xl leading-tight md:text-[2.75rem]', light && 'text-white')}>{title}</h2>
      {description && (
        <p className={cn('mt-5 text-lg leading-relaxed', light ? 'text-white/75' : 'text-graphite/70')}>{description}</p>
      )}
    </Reveal>
  );
}
