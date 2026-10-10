'use client';

import { Factory, Landmark, Leaf, Lightbulb, Recycle, Users, Droplets } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { useSiteData } from '@/context/SiteDataProvider';
import { asset } from '@/lib/config';
import type { Article } from '@/lib/types';
import { ArticleCard, ArticleModal } from './Articles';

const TOPICS = [
  { Icon: Leaf, title: 'Importância da gestão ambiental', text: 'Conhecer e controlar os impactos das atividades permite prevenir riscos, reduzir custos e fortalecer a reputação da empresa.' },
  { Icon: Users, title: 'Responsabilidade socioambiental', text: 'Empresas fazem parte de uma comunidade. Atuar com responsabilidade significa considerar pessoas e meio ambiente nas decisões.' },
  { Icon: Lightbulb, title: 'Práticas sustentáveis nas empresas', text: 'Ações simples — como coleta seletiva, uso consciente de energia e compras responsáveis — geram resultados consistentes.' },
  { Icon: Recycle, title: 'Redução de desperdícios', text: 'Medir consumos, revisar processos e reaproveitar materiais reduz desperdícios e melhora a eficiência operacional.' },
  { Icon: Droplets, title: 'Gestão eficiente de recursos', text: 'Água, energia e insumos bem gerenciados significam economia financeira e menor pressão sobre os recursos naturais.' },
  { Icon: Factory, title: 'Desenvolvimento sustentável', text: 'Crescer de forma equilibrada, atendendo às necessidades atuais sem comprometer as gerações futuras.' },
  { Icon: Landmark, title: 'ESG e governança corporativa', text: 'Critérios ambientais, sociais e de governança orientam decisões mais transparentes, éticas e responsáveis.' },
];

export function SustainabilityContent() {
  const { articles } = useSiteData();
  const [open, setOpen] = useState<Article | null>(null);

  return (
    <>
      <Section tone="white">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Por que importa" title="Sustentabilidade é estratégia de negócio" />
            <Reveal className="prose-mj text-lg">
              <p>
                A sustentabilidade deixou de ser um tema periférico para se tornar parte da estratégia das organizações.
                Clientes, investidores, parceiros e a sociedade valorizam empresas que conciliam resultados econômicos com
                responsabilidade ambiental e social.
              </p>
              <p>
                Integrar a gestão ambiental à gestão empresarial permite identificar riscos e oportunidades, reduzir
                custos, aumentar a eficiência e construir uma reputação sólida no longo prazo.
              </p>
            </Reveal>
          </div>
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/images/sustentabilidade.svg')} alt="Ilustração de floresta e energia limpa" loading="lazy" className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-soft" />
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Temas essenciais" title="Pilares da gestão sustentável" align="center" />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map(({ Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={(i % 3) * 0.08} className="card p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/5 text-brand">
                <Icon className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-graphite/70">{text}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="white" id="conteudos">
        <SectionHeading eyebrow="Conteúdos educativos" title="Aprenda com a MJ" description="Artigos e orientações práticas para gestores e equipes." />
        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-forest/20 p-12 text-center text-graphite/60">Novos conteúdos serão publicados em breve.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 0.08}>
                <ArticleCard article={a} onOpen={() => setOpen(a)} />
              </Reveal>
            ))}
          </div>
        )}
        <ArticleModal article={open} onClose={() => setOpen(null)} />
      </Section>
    </>
  );
}
