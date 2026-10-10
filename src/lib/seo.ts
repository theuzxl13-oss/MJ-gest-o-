import type { Metadata } from 'next';
import { siteUrl } from './config';
import type { SiteSettings } from './types';

export const SITE_NAME = 'MJ Gestão & Ambiental';
export const SITE_DESCRIPTION =
  'Consultoria em gestão empresarial, gestão ambiental, sustentabilidade e ESG. Soluções para organizações mais eficientes, responsáveis e preparadas para o futuro.';

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: path, type: 'website', locale: 'pt_BR', siteName: SITE_NAME },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description },
  };
}

/** Dados estruturados (schema.org). Inclui apenas informações efetivamente cadastradas. */
export function organizationJsonLd(settings: SiteSettings) {
  const sameAs = Object.values(settings.socials).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: settings.company_name,
    slogan: settings.slogan,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    areaServed: 'BR',
    knowsAbout: ['Gestão empresarial', 'Gestão ambiental', 'Sustentabilidade', 'ESG', 'Consultoria administrativa'],
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.address ? { address: settings.address } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}
