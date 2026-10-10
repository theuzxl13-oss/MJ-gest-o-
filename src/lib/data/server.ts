import 'server-only';
import { isDemoMode } from '../config';
import { getSeedData } from '../seed';
import type { PublicData } from '../types';
import { fetchPublicData } from './public-data';
import { getServerSupabase } from './supabase-client';

/**
 * Dados usados na renderização no servidor (HTML inicial / SEO).
 * Em modo demo, usa o conteúdo de exemplo; com Supabase, lê do banco
 * e recorre ao conteúdo de exemplo apenas se a leitura falhar.
 */
export async function getInitialData(): Promise<PublicData> {
  if (isDemoMode) return getSeedData();
  try {
    return await fetchPublicData(getServerSupabase());
  } catch (err) {
    console.error('[MJ] Falha ao ler dados do Supabase:', err);
    return { ...getSeedData(), services: [], projects: [], articles: [] };
  }
}
