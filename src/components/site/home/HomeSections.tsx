'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ArticleCard, ArticleModal } from '@/components/site/sustainability/Articles';
import { ProjectCard } from '@/components/site/ProjectCard';
import { ProjectModal } from '@/components/site/ProjectModal';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { useSiteData } from '@/context/SiteDataProvider';
import { asset } from '@/lib/config';
import { Icon } from '@/lib/icons';
import type { Article, Project } from '@/lib/types';

export function AboutTeaser() {
  const { settings } = useSiteData();
  return (
    <Section tone="white">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset('/images/about.svg')} alt="Ilustração de equipe em ambiente de trabalho com elementos naturais" loading="lazy" className="aspect-[5/4] w-full rounded-[2rem] object-cover" />
          <div className="absolute -bottom-6 -right-2 hidden rounded-2xl bg-forest p-6 text-white shadow-soft sm:block md:-right-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Nosso compromisso</p>
            <p className="mt-2 max-w-[14rem] font-serif text-lg">Eficiência e responsabilidade ambiental lado a lado.</p>
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow="Quem somos" title="Gestão com propósito, consultoria com responsabilidade." />
          <Reveal>
            <p className="text-lg leading-relaxed text-graphite/75">{settings.about_who}</p>
            <ul className="mt-8 space-y-3">
              {settings.values.slice(0, 4).map((v) => (
                <li key={v} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15"><Check className="h-3.5 w-3.5 text-gold-dark" /></span>
                  <span className="text-graphite/80">{v}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href="/sobre" variant="outline" className="mt-10">Conheça a MJ <ArrowRight className="h-4 w-4" /></ButtonLink>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

export function AreasSection() {
  const { categories, services } = useSiteData();
  return (
    <Section>
      <SectionHeading
        eyebrow="Áreas de atuação"
        title="Soluções integradas para a gestão do seu negócio"
        description="Atuamos de forma integrada nas frentes administrativa, ambiental e de sustentabilidade, sempre de acordo com a realidade de cada organização."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat, i) => {
          const count = services.filter((s) => s.category_id === cat.id).length;
          return (
            <Reveal key={cat.id} delay={i * 0.08}>
              <Link href={`/servicos#${cat.slug}`} className="group card flex h-full flex-col p-7 transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-gold-light transition group-hover:bg-brand">
                  <Icon name={cat.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-xl">{cat.name}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-graphite/70">{cat.description}</p>
                <span className="mt-6 flex items-center justify-between border-t border-forest/10 pt-4 text-sm font-medium text-forest">
                  {count} {count === 1 ? 'serviço' : 'serviços'}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

const METHOD = [
  { title: 'Diagnóstico', text: 'Entendemos o contexto, os processos e os desafios da organização.' },
  { title: 'Planejamento', text: 'Definimos prioridades, metas e um plano de ação realista.' },
  { title: 'Implementação', text: 'Apoiamos a execução das ações junto à sua equipe.' },
  { title: 'Acompanhamento', text: 'Monitoramos indicadores e promovemos a melhoria contínua.' },
];

export function MethodSection() {
  return (
    <Section tone="forest" className="relative overflow-hidden">
      <SectionHeading light eyebrow="Como trabalhamos" title="Um método claro, do diagnóstico aos resultados" />
      <ol className="grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {METHOD.map((step, i) => (
          <Reveal as="li" key={step.title} delay={i * 0.08} className="bg-forest p-8">
            <span className="font-serif text-5xl text-gold/80">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-6 text-xl text-white">{step.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

export function FeaturedProjects() {
  const { projects, categories } = useSiteData();
  const [open, setOpen] = useState<Project | null>(null);
  const featured = projects.filter((p) => p.is_featured).slice(0, 3);
  if (featured.length === 0) return null;
  return (
    <Section tone="white">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow="Portfólio" title="Projetos em destaque" description="Conheça a forma como estruturamos e apresentamos nossos trabalhos." />
        <ButtonLink href="/portfolio" variant="outline" className="mb-12 self-start md:mb-16 md:self-auto">Ver portfólio completo</ButtonLink>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <ProjectCard project={p} category={categories.find((c) => c.id === p.category_id)} onOpen={() => setOpen(p)} />
          </Reveal>
        ))}
      </div>
      <ProjectModal project={open} category={categories.find((c) => c.id === open?.category_id)} onClose={() => setOpen(null)} />
    </Section>
  );
}

export function KnowledgeSection() {
  const { articles } = useSiteData();
  const [open, setOpen] = useState<Article | null>(null);
  if (articles.length === 0) return null;
  return (
    <Section>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow="Conteúdos" title="Sustentabilidade na prática" description="Conteúdos educativos sobre gestão ambiental, ESG e eficiência." />
        <ButtonLink href="/sustentabilidade" variant="outline" className="mb-12 self-start md:mb-16 md:self-auto">Ver todos os conteúdos</ButtonLink>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {articles.slice(0, 3).map((a, i) => (
          <Reveal key={a.id} delay={i * 0.08}>
            <ArticleCard article={a} onOpen={() => setOpen(a)} />
          </Reveal>
        ))}
      </div>
      <ArticleModal article={open} onClose={() => setOpen(null)} />
    </Section>
  );
}
