'use client';

import { ArrowRight, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { resolveImage } from '@/lib/config';
import { PROJECT_STATUS_LABELS, type Project, type ServiceCategory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function ProjectCard({
  project,
  category,
  onOpen,
}: {
  project: Project;
  category?: ServiceCategory;
  onOpen: () => void;
}) {
  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <button type="button" onClick={onOpen} className="relative block aspect-[16/10] overflow-hidden bg-forest-50 text-left" aria-label={`Ver detalhes: ${project.title}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImage(project.images[0], '/images/projects/processos.svg')}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {project.is_illustrative && <Badge tone="gold" className="bg-white/95">Exemplo ilustrativo</Badge>}
        </div>
      </button>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-graphite/60">
          {category && <span className="font-semibold uppercase tracking-wider text-brand">{category.name}</span>}
          <span aria-hidden="true">•</span>
          <span>{PROJECT_STATUS_LABELS[project.status]}</span>
          {project.executed_at && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(project.executed_at, { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        <h3 className="text-xl leading-snug">{project.title}</h3>
        {project.client_authorized && project.client_name && (
          <p className="mt-1 text-sm font-medium text-graphite/70">Cliente: {project.client_name}</p>
        )}
        <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-relaxed text-graphite/70">{project.problem || project.description}</p>
        <button type="button" onClick={onOpen} className="mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-forest hover:text-brand">
          Ver detalhes <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}
