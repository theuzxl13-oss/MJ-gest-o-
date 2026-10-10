/**
 * Gera supabase/seed.sql a partir de src/lib/seed.ts (fonte única do conteúdo demonstrativo).
 * Uso: npm run db:seed-sql
 */
import { writeFileSync } from 'node:fs';
import { seedArticles, seedCategories, seedProjects, seedServices } from '../src/lib/seed';

const q = (v: unknown): string => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return `array[${v.map(q).join(', ')}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

function insert(table: string, rows: Record<string, unknown>[], omit: string[] = ['updated_at']) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]).filter((c) => !omit.includes(c));
  const values = rows.map((r) => `  (${cols.map((c) => q(r[c])).join(', ')})`).join(',\n');
  return `insert into public.${table} (${cols.join(', ')}) values\n${values}\non conflict (id) do nothing;\n`;
}

const sql = `-- ═══════════════════════════════════════════════════════════════
-- DADOS DE DEMONSTRAÇÃO (gerado por scripts/generate-seed-sql.ts)
-- Serviços em RASCUNHO e projetos ILUSTRATIVOS (is_demo = true).
-- Para remover: painel /admin → Configurações → "Remover dados de demonstração"
-- ou: delete from projects where is_demo; delete from articles where is_demo; delete from services where is_demo;
-- ═══════════════════════════════════════════════════════════════

${insert('service_categories', seedCategories as unknown as Record<string, unknown>[])}
${insert('services', seedServices as unknown as Record<string, unknown>[])}
${insert('projects', seedProjects as unknown as Record<string, unknown>[])}
${insert('articles', seedArticles as unknown as Record<string, unknown>[])}`;

writeFileSync('supabase/seed.sql', sql);
console.log('supabase/seed.sql gerado.');
