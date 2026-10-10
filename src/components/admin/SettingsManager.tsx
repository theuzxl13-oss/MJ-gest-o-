'use client';

import { RefreshCw, Trash2 } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { isDemoMode } from '@/lib/config';
import { DemoRepository } from '@/lib/data/demo-repository';
import type { SiteSettings } from '@/lib/types';
import { linesToList } from '@/lib/utils';
import { whatsappLink } from '@/lib/whatsapp';
import { useAdmin } from './AdminShell';
import { IntegrationStatus } from './IntegrationStatus';
import { FormActions, ImageUpload, PageHeader, TextArea, TextInput } from './ui';

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card p-6 md:p-8">
      <h2 className="text-xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-graphite/60">{description}</p>}
      <div className="mt-6 grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function SettingsManager() {
  const { data, repo, run } = useAdmin();
  const [s, setS] = useState<SiteSettings>(data.settings);
  const [values, setValues] = useState(data.settings.values.join('\n'));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const setSocial = (k: keyof SiteSettings['socials'], v: string) => setS((x) => ({ ...x, socials: { ...x.socials, [k]: v } }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (s.whatsapp && !whatsappLink(s.whatsapp)) return alert('Número de WhatsApp inválido. Informe DDD + número (ex.: 11 91234-5678).');
    const badUrl = Object.values(s.socials).find((u) => u && !/^https:\/\//.test(u));
    if (badUrl) return alert(`Os links de redes sociais devem começar com https:// (${badUrl}).`);
    setSaving(true);
    await run(() => repo.saveSettings({ ...s, values: linesToList(values) }), 'Configurações salvas.');
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Configurações do site" description="Identidade visual, textos institucionais, contatos e redes sociais." />
      <form onSubmit={submit} className="space-y-6">
        <Group title="Identidade" description="Logomarca, nome e slogan exibidos em todo o site.">
          <div className="md:col-span-2"><ImageUpload label="Logomarca" value={s.logo_url} onChange={(v) => set('logo_url', v)} folder="brand" hint="Preferencialmente SVG ou PNG com fundo transparente. Sem imagem, usa-se a marca padrão." /></div>
          <TextInput label="Nome da empresa" value={s.company_name} onChange={(v) => set('company_name', v)} />
          <TextInput label="Slogan" value={s.slogan} onChange={(v) => set('slogan', v)} />
        </Group>

        <Group title="Contato" description="Deixe em branco o que ainda não estiver definido — o site exibirá “Em breve”.">
          <TextInput label="WhatsApp empresarial" value={s.whatsapp} onChange={(v) => set('whatsapp', v)} placeholder="(00) 00000-0000" hint="Usado no botão flutuante e nas mensagens por serviço." />
          <TextInput label="Telefone" value={s.phone} onChange={(v) => set('phone', v)} placeholder="(00) 0000-0000" />
          <TextInput label="E-mail institucional" type="email" value={s.email} onChange={(v) => set('email', v)} />
          <TextInput label="E-mail para assuntos de privacidade (LGPD)" type="email" value={s.privacy_contact} onChange={(v) => set('privacy_contact', v)} hint="Se vazio, usa o e-mail institucional." />
          <TextInput label="Endereço" value={s.address} onChange={(v) => set('address', v)} />
          <TextInput label="Horário de atendimento" value={s.business_hours} onChange={(v) => set('business_hours', v)} placeholder="Ex.: Segunda a sexta, das 8h às 18h" />
        </Group>

        <Group title="Redes sociais" description="Links completos (https://…). Ícones aparecem apenas para redes preenchidas.">
          <TextInput label="Instagram" value={s.socials.instagram} onChange={(v) => setSocial('instagram', v)} placeholder="https://instagram.com/…" />
          <TextInput label="LinkedIn" value={s.socials.linkedin} onChange={(v) => setSocial('linkedin', v)} placeholder="https://linkedin.com/company/…" />
          <TextInput label="Facebook" value={s.socials.facebook} onChange={(v) => setSocial('facebook', v)} placeholder="https://facebook.com/…" />
          <TextInput label="YouTube" value={s.socials.youtube} onChange={(v) => setSocial('youtube', v)} placeholder="https://youtube.com/@…" />
        </Group>

        <Group title="Página inicial">
          <TextArea className="md:col-span-2" label="Título principal" rows={2} value={s.hero_title} onChange={(v) => set('hero_title', v)} />
          <TextArea className="md:col-span-2" label="Subtítulo" rows={3} value={s.hero_subtitle} onChange={(v) => set('hero_subtitle', v)} />
          <div className="md:col-span-2"><ImageUpload label="Imagem principal" value={s.hero_image_url} onChange={(v) => set('hero_image_url', v)} folder="site" hint="Recomendado: 1200×1500 px. Sem imagem, usa-se a ilustração padrão." /></div>
        </Group>

        <Group title="Textos institucionais" description="Exibidos nas páginas Início e Sobre Nós.">
          <TextArea className="md:col-span-2" label="Quem somos" rows={4} value={s.about_who} onChange={(v) => set('about_who', v)} />
          <TextArea label="Missão" rows={3} value={s.mission} onChange={(v) => set('mission', v)} />
          <TextArea label="Visão" rows={3} value={s.vision} onChange={(v) => set('vision', v)} />
          <TextArea className="md:col-span-2" label="Valores" hint="Um valor por linha." rows={6} value={values} onChange={setValues} />
        </Group>

        <div className="sticky bottom-0 z-10 -mx-4 bg-offwhite/95 px-4 backdrop-blur md:-mx-8 md:px-8">
          <FormActions onCancel={() => { setS(data.settings); setValues(data.settings.values.join('\n')); }} saving={saving} submitLabel="Salvar configurações" />
        </div>
      </form>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <IntegrationStatus />
        <section className="card p-6">
          <h2 className="text-xl">Dados de demonstração</h2>
          <p className="mt-2 text-sm text-graphite/65">
            Serviços em rascunho, projetos ilustrativos e artigos de exemplo estão marcados como “demonstração”. Remova-os
            quando o conteúdo oficial estiver cadastrado. Categorias, configurações e solicitações são mantidas.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => confirm('Remover todos os serviços, projetos e conteúdos de demonstração?') && run(() => repo.removeDemoData(), 'Dados de demonstração removidos.')}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Remover dados de demonstração
            </button>
            {isDemoMode && repo instanceof DemoRepository && (
              <button
                type="button"
                onClick={() => {
                  if (!confirm('Restaurar todo o conteúdo inicial da demonstração? As alterações feitas neste navegador serão perdidas.')) return;
                  repo.resetDemo();
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-2.5 text-sm text-forest hover:border-forest"
              >
                <RefreshCw className="h-4 w-4" /> Restaurar demonstração
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
