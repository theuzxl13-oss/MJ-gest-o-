'use client';

import { CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useSiteData } from '@/context/SiteDataProvider';
import { isDemoMode } from '@/lib/config';
import { getRepository } from '@/lib/data';
import { cn } from '@/lib/utils';
import { fieldErrors, quoteRequestSchema } from '@/lib/validation';

interface FormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  service_id: string;
  message: string;
  consent_privacy: boolean;
  consent_marketing: boolean;
  website: string;
}

const EMPTY: FormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service_id: '',
  message: '',
  consent_privacy: false,
  consent_marketing: false,
  website: '',
};

function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function QuoteForm() {
  const { services, categories } = useSiteData();
  const params = useSearchParams();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  // Pré-seleção a partir de ?servico=slug ou ?categoria=slug
  useEffect(() => {
    const serviceSlug = params.get('servico');
    const categorySlug = params.get('categoria');
    const service = services.find((s) => s.slug === serviceSlug);
    const category = categories.find((c) => c.slug === categorySlug);
    if (service) setForm((f) => ({ ...f, service_id: service.id }));
    else if (category && !form.message) {
      setForm((f) => ({ ...f, message: `Tenho interesse em serviços de ${category.name}. ` }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, services, categories]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const service = services.find((s) => s.id === form.service_id);
    const payload = {
      ...form,
      service_name: service?.name ?? (form.service_id === 'outro' ? 'Outro / ainda não sei' : ''),
      service_id: service ? service.id : '',
      started_at: startedAt.current,
    };

    const parsed = quoteRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus('sending');
    setMessage('');
    try {
      const result = await getRepository().submitQuote(payload);
      if (result.ok) {
        setStatus('success');
        setForm(EMPTY);
        setErrors({});
      } else {
        setStatus('error');
        setMessage(result.error);
        if (result.fieldErrors) setErrors(result.fieldErrors);
      }
    } catch {
      setStatus('error');
      setMessage('Não foi possível enviar no momento. Verifique sua conexão e tente novamente.');
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-8 text-center md:p-12" role="status" aria-live="polite">
        <CircleCheck className="mx-auto h-14 w-14 text-brand" strokeWidth={1.4} />
        <h2 className="mt-6 text-3xl">Solicitação enviada!</h2>
        <p className="mx-auto mt-4 max-w-md text-graphite/70">
          Obrigado pelo contato. Recebemos sua solicitação e nossa equipe retornará pelos meios informados.
        </p>
        {isDemoMode && (
          <p className="mx-auto mt-6 max-w-md rounded-xl bg-gold/10 p-4 text-sm text-forest">
            <strong>Versão demonstrativa:</strong> a solicitação foi registrada neste navegador e já pode ser vista em{' '}
            <Link href="/admin/solicitacoes" className="font-semibold underline">Painel → Solicitações</Link>.
          </p>
        )}
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus('idle');
          }}
        >
          Enviar nova solicitação
        </Button>
      </div>
    );
  }

  const fieldClass = (key: string) => cn('input', errors[key] && 'input-error');
  const errorText = (key: string) =>
    errors[key] ? (
      <p id={`${key}-erro`} className="mt-1.5 text-sm text-red-600">
        {errors[key]}
      </p>
    ) : null;
  const describedBy = (key: string) => (errors[key] ? `${key}-erro` : undefined);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card relative p-6 md:p-10" aria-describedby="form-obrigatorios">
      <h2 className="text-2xl md:text-3xl">Solicite um orçamento</h2>
      <p id="form-obrigatorios" className="mt-2 text-sm text-graphite/60">Campos marcados com * são obrigatórios.</p>

      {status === 'error' && message && (
        <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert className="h-5 w-5 shrink-0" /> {message}
        </div>
      )}

      {/* Campo armadilha contra robôs (não preencher) */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Nome completo *</label>
          <input id="name" name="name" className={fieldClass('name')} autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={describedBy('name')} required />
          {errorText('name')}
        </div>
        <div>
          <label htmlFor="company" className="label">Empresa</label>
          <input id="company" name="company" className={fieldClass('company')} autoComplete="organization" value={form.company} onChange={(e) => set('company', e.target.value)} aria-invalid={!!errors.company} aria-describedby={describedBy('company')} />
          {errorText('company')}
        </div>
        <div>
          <label htmlFor="email" className="label">E-mail *</label>
          <input id="email" name="email" type="email" inputMode="email" className={fieldClass('email')} autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={describedBy('email')} required />
          {errorText('email')}
        </div>
        <div>
          <label htmlFor="phone" className="label">Telefone / WhatsApp</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" className={fieldClass('phone')} autoComplete="tel" placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} aria-invalid={!!errors.phone} aria-describedby={describedBy('phone')} />
          {errorText('phone')}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="service_id" className="label">Serviço desejado</label>
          <select id="service_id" name="service_id" className={fieldClass('service_id')} value={form.service_id} onChange={(e) => set('service_id', e.target.value)}>
            <option value="">Selecione um serviço (opcional)</option>
            {categories.map((c) => {
              const items = services.filter((s) => s.category_id === c.id);
              if (!items.length) return null;
              return (
                <optgroup key={c.id} label={c.name}>
                  {items.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              );
            })}
            <option value="outro">Outro / ainda não sei</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="message" className="label">Descrição da necessidade *</label>
          <textarea id="message" name="message" rows={6} className={fieldClass('message')} value={form.message} onChange={(e) => set('message', e.target.value)} aria-invalid={!!errors.message} aria-describedby={describedBy('message')} placeholder="Conte-nos sobre sua empresa e o que você precisa." maxLength={3000} required />
          <div className="flex justify-between">
            {errorText('message') ?? <span />}
            <span className="mt-1.5 text-xs text-graphite/50">{form.message.length}/3000</span>
          </div>
        </div>
      </div>

      <fieldset className="mt-6 space-y-4 rounded-xl bg-offwhite p-5">
        <legend className="sr-only">Consentimentos (LGPD)</legend>
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-graphite/80">
          <input type="checkbox" name="consent_privacy" className="mt-1 h-4 w-4 shrink-0 accent-forest" checked={form.consent_privacy} onChange={(e) => set('consent_privacy', e.target.checked)} aria-invalid={!!errors.consent_privacy} aria-describedby={describedBy('consent_privacy')} />
          <span>
            * Concordo com o tratamento dos meus dados pessoais para resposta a esta solicitação, conforme a{' '}
            <Link href="/politica-de-privacidade" target="_blank" className="font-medium text-brand underline underline-offset-2">Política de Privacidade</Link>.
          </span>
        </label>
        {errorText('consent_privacy')}
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-graphite/80">
          <input type="checkbox" name="consent_marketing" className="mt-1 h-4 w-4 shrink-0 accent-forest" checked={form.consent_marketing} onChange={(e) => set('consent_marketing', e.target.checked)} />
          <span>Aceito receber comunicações da MJ Gestão & Ambiental sobre serviços e conteúdos (opcional — você pode cancelar a qualquer momento).</span>
        </label>
      </fieldset>

      <Button type="submit" size="lg" className="mt-8 w-full sm:w-auto" disabled={status === 'sending'}>
        {status === 'sending' ? (<><LoaderCircle className="h-5 w-5 animate-spin" /> Enviando…</>) : 'Enviar solicitação'}
      </Button>
    </form>
  );
}
