import { beforeEach, describe, expect, it } from 'vitest';
import { DemoRepository, type StorageLike } from '@/lib/data/demo-repository';

function mem(): StorageLike {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}

const submission = () => ({
  name: 'Maria Silva',
  email: 'maria@example.com',
  message: 'Preciso de apoio na organização dos processos internos.',
  consent_privacy: true,
  consent_marketing: false,
  started_at: Date.now() - 10_000,
});

describe('DemoRepository', () => {
  let repo: DemoRepository;
  beforeEach(() => {
    repo = new DemoRepository(mem(), mem());
  });

  it('carrega o conteúdo demonstrativo: serviços em rascunho e projetos ilustrativos', async () => {
    const data = await repo.loadPublicData();
    expect(data.categories).toHaveLength(4);
    expect(data.services.length).toBeGreaterThan(20);
    expect(data.services.every((s) => s.status === 'draft')).toBe(true);
    expect(data.projects.every((p) => p.is_illustrative && p.client_name === null)).toBe(true);
    expect(data.team).toHaveLength(0);
    expect(data.settings.whatsapp).toBe('');
  });

  it('exige sessão para operações administrativas', async () => {
    await expect(repo.listQuotes()).rejects.toThrow(/Sessão/);
  });

  it('registra solicitações válidas e as exibe no painel', async () => {
    expect(await repo.submitQuote(submission())).toEqual({ ok: true });
    await repo.signIn();
    const quotes = await repo.listQuotes();
    expect(quotes).toHaveLength(1);
    expect(quotes[0].status).toBe('novo');
    const updated = await repo.updateQuote(quotes[0].id, { status: 'em_atendimento', internal_notes: 'ok' });
    expect(updated.status).toBe('em_atendimento');
  });

  it('rejeita dados inválidos e aplica limite de envios', async () => {
    const bad = await repo.submitQuote({ ...submission(), email: 'x' });
    expect(bad.ok).toBe(false);
    for (let i = 0; i < 3; i++) expect((await repo.submitQuote(submission())).ok).toBe(true);
    const limited = await repo.submitQuote(submission());
    expect(limited.ok).toBe(false);
  });

  it('oculta serviços inativos no site público', async () => {
    await repo.signIn();
    const { services } = await repo.loadAdminData();
    await repo.saveService({ ...services[0], is_active: false });
    const pub = await repo.loadPublicData();
    expect(pub.services.find((s) => s.id === services[0].id)).toBeUndefined();
  });

  it('remove apenas os dados de demonstração', async () => {
    await repo.signIn();
    const { categories } = await repo.loadAdminData();
    await repo.saveService({
      id: 'real', slug: 'real', category_id: categories[0].id, name: 'Serviço real', summary: '', description: '', icon: 'leaf',
      image_url: null, benefits: [], steps: [], status: 'approved', is_active: true, sort_order: 1, is_demo: false, updated_at: '',
    });
    await repo.removeDemoData();
    const data = await repo.loadAdminData();
    expect(data.services.map((s) => s.id)).toEqual(['real']);
    expect(data.projects).toHaveLength(0);
    expect(data.categories).toHaveLength(4);
  });

  it('impede excluir categoria com serviços', async () => {
    await repo.signIn();
    await expect(repo.deleteCategory('cat-gestao-empresarial')).rejects.toThrow(/serviços/);
  });
});
