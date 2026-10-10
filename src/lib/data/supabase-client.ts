import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';

let browserClient: SupabaseClient | null = null;

/** Cliente do navegador (usa apenas a anon key; a segurança vem das políticas RLS). */
export function getBrowserSupabase(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'mj-admin-auth' },
    });
  }
  return browserClient;
}

/** Cliente sem sessão para leituras públicas no servidor (build/ISR) e na rota de API. */
export function getServerSupabase(): SupabaseClient {
  return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
