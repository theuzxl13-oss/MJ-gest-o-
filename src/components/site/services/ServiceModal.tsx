'use client';

import { Check, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useSiteData } from '@/context/SiteDataProvider';
import { resolveImage } from '@/lib/config';
import { Icon } from '@/lib/icons';
import type { Service, ServiceCategory } from '@/lib/types';
import { whatsappLink } from '@/lib/whatsapp';

export function ServiceModal({ service, category, onClose }: { service: Service | null; category?: ServiceCategory; onClose: () => void }) {
  const { settings } = useSiteData();
  const wa = service ? whatsappLink(settings.whatsapp, service.name) : null;

  return (
    <Modal open={!!service} onClose={onClose} title={service?.name ?? ''}>
      {service && (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {category && <Badge tone="green">{category.name}</Badge>}
            {service.status === 'draft' && <Badge tone="amber">Rascunho — sujeito à aprovação</Badge>}
          </div>

          {service.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveImage(service.image_url, '')} alt="" className="mt-6 aspect-[16/7] w-full rounded-2xl object-cover" />
          ) : (
            <div className="mt-6 flex items-center gap-5 rounded-2xl bg-forest p-6 text-white">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
                <Icon name={service.icon} className="h-7 w-7" />
              </span>
              <p className="text-white/85">{service.summary}</p>
            </div>
          )}

          <p className="mt-6 text-[15px] leading-relaxed text-graphite/80">{service.description}</p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {service.benefits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-dark">Benefícios</h3>
                <ul className="mt-4 space-y-3">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex gap-3 text-[15px]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {service.steps.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-dark">Etapas de atendimento</h3>
                <ol className="mt-4 space-y-3">
                  {service.steps.map((s, i) => (
                    <li key={s} className="flex gap-3 text-[15px]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-semibold text-white">{i + 1}</span>
                      <span className="text-graphite/80">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-forest/10 pt-6 sm:flex-row">
            <ButtonLink href={`/contato?servico=${service.slug}`}>Solicitar Orçamento</ButtonLink>
            {wa ? (
              <ButtonLink href={wa} variant="outline">
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </ButtonLink>
            ) : (
              <p className="self-center text-sm text-graphite/60">WhatsApp em configuração — use o formulário de orçamento.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
