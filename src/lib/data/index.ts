import { isDemoMode } from '../config';
import { DemoRepository } from './demo-repository';
import type { DataRepository } from './repository';
import { SupabaseRepository } from './supabase-repository';

let instance: DataRepository | null = null;

/** Retorna o repositório ativo (somente no navegador). */
export function getRepository(): DataRepository {
  if (!instance) instance = isDemoMode ? new DemoRepository() : new SupabaseRepository();
  return instance;
}

export type { DataRepository } from './repository';
