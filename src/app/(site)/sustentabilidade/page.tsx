import { PageHero } from '@/components/layout/PageHero';
import { CtaBand } from '@/components/site/CtaBand';
import { SustainabilityContent } from '@/components/site/sustainability/SustainabilityContent';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Sustentabilidade',
  description: 'Gestão ambiental, responsabilidade socioambiental, redução de desperdícios, ESG e governança: conteúdos educativos para empresas.',
  path: '/sustentabilidade',
});

export default function SustentabilidadePage() {
  return (
    <>
      <PageHero
        eyebrow="Sustentabilidade"
        title="Compromisso com um futuro sustentável"
        description="Conteúdos e práticas para empresas que desejam crescer com responsabilidade ambiental, social e de governança."
        image="/images/sustentabilidade.svg"
      />
      <SustainabilityContent />
      <CtaBand title="Pronto para dar o próximo passo?" description="Fale com a MJ e descubra como tornar sua empresa mais eficiente e sustentável." />
    </>
  );
}
