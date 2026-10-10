'use client';

import { Eye, EyeOff, Pencil, Plus, Star } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { resolveImage } from '@/lib/config';
import { PROJECT_STATUS_LABELS, type Project } from '@/lib/types';
import { cn, slugify, uid } from '@/lib/utils';
import { useAdmin } from './AdminShell';
import { EmptyState, FormActions, MultiImageUpload, PageHeader, SelectInput, TextArea, TextInput, Toggle } from './ui';

const blank = (): Project => ({
  id: uid(), slug: '', title: '', client_name: null, client_authorized: false, category_id: null, description: '', problem: '',
  solution: '', results: '', images: [], executed_at: null, status: 'concluido', is_featured: false, is_published: false,
  is_illustrative: false, is_demo: false, updated_at: new Date().toISOString(),
});

export function PortfolioManager() {
  const { data, repo, run } = useAdmin();
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <>
      <PageHeader
        title="Portfólio"
        description="Cadastre os projetos realizados. Publique nomes de clientes somente com autorização."
        actions={<button type="button" onClick={() => setEditing(blank())} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-brand"><Plus className="h-4 w-4" /> Novo projeto</button>}
      />
      {data.projects.length === 0 ? (
        <EmptyState>Nenhum projeto cadastrado.</EmptyState>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.projects.map((p) => (
            <li key={p.id} className="card flex flex-col overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(p.images[0], '/images/projects/processos.svg')} alt="" className="aspect-[16/9] w-full object-cover" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-1.5">
                  {p.is_illustrative && <Badge tone="gold">Exemplo ilustrativo</Badge>}
                  <Badge tone={p.is_published ? 'green' : 'gray'}>{p.is_published ? 'Publicado' : 'Oculto'}</Badge>
                  <Badge>{PROJECT_STATUS_LABELS[p.status]}</Badge>
                </div>
                <p className="mt-3 flex-1 font-medium text-forest">{p.title}</p>
                <p className="text-xs text-graphite/55">{data.categories.find((c) => c.id === p.category_id)?.name ?? 'Sem categoria'}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-forest/5 pt-4">
                  <button type="button" onClick={() => run(() => repo.saveProject({ ...p, is_featured: !p.is_featured }), p.is_featured ? 'Removido dos destaques.' : 'Projeto definido como destaque.')} className={cn('rounded-full p-2 transition', p.is_featured ? 'text-gold' : 'text-graphite/35 hover:text-gold')} aria-label={p.is_featured ? 'Remover destaque' : 'Destacar'} title="Destaque na página inicial">
                    <Star className="h-5 w-5" fill={p.is_featured ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" onClick={() => run(() => repo.saveProject({ ...p, is_published: !p.is_published }), p.is_published ? 'Projeto ocultado.' : 'Projeto publicado.')} className="rounded-full p-2 text-graphite/50 hover:text-forest" aria-label={p.is_published ? 'Ocultar' : 'Publicar'} title={p.is_published ? 'Ocultar do site' : 'Publicar no site'}>
                    {p.is_published ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <button type="button" onClick={() => setEditing(p)} className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-4 py-2 text-sm text-forest hover:border-forest">
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.title ? `Editar: ${editing.title}` : 'Novo projeto'} size="xl">
        {editing && <ProjectForm key={editing.id} initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}

function ProjectForm({ initial, onDone }: { initial: Project; onDone: () => void }) {
  const { data, repo, run } = useAdmin();
  const [p, setP] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isNew = !data.projects.some((x) => x.id === initial.id);
  const set = <K extends keyof Project>(k: K, v: Project[K]) => setP((x) => ({ ...x, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (p.title.trim().length < 2) return alert('Informe o nome do projeto.');
    setSaving(true);
    const ok = await run(
      () => repo.saveProject({ ...p, title: p.title.trim(), slug: slugify(p.slug || p.title), client_name: p.client_authorized ? p.client_name?.trim() || null : null }),
      'Projeto salvo.',
    );
    setSaving(false);
    if (ok) onDone();
  };

  const remove = async () => {
    if (!confirm(`Excluir o projeto “${p.title}”?`)) return;
    if (await run(() => repo.deleteProject(p.id), 'Projeto excluído.')) onDone();
  };

  return (
    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      <TextInput className="md:col-span-2" label="Nome do projeto *" value={p.title} onChange={(v) => set('title', v)} required maxLength={200} />
      <SelectInput label="Categoria do serviço" value={p.category_id ?? ''} onChange={(v) => set('category_id', v || null)} options={[{ value: '', label: 'Sem categoria' }, ...data.categories.map((c) => ({ value: c.id, label: c.name }))]} />
      <SelectInput label="Status" value={p.status} onChange={(v) => set('status', v as Project['status'])} options={Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
      <TextInput label="Data de execução" type="date" value={p.executed_at ?? ''} onChange={(v) => set('executed_at', v || null)} />
      <TextInput label="Endereço (slug)" value={p.slug} onChange={(v) => set('slug', v)} placeholder={slugify(p.title)} />

      <div className="space-y-3 rounded-xl bg-offwhite p-5 md:col-span-2">
        <Toggle label="O cliente autorizou a divulgação do nome" checked={p.client_authorized} onChange={(v) => set('client_authorized', v)} />
        <TextInput label="Nome do cliente" value={p.client_name ?? ''} onChange={(v) => set('client_name', v)} disabled={!p.client_authorized} hint="Só é exibido no site quando a autorização estiver marcada." />
      </div>

      <TextArea className="md:col-span-2" label="Descrição" rows={3} value={p.description} onChange={(v) => set('description', v)} />
      <TextArea label="Problema identificado" rows={4} value={p.problem} onChange={(v) => set('problem', v)} />
      <TextArea label="Solução aplicada" rows={4} value={p.solution} onChange={(v) => set('solution', v)} />
      <TextArea className="md:col-span-2" label="Resultados alcançados" rows={3} value={p.results} onChange={(v) => set('results', v)} hint="Informe apenas resultados reais e verificáveis." />
      <div className="md:col-span-2"><MultiImageUpload label="Imagens" values={p.images} onChange={(v) => set('images', v)} folder="projects" /></div>

      <div className="grid gap-4 rounded-xl bg-offwhite p-5 md:col-span-2 md:grid-cols-3">
        <Toggle label="Publicado" checked={p.is_published} onChange={(v) => set('is_published', v)} />
        <Toggle label="Destaque" description="Aparece na página inicial." checked={p.is_featured} onChange={(v) => set('is_featured', v)} />
        <Toggle label="Exemplo ilustrativo" description="Exibe o selo de exemplo." checked={p.is_illustrative} onChange={(v) => set('is_illustrative', v)} />
      </div>

      <div className="md:col-span-2"><FormActions onCancel={onDone} saving={saving} onDelete={isNew ? undefined : remove} /></div>
    </form>
  );
}
