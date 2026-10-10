'use client';

import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { useSiteData } from '@/context/SiteDataProvider';
import { whatsappLink } from '@/lib/whatsapp';

function Item({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold-light">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-light">{label}</p>
        <div className="mt-1 text-white/90">{children}</div>
      </div>
    </li>
  );
}

const pending = <span className="text-white/50">Em breve</span>;

export function ContactInfo() {
  const { settings } = useSiteData();
  const wa = whatsappLink(settings.whatsapp);
  const socials = [
    { href: settings.socials.instagram, label: 'Instagram', Icon: Instagram },
    { href: settings.socials.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: settings.socials.facebook, label: 'Facebook', Icon: Facebook },
    { href: settings.socials.youtube, label: 'YouTube', Icon: Youtube },
  ].filter((s) => s.href);

  return (
    <aside className="relative overflow-hidden rounded-3xl bg-forest p-8 text-white md:p-10">
      <div className="leaf-pattern absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative">
        <h2 className="text-2xl text-white">Canais de atendimento</h2>
        <p className="mt-3 text-white/70">Responderemos sua solicitação o mais breve possível.</p>

        {wa && (
          <ButtonLink href={wa} variant="gold" className="mt-8 w-full">
            Conversar pelo WhatsApp
          </ButtonLink>
        )}

        <ul className="mt-8 space-y-6">
          <Item icon={<Phone className="h-5 w-5" />} label="WhatsApp / Telefone">
            {settings.phone ? <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="hover:text-gold-light">{settings.phone}</a> : settings.whatsapp ? settings.whatsapp : pending}
          </Item>
          <Item icon={<Mail className="h-5 w-5" />} label="E-mail institucional">
            {settings.email ? <a href={`mailto:${settings.email}`} className="break-all hover:text-gold-light">{settings.email}</a> : pending}
          </Item>
          <Item icon={<MapPin className="h-5 w-5" />} label="Endereço">{settings.address || pending}</Item>
          <Item icon={<Clock className="h-5 w-5" />} label="Horário de atendimento">{settings.business_hours || pending}</Item>
        </ul>

        {socials.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-light">Redes sociais</p>
            <ul className="mt-4 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold">
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
