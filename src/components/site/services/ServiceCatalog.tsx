'use client';

import { ArrowRight, Info } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';
import { useSiteData } from '@/context/SiteDataProvider';
import { Icon } from '@/lib/icons';
import type { Service } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ServiceModal } from './ServiceModal';

export function ServiceCatalog() {
  const { categories, services, setFocusedService } = useSiteData();
  const [selected, setSelected] = useState<Service | null>(null);
  const hasDrafts = services.some((s) => s.status === 'draft');

  const grouped = useMemo(
    () => categories.map((c) => ({ category: c, items: services.filter((s) => s.category_id === c.id) })).filter((g) => g.items.length > 0),
    [categories, services],
  );

  // Link direto para um serviço: /servicos#slug-do-servico
  useEffect(() => {
    const openFromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const found = services.find((s) => s.slug === slug);
      if (found) setSelected(found);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [services]);

  useEffect(() => {
    setFocusedService(selected?.name ?? null);
  }, [selected, setFocusedService]);

  useEffect(() => () => setFocusedService(null), [setFocusedService]);

  const close = () => {
    setSelected(null);
    if (services.some((s) => `#${s.slug}` === window.location.hash)) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  return (
    <>
      {/* Navegação por categorias */}
      <nav aria-label="Categorias de serviços" className="sticky top-[var(--header-h)] z-30 border-b border-forest/10 bg-offwhite/95 backdrop-blur">
        <div className="container flex gap-2 overflow-x-auto py-3">
          {grouped.map(({ category }) => (
            <a key={category.id} href={`#${category.slug}`} className="shrink-0 rounded-full border border-forest/15 px-4 py-2 text-sm text-forest transition hover:border-forest hover:bg-forest hover:text-white">
              {category.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="container py-16 md:py-20">
        {hasDrafts && (
          <div className="mb-14 flex gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm text-forest">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
            <p>
              <strong>Catálogo em validação.</strong> Os serviços identificados como “Rascunho” são propostas sujeitas à aprovação
              da empresa. Atividades técnicas regulamentadas (como laudos, projetos técnicos e licenciamento) dependem de
              profissionais legalmente habilitados e não são oferecidas sem a devida confirmação.
            </p>
          </div>
        )}

        {grouped.length === 0 && <p className="text-center text-graphite/60">Nenhum serviço publicado no momento.</p>}

        <div className="space-y-24">
          {grouped.map(({ category, items }) => (
            <section key={category.id} id={category.slug} aria-labelledby={`h-${category.slug}`} className="scroll-mt-40">
              <Reveal className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="flex items-start gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest text-gold-light">
                    <Icon name={category.icon} className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 id={`h-${category.slug}`} className="text-3xl md:text-4xl">{category.name}</h2>
                    <p className="mt-2 max-w-2xl text-graphite/70">{category.description}</p>
                  </div>
                </div>
              </Reveal>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((service, i) => (
                  <Reveal as="li" key={service.id} delay={Math.min(i, 6) * 0.04}>
                    <button
                      type="button"
                      onClick={() => setSelected(service)}
                      className={cn(
                        'group card flex h-full w-full flex-col p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/5 text-brand transition group-hover:bg-forest group-hover:text-gold-light">
                          <Icon name={service.icon} className="h-5 w-5" />
                        </span>
                        {service.status === 'draft' && <Badge tone="amber">Rascunho</Badge>}
                      </div>
                      <h3 className="mt-5 font-serif text-lg leading-snug text-forest">{service.name}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite/70">{service.summary}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest">
                        Detalhes e orçamento <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <ServiceModal service={selected} category={categories.find((c) => c.id === selected?.category_id)} onClose={close} />
    </>
  );
}
