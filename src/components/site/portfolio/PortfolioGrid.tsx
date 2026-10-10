'use client';

import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProjectCard } from '@/components/site/ProjectCard';
import { ProjectModal } from '@/components/site/ProjectModal';
import { Reveal } from '@/components/ui/Reveal';
import { useSiteData } from '@/context/SiteDataProvider';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

export function PortfolioGrid() {
  const { projects, categories } = useSiteData();
  const [filter, setFilter] = useState<string>('todos');
  const [open, setOpen] = useState<Project | null>(null);

  const usedCategories = categories.filter((c) => projects.some((p) => p.category_id === c.id));
  const visible = useMemo(
    () =>
      [...projects]
        .filter((p) => filter === 'todos' || p.category_id === filter)
        .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || b.updated_at.localeCompare(a.updated_at)),
    [projects, filter],
  );
  const hasIllustrative = projects.some((p) => p.is_illustrative);

  return (
    <div className="container py-16 md:py-20">
      {hasIllustrative && (
        <div className="mb-10 flex gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm text-forest">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
          <p>
            Os projetos marcados como <strong>“Exemplo ilustrativo”</strong> demonstram apenas o formato de apresentação.
            Eles não representam clientes, trabalhos executados ou resultados reais.
          </p>
        </div>
      )}

      <div role="group" aria-label="Filtrar projetos por categoria" className="mb-10 flex flex-wrap gap-2">
        {[{ id: 'todos', name: 'Todos' }, ...usedCategories].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            aria-pressed={filter === c.id}
            className={cn(
              'rounded-full border px-5 py-2 text-sm transition',
              filter === c.id ? 'border-forest bg-forest text-white' : 'border-forest/15 text-forest hover:border-forest',
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-forest/20 p-12 text-center text-graphite/60">
          Nenhum projeto publicado nesta categoria até o momento.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
              <ProjectCard project={p} category={categories.find((c) => c.id === p.category_id)} onOpen={() => setOpen(p)} />
            </Reveal>
          ))}
        </div>
      )}

      <ProjectModal project={open} category={categories.find((c) => c.id === open?.category_id)} onClose={() => setOpen(null)} />
    </div>
  );
}
