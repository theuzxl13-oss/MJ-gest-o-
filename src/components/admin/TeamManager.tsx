'use client';

import { Info, Pencil, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { resolveImage } from '@/lib/config';
import type { TeamMember } from '@/lib/types';
import { uid } from '@/lib/utils';
import { useAdmin } from './AdminShell';
import { EmptyState, FormActions, ImageUpload, PageHeader, TextArea, TextInput, Toggle } from './ui';

export function TeamManager() {
  const { data } = useAdmin();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const blank = (): TeamMember => ({ id: uid(), name: '', role: '', bio: '', credentials: null, photo_url: null, sort_order: data.team.length + 1, is_active: true, updated_at: new Date().toISOString() });

  return (
    <>
      <PageHeader
        title="Equipe e responsáveis técnicos"
        description="Profissionais exibidos na página “Sobre Nós”."
        actions={<button type="button" onClick={() => setEditing(blank())} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-brand"><Plus className="h-4 w-4" /> Novo profissional</button>}
      />
      <p className="mb-6 flex gap-2 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-forest">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
        Cadastre apenas profissionais reais, com formação e registros profissionais verificados e autorizados para divulgação.
      </p>
      {data.team.length === 0 ? (
        <EmptyState>Nenhum profissional cadastrado. Enquanto isso, o site exibe uma mensagem de “informações em breve”.</EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data.team.map((m) => (
            <li key={m.id} className="card flex items-center gap-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImage(m.photo_url, '/images/team-placeholder.svg')} alt="" className="h-16 w-16 shrink-0 rounded-full bg-forest-50 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-forest">{m.name}</p>
                <p className="truncate text-sm text-graphite/60">{m.role}</p>
                {!m.is_active && <Badge className="mt-1">Oculto</Badge>}
              </div>
              <button type="button" onClick={() => setEditing(m)} className="rounded-full border border-forest/15 p-2 text-forest hover:border-forest" aria-label={`Editar ${m.name}`}><Pencil className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name ? `Editar: ${editing.name}` : 'Novo profissional'}>
        {editing && <MemberForm key={editing.id} initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}

function MemberForm({ initial, onDone }: { initial: TeamMember; onDone: () => void }) {
  const { data, repo, run } = useAdmin();
  const [m, setM] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isNew = !data.team.some((x) => x.id === initial.id);
  const set = <K extends keyof TeamMember>(k: K, v: TeamMember[K]) => setM((x) => ({ ...x, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (m.name.trim().length < 2) return alert('Informe o nome.');
    setSaving(true);
    const ok = await run(() => repo.saveTeamMember({ ...m, name: m.name.trim(), credentials: m.credentials?.trim() || null }), 'Profissional salvo.');
    setSaving(false);
    if (ok) onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <TextInput label="Nome completo *" value={m.name} onChange={(v) => set('name', v)} required />
      <TextInput label="Cargo / função" value={m.role} onChange={(v) => set('role', v)} placeholder="Ex.: Responsável técnico" />
      <TextInput label="Formação e registro profissional" value={m.credentials ?? ''} onChange={(v) => set('credentials', v)} hint="Ex.: formação e número de registro no conselho de classe, quando aplicável." />
      <TextArea label="Minibiografia" rows={4} value={m.bio} onChange={(v) => set('bio', v)} />
      <ImageUpload label="Foto" value={m.photo_url} onChange={(v) => set('photo_url', v)} folder="team" />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput label="Ordem" type="number" value={String(m.sort_order)} onChange={(v) => set('sort_order', Number(v) || 0)} />
        <div className="pt-7"><Toggle label="Exibir no site" checked={m.is_active} onChange={(v) => set('is_active', v)} /></div>
      </div>
      <FormActions onCancel={onDone} saving={saving} onDelete={isNew ? undefined : async () => { if (confirm(`Excluir ${m.name}?`) && (await run(() => repo.deleteTeamMember(m.id), 'Profissional excluído.'))) onDone(); }} />
    </form>
  );
}
