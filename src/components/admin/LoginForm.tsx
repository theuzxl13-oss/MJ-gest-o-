'use client';

import { LoaderCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Logo } from '@/components/ui/Logo';
import { isDemoMode } from '@/lib/config';
import { getRepository } from '@/lib/data';
import type { AdminSession } from '@/lib/data/repository';

export function LoginForm({ onSignedIn }: { onSignedIn: (s: AdminSession) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      onSignedIn(await getRepository().signIn(email.trim(), password));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest px-4 py-12">
      <div className="leaf-pattern fixed inset-0 opacity-30" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl md:p-10">
        <Logo />
        <h1 className="mt-8 flex items-center gap-2 text-2xl"><Lock className="h-5 w-5 text-gold" /> Área administrativa</h1>

        {isDemoMode ? (
          <div className="mt-6">
            <p className="text-graphite/70">
              Esta é a <strong>versão demonstrativa</strong> do painel. Nenhuma credencial é necessária: todas as funções
              estão disponíveis e as alterações ficam salvas apenas neste navegador.
            </p>
            <button type="button" onClick={() => submit()} disabled={busy} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 font-medium text-white hover:bg-brand disabled:opacity-60">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Entrar no painel demonstrativo
            </button>
            <p className="mt-4 text-xs text-graphite/55">
              Em produção, o acesso exige e-mail e senha de um administrador cadastrado no Supabase Auth.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="label">E-mail</label>
              <input id="email" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="label">Senha</label>
              <input id="password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 font-medium text-white hover:bg-brand disabled:opacity-60">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Entrar
            </button>
          </form>
        )}
        <Link href="/" className="mt-8 block text-center text-sm text-graphite/60 hover:text-forest">← Voltar ao site</Link>
      </div>
    </main>
  );
}
