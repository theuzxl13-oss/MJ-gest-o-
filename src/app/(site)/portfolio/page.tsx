import { PageHero } from '@/components/layout/PageHero';
import { CtaBand } from '@/components/site/CtaBand';
import { PortfolioGrid } from '@/components/site/portfolio/PortfolioGrid';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Portfólio e Projetos',
  description: 'Projetos de gestão empresarial, gestão ambiental e sustentabilidade apresentados pela MJ Gestão & Ambiental.',
  path: '/portfolio',
});

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfólio"
        title="Projetos e trabalhos"
        description="Conheça como estruturamos nossos projetos: o problema identificado, a solução aplicada e os resultados alcançados."
        image="/images/hero/pattern.svg"
      />
      <PortfolioGrid />
      <CtaBand />
    </>
  );
}
