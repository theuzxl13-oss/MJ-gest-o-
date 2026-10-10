import 'server-only';
import type { QuoteRequestInput } from '../validation';

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL_TO && process.env.NOTIFY_EMAIL_FROM);
}

/** Envia aviso de nova solicitação via Resend (opcional). Falhas não bloqueiam o registro. */
export async function notifyNewQuote(data: QuoteRequestInput): Promise<'sent' | 'skipped' | 'failed'> {
  if (!isEmailConfigured()) return 'skipped';
  const rows: [string, string | undefined][] = [
    ['Nome', data.name],
    ['Empresa', data.company],
    ['E-mail', data.email],
    ['Telefone', data.phone],
    ['Serviço', data.service_name],
    ['Aceita comunicações', data.consent_marketing ? 'Sim' : 'Não'],
  ];
  const html = `
    <h2 style="font-family:Georgia,serif;color:#103B2B">Nova solicitação de orçamento</h2>
    <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><strong>${escape(v || '—')}</strong></td></tr>`).join('')}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-line">${escape(data.message)}</p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#888">Acesse o painel administrativo para atualizar o status.</p>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_EMAIL_FROM,
        to: process.env.NOTIFY_EMAIL_TO!.split(',').map((s) => s.trim()),
        reply_to: data.email,
        subject: `Nova solicitação: ${data.service_name || 'Contato pelo site'} — ${data.name}`,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
