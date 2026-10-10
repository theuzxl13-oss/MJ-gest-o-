'use client';

import { Download, Mail, MessageCircle, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { downloadText, quotesToCsv } from '@/lib/csv';
import { QUOTE_STATUS_LABELS, type QuoteRequest, type QuoteStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { whatsappLink } from '@/lib/whatsapp';
import { useAdmin } from './AdminShell';
import { STATUS_TONE } from './Dashboard';
import { EmptyState, PageHeader } from './ui';

const STATUSES = Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[];

export function QuotesManager() {
  const { quotes, run, repo } = useAdmin();
  const [status, setStatus] = useState<'todos' | QuoteStatus>('todos');
  const [service, setService] = useState('todos');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<QuoteRequest | null>(null);

  const serviceNames = useMemo(() => Array.from(new Set(quotes.map((x) => x.service_name || 'Não informado'))).sort(), [quotes]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return quotes.filter((x) => {
      if (status !== 'todos' && x.status !== status) return false;
      if (service !== 'todos' && (x.service_name || 'Não informado') !== service) return false;
      const day = x.created_at.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (term && ![x.name, x.email, x.company, x.message].some((v) => v?.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [quotes, status, service, from, to, q]);

  const exportCsv = () => downloadText(`solicitacoes-mj-${new Date().toISOString().slice(0, 10)}.csv`, quotesToCsv(filtered));

  return (
    <>
      <PageHeader
        title="Solicitações de orçamento"
        description="Acompanhe os contatos recebidos pelo site, atualize o status e registre observações internas."
        actions={
          <button type="button" onClick={exportCsv} disabled={!filtered.length} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-brand disabled:opacity-50">
            <Download className="h-4 w-4" /> Exportar CSV ({filtered.length})
          </button>
        }
      />

      <div className="card mb-6 grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative xl:col-span-1">
          <label htmlFor="q" className="label">Buscar</label>
          <Search className="pointer-events-none absolute bottom-3.5 left-3 h-4 w-4 text-graphite/40" />
          <input id="q" className="input pl-9" placeholder="Nome, e-mail, empresa…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label htmlFor="st" className="label">Status</label>
          <select id="st" className="input" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="todos">Todos</option>
            {STATUSES.map((s) => <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sv" className="label">Serviço</label>
          <select id="sv" className="input" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="todos">Todos</option>
            {serviceNames.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="label">De</label>
          <input id="from" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label htmlFor="to" className="label">Até</label>
          <input id="to" type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>{quotes.length ? 'Nenhuma solicitação corresponde aos filtros.' : 'Nenhuma solicitação recebida até o momento.'}</EmptyState>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="hidden bg-offwhite text-xs uppercase tracking-wider text-graphite/60 md:table-header-group">
              <tr>
                <th className="px-5 py-3 font-semibold">Data</th>
                <th className="px-5 py-3 font-semibold">Contato</th>
                <th className="px-5 py-3 font-semibold">Serviço</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {filtered.map((x) => (
                <tr key={x.id} onClick={() => setSelected(x)} className="flex cursor-pointer flex-col gap-1 px-5 py-4 transition hover:bg-offwhite md:table-row md:p-0">
                  <td className="text-xs text-graphite/55 md:px-5 md:py-4 md:text-sm">{formatDateTime(x.created_at)}</td>
                  <td className="md:px-5 md:py-4">
                    <button type="button" className="text-left font-medium text-forest hover:underline" onClick={(e) => { e.stopPropagation(); setSelected(x); }}>{x.name}</button>
                    <p className="text-xs text-graphite/55">{x.company ? `${x.company} · ` : ''}{x.email}</p>
                  </td>
                  <td className="text-graphite/70 md:px-5 md:py-4">{x.service_name || '—'}</td>
                  <td className="md:px-5 md:py-4"><Badge tone={STATUS_TONE[x.status]}>{QUOTE_STATUS_LABELS[x.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QuoteDetail
        quote={selected}
        onClose={() => setSelected(null)}
        onSave={async (patch) => {
          if (!selected) return;
          const ok = await run(() => repo.updateQuote(selected.id, patch), 'Solicitação atualizada.');
          if (ok) setSelected(null);
        }}
        onDelete={async () => {
          if (!selected || !confirm('Excluir definitivamente esta solicitação? Esta ação não pode ser desfeita.')) return;
          const ok = await run(() => repo.deleteQuote(selected.id), 'Solicitação excluída.');
          if (ok) setSelected(null);
        }}
      />
    </>
  );
}

function QuoteDetail({ quote, onClose, onSave, onDelete }: { quote: QuoteRequest | null; onClose: () => void; onSave: (p: { status: QuoteStatus; internal_notes: string | null }) => Promise<void>; onDelete: () => Promise<void> }) {
  return (
    <Modal open={!!quote} onClose={onClose} title={quote ? `Solicitação de ${quote.name}` : ''}>
      {quote && <QuoteDetailBody key={quote.id} quote={quote} onSave={onSave} onDelete={onDelete} />}
    </Modal>
  );
}

function QuoteDetailBody({ quote, onSave, onDelete }: { quote: QuoteRequest; onSave: (p: { status: QuoteStatus; internal_notes: string | null }) => Promise<void>; onDelete: () => Promise<void> }) {
  const [status, setStatus] = useState<QuoteStatus>(quote.status);
  const [notes, setNotes] = useState(quote.internal_notes ?? '');
  const [saving, setSaving] = useState(false);
  const wa = whatsappLink(quote.phone, quote.service_name);

  return (
    <div>
      <dl className="grid gap-5 text-sm sm:grid-cols-2">
        {[
          ['Recebida em', formatDateTime(quote.created_at)],
          ['Origem', quote.source],
          ['E-mail', quote.email],
          ['Telefone', quote.phone || '—'],
          ['Empresa', quote.company || '—'],
          ['Serviço', quote.service_name || '—'],
          ['Consentimento LGPD', quote.consent_privacy ? 'Sim' : 'Não'],
          ['Aceita comunicações', quote.consent_marketing ? 'Sim' : 'Não'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-gold-dark">{k}</dt>
            <dd className="mt-1 break-words text-graphite/85">{v}</dd>
          </div>
        ))}
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wider text-gold-dark">Necessidade</dt>
          <dd className="mt-1 whitespace-pre-line rounded-xl bg-offwhite p-4 text-graphite/85">{quote.message}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <a href={`mailto:${quote.email}?subject=${encodeURIComponent('MJ Gestão & Ambiental — sua solicitação')}`} className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-4 py-2 text-sm text-forest hover:border-forest">
          <Mail className="h-4 w-4" /> Responder por e-mail
        </a>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-4 py-2 text-sm text-forest hover:border-forest">
            <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
          </a>
        )}
      </div>

      <form
        className="mt-8 space-y-5 border-t border-forest/10 pt-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSave({ status, internal_notes: notes.trim() || null });
          setSaving(false);
        }}
      >
        <div>
          <span className="label">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)} aria-pressed={status === s} className={`rounded-full border px-4 py-2 text-sm transition ${status === s ? 'border-forest bg-forest text-white' : 'border-forest/15 text-forest hover:border-forest'}`}>
                {QUOTE_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="label">Observações internas</label>
          <textarea id="notes" rows={4} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visíveis apenas para administradores." />
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Excluir solicitação
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-white hover:bg-brand disabled:opacity-60">
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
