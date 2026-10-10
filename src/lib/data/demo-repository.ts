import { getSeedData } from '../seed';
import type { PublicData, QuoteRequest } from '../types';
import { uid } from '../utils';
import { checkAntiSpam, fieldErrors, quoteRequestSchema } from '../validation';
import { assertImage, type AdminSession, type DataRepository, type QuoteSubmission } from './repository';

/**
 * Repositório do MODO DEMONSTRATIVO.
 * Os dados ficam somente no navegador do visitante (localStorage), servem
 * apenas para apresentação e podem ser restaurados a qualquer momento.
 * Em produção, use o SupabaseRepository (banco PostgreSQL).
 */
const DB_KEY = 'mj-demo-db-v1';
const SESSION_KEY = 'mj-demo-admin-session';
const RATE_KEY = 'mj-demo-quote-hits';

interface DemoDb extends PublicData {
  quotes: QuoteRequest[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function memoryStorage(): StorageLike {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

function safeStorage(kind: 'local' | 'session'): StorageLike {
  try {
    const s = kind === 'local' ? window.localStorage : window.sessionStorage;
    const probe = '__mj_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return memoryStorage();
  }
}

const now = () => new Date().toISOString();

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const copy = [...list];
  copy[idx] = item;
  return copy;
}

export class DemoRepository implements DataRepository {
  readonly mode = 'demo' as const;
  private local: StorageLike;
  private session: StorageLike;

  constructor(local?: StorageLike, session?: StorageLike) {
    this.local = local ?? (typeof window !== 'undefined' ? safeStorage('local') : memoryStorage());
    this.session = session ?? (typeof window !== 'undefined' ? safeStorage('session') : memoryStorage());
  }

  private read(): DemoDb {
    const raw = this.local.getItem(DB_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as DemoDb;
      } catch {
        /* dados corrompidos: recria a partir do seed */
      }
    }
    const fresh: DemoDb = { ...getSeedData(), quotes: [] };
    this.write(fresh);
    return fresh;
  }

  private write(db: DemoDb) {
    try {
      this.local.setItem(DB_KEY, JSON.stringify(db));
    } catch {
      throw new Error('Não foi possível salvar: o armazenamento do navegador está cheio. Use imagens menores.');
    }
  }

  private mutate(fn: (db: DemoDb) => DemoDb) {
    this.write(fn(this.read()));
  }

  private requireAdmin() {
    if (!this.session.getItem(SESSION_KEY)) throw new Error('Sessão expirada. Entre novamente.');
  }

  async loadPublicData(): Promise<PublicData> {
    const db = this.read();
    return {
      settings: db.settings,
      categories: [...db.categories].sort((a, b) => a.sort_order - b.sort_order),
      services: db.services.filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order),
      projects: db.projects.filter((p) => p.is_published),
      team: db.team.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order),
      articles: db.articles.filter((a) => a.is_published),
    };
  }

  async submitQuote(input: QuoteSubmission) {
    const spam = checkAntiSpam(input);
    if (spam) return { ok: false as const, error: 'Não foi possível validar o envio. Aguarde alguns segundos e tente novamente.' };

    const parsed = quoteRequestSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false as const, error: 'Verifique os campos destacados.', fieldErrors: fieldErrors(parsed.error) };
    }

    // Limite de envios por navegador: 3 a cada 10 minutos.
    const windowMs = 10 * 60 * 1000;
    const t = Date.now();
    const hits = (JSON.parse(this.local.getItem(RATE_KEY) ?? '[]') as number[]).filter((h) => t - h < windowMs);
    if (hits.length >= 3) {
      return { ok: false as const, error: 'Muitos envios em sequência. Tente novamente em alguns minutos.' };
    }
    this.local.setItem(RATE_KEY, JSON.stringify([...hits, t]));

    const d = parsed.data;
    const quote: QuoteRequest = {
      id: uid(),
      name: d.name,
      company: d.company || null,
      email: d.email,
      phone: d.phone || null,
      service_id: d.service_id || null,
      service_name: d.service_name || null,
      message: d.message,
      consent_privacy: true,
      consent_marketing: d.consent_marketing,
      status: 'novo',
      internal_notes: null,
      source: 'site (demonstração)',
      created_at: now(),
      updated_at: now(),
    };
    this.mutate((db) => ({ ...db, quotes: [quote, ...db.quotes] }));
    return { ok: true as const };
  }

  async getSession(): Promise<AdminSession | null> {
    const raw = this.session.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  }

  async signIn(): Promise<AdminSession> {
    const session: AdminSession = { email: 'demonstracao@local', isDemo: true };
    this.session.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  async signOut() {
    this.session.removeItem(SESSION_KEY);
  }

  async loadAdminData(): Promise<PublicData> {
    this.requireAdmin();
    const db = this.read();
    return {
      settings: db.settings,
      categories: [...db.categories].sort((a, b) => a.sort_order - b.sort_order),
      services: [...db.services].sort((a, b) => a.sort_order - b.sort_order),
      projects: db.projects,
      team: [...db.team].sort((a, b) => a.sort_order - b.sort_order),
      articles: db.articles,
    };
  }

  async saveSettings(settings: PublicData['settings']) {
    this.requireAdmin();
    const saved = { ...settings, updated_at: now() };
    this.mutate((db) => ({ ...db, settings: saved }));
    return saved;
  }

  async saveCategory(category: PublicData['categories'][number]) {
    this.requireAdmin();
    this.mutate((db) => ({ ...db, categories: upsert(db.categories, category) }));
    return category;
  }

  async deleteCategory(id: string) {
    this.requireAdmin();
    const db = this.read();
    if (db.services.some((s) => s.category_id === id)) {
      throw new Error('Existem serviços nesta categoria. Mova-os ou exclua-os antes.');
    }
    this.write({ ...db, categories: db.categories.filter((c) => c.id !== id) });
  }

  async saveService(service: PublicData['services'][number]) {
    this.requireAdmin();
    const saved = { ...service, updated_at: now() };
    this.mutate((db) => ({ ...db, services: upsert(db.services, saved) }));
    return saved;
  }

  async deleteService(id: string) {
    this.requireAdmin();
    this.mutate((db) => ({ ...db, services: db.services.filter((s) => s.id !== id) }));
  }

  async saveProject(project: PublicData['projects'][number]) {
    this.requireAdmin();
    const saved = { ...project, updated_at: now() };
    this.mutate((db) => ({ ...db, projects: upsert(db.projects, saved) }));
    return saved;
  }

  async deleteProject(id: string) {
    this.requireAdmin();
    this.mutate((db) => ({ ...db, projects: db.projects.filter((p) => p.id !== id) }));
  }

  async saveTeamMember(member: PublicData['team'][number]) {
    this.requireAdmin();
    const saved = { ...member, updated_at: now() };
    this.mutate((db) => ({ ...db, team: upsert(db.team, saved) }));
    return saved;
  }

  async deleteTeamMember(id: string) {
    this.requireAdmin();
    this.mutate((db) => ({ ...db, team: db.team.filter((t) => t.id !== id) }));
  }

  async saveArticle(article: PublicData['articles'][number]) {
    this.requireAdmin();
    const saved = { ...article, updated_at: now() };
    this.mutate((db) => ({ ...db, articles: upsert(db.articles, saved) }));
    return saved;
  }

  async deleteArticle(id: string) {
    this.requireAdmin();
    this.mutate((db) => ({ ...db, articles: db.articles.filter((a) => a.id !== id) }));
  }

  async listQuotes() {
    this.requireAdmin();
    return [...this.read().quotes].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async updateQuote(id: string, patch: { status?: QuoteRequest['status']; internal_notes?: string | null }) {
    this.requireAdmin();
    const db = this.read();
    const current = db.quotes.find((q) => q.id === id);
    if (!current) throw new Error('Solicitação não encontrada.');
    const updated = { ...current, ...patch, updated_at: now() };
    this.write({ ...db, quotes: upsert(db.quotes, updated) });
    return updated;
  }

  async deleteQuote(id: string) {
    this.requireAdmin();
    this.mutate((db) => ({ ...db, quotes: db.quotes.filter((q) => q.id !== id) }));
  }

  async uploadImage(file: File): Promise<string> {
    this.requireAdmin();
    // No modo demo a imagem vira data URL; limite menor por causa do localStorage.
    assertImage(file, 1.5 * 1024 * 1024);
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Falha ao ler a imagem.'));
      reader.readAsDataURL(file);
    });
  }

  async removeDemoData() {
    this.requireAdmin();
    this.mutate((db) => ({
      ...db,
      services: db.services.filter((s) => !s.is_demo),
      projects: db.projects.filter((p) => !p.is_demo),
      articles: db.articles.filter((a) => !a.is_demo),
    }));
  }

  /** Exclusivo do modo demo: volta ao conteúdo inicial. */
  resetDemo() {
    this.local.removeItem(DB_KEY);
    this.local.removeItem(RATE_KEY);
  }
}
