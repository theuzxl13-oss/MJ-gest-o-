import { describe, expect, it } from 'vitest';
import { checkAntiSpam, fieldErrors, MIN_FILL_TIME_MS, quoteRequestSchema } from '@/lib/validation';

const valid = {
  name: 'Maria Silva',
  company: 'Empresa Exemplo',
  email: 'Maria@Example.com ',
  phone: '(11) 91234-5678',
  service_id: '',
  service_name: 'Planejamento estratégico',
  message: 'Gostaria de entender como funciona o serviço para minha empresa.',
  consent_privacy: true,
  consent_marketing: false,
};

describe('quoteRequestSchema', () => {
  it('aceita uma solicitação válida e normaliza o e-mail', () => {
    const r = quoteRequestSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.success && r.data.email).toBe('maria@example.com');
  });

  it('exige consentimento de privacidade (LGPD)', () => {
    const r = quoteRequestSchema.safeParse({ ...valid, consent_privacy: false });
    expect(r.success).toBe(false);
    expect(!r.success && fieldErrors(r.error).consent_privacy).toMatch(/Política de Privacidade/);
  });

  it('rejeita e-mail, telefone e mensagem inválidos', () => {
    const r = quoteRequestSchema.safeParse({ ...valid, email: 'invalido', phone: 'abc', message: 'curta' });
    expect(r.success).toBe(false);
    const errs = !r.success ? fieldErrors(r.error) : {};
    expect(Object.keys(errs).sort()).toEqual(['email', 'message', 'phone']);
  });

  it('limita o tamanho da mensagem', () => {
    expect(quoteRequestSchema.safeParse({ ...valid, message: 'x'.repeat(3001) }).success).toBe(false);
  });
});

describe('checkAntiSpam', () => {
  const now = 1_000_000;
  it('bloqueia o campo armadilha preenchido', () => {
    expect(checkAntiSpam({ website: 'http://spam', started_at: now - 10_000 }, now)).toBe('spam');
  });
  it('bloqueia envios rápidos demais', () => {
    expect(checkAntiSpam({ started_at: now - MIN_FILL_TIME_MS + 1 }, now)).toBe('too_fast');
  });
  it('permite envios normais', () => {
    expect(checkAntiSpam({ website: '', started_at: now - 10_000 }, now)).toBeNull();
  });
});
