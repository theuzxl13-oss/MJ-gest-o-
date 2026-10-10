'use client';

import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useSiteData } from '@/context/SiteDataProvider';
import { NAV_ITEMS } from './nav';

export function Footer() {
  const { settings, categories } = useSiteData();
  const socials = [
    { href: settings.socials.instagram, label: 'Instagram', Icon: Instagram },
    { href: settings.socials.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: settings.socials.facebook, label: 'Facebook', Icon: Facebook },
    { href: settings.socials.youtube, label: 'YouTube', Icon: Youtube },
  ].filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden bg-forest-900 text-white/75">
      <div className="leaf-pattern absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="container relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo src={settings.logo_url} light />
          <p className="mt-6 max-w-xs font-serif text-lg italic text-white/85">“{settings.slogan}”</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Navegação</h2>
          <ul className="space-y-2.5 text-[15px]">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Áreas de atuação</h2>
          <ul className="space-y-2.5 text-[15px]">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/servicos#${c.slug}`} className="transition hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Contato</h2>
          <ul className="space-y-3.5 text-[15px]">
            {settings.email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-white">{settings.email}</a>
              </li>
            )}
            {settings.phone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white">{settings.phone}</a>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.business_hours && (
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{settings.business_hours}</span>
              </li>
            )}
            <li>
              <Link href="/contato" className="inline-flex items-center gap-2 text-gold-light underline-offset-4 hover:underline">
                Enviar solicitação pelo formulário →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container flex flex-col gap-3 py-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {settings.company_name}. Todos os direitos reservados.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href="/politica-de-privacidade" className="hover:text-white">Política de Privacidade</Link></li>
            <li><Link href="/admin" className="hover:text-white" rel="nofollow">Área administrativa</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
