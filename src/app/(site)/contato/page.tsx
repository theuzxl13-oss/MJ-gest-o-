import { Suspense } from 'react';
import { PageHero } from '@/components/layout/PageHero';
import { ContactInfo } from '@/components/site/contact/ContactInfo';
import { QuoteForm } from '@/components/site/contact/QuoteForm';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contato e Orçamento',
  description: 'Solicite um orçamento de consultoria em gestão empresarial, gestão ambiental, sustentabilidade e ESG.',
  path: '/contato',
});

export default function ContatoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contato"
        title="Vamos conversar sobre a sua empresa"
        description="Preencha o formulário com sua necessidade. Retornaremos com orientações e uma proposta adequada."
        image="/images/hero/pattern.svg"
      />
      <section className="py-16 md:py-24">
        <div className="container grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <Suspense fallback={<div className="card h-[600px] animate-pulse" />}>
            <QuoteForm />
          </Suspense>
          <ContactInfo />
        </div>
      </section>
    </>
  );
}
