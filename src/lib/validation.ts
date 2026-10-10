import { z } from 'zod';

const phoneRegex = /^[\d\s()+-]{8,20}$/;

/** Esquema único usado no cliente, na rota de API e espelhado na função SQL. */
export const quoteRequestSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.').max(120, 'Nome muito longo.'),
  company: z.string().trim().max(120, 'Nome da empresa muito longo.').optional().or(z.literal('')),
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.').max(160),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === '' || phoneRegex.test(v), 'Informe um telefone válido com DDD.')
    .optional()
    .or(z.literal('')),
  service_id: z.string().trim().max(64).optional().or(z.literal('')),
  service_name: z.string().trim().max(160).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(20, 'Descreva sua necessidade com pelo menos 20 caracteres.')
    .max(3000, 'Mensagem muito longa (máx. 3000 caracteres).'),
  consent_privacy: z.literal(true, {
    errorMap: () => ({ message: 'É necessário concordar com a Política de Privacidade.' }),
  }),
  consent_marketing: z.boolean().default(false),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

/** Campos anti-spam enviados junto ao formulário. */
export const antiSpamSchema = z.object({
  website: z.string().max(0).optional().or(z.literal('')), // honeypot: deve ficar vazio
  started_at: z.number().int().positive(),
});

export const MIN_FILL_TIME_MS = 3000;

export function checkAntiSpam(input: { website?: string; started_at?: number }, now = Date.now()) {
  if (input.website && input.website.trim() !== '') return 'spam';
  if (!input.started_at || now - input.started_at < MIN_FILL_TIME_MS) return 'too_fast';
  return null;
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
