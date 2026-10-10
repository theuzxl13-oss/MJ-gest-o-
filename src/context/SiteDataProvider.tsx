'use client';

import { MotionConfig } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getRepository } from '@/lib/data';
import type { PublicData } from '@/lib/types';

interface SiteDataValue extends PublicData {
  refresh: () => Promise<void>;
  /** Serviço em foco (usado para personalizar a mensagem do WhatsApp). */
  focusedService: string | null;
  setFocusedService: (name: string | null) => void;
}

const SiteDataContext = createContext<SiteDataValue | null>(null);

/**
 * Recebe os dados renderizados no servidor (SEO) e, no navegador,
 * atualiza com a fonte ativa (Supabase ou dados de demonstração).
 */
export function SiteDataProvider({ initialData, children }: { initialData: PublicData; children: ReactNode }) {
  const [data, setData] = useState<PublicData>(initialData);
  const [focusedService, setFocusedService] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setData(await getRepository().loadPublicData());
    } catch (err) {
      console.error('[MJ] Não foi possível atualizar os dados do site:', err);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SiteDataContext.Provider value={{ ...data, refresh, focusedService, setFocusedService }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData deve ser usado dentro de SiteDataProvider');
  return ctx;
}
