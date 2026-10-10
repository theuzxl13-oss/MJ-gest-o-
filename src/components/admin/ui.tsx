'use client';

import { ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';
import { resolveImage } from '@/lib/config';
import { cn } from '@/lib/utils';
import { useAdmin } from './AdminShell';

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-graphite/65">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, hint, children, className, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-graphite/55">{hint}</p>}
    </div>
  );
}

export function TextInput({ label, value, onChange, hint, className, ...rest }: { label: string; value: string; onChange: (v: string) => void; hint?: ReactNode; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <input id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

export function TextArea({ label, value, onChange, hint, rows = 4, className, ...rest }: { label: string; value: string; onChange: (v: string) => void; hint?: ReactNode; rows?: number; className?: string } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <textarea id={id} className="input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

export function SelectInput({ label, value, onChange, options, hint, className }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: ReactNode; className?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, description, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string; disabled?: boolean }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-60')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-brand' : 'bg-graphite/20')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
      <span>
        <span className="block text-sm font-medium text-forest">{label}</span>
        {description && <span className="block text-xs text-graphite/55">{description}</span>}
      </span>
    </label>
  );
}

/** Envio de imagem (Supabase Storage em produção; data URL no modo demo). */
export function ImageUpload({ label, value, onChange, folder, hint }: { label: string; value: string | null; onChange: (url: string | null) => void; folder: string; hint?: string }) {
  const { repo, toast } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await repo.uploadImage(file, folder));
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-forest/10 bg-offwhite">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveImage(value, '')} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-graphite/30" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-4 py-2 text-sm text-forest hover:border-forest disabled:opacity-60">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {value ? 'Trocar' : 'Enviar imagem'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Remover
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}

export function MultiImageUpload({ label, values, onChange, folder }: { label: string; values: string[]; onChange: (v: string[]) => void; folder: string }) {
  const { repo, toast } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      try {
        urls.push(await repo.uploadImage(f, folder));
      } catch (err) {
        toast(`${f.name}: ${(err as Error).message}`, 'error');
      }
    }
    onChange([...values, ...urls]);
    setBusy(false);
    if (input.current) input.current.value = '';
  };

  return (
    <Field label={label} hint="A primeira imagem é usada como capa. Clique em “Capa” para reordenar.">
      <div className="flex flex-wrap gap-3">
        {values.map((url, i) => (
          <div key={url.slice(-40) + i} className="group relative h-24 w-32 overflow-hidden rounded-xl border border-forest/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImage(url, '')} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-forest-900/70 p-1 text-[11px] text-white">
              {i === 0 ? <span className="px-1">Capa</span> : (
                <button type="button" className="px-1 hover:text-gold-light" onClick={() => onChange([url, ...values.filter((_, j) => j !== i)])}>Capa</button>
              )}
              <button type="button" className="px-1 hover:text-red-300" onClick={() => onChange(values.filter((_, j) => j !== i))} aria-label="Remover imagem">Remover</button>
            </div>
          </div>
        ))}
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-forest/25 text-xs text-forest hover:border-forest disabled:opacity-60">
          {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />} Adicionar
        </button>
      </div>
    </Field>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-forest/20 bg-white p-12 text-center text-graphite/60">{children}</div>;
}

export function FormActions({ onCancel, saving, onDelete, submitLabel = 'Salvar' }: { onCancel: () => void; saving: boolean; onDelete?: () => void; submitLabel?: string }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-forest/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {onDelete && (
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Excluir
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="rounded-full px-5 py-2.5 text-sm text-graphite/70 hover:bg-forest/5">Cancelar</button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-white hover:bg-brand disabled:opacity-60">
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />} {submitLabel}
        </button>
      </div>
    </div>
  );
}
