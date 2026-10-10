'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSiteData } from '@/context/SiteDataProvider';
import { whatsappLink } from '@/lib/whatsapp';

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
    </svg>
  );
}

/** Botão flutuante presente em todas as páginas; usa o serviço em foco na mensagem. */
export function WhatsAppButton() {
  const { settings, focusedService, services } = useSiteData();
  const [open, setOpen] = useState(false);
  const href = whatsappLink(settings.whatsapp, focusedService);
  const service = services.find((s) => s.name === focusedService);
  const contactHref = service ? `/contato?servico=${service.slug}` : '/contato';

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-5 right-5 z-[60] flex h-14 items-center gap-2 rounded-full bg-[#1f8f4e] pl-4 pr-4 text-white shadow-soft transition hover:bg-[#187a42] md:bottom-8 md:right-8"
        aria-label={focusedService ? `Falar no WhatsApp sobre ${focusedService}` : 'Falar no WhatsApp'}
      >
        <WhatsAppGlyph className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-[14rem] group-focus-visible:max-w-[14rem]">
          {focusedService ? 'Falar sobre este serviço' : 'Fale conosco'}
        </span>
      </a>
    );
  }

  // Número ainda não configurado pelo administrador: oferece o formulário como alternativa.
  return (
    <div className="fixed bottom-5 right-5 z-[60] md:bottom-8 md:right-8">
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Atendimento"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-0 w-72 rounded-2xl border border-forest/10 bg-white p-5 text-sm shadow-soft"
          >
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 text-graphite/50 hover:text-forest" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
            <p className="pr-4 font-medium text-forest">Atendimento via WhatsApp em configuração</p>
            <p className="mt-2 text-graphite/70">
              {focusedService
                ? `Envie sua solicitação sobre “${focusedService}” pelo formulário e retornaremos em breve.`
                : 'Enquanto isso, envie sua solicitação pelo formulário e retornaremos em breve.'}
            </p>
            <Link
              href={contactHref}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-forest px-4 py-2.5 font-medium text-white hover:bg-brand"
            >
              Ir para o formulário
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1f8f4e] text-white shadow-soft transition hover:bg-[#187a42]"
        aria-label="Atendimento — WhatsApp em configuração"
      >
        {open ? <MessageCircle className="h-6 w-6" /> : <WhatsAppGlyph className="h-6 w-6" />}
      </button>
    </div>
  );
}
