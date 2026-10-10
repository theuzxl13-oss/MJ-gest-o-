# MJ Gestão & Ambiental — Site institucional e painel administrativo

> *Gestão responsável, resultados sustentáveis.*

Site institucional completo (Início, Sobre Nós, Serviços, Portfólio, Sustentabilidade, Contato e Política de
Privacidade) com painel administrativo protegido, formulário de orçamento com proteção contra spam, integração
com WhatsApp e banco de dados Supabase com políticas RLS.

| Ambiente | Para quê | Dados |
| --- | --- | --- |
| **Vercel + Supabase** | Site oficial | PostgreSQL (Supabase), autenticação real, imagens no Storage |
| **GitHub Pages** | Apresentação comercial (demonstração) | Salvos apenas no navegador do visitante |

---

## 1. Arquitetura

```
                ┌──────────────────────── Next.js 15 (App Router, TypeScript, Tailwind) ───────────────────────┐
 Visitante ───▶ │  Páginas públicas (HTML pré-renderizado + SEO)      Painel /admin (cliente)                  │
                │            │                                               │                              │
                │            ▼                                               ▼                              │
                │                 DataRepository  (interface única de acesso a dados)                      │
                │          ┌─────────────────┴──────────────────┐                                         │
                │   SupabaseRepository                   DemoRepository                                   │
                │   (produção)                           (demonstração — localStorage)                    │
                └────────┬────────────────────────────────────────────────────────────────────────────────┘
                         │ anon key (pública) + sessão do admin
                         ▼
   POST /api/contato ──▶ Supabase: PostgreSQL + RLS │ Auth │ Storage (bucket "media")
   (validação, limite         ▲
    por IP, e-mail Resend)    └── submit_quote_request(): validação + limite de envios no banco
```

**Decisões principais**

- **Um código, dois alvos de build.** `npm run build` gera o site completo (Vercel). `npm run build:pages` gera
  uma exportação estática (GitHub Pages). As rotas de API usam a extensão `route.api.ts`, registrada apenas no
  modo servidor — por isso não quebram a exportação estática.
- **Repositório de dados com duas implementações.** A interface não sabe se está em demonstração ou produção.
  Sem as variáveis do Supabase (ou com `NEXT_PUBLIC_DEMO_MODE=true`), o site entra em modo demonstrativo.
- **Segurança no banco, não no navegador.** A anon key do Supabase é pública por design; quem protege os dados são
  as políticas RLS. Nenhuma chave privada (service role) é usada. Solicitações só entram no banco pela função
  `submit_quote_request`, que valida campos, exige o consentimento LGPD e limita envios
  (3 por e-mail/hora, 5 por origem/hora, 100 no total/hora).
- **SEO.** O HTML de todas as páginas públicas é pré-renderizado no servidor (com o conteúdo do banco, revalidado a
  cada 5 minutos) e atualizado no navegador após edições no painel.

## 2. Estrutura de pastas

```
├── .github/workflows/        ci.yml (tipos, testes e builds) · pages.yml (deploy no GitHub Pages)
├── public/images/            ilustrações institucionais (SVG) — substituíveis pelo painel
├── scripts/                  geração do seed SQL e das ilustrações
├── supabase/
│   ├── migrations/           esquema, políticas RLS e Storage
│   └── seed.sql              dados de demonstração (gerado a partir de src/lib/seed.ts)
├── src/
│   ├── app/
│   │   ├── (site)/           páginas públicas: /, sobre, servicos, portfolio, sustentabilidade, contato, politica-de-privacidade
│   │   ├── admin/            painel: dashboard, solicitacoes, servicos, portfolio, equipe, conteudos, configuracoes
│   │   ├── api/              contato (POST) e status (GET) — apenas no modo servidor
│   │   ├── sitemap.ts · robots.ts · icon.svg · layout.tsx · globals.css
│   ├── components/
│   │   ├── ui/               Button, Modal, Badge, Section, Reveal (animações), Logo
│   │   ├── layout/           Header, Footer, WhatsAppButton, CookieBanner, DemoBanner, PageHero
│   │   ├── site/             seções de cada página (home, services, portfolio, about, sustainability, contact)
│   │   └── admin/            AdminShell (autenticação + menu), gerenciadores e campos de formulário
│   ├── context/              SiteDataProvider (dados do site + serviço em foco para o WhatsApp)
│   └── lib/
│       ├── data/             repository (interface), supabase-repository, demo-repository, server
│       ├── server/           notificação por e-mail (somente servidor)
│       ├── config.ts · types.ts · validation.ts · whatsapp.ts · csv.ts · rate-limit.ts · seo.ts · seed.ts
└── tests/                    testes unitários (Vitest)
```

## 3. Executar localmente

Requisitos: Node.js 20+ e npm.

```bash
npm install
cp .env.example .env.local     # opcional: sem Supabase, roda em modo demonstrativo
npm run dev                    # http://localhost:3000
```

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e execução de produção |
| `npm run build:pages` | Exportação estática demonstrativa (pasta `out/`) |
| `npm run typecheck` | Verificação de tipos |
| `npm test` | Testes unitários |
| `npm run db:seed-sql` | Regenera `supabase/seed.sql` a partir de `src/lib/seed.ts` |
| `node scripts/generate-illustrations.mjs` | Regenera as ilustrações SVG |

