import { PageHero } from '@/components/layout/PageHero';
import { CtaBand } from '@/components/site/CtaBand';
import { ServiceCatalog } from '@/components/site/services/ServiceCatalog';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Serviços',
  description:
    'Catálogo de serviços em gestão empresarial, gestão ambiental, sustentabilidade e ESG, assessoria e organização documental.',
  path: '/servicos',
});

export default function ServicosPage() {
  return (
    <>
      <PageHero
        eyebrow="Serviços"
        title="Soluções em gestão, meio ambiente e sustentabilidade"
        description="Conheça nosso catálogo de serviços. Clique em um serviço para ver benefícios, etapas de atendimento e solicitar um orçamento."
        image="/images/hero/pattern.svg"
      />
      <ServiceCatalog />
      <CtaBand title="Não encontrou o que procura?" description="Descreva sua necessidade e avaliaremos a melhor forma de apoiar sua empresa." />
    </>
  );
}
