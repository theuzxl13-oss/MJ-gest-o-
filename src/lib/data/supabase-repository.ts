import { basePath, isStaticExport } from '../config';
import type { Article, Project, QuoteRequest, Service, ServiceCategory, SiteSettings, TeamMember } from '../types';
import { checkAntiSpam, fieldErrors, quoteRequestSchema } from '../validation';
import { fetchPublicData } from './public-data';
import { assertImage, type AdminSession, type DataRepository, type QuoteSubmission, type SubmitResult } from './repository';
import { getBrowserSupabase } from './supabase-client';

function unwrap(res: { data: unknown; error: { message: string } | null }): unknown {
  if (res.error) throw new Error(traduzirErro(res.error.message));
  return res.data;
}

function traduzirErro(message: string) {
  if (/row-level security|permission denied/i.test(message)) return 'Acesso negado. Verifique se seu usuário é administrador.';
  if (/Invalid login credentials/i.test(message)) return 'E-mail ou senha inválidos.';
  if (/duplicate key/i.test(message)) return 'Já existe um registro com este identificador (slug).';
  if (/foreign key/i.test(message)) return 'Este registro está vinculado a outros dados e não pode ser excluído.';
  return message;
}

/** Repositório de produção: PostgreSQL + Auth + Storage do Supabase. */
export class SupabaseRepository implements DataRepository {
  readonly mode = 'supabase' as const;
  private db = getBrowserSupabase();

  loadPublicData() {
    return fetchPublicData(this.db);
  }

  async submitQuote(input: QuoteSubmission): Promise<SubmitResult> {
    const spam = checkAntiSpam(input);
    if (spam) return { ok: false, error: 'Não foi possível validar o envio. Aguarde alguns segundos e tente novamente.' };
    const parsed = quoteRequestSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Verifique os campos destacados.', fieldErrors: fieldErrors(parsed.error) };

    if (!isStaticExport) {
      // Caminho preferencial: rota de API (validação no servidor, limite por IP e e-mail de aviso).
      const res = await fetch(`${basePath}/api/contato`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; fieldErrors?: Record<string, string> };
      return res.ok ? { ok: true } : { ok: false, error: body.error ?? 'Falha ao enviar. Tente novamente.', fieldErrors: body.fieldErrors };
    }

    // Hospedagem estática: a função SQL valida e limita os envios no banco.
    const d = parsed.data;
    const { error } = await this.db.rpc('submit_quote_request', {
      p_name: d.name,
      p_company: d.company || null,
      p_email: d.email,
      p_phone: d.phone || null,
      p_service_id: d.service_id || null,
      p_service_name: d.service_name || null,
      p_message: d.message,
      p_consent_privacy: d.consent_privacy,
      p_consent_marketing: d.consent_marketing,
      p_fingerprint: null,
      p_source: 'site',
    });
    if (error) {
      if (/rate_limited/.test(error.message)) return { ok: false, error: 'Muitos envios em sequência. Tente novamente mais tarde.' };
      return { ok: false, error: 'Não foi possível registrar sua solicitação. Tente novamente.' };
    }
    return { ok: true };
  }

  private async isAdmin(): Promise<boolean> {
    const { data, error } = await this.db.rpc('is_admin');
    return !error && data === true;
  }

  async getSession(): Promise<AdminSession | null> {
    const { data } = await this.db.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    if (!(await this.isAdmin())) return null;
    return { email: user.email ?? '', isDemo: false };
  }

  async signIn(email: string, password: string): Promise<AdminSession> {
    const { data, error } = await this.db.auth.signInWithPassword({ email, password });
    if (error) throw new Error(traduzirErro(error.message));
    if (!(await this.isAdmin())) {
      await this.db.auth.signOut();
      throw new Error('Este usuário não possui permissão de administrador.');
    }
    return { email: data.user?.email ?? email, isDemo: false };
  }

  async signOut() {
    await this.db.auth.signOut();
  }

  loadAdminData() {
    return fetchPublicData(this.db, true);
  }

  async saveSettings(settings: SiteSettings) {
    const { updated_at: _ignored, ...data } = settings;
    const row = unwrap(
      await this.db.from('site_settings').upsert({ id: 1, data }).select('data, updated_at').single(),
    ) as { data: SiteSettings; updated_at: string };
    return { ...settings, ...row.data, updated_at: row.updated_at };
  }

  async saveCategory(category: Parameters<DataRepository['saveCategory']>[0]) {
    return unwrap(await this.db.from('service_categories').upsert(category).select().single()) as ServiceCategory;
  }

  async deleteCategory(id: string) {
    unwrap(await this.db.from('service_categories').delete().eq('id', id));
  }

  async saveService(service: Parameters<DataRepository['saveService']>[0]) {
    const { updated_at: _u, ...row } = service;
    return unwrap(await this.db.from('services').upsert(row).select().single()) as Service;
  }

  async deleteService(id: string) {
    unwrap(await this.db.from('services').delete().eq('id', id));
  }

  async saveProject(project: Parameters<DataRepository['saveProject']>[0]) {
    const { updated_at: _u, ...row } = project;
    return unwrap(await this.db.from('projects').upsert(row).select().single()) as Project;
  }

  async deleteProject(id: string) {
    unwrap(await this.db.from('projects').delete().eq('id', id));
  }

  async saveTeamMember(member: Parameters<DataRepository['saveTeamMember']>[0]) {
    const { updated_at: _u, ...row } = member;
    return unwrap(await this.db.from('team_members').upsert(row).select().single()) as TeamMember;
  }

  async deleteTeamMember(id: string) {
    unwrap(await this.db.from('team_members').delete().eq('id', id));
  }

  async saveArticle(article: Parameters<DataRepository['saveArticle']>[0]) {
    const { updated_at: _u, ...row } = article;
    return unwrap(await this.db.from('articles').upsert(row).select().single()) as Article;
  }

  async deleteArticle(id: string) {
    unwrap(await this.db.from('articles').delete().eq('id', id));
  }

  async listQuotes() {
    return unwrap(
      await this.db.from('quote_requests').select('*').order('created_at', { ascending: false }).limit(2000),
    ) as QuoteRequest[];
  }

  async updateQuote(id: string, patch: { status?: QuoteRequest['status']; internal_notes?: string | null }) {
    return unwrap(await this.db.from('quote_requests').update(patch).eq('id', id).select().single()) as QuoteRequest;
  }

  async deleteQuote(id: string) {
    unwrap(await this.db.from('quote_requests').delete().eq('id', id));
  }

  async uploadImage(file: File, folder: string) {
    assertImage(file);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    unwrap(await this.db.storage.from('media').upload(path, file, { cacheControl: '31536000', upsert: false }));
    return this.db.storage.from('media').getPublicUrl(path).data.publicUrl;
  }

  async removeDemoData() {
    for (const table of ['projects', 'articles', 'services'] as const) {
      unwrap(await this.db.from(table).delete().eq('is_demo', true));
    }
  }
}
