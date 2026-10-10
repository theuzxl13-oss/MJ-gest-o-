'use client';

import { Compass, Eye, Gem, UserRound } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { useSiteData } from '@/context/SiteDataProvider';
import { asset, resolveImage } from '@/lib/config';

export function AboutContent() {
  const { settings, team } = useSiteData();

  return (
    <>
      <Section tone="white">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Quem somos" title={settings.company_name} />
            <Reveal>
              <p className="text-lg leading-relaxed text-graphite/75">{settings.about_who}</p>
              <p className="mt-6 font-serif text-2xl italic text-forest">“{settings.slogan}”</p>
            </Reveal>
          </div>
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/images/about.svg')} alt="Ilustração institucional com elementos de natureza e escritório" loading="lazy" className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-soft" />
          </Reveal>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { Icon: Compass, title: 'Missão', text: settings.mission },
            { Icon: Eye, title: 'Visão', text: settings.vision },
          ].map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="card relative overflow-hidden p-10">
              <Icon className="h-8 w-8 text-gold" strokeWidth={1.5} />
              <h2 className="mt-6 text-3xl">{title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-graphite/75">{text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="forest">
        <SectionHeading light eyebrow="Nossos valores" title="Princípios que orientam cada projeto" />
        <ul className="grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {settings.values.map((v, i) => (
            <Reveal as="li" key={v} delay={i * 0.05} className="flex items-start gap-4 bg-forest p-8">
              <Gem className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
              <span className="font-serif text-xl text-white">{v.replace(/\.$/, '')}</span>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="white" id="equipe">
        <SectionHeading
          eyebrow="Equipe"
          title="Responsáveis técnicos e profissionais"
          description="Profissionais responsáveis pela condução dos trabalhos da MJ Gestão & Ambiental."
        />
        {team.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-forest/20 bg-offwhite p-10 text-center md:p-14">
            <UserRound className="mx-auto h-10 w-10 text-gold" strokeWidth={1.4} />
            <p className="mx-auto mt-4 max-w-lg text-graphite/70">
              As informações da equipe, incluindo formação e registros profissionais, serão publicadas após o cadastro e a
              validação pela administração da empresa.
            </p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <Reveal as="li" key={m.id} delay={i * 0.06} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveImage(m.photo_url, '/images/team-placeholder.svg')} alt={m.photo_url ? `Foto de ${m.name}` : ''} loading="lazy" className="aspect-[4/3] w-full bg-forest-50 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl">{m.name}</h3>
                  {m.role && <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-gold-dark">{m.role}</p>}
                  {m.credentials && <p className="mt-2 text-sm text-graphite/60">{m.credentials}</p>}
                  {m.bio && <p className="mt-4 text-[15px] leading-relaxed text-graphite/75">{m.bio}</p>}
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
