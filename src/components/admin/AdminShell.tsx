'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, Briefcase, CircleCheck, ExternalLink, FolderOpen, Inbox, LayoutDashboard, LoaderCircle, LogOut, Menu,
  Settings2, TriangleAlert, Users, X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import { useSiteData } from '@/context/SiteDataProvider';
import { isDemoMode } from '@/lib/config';
import { getRepository, type DataRepository } from '@/lib/data';
import type { AdminSession } from '@/lib/data/repository';
import type { PublicData, QuoteRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LoginForm } from './LoginForm';

type ToastKind = 'success' | 'error';

interface AdminContextValue {
  repo: DataRepository;
  session: AdminSession;
  data: PublicData;
  quotes: QuoteRequest[];
  reload: () => Promise<void>;
  toast: (message: string, kind?: ToastKind) => void;
  /** Executa uma operação, recarrega os dados e exibe o resultado. */
  run: (fn: () => Promise<unknown>, success: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin deve ser usado dentro do AdminShell');
  return ctx;
}

const NAV = [
  { href: '/admin', label: 'Painel', Icon: LayoutDashboard },
  { href: '/admin/solicitacoes', label: 'Solicitações', Icon: Inbox },
  { href: '/admin/servicos', label: 'Serviços', Icon: Briefcase },
  { href: '/admin/portfolio', label: 'Portfólio', Icon: FolderOpen },
  { href: '/admin/equipe', label: 'Equipe', Icon: Users },
  { href: '/admin/conteudos', label: 'Conteúdos', Icon: BookOpen },
  { href: '/admin/configuracoes', label: 'Configurações', Icon: Settings2 },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const repo = getRepository();
  const pathname = usePathname().replace(/\/$/, '') || '/admin';
  const site = useSiteData();
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined);
  const [data, setData] = useState<PublicData | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: ToastKind }[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const reload = useCallback(async () => {
    const [d, q] = await Promise.all([repo.loadAdminData(), repo.listQuotes()]);
    setData(d);
    setQuotes(q);
  }, [repo]);

  const run = useCallback(
    async (fn: () => Promise<unknown>, success: string) => {
      try {
        await fn();
        await reload();
        void site.refresh();
        toast(success);
        return true;
      } catch (err) {
        toast((err as Error).message || 'Não foi possível concluir a operação.', 'error');
        return false;
      }
    },
    [reload, site, toast],
  );

  useEffect(() => {
    repo.getSession().then(setSession).catch(() => setSession(null));
  }, [repo]);

  useEffect(() => {
    if (!session) return;
    reload().catch((err: Error) => toast(err.message, 'error'));
  }, [session, reload, toast]);

  useEffect(() => setMenuOpen(false), [pathname]);

  const signOut = async () => {
    await repo.signOut();
    setSession(null);
    setData(null);
  };

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-brand" /></div>;
  }
  if (!session) return <LoginForm onSignedIn={setSession} />;

  const newCount = quotes.filter((q) => q.status === 'novo').length;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6"><Logo src={site.settings.logo_url} light /></div>
      <nav className="flex-1 px-3" aria-label="Menu administrativo">
        <ul className="space-y-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link href={href} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] transition', active ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white')}>
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="flex-1">{label}</span>
                  {href === '/admin/solicitacoes' && newCount > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-forest-900">{newCount}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> Ver site
        </Link>
        <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Sair
        </button>
        <p className="truncate px-4 pt-2 text-xs text-white/40">{session.email}</p>
      </div>
    </div>
  );

  return (
    <AdminContext.Provider value={{ repo, session, data: data ?? site, quotes, reload, toast, run }}>
      <div className="min-h-screen bg-offwhite lg:pl-64">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-forest-900 lg:block">{sidebar}</aside>

        <AnimatePresence>
          {menuOpen && (
            <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
              <motion.aside className="absolute inset-y-0 left-0 w-72 bg-forest-900" initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ duration: 0.25 }}>
                <button type="button" onClick={() => setMenuOpen(false)} className="absolute right-3 top-3 p-2 text-white/70" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
                {sidebar}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-forest/10 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-forest" aria-label="Abrir menu"><Menu className="h-6 w-6" /></button>
          <span className="font-serif text-lg text-forest">Painel MJ</span>
          <span className="w-10" />
        </header>

        {isDemoMode && (
          <div className="border-b border-gold/30 bg-gold/10 px-6 py-2.5 text-center text-sm text-forest">
            <strong>Modo demonstrativo:</strong> as alterações ficam salvas somente neste navegador. Em produção, os dados são gravados no banco de dados (Supabase).
          </div>
        )}

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
          {data ? children : <div className="flex justify-center py-24"><LoaderCircle className="h-8 w-8 animate-spin text-brand" /></div>}
        </main>
      </div>

      <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn('pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-soft', t.kind === 'success' ? 'bg-forest text-white' : 'bg-red-600 text-white')}>
              {t.kind === 'success' ? <CircleCheck className="h-5 w-5 shrink-0" /> : <TriangleAlert className="h-5 w-5 shrink-0" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AdminContext.Provider>
  );
}
