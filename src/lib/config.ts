/**
 * Configuração derivada das variáveis de ambiente públicas.
 * Nada aqui é secreto: variáveis NEXT_PUBLIC_* vão para o navegador.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !isSupabaseConfigured;

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const supabaseConfig = { url: supabaseUrl, anonKey: supabaseAnonKey };

/** Prefixa caminhos de arquivos em /public com o basePath (necessário no GitHub Pages). */
export function asset(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${basePath}${path}`;
}

/** Resolve uma imagem cadastrada (URL absoluta, data URL ou caminho local). */
export function resolveImage(src: string | null | undefined, fallback: string): string {
  if (!src) return asset(fallback);
  return asset(src);
}
