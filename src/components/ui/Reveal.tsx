'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Animação discreta de entrada ao rolar a página.
 * A estrutura é idêntica no servidor e no cliente; a preferência
 * "reduzir movimento" é tratada pelo MotionConfig (SiteDataProvider).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'article';
}) {
  const Cmp = motion[as];
  return (
    <Cmp
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Cmp>
  );
}
