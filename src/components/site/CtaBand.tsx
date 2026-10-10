import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export function CtaBand({
  title = 'Vamos conversar sobre a sua empresa?',
  description = 'Conte-nos sua necessidade. Retornaremos com uma proposta adequada à realidade do seu negócio.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-forest px-8 py-14 text-center md:px-16 md:py-20">
          <div className="leaf-pattern absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-gold/30" aria-hidden="true" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-gold/20" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl text-white md:text-4xl">{title}</h2>
            <p className="mt-5 text-lg text-white/75">{description}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/contato" variant="gold" size="lg">Solicitar proposta</ButtonLink>
              <ButtonLink href="/servicos" variant="light" size="lg">Ver serviços</ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