## 4. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute **em ordem** os arquivos de `supabase/migrations/`:
   `…_schema.sql`, `…_policies.sql` e `…_storage.sql`.
   (Ou, com a Supabase CLI: `supabase link` e `supabase db push`.)
3. *(Opcional)* Execute `supabase/seed.sql` para carregar o conteúdo demonstrativo.
4. Crie o administrador: **Authentication → Users → Add user** (e-mail e senha) e, no SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-do-administrador@dominio.com.br';
   ```
5. Copie **Project URL** e **anon public key** (Project Settings → API) para `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
6. Recomendado: em **Authentication → Providers → Email**, desative "Allow new users to sign up" — os
   administradores são criados manualmente.

## 5. Publicar na Vercel (site oficial)

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) (framework detectado: Next.js).
2. Em **Environment Variables**, cadastre:
   - `NEXT_PUBLIC_SITE_URL` (ex.: `https://www.seudominio.com.br`)
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RATE_LIMIT_SALT` (texto aleatório longo)
   - Opcional, para aviso por e-mail de novas solicitações ([Resend](https://resend.com)):
     `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM` (remetente de domínio verificado)
3. Faça o deploy e configure o domínio próprio em **Settings → Domains**.

## 6. Versão demonstrativa no GitHub Pages

O workflow `.github/workflows/pages.yml` publica automaticamente a versão demonstrativa a cada push.

**Ativação (uma única vez):** no GitHub, acesse **Settings → Pages → Build and deployment → Source** e selecione
**GitHub Actions**. Depois, em **Actions → GitHub Pages (demonstração) → Run workflow**, execute o workflow.

Endereço: `https://theuzxl13-oss.github.io/MJ-gest-o-/`

Na demonstração **todos os botões funcionam**: navegação, catálogo com detalhes dos serviços, filtros do portfólio,
formulário de orçamento (com validação), WhatsApp, painel administrativo completo (sem senha, identificado como
demonstração), exportação CSV, envio de imagens, edição de textos e contatos. Os dados ficam apenas no navegador de
quem está testando e podem ser restaurados em **Painel → Configurações → Restaurar demonstração**.

## 7. O que está funcional e o que depende de configuração

| Recurso | Status |
| --- | --- |
| Páginas públicas, menu responsivo, animações, SEO (metadados, Open Graph, sitemap, robots, JSON-LD) | ✅ Funcional |
| Catálogo de serviços (categorias, benefícios, etapas, "Solicitar Orçamento") | ✅ Funcional — conteúdo em **rascunho** até aprovação |
| Portfólio com filtros e detalhes | ✅ Funcional — projetos **ilustrativos** identificados |
| Formulário de orçamento: validação, anti-spam (campo armadilha + tempo mínimo), limite de envios | ✅ Funcional |
| Painel: dashboard, solicitações (status, observações, filtros, CSV), serviços, categorias, portfólio, equipe, conteúdos, configurações | ✅ Funcional |
| Botão flutuante e mensagens de WhatsApp por serviço | ⚙️ Requer o número em **Painel → Configurações** (até lá, direciona ao formulário) |
| Persistência em banco, login de administradores, upload no Storage | ⚙️ Requer Supabase (seção 4) |
| Aviso por e-mail de novas solicitações | ⚙️ Requer Resend + Vercel (indisponível no GitHub Pages) |
| E-mail, telefone, endereço, horário, redes sociais, equipe técnica | ⚙️ Cadastro pela empresa — **nenhum dado foi inventado** |
| Logomarca oficial e fotografias | ⚙️ Enviar pelo painel (o site usa uma marca provisória e ilustrações próprias) |

### Remover os dados de demonstração

**Painel → Configurações → Remover dados de demonstração** apaga serviços, projetos e artigos marcados como
demonstração (`is_demo = true`), preservando categorias, configurações e solicitações.

## 8. Testes

```bash
npm run typecheck && npm test
```

Os testes cobrem validação do formulário e anti-spam, links e mensagens de WhatsApp, exportação CSV (incluindo
proteção contra injeção de fórmulas), limitador de envios e o repositório de demonstração. A CI executa tipos,
testes e os dois builds a cada push.

## 9. Segurança e LGPD

- RLS em todas as tabelas: visitantes leem apenas conteúdo ativo/publicado; somente administradores (tabela
  `admins`) alteram dados e leem solicitações.
- Inserção de solicitações apenas via função validada, com limite de envios no banco e na rota de API (por IP,
  armazenado como hash com `RATE_LIMIT_SALT`).
- Nome de cliente em projeto só é aceito pelo banco com autorização registrada (`client_authorized`).
- Cabeçalhos de segurança (HSTS, X-Frame-Options, nosniff, Referrer-Policy) e `noindex` no `/admin`.
- Política de Privacidade, consentimento obrigatório para tratamento de dados, consentimento **separado e opcional**
  para comunicações comerciais e aviso de armazenamento local (o site não usa cookies de rastreamento).

## 10. Conteúdo e responsabilidade técnica

Os serviços do catálogo são **sugestões em rascunho**. Atividades técnicas regulamentadas (laudos, projetos
técnicos, licenciamento) só devem ser oferecidas após a confirmação das habilitações e dos responsáveis técnicos
exigidos. O painel exibe esse alerta ao aprovar um serviço.
