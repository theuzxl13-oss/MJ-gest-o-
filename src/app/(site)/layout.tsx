import { CookieBanner } from '@/components/layout/CookieBanner';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <DemoBanner />
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </>
  );
}
