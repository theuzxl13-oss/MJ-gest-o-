'use client';

import { CircleCheck, CircleDashed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { basePath, isDemoMode, isStaticExport, isSupabaseConfigured } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';
import { useAdmin } from './AdminShell';

/** Diferencia claramente o que está operacional do que depende de configuração externa. */
export function IntegrationStatus() {
  const { data } = useAdmin();
  const [email, setEmail] = useState<boolean | null>(null);

  useEffect(() => {
    if (isStaticExport) return;
    fetch(`${basePath}/api/status`)
      .then((r) => r.json())
      .then((s: { email: boolean }) => setEmail(s.email))
      .catch(() => setEmail(false));
  }, []);

  const items = [
    {
      label: 'Banco de dados (Supabase)',
      ok: isSupabaseConfigured && !isDemoMode,
      detail: isSupabaseConfigured && !isDemoMode ? 'Conectado — dados persistidos no PostgreSQL.' : 'Não configurado — usando dados de demonstração no navegador.',
    },
    {
      label: 'Autenticação de administradores',
      ok: !isDemoMode,
      detail: !isDemoMode ? 'Supabase Auth ativo.' : 'Acesso livre de demonstração (sem senha).',
    },
    {
      label: 'Armazenamento de imagens',
      ok: !isDemoMode,
      detail: !isDemoMode ? 'Supabase Storage (bucket “media”).' : 'Imagens salvas no navegador (limite de 1,5 MB).',
    },
    {
      label: 'Notificação por e-mail',
      ok: email === true,
      detail: isStaticExport ? 'Indisponível em hospedagem estática (use a Vercel).' : email ? 'Resend configurado.' : 'Não configurado (RESEND_API_KEY / NOTIFY_EMAIL_*).',
    },
    {
      label: 'WhatsApp empresarial',
      ok: Boolean(whatsappLink(data.settings.whatsapp)),
      detail: whatsappLink(data.settings.whatsapp) ? data.settings.whatsapp : 'Número não cadastrado — informe em Configurações.',
    },
    {
      label: 'Dados de contato',
      ok: Boolean(data.settings.email),
      detail: data.settings.email ? 'E-mail institucional cadastrado.' : 'E-mail, telefone e endereço pendentes.',
    },
  ];

  return (
    <div className="card p-6">
      <h2 className="text-xl">Integrações e configurações</h2>
      <ul className="mt-5 divide-y divide-forest/5">
        {items.map((i) => (
          <li key={i.label} className="flex items-start gap-3 py-3">
            {i.ok ? <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" /> : <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-forest">{i.label}</p>
              <p className="text-xs text-graphite/60">{i.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
