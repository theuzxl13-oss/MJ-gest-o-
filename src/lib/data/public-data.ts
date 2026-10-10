import type { SupabaseClient } from '@supabase/supabase-js';
import { defaultSettings } from '../seed';
import type { PublicData, SiteSettings } from '../types';

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/** Leitura pública (respeita RLS: apenas registros ativos/publicados). */
export async function fetchPublicData(db: SupabaseClient, admin = false): Promise<PublicData> {
  const servicesQ = db.from('services').select('*').order('sort_order');
  const projectsQ = db.from('projects').select('*').order('updated_at', { ascending: false });
  const teamQ = db.from('team_members').select('*').order('sort_order');
  const articlesQ = db.from('articles').select('*').order('published_at', { ascending: false, nullsFirst: false });

  const [settings, categories, services, projects, team, articles] = await Promise.all([
    db.from('site_settings').select('data, updated_at').eq('id', 1).maybeSingle(),
    db.from('service_categories').select('*').order('sort_order'),
    admin ? servicesQ : servicesQ.eq('is_active', true),
    admin ? projectsQ : projectsQ.eq('is_published', true),
    admin ? teamQ : teamQ.eq('is_active', true),
    admin ? articlesQ : articlesQ.eq('is_published', true),
  ]);

  const settingsRow = check(settings) as { data: Partial<SiteSettings>; updated_at: string } | null;

  return {
    settings: {
      ...defaultSettings,
      ...(settingsRow?.data ?? {}),
      socials: { ...defaultSettings.socials, ...(settingsRow?.data?.socials ?? {}) },
      updated_at: settingsRow?.updated_at ?? defaultSettings.updated_at,
    },
    categories: check(categories) ?? [],
    services: check(services) ?? [],
    projects: check(projects) ?? [],
    team: check(team) ?? [],
    articles: check(articles) ?? [],
  };
}
