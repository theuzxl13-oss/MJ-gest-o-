'use client';

import { motion } from 'framer-motion';
import { Leaf, LineChart, ShieldCheck } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { useSiteData } from '@/context/SiteDataProvider';
import { resolveImage } from '@/lib/config';

export function Hero() {
  const { settings } = useSiteData();
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden">
      <div className="leaf-pattern absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block" aria-hidden="true" />
      <div className="container relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div>
          <motion.p className="eyebrow mb-6" {...fade(0)}>Consultoria • Gestão • Meio Ambiente</motion.p>
          <motion.h1 className="text-[2.4rem] leading-[1.1] md:text-5xl lg:text-[3.6rem]" {...fade(0.08)}>
            {settings.hero_title}
          </motion.h1>
          <motion.p className="mt-7 max-w-xl text-lg leading-relaxed text-graphite/70" {...fade(0.16)}>
            {settings.hero_subtitle}
          </motion.p>
          <motion.div className="mt-10 flex flex-col gap-3 sm:flex-row" {...fade(0.24)}>
            <ButtonLink href="/servicos" size="lg">Conheça nossos serviços</ButtonLink>
            <ButtonLink href="/contato" variant="outline" size="lg">Solicite uma proposta</ButtonLink>
          </motion.div>
          <motion.ul className="mt-12 grid max-w-xl grid-cols-1 gap-4 border-t border-forest/10 pt-8 text-sm sm:grid-cols-3" {...fade(0.32)}>
            {[
              { Icon: LineChart, label: 'Gestão empresarial' },
              { Icon: Leaf, label: 'Gestão ambiental' },
              { Icon: ShieldCheck, label: 'Sustentabilidade e ESG' },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-forest">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/5"><Icon className="h-4 w-4 text-brand" /></span>
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -left-6 -top-6 h-full w-full rounded-[2rem] border border-gold/40" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImage(settings.hero_image_url, '/images/hero/hero.svg')}
            alt="Ilustração de paisagem natural integrada a um ambiente corporativo"
            className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-soft sm:aspect-[5/4] lg:aspect-[4/5]"
            fetchPriority="high"
          />
          <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-white/95 p-5 shadow-soft backdrop-blur sm:left-auto sm:right-8 sm:w-72">
            <p className="font-serif text-lg italic text-forest">“{settings.slogan}”</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">{settings.company_name}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
