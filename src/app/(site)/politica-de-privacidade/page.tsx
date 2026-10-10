import { PageHero } from '@/components/layout/PageHero';
import { PrivacyContent } from '@/components/site/PrivacyContent';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Política de Privacidade',
  description: 'Saiba como a MJ Gestão & Ambiental trata seus dados pessoais, em conformidade com a LGPD.',
  path: '/politica-de-privacidade',
});

export default function PrivacidadePage() {
  return (
    <>
      <PageHero eyebrow="LGPD" title="Política de Privacidade" image="/images/hero/pattern.svg" />
      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <PrivacyContent />
        </div>
      </section>
    </>
  );
}
