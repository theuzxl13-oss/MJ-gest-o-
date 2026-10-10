'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

const KEY = 'mj-cookie-notice-v1';

/**
 * O site não utiliza cookies de rastreamento ou publicidade. Este aviso informa
 * o uso de armazenamento local estritamente necessário (preferências, sessão
 * administrativa e, na versão demonstrativa, os dados de exemplo).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(!window.localStorage.getItem(KEY));
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* armazenamento indisponível: apenas oculta nesta visita */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso sobre cookies"
      className="fixed inset-x-3 bottom-24 z-[55] mx-auto max-w-xl rounded-2xl border border-forest/10 bg-white p-5 text-sm shadow-soft md:bottom-8 md:left-8 md:right-auto md:mx-0"
    >
      <p className="text-graphite/80">
        Utilizamos apenas armazenamento local essencial para o funcionamento do site. Não usamos cookies de
        rastreamento ou publicidade. Saiba mais na{' '}
        <Link href="/politica-de-privacidade" className="font-medium text-brand underline underline-offset-2">
          Política de Privacidade
        </Link>
        .
      </p>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={accept}>
          Entendi
        </Button>
      </div>
    </div>
  );
}
