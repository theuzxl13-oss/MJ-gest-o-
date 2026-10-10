'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { resolveImage } from '@/lib/config';
import { PROJECT_STATUS_LABELS, type Project, type ServiceCategory } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

export function ProjectModal({
  project,
  category,
  onClose,
}: {
  project: Project | null;
  category?: ServiceCategory;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);
  const images = project?.images.length ? project.images : ['/images/projects/processos.svg'];

  return (
    <Modal open={!!project} onClose={() => { setActive(0); onClose(); }} title={project?.title ?? ''} size="xl">
      {project && (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImage(images[active] ?? images[0], '/images/projects/processos.svg')} alt={`Imagem do projeto ${project.title}`} className="aspect-[16/10] w-full rounded-2xl object-cover" />
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={img + i} type="button" onClick={() => setActive(i)} className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2', i === active ? 'border-gold' : 'border-transparent opacity-70')} aria-label={`Imagem ${i + 1}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveImage(img, '')} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {project.is_illustrative && (
              <p className="mt-4 flex gap-2 rounded-xl bg-gold/10 p-4 text-sm text-forest">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                Este é um exemplo ilustrativo, criado apenas para demonstrar a apresentação de projetos. Não representa trabalho realizado nem cliente real.
              </p>
            )}
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {project.is_illustrative && <Badge tone="gold">Exemplo ilustrativo</Badge>}
              {category && <Badge tone="green">{category.name}</Badge>}
              <Badge>{PROJECT_STATUS_LABELS[project.status]}</Badge>
            </div>
            <dl className="mt-6 space-y-5 text-[15px]">
              {project.client_authorized && project.client_name && (
                <div><dt className="text-xs font-semibold uppercase tracking-wider text-gold-dark">Cliente</dt><dd className="mt-1">{project.client_name}</dd></div>
              )}
              {project.executed_at && (
                <div><dt className="text-xs font-semibold uppercase tracking-wider text-gold-dark">Execução</dt><dd className="mt-1">{formatDate(project.executed_at, { month: 'long', year: 'numeric' })}</dd></div>
              )}
              {[
                ['Descrição', project.description],
                ['Problema identificado', project.problem],
                ['Solução aplicada', project.solution],
                ['Resultados', project.results],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gold-dark">{label}</dt>
                    <dd className="mt-1 whitespace-pre-line leading-relaxed text-graphite/80">{value}</dd>
                  </div>
                ))}
            </dl>
            <ButtonLink href={category ? `/contato?categoria=${category.slug}` : '/contato'} className="mt-8">
              Quero um projeto como este
            </ButtonLink>
          </div>
        </div>
      )}
    </Modal>
  );
}
