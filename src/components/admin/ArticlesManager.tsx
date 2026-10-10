'use client';

import { Pencil, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { resolveImage } from '@/lib/config';
import type { Article } from '@/lib/types';
import { formatDate, slugify, uid } from '@/lib/utils';
import { useAdmin } from './AdminShell';
import { EmptyState, FormActions, ImageUpload, PageHeader, TextArea, TextInput, Toggle } from './ui';

const blank = (): Article => ({ id: uid(), slug: '', title: '', excerpt: '', content: '', image_url: null, is_published: false, published_at: null, is_demo: false, updated_at: new Date().toISOString() });

export function ArticlesManager() {
  const { data } = useAdmin();
  const [editing, setEditing] = useState<Article | null>(null);

  return (
    <>
      <PageHeader
        title="Conteúdos educativos"
        description="Artigos exibidos na página Sustentabilidade e na página inicial."
        actions={<button type="button" onClick={() => setEditing(blank())} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-brand"><Plus className="h-4 w-4" /> Novo conteúdo</button>}
      />
      {data.articles.length === 0 ? (
        <EmptyState>Nenhum conteúdo cadastrado.</EmptyState>
      ) : (
        <ul className="card divide-y divide-forest/5">
          {data.articles.map((a) => (
            <li key={a.id} className="flex items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(a.image_url, '/images/articles/gestao-ambiental.svg')} alt="" className="hidden h-14 w-24 rounded-lg object-cover sm:block" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-forest">{a.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-graphite/55">
                  <Badge tone={a.is_published ? 'green' : 'gray'}>{a.is_published ? 'Publicado' : 'Rascunho'}</Badge>
                  {a.is_demo && <Badge>Demonstração</Badge>}
                  {a.published_at && formatDate(a.published_at)}
                </div>
              </div>
              <button type="button" onClick={() => setEditing(a)} className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 px-4 py-2 text-sm text-forest hover:border-forest"><Pencil className="h-3.5 w-3.5" /> Editar</button>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.title ? `Editar: ${editing.title}` : 'Novo conteúdo'} size="xl">
        {editing && <ArticleForm key={editing.id} initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}

function ArticleForm({ initial, onDone }: { initial: Article; onDone: () => void }) {
  const { data, repo, run } = useAdmin();
  const [a, setA] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isNew = !data.articles.some((x) => x.id === initial.id);
  const set = <K extends keyof Article>(k: K, v: Article[K]) => setA((x) => ({ ...x, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (a.title.trim().length < 2) return alert('Informe o título.');
    setSaving(true);
    const ok = await run(
      () => repo.saveArticle({ ...a, title: a.title.trim(), slug: slugify(a.slug || a.title), published_at: a.is_published ? a.published_at ?? new Date().toISOString() : a.published_at }),
      'Conteúdo salvo.',
    );
    setSaving(false);
    if (ok) onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <TextInput label="Título *" value={a.title} onChange={(v) => set('title', v)} required maxLength={200} />
      <TextArea label="Resumo" rows={2} value={a.excerpt} onChange={(v) => set('excerpt', v)} maxLength={300} />
      <TextArea label="Conteúdo" rows={12} value={a.content} onChange={(v) => set('content', v)} hint="Separe os parágrafos com uma linha em branco." />
      <ImageUpload label="Imagem de capa" value={a.image_url} onChange={(v) => set('image_url', v)} folder="articles" />
      <Toggle label="Publicado" description="Conteúdos não publicados ficam ocultos no site." checked={a.is_published} onChange={(v) => set('is_published', v)} />
      <FormActions onCancel={onDone} saving={saving} onDelete={isNew ? undefined : async () => { if (confirm(`Excluir “${a.title}”?`) && (await run(() => repo.deleteArticle(a.id), 'Conteúdo excluído.'))) onDone(); }} />
    </form>
  );
}
