import { PageHero } from '@/components/layout/PageHero';
import { AboutContent } from '@/components/site/about/AboutContent';
import { CtaBand } from '@/components/site/CtaBand';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Sobre Nós',
  description: 'Conheça a MJ Gestão & Ambiental: missão, visão, valores e compromisso com a gestão responsável e sustentável.',
  path: '/sobre',
});

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre a empresa"
        title="Gestão responsável, resultados sustentáveis"
        description="Unimos organização administrativa, melhoria de processos e responsabilidade ambiental para apoiar empresas em seu desenvolvimento."
        image="/images/hero/pattern.svg"
      />
      <AboutContent />
      <CtaBand />
    </>
  );
}
