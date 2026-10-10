import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { isDemoMode } from '@/lib/config';
import { getServerSupabase } from '@/lib/data/supabase-client';
import { SlidingWindowLimiter } from '@/lib/rate-limit';
import { notifyNewQuote } from '@/lib/server/notify';
import { checkAntiSpam, fieldErrors, quoteRequestSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 5 envios a cada 10 minutos por IP (por instância). O limite definitivo fica no banco.
const limiter = new SlidingWindowLimiter(5, 10 * 60 * 1000);

function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'desconhecido';
}

export async function POST(req: NextRequest) {
  if (isDemoMode) {
    return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
  }

  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== req.nextUrl.host) {
    return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
  }

  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > 20_000) return NextResponse.json({ error: 'Conteúdo muito grande.' }, { status: 413 });

  const ip = clientIp(req);
  const fingerprint = createHash('sha256').update(`${ip}:${process.env.RATE_LIMIT_SALT ?? 'mj'}`).digest('hex').slice(0, 32);

  const rl = limiter.check(fingerprint);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitos envios em sequência. Tente novamente em alguns minutos.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  if (checkAntiSpam({ website: String(body.website ?? ''), started_at: Number(body.started_at) })) {
    // Resposta genérica para não orientar robôs.
    return NextResponse.json({ error: 'Não foi possível validar o envio. Aguarde alguns segundos e tente novamente.' }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Verifique os campos destacados.', fieldErrors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;

  const { error } = await getServerSupabase().rpc('submit_quote_request', {
    p_name: d.name,
    p_company: d.company || null,
    p_email: d.email,
    p_phone: d.phone || null,
    p_service_id: d.service_id || null,
    p_service_name: d.service_name || null,
    p_message: d.message,
    p_consent_privacy: d.consent_privacy,
    p_consent_marketing: d.consent_marketing,
    p_fingerprint: fingerprint,
    p_source: 'site',
  });

  if (error) {
    if (/rate_limited/.test(error.message)) {
      return NextResponse.json({ error: 'Muitos envios em sequência. Tente novamente mais tarde.' }, { status: 429 });
    }
    console.error('[MJ] Falha ao registrar solicitação:', error.message);
    return NextResponse.json({ error: 'Não foi possível registrar sua solicitação. Tente novamente.' }, { status: 500 });
  }

  const email = await notifyNewQuote(d);
  return NextResponse.json({ ok: true, email }, { status: 201 });
}
