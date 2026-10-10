'use client';

import { ArrowRight, Briefcase, FolderOpen, Inbox, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { QUOTE_STATUS_LABELS, type QuoteStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { useAdmin } from './AdminShell';
import { IntegrationStatus } from './IntegrationStatus';
import { PageHeader } from './ui';

export const STATUS_TONE: Record<QuoteStatus, 'blue' | 'amber' | 'gold' | 'green'> = {
  novo: 'blue',
  em_atendimento: 'amber',
  proposta_enviada: 'gold',
  concluido: 'green',
};

export function Dashboard() {
  const { data, quotes } = useAdmin();
  const publishedServices = data.services.filter((s) => s.is_active);
  const stats = [
    { label: 'Total de contatos', value: quotes.length, Icon: Inbox, href: '/admin/solicitacoes' },
    { label: 'Novas solicitações', value: quotes.filter((q) => q.status === 'novo').length, Icon: Sparkles, href: '/admin/solicitacoes' },
    { label: 'Projetos cadastrados', value: data.projects.length, Icon: FolderOpen, href: '/admin/portfolio' },
    { label: 'Serviços publicados', value: publishedServices.length, Icon: Briefcase, href: '/admin/servicos', note: `${publishedServices.filter((s) => s.status === 'draft').length} em rascunho` },
  ];

  const activity = [
    ...quotes.map((q) => ({ at: q.created_at, text: `Nova solicitação de ${q.name}${q.service_name ? ` — ${q.service_name}` : ''}`, href: '/admin/solicitacoes' })),
    ...data.services.map((s) => ({ at: s.updated_at, text: `Serviço atualizado: ${s.name}`, href: '/admin/servicos' })),
    ...data.projects.map((p) => ({ at: p.updated_at, text: `Projeto atualizado: ${p.title}`, href: '/admin/portfolio' })),
    ...data.articles.map((a) => ({ at: a.updated_at, text: `Conteúdo atualizado: ${a.title}`, href: '/admin/conteudos' })),
    { at: data.settings.updated_at, text: 'Configurações do site atualizadas', href: '/admin/configuracoes' },
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  const byStatus = (Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((s) => ({ s, n: quotes.filter((q) => q.status === s).length }));

  return (
    <>
      <PageHeader title="Painel" description="Visão geral das solicitações, conteúdos e configurações do site." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, href, note }) => (
          <Link key={label} href={href} className="card group p-6 transition hover:shadow-soft">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/5 text-brand"><Icon className="h-5 w-5" /></span>
              <ArrowRight className="h-4 w-4 text-graphite/30 transition group-hover:translate-x-1 group-hover:text-forest" />
            </div>
            <p className="mt-5 font-serif text-4xl text-forest">{value}</p>
            <p className="mt-1 text-sm text-graphite/60">{label}</p>
            {note && <p className="mt-1 text-xs text-amber-700">{note}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Solicitações recentes</h2>
            <Link href="/admin/solicitacoes" className="text-sm font-medium text-brand hover:underline">Ver todas</Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {byStatus.map(({ s, n }) => (
              <Badge key={s} tone={STATUS_TONE[s]}>{QUOTE_STATUS_LABELS[s]}: {n}</Badge>
            ))}
          </div>
          {quotes.length === 0 ? (
            <p className="mt-8 rounded-xl bg-offwhite p-6 text-center text-sm text-graphite/60">
              Nenhuma solicitação ainda. Teste o <Link href="/contato" target="_blank" className="font-medium text-brand underline">formulário de contato</Link>.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-forest/5">
              {quotes.slice(0, 6).map((q) => (
                <li key={q.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-forest">{q.name}{q.company ? ` · ${q.company}` : ''}</p>
                    <p className="truncate text-sm text-graphite/60">{q.service_name || 'Serviço não informado'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={STATUS_TONE[q.status]}>{QUOTE_STATUS_LABELS[q.status]}</Badge>
                    <span className="text-xs text-graphite/50">{formatDateTime(q.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl">Resumo de atividades</h2>
          <ol className="mt-5 space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="relative border-l-2 border-gold/30 pl-4">
                <Link href={a.href} className="text-sm text-forest hover:underline">{a.text}</Link>
                <p className="text-xs text-graphite/50">{formatDateTime(a.at)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6">
        <IntegrationStatus />
      </div>
    </>
  );
}
