import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { SiteDataProvider } from '@/context/SiteDataProvider';
import { siteUrl } from '@/lib/config';
import { getInitialData } from '@/lib/data/server';
import { SITE_DESCRIPTION, SITE_NAME, organizationJsonLd } from '@/lib/seo';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SITE_NAME} | Gestão responsável, resultados sustentáveis`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['gestão ambiental', 'consultoria empresarial', 'sustentabilidade', 'ESG', 'gestão administrativa', 'gestão de resíduos'],
  openGraph: { type: 'website', locale: 'pt_BR', siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', title: SITE_NAME, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#103B2B',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialData = await getInitialData();
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(initialData.settings)).replace(/</g, '\\u003c') }}
        />
        <SiteDataProvider initialData={initialData}>{children}</SiteDataProvider>
      </body>
    </html>
  );
}
