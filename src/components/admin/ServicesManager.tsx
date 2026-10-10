'use client';

import { Pencil, Plus, TriangleAlert } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ICON_NAMES, Icon } from '@/lib/icons';
import { SERVICE_STATUS_LABELS, type Service, type ServiceCategory } from '@/lib/types';
import { cn, linesToList, slugify, uid } from '@/lib/utils';
import { useAdmin } from './AdminShell';
import { EmptyState, FormActions, ImageUpload, PageHeader, SelectInput, TextArea, TextInput, Toggle } from './ui';

const newService = (categoryId: string, order: number): Service => ({
  id: uid(), slug: '', category_id: categoryId, name: '', summary: '', description: '', icon: 'leaf', image_url: null,
  benefits: [], steps: [], status: 'draft', is_active: false, sort_order: order, is_demo: false, updated_at: new Date().toISOString(),
});

const newCategory = (order: number): ServiceCategory => ({ id: uid(), slug: '', name: '', description: '', icon: 'leaf', sort_order: order });

export function ServicesManager() {
  const { data, repo, run } = useAdmin();
  const [tab, setTab] = useState<'servicos' | 'categorias'>('servicos');
  const [editing, setEditing] = useState<Service | null>(null);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);

  const toggleActive = (s: Service) =>
    run(() => repo.saveService({ ...s, is_active: !s.is_active }), s.is_active ? 'Serviço desativado.' : 'Serviço ativado e publicado no site.');

  return (
    <>
      <PageHeader
        title="Serviços"
        description="Cadastre, edite, organize por categorias e ative/desative os serviços exibidos no site."
        actions={
          tab === 'servicos' ? (
            <button type="button" disabled={!data.categories.length} onClick={() => setEditing(newService(data.categories[0]?.id ?? '', data.services.length + 1))} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-brand disabled:opacity-50">
              <Plus className="h-4 w-4" /> Novo serviço
            </button>
          ) : (
            <button type="button" onClick={() => setEditingCat(newCategory(data.categories.length + 1))} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-brand">
              <Plus className="h-4 w-4" /> Nova categoria
            </button>
          )
        }
      />

      <div role="tablist" className="mb-6 inline-flex rounded-full bg-white p-1 shadow-card">
        {(['servicos', 'categorias'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={cn('rounded-full px-5 py-2 text-sm transition', tab === t ? 'bg-forest text-white' : 'text-forest hover:bg-forest/5')}>
            {t === 'servicos' ? `Serviços (${data.services.length})` : `Categorias (${data.categories.length})`}
          </button>
        ))}
      </div>

      {tab === 'servicos' ? (
        data.categories.length === 0 ? (
          <EmptyState>Cadastre uma categoria antes de adicionar serviços.</EmptyState>
        ) : (
          <div className="space-y-8">
            {data.categories.map((cat) => {
              const items = data.services.filter((s) => s.category_id === cat.id);
              return (
                <section key={cat.id} className="card overflow-hidden">
                  <header className="flex items-center gap-3 border-b border-forest/10 bg-offwhite px-5 py-4">
                    <Icon name={cat.icon} className="h-5 w-5 text-brand" />
                    <h2 className="font-serif text-lg">{cat.name}</h2>
                    <span className="text-sm text-graphite/50">({items.length})</span>
                  </header>
                  {items.length === 0 ? (
                    <p className="p-5 text-sm text-graphite/55">Nenhum serviço nesta categoria.</p>
                  ) : (
                    <ul className="divide-y divide-forest/5">
                      {items.map((s) => (
                        <li key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Icon name={s.icon} className="h-5 w-5 shrink-0 text-graphite/50" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-forest">{s.name}</p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <Badge tone={s.status === 'draft' ? 'amber' : 'green'}>{s.status === 'draft' ? 'Rascunho' : 'Aprovado'}</Badge>
                                {s.is_demo && <Badge>Demonstração</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Toggle label={s.is_active ? 'Ativo' : 'Inativo'} checked={s.is_active} onChange={() => toggleActive(s)} />
                            <button type="button" onClick={() => setEditing(s)} className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-4 py-2 text-sm text-forest hover:border-forest">
                              <Pencil className="h-3.5 w-3.5" /> Editar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.categories.map((c) => (
            <li key={c.id} className="card flex items-start gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest text-gold-light"><Icon name={c.icon} className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-forest">{c.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-graphite/60">{c.description}</p>
                <p className="mt-1 text-xs text-graphite/45">Ordem: {c.sort_order} · {data.services.filter((s) => s.category_id === c.id).length} serviço(s)</p>
              </div>
              <button type="button" onClick={() => setEditingCat(c)} className="rounded-full border border-forest/15 p-2 text-forest hover:border-forest" aria-label={`Editar ${c.name}`}>
                <Pencil className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name ? `Editar: ${editing.name}` : 'Novo serviço'} size="xl">
        {editing && <ServiceForm key={editing.id} initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!editingCat} onClose={() => setEditingCat(null)} title={editingCat?.name ? `Editar: ${editingCat.name}` : 'Nova categoria'}>
        {editingCat && <CategoryForm key={editingCat.id} initial={editingCat} onDone={() => setEditingCat(null)} />}
      </Modal>
    </>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="label">Ícone</span>
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-forest/10 p-2">
        {ICON_NAMES.map((name) => (
          <button key={name} type="button" title={name} aria-label={`Ícone ${name}`} aria-pressed={value === name} onClick={() => onChange(name)} className={cn('flex h-10 w-10 items-center justify-center rounded-lg transition', value === name ? 'bg-forest text-gold-light' : 'text-forest hover:bg-forest/5')}>
            <Icon name={name} className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({ initial, onDone }: { initial: Service; onDone: () => void }) {
  const { data, repo, run } = useAdmin();
  const [s, setS] = useState(initial);
  const [benefits, setBenefits] = useState(initial.benefits.join('\n'));
  const [steps, setSteps] = useState(initial.steps.join('\n'));
  const [saving, setSaving] = useState(false);
  const isNew = !data.services.some((x) => x.id === initial.id);
  const set = <K extends keyof Service>(k: K, v: Service[K]) => setS((p) => ({ ...p, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (s.name.trim().length < 2) return alert('Informe o nome do serviço.');
    setSaving(true);
    const ok = await run(
      () => repo.saveService({ ...s, name: s.name.trim(), slug: slugify(s.slug || s.name), benefits: linesToList(benefits), steps: linesToList(steps) }),
      'Serviço salvo.',
    );
    setSaving(false);
    if (ok) onDone();
  };

  const remove = async () => {
    if (!confirm(`Excluir o serviço “${s.name}”?`)) return;
    if (await run(() => repo.deleteService(s.id), 'Serviço excluído.')) onDone();
  };

  return (
    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      <TextInput label="Nome *" value={s.name} onChange={(v) => set('name', v)} required maxLength={160} />
      <TextInput label="Endereço (slug)" value={s.slug} onChange={(v) => set('slug', v)} placeholder={slugify(s.name) || 'gerado-automaticamente'} hint="Usado no link /servicos#slug. Deixe em branco para gerar a partir do nome." />
      <SelectInput label="Categoria" value={s.category_id} onChange={(v) => set('category_id', v)} options={data.categories.map((c) => ({ value: c.id, label: c.name }))} />
      <TextInput label="Ordem de exibição" type="number" value={String(s.sort_order)} onChange={(v) => set('sort_order', Number(v) || 0)} />
      <TextArea className="md:col-span-2" label="Resumo (cartão)" rows={2} value={s.summary} onChange={(v) => set('summary', v)} maxLength={300} />
      <TextArea className="md:col-span-2" label="Descrição completa" rows={4} value={s.description} onChange={(v) => set('description', v)} />
      <TextArea label="Benefícios" hint="Um benefício por linha." rows={5} value={benefits} onChange={setBenefits} />
      <TextArea label="Etapas de atendimento" hint="Uma etapa por linha, na ordem." rows={5} value={steps} onChange={setSteps} />
      <div className="md:col-span-2"><IconPicker value={s.icon} onChange={(v) => set('icon', v)} /></div>
      <div className="md:col-span-2"><ImageUpload label="Imagem (opcional)" value={s.image_url} onChange={(v) => set('image_url', v)} folder="services" hint="Se não houver imagem, o ícone é exibido." /></div>

      <div className="space-y-4 rounded-xl bg-offwhite p-5 md:col-span-2">
        <SelectInput label="Status de aprovação" value={s.status} onChange={(v) => set('status', v as Service['status'])} options={Object.entries(SERVICE_STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
        {s.status === 'approved' && (
          <p className="flex gap-2 text-sm text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Aprove apenas serviços confirmados pela empresa. Atividades técnicas regulamentadas (laudos, projetos técnicos, licenciamento) exigem responsável técnico legalmente habilitado.
          </p>
        )}
        <Toggle label="Exibir no site" description="Serviços inativos ficam ocultos para os visitantes." checked={s.is_active} onChange={(v) => set('is_active', v)} />
      </div>

      <div className="md:col-span-2">
        <FormActions onCancel={onDone} saving={saving} onDelete={isNew ? undefined : remove} />
      </div>
    </form>
  );
}

function CategoryForm({ initial, onDone }: { initial: ServiceCategory; onDone: () => void }) {
  const { data, repo, run } = useAdmin();
  const [c, setC] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isNew = !data.categories.some((x) => x.id === initial.id);
  const set = <K extends keyof ServiceCategory>(k: K, v: ServiceCategory[K]) => setC((p) => ({ ...p, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (c.name.trim().length < 2) return alert('Informe o nome da categoria.');
    setSaving(true);
    const ok = await run(() => repo.saveCategory({ ...c, name: c.name.trim(), slug: slugify(c.slug || c.name) }), 'Categoria salva.');
    setSaving(false);
    if (ok) onDone();
  };

  const remove = async () => {
    if (!confirm(`Excluir a categoria “${c.name}”?`)) return;
    if (await run(() => repo.deleteCategory(c.id), 'Categoria excluída.')) onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <TextInput label="Nome *" value={c.name} onChange={(v) => set('name', v)} required />
      <TextInput label="Endereço (slug)" value={c.slug} onChange={(v) => set('slug', v)} placeholder={slugify(c.name)} />
      <TextArea label="Descrição" rows={3} value={c.description} onChange={(v) => set('description', v)} />
      <TextInput label="Ordem de exibição" type="number" value={String(c.sort_order)} onChange={(v) => set('sort_order', Number(v) || 0)} />
      <IconPicker value={c.icon} onChange={(v) => set('icon', v)} />
      <FormActions onCancel={onDone} saving={saving} onDelete={isNew ? undefined : remove} />
    </form>
  );
}
