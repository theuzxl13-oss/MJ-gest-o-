import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'light' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-brand shadow-sm hover:shadow-soft',
  gold: 'bg-gold text-forest-900 hover:bg-gold-light shadow-sm',
  outline: 'border border-forest/25 text-forest hover:border-forest hover:bg-forest hover:text-white',
  ghost: 'text-forest hover:bg-forest/5',
  light: 'border border-white/40 text-white hover:bg-white hover:text-forest',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[15px]',
  lg: 'px-8 py-4 text-base',
};

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({ variant, size, className, ...props }: CommonProps & ComponentProps<'button'>) {
  return <button type="button" className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  href,
  external,
  ...props
}: CommonProps & { href: string; external?: boolean } & Omit<ComponentProps<'a'>, 'href'>) {
  if (external || /^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={buttonClasses(variant, size, className)}
        {...props}
      />
    );
  }
  return <Link href={href} className={buttonClasses(variant, size, className)} {...props} />;
}
