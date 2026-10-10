import type { Article, Project, PublicData, Service, ServiceCategory, SiteSettings } from './types';
import { slugify } from './utils';

/**
 * Dados de demonstração. Todos os serviços estão como RASCUNHO e todos os
 * projetos são EXEMPLOS ILUSTRATIVOS — nada aqui representa clientes,
 * profissionais, registros ou resultados reais.
 */
const SEED_DATE = '2026-01-15T12:00:00.000Z';

export const defaultSettings: SiteSettings = {
  company_name: 'MJ Gestão & Ambiental',
  slogan: 'Gestão responsável, resultados sustentáveis.',
  logo_url: null,
  whatsapp: '',
  email: '',
  phone: '',
  address: '',
  business_hours: '',
  socials: { instagram: '', linkedin: '', facebook: '', youtube: '' },
  hero_title: 'Gestão inteligente para empresas. Compromisso com um futuro sustentável.',
  hero_subtitle:
    'A MJ Gestão & Ambiental oferece soluções em gestão administrativa, consultoria empresarial e gestão ambiental, contribuindo para organizações mais eficientes, responsáveis e preparadas para o futuro.',
  hero_image_url: null,
  about_who:
    'A MJ Gestão & Ambiental é uma empresa voltada à prestação de serviços de consultoria e gestão, com foco na organização administrativa, melhoria de processos, responsabilidade ambiental e desenvolvimento sustentável das empresas.',
  mission:
    'Oferecer soluções eficientes de gestão empresarial e ambiental, contribuindo para o desenvolvimento responsável das organizações.',
  vision:
    'Ser reconhecida pela excelência na prestação de serviços de gestão, consultoria e soluções empresariais sustentáveis.',
  values: [
    'Ética e transparência.',
    'Responsabilidade ambiental.',
    'Compromisso com resultados.',
    'Excelência profissional.',
    'Inovação e melhoria contínua.',
    'Respeito às pessoas e ao meio ambiente.',
  ],
  privacy_contact: '',
  updated_at: SEED_DATE,
};

export const seedCategories: ServiceCategory[] = [
  {
    id: 'cat-gestao-empresarial',
    slug: 'gestao-empresarial',
    name: 'Gestão Empresarial',
    description: 'Organização administrativa, planejamento e melhoria de processos para empresas mais eficientes.',
    icon: 'briefcase',
    sort_order: 1,
  },
  {
    id: 'cat-gestao-ambiental',
    slug: 'gestao-ambiental',
    name: 'Gestão Ambiental',
    description: 'Planejamento e boas práticas ambientais integradas à rotina e à estratégia da empresa.',
    icon: 'leaf',
    sort_order: 2,
  },
  {
    id: 'cat-sustentabilidade-esg',
    slug: 'sustentabilidade-esg',
    name: 'Sustentabilidade e ESG',
    description: 'Diagnóstico, planejamento e indicadores para uma atuação socioambiental responsável.',
    icon: 'sprout',
    sort_order: 3,
  },
  {
    id: 'cat-assessoria-regularizacao',
    slug: 'assessoria-regularizacao',
    name: 'Assessoria e Regularização',
    description: 'Apoio na organização documental e no acompanhamento administrativo de demandas.',
    icon: 'files',
    sort_order: 4,
  },
];

type ServiceDraft = { name: string; icon: string; summary: string; benefits: string[] };

const categorySteps: Record<string, string[]> = {
  'cat-gestao-empresarial': [
    'Reunião inicial para entender o contexto e os objetivos da empresa.',
    'Levantamento de informações, processos e rotinas atuais.',
    'Elaboração de diagnóstico e plano de ação com prioridades.',
    'Apoio na implantação e acompanhamento dos resultados.',
  ],
  'cat-gestao-ambiental': [
    'Conversa inicial sobre as atividades e a realidade da empresa.',
    'Levantamento de aspectos ambientais e práticas atuais.',
    'Proposta de plano de ação ambiental com metas e responsáveis.',
    'Acompanhamento periódico e revisão das ações.',
  ],
  'cat-sustentabilidade-esg': [
    'Alinhamento de expectativas e escopo com a liderança.',
    'Diagnóstico das práticas ambientais, sociais e de governança.',
    'Definição de indicadores, metas e plano de comunicação.',
    'Monitoramento e ciclos de melhoria contínua.',
  ],
  'cat-assessoria-regularizacao': [
    'Entendimento da demanda e da documentação existente.',
    'Organização e conferência dos documentos administrativos.',
    'Elaboração de cronograma e checklist de pendências.',
    'Acompanhamento administrativo junto à empresa e aos profissionais habilitados envolvidos.',
  ],
};

const catalog: Record<string, ServiceDraft[]> = {
  'cat-gestao-empresarial': [
    { name: 'Consultoria administrativa', icon: 'briefcase', summary: 'Análise e orientação sobre a rotina administrativa para ganhar organização, controle e eficiência.', benefits: ['Rotinas mais organizadas', 'Maior controle gerencial', 'Decisões baseadas em informação'] },
    { name: 'Planejamento estratégico', icon: 'target', summary: 'Definição de objetivos, metas e ações para orientar o crescimento da empresa com clareza.', benefits: ['Direcionamento claro', 'Equipe alinhada às metas', 'Uso eficiente de recursos'] },
    { name: 'Organização de processos', icon: 'workflow', summary: 'Mapeamento e padronização dos processos internos para reduzir retrabalho e falhas.', benefits: ['Menos retrabalho', 'Padronização de atividades', 'Facilidade no treinamento'] },
    { name: 'Gestão organizacional', icon: 'building-2', summary: 'Apoio na estruturação de áreas, responsabilidades e fluxos de comunicação.', benefits: ['Papéis bem definidos', 'Comunicação mais fluida', 'Estrutura preparada para crescer'] },
    { name: 'Assessoria empresarial', icon: 'handshake', summary: 'Acompanhamento contínuo para apoiar a gestão nas decisões do dia a dia.', benefits: ['Apoio próximo à gestão', 'Visão externa e imparcial', 'Agilidade nas decisões'] },
    { name: 'Diagnóstico administrativo', icon: 'clipboard-check', summary: 'Avaliação da situação atual da empresa com identificação de pontos fortes e oportunidades.', benefits: ['Visão completa do negócio', 'Prioridades bem definidas', 'Base para o planejamento'] },
    { name: 'Gestão de indicadores', icon: 'chart-column', summary: 'Definição e acompanhamento de indicadores de desempenho alinhados aos objetivos.', benefits: ['Acompanhamento objetivo', 'Identificação rápida de desvios', 'Cultura orientada a resultados'] },
    { name: 'Melhoria de processos internos', icon: 'settings-2', summary: 'Revisão de processos existentes com foco em simplificação e produtividade.', benefits: ['Processos mais simples', 'Ganho de produtividade', 'Redução de custos operacionais'] },
  ],
  'cat-gestao-ambiental': [
    { name: 'Consultoria em gestão ambiental', icon: 'leaf', summary: 'Orientação para integrar a gestão ambiental às rotinas e à estratégia da empresa.', benefits: ['Gestão ambiental estruturada', 'Prevenção de riscos', 'Imagem institucional fortalecida'] },
    { name: 'Planejamento ambiental empresarial', icon: 'map', summary: 'Elaboração de planos de ação ambientais com metas, prazos e responsáveis.', benefits: ['Metas ambientais claras', 'Ações organizadas no tempo', 'Integração com o negócio'] },
    { name: 'Gestão de resíduos sólidos', icon: 'recycle', summary: 'Apoio na organização da segregação, armazenamento e destinação adequada dos resíduos.', benefits: ['Redução de desperdícios', 'Destinação adequada', 'Possível redução de custos'] },
    { name: 'Programas de sustentabilidade', icon: 'sprout', summary: 'Estruturação de programas internos voltados a práticas sustentáveis.', benefits: ['Engajamento da equipe', 'Uso consciente de recursos', 'Ações contínuas e mensuráveis'] },
    { name: 'Gestão de indicadores ambientais', icon: 'chart-line', summary: 'Definição e monitoramento de indicadores de consumo, resíduos e desempenho ambiental.', benefits: ['Dados para decisões', 'Acompanhamento de metas', 'Transparência nos resultados'] },
    { name: 'Assessoria em processos de conformidade ambiental', icon: 'shield-check', summary: 'Apoio na organização das rotinas internas relacionadas às obrigações ambientais da empresa.', benefits: ['Rotinas organizadas', 'Prazos acompanhados', 'Menor risco de pendências'] },
    { name: 'Apoio à implantação de sistemas de gestão ambiental', icon: 'layers', summary: 'Suporte na estruturação de procedimentos e registros de um sistema de gestão ambiental.', benefits: ['Procedimentos documentados', 'Melhoria contínua', 'Preparação para auditorias'] },
    { name: 'Orientação empresarial sobre boas práticas ambientais', icon: 'book-open', summary: 'Orientações práticas para gestores e equipes adotarem condutas ambientalmente responsáveis.', benefits: ['Equipe capacitada', 'Práticas simples e aplicáveis', 'Cultura de responsabilidade'] },
  ],
  'cat-sustentabilidade-esg': [
    { name: 'Diagnóstico de práticas sustentáveis', icon: 'search', summary: 'Levantamento das práticas atuais da empresa sob a ótica da sustentabilidade.', benefits: ['Ponto de partida claro', 'Oportunidades identificadas', 'Prioridades realistas'] },
    { name: 'Planejamento de sustentabilidade corporativa', icon: 'compass', summary: 'Construção de um plano de sustentabilidade alinhado à estratégia do negócio.', benefits: ['Estratégia integrada', 'Metas de longo prazo', 'Posicionamento responsável'] },
    { name: 'Gestão de indicadores ESG', icon: 'gauge', summary: 'Estruturação de indicadores ambientais, sociais e de governança.', benefits: ['Informações organizadas', 'Base para relatórios', 'Acompanhamento de evolução'] },
    { name: 'Apoio à elaboração de políticas ambientais', icon: 'file-text', summary: 'Apoio na redação e revisão de políticas ambientais internas.', benefits: ['Diretrizes formalizadas', 'Compromisso público', 'Alinhamento interno'] },
    { name: 'Programas de conscientização ambiental', icon: 'users', summary: 'Ações educativas para colaboradores sobre temas ambientais e sustentabilidade.', benefits: ['Equipe engajada', 'Mudança de hábitos', 'Fortalecimento da cultura'] },
    { name: 'Consultoria em responsabilidade socioambiental', icon: 'heart-handshake', summary: 'Orientação para iniciativas que conciliam impacto social, ambiental e o negócio.', benefits: ['Relação com a comunidade', 'Reputação fortalecida', 'Impacto positivo planejado'] },
  ],
  'cat-assessoria-regularizacao': [
    { name: 'Assessoria documental empresarial', icon: 'folder-open', summary: 'Organização e controle da documentação empresarial do dia a dia.', benefits: ['Documentos localizáveis', 'Controle de vencimentos', 'Menos retrabalho'] },
    { name: 'Organização de documentação administrativa', icon: 'files', summary: 'Estruturação de arquivos físicos e digitais com critérios claros de organização.', benefits: ['Arquivo padronizado', 'Acesso rápido à informação', 'Segurança documental'] },
    { name: 'Apoio a processos de regularização', icon: 'file-check', summary: 'Apoio administrativo na organização de etapas e documentos de processos de regularização.', benefits: ['Etapas organizadas', 'Pendências mapeadas', 'Acompanhamento de prazos'] },
    { name: 'Acompanhamento administrativo de demandas ambientais', icon: 'clipboard-check', summary: 'Controle administrativo de prazos, documentos e comunicações de demandas ambientais.', benefits: ['Prazos sob controle', 'Histórico organizado', 'Comunicação centralizada'] },
    { name: 'Apoio à organização de documentos para processos de licenciamento', icon: 'scale', summary: 'Apoio na reunião e organização de documentos administrativos solicitados em processos de licenciamento, em conjunto com os profissionais habilitados responsáveis.', benefits: ['Documentação reunida', 'Checklist de pendências', 'Interlocução facilitada'] },
  ],
};

export const seedServices: Service[] = Object.entries(catalog).flatMap(([categoryId, items]) =>
  items.map((item, index) => ({
    id: `srv-${slugify(item.name)}`,
    slug: slugify(item.name),
    category_id: categoryId,
    name: item.name,
    summary: item.summary,
    description: `${item.summary} O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.`,
    icon: item.icon,
    image_url: null,
    benefits: item.benefits,
    steps: categorySteps[categoryId],
    status: 'draft' as const,
    is_active: true,
    sort_order: index + 1,
    is_demo: true,
    updated_at: SEED_DATE,
  })),
);

const illustrativeNote =
  'Exemplo ilustrativo criado para demonstrar a apresentação de projetos. Não representa um trabalho realizado nem um cliente real.';

export const seedProjects: Project[] = [
  {
    id: 'prj-exemplo-processos',
    slug: 'exemplo-organizacao-de-processos-administrativos',
    title: 'Organização de processos administrativos',
    client_name: null,
    client_authorized: false,
    category_id: 'cat-gestao-empresarial',
    description: `${illustrativeNote} Cenário: empresa de serviços com rotinas administrativas pouco padronizadas.`,
    problem: 'Atividades executadas de formas diferentes por cada colaborador, gerando retrabalho e dificuldade de controle.',
    solution: 'Mapeamento dos processos principais, definição de responsáveis e criação de procedimentos padronizados.',
    results: 'Em um projeto real, esta seção apresentaria os resultados efetivamente medidos e autorizados pelo cliente.',
    images: ['/images/projects/processos.svg'],
    executed_at: null,
    status: 'concluido',
    is_featured: true,
    is_published: true,
    is_illustrative: true,
    is_demo: true,
    updated_at: SEED_DATE,
  },
  {
    id: 'prj-exemplo-residuos',
    slug: 'exemplo-programa-de-gestao-de-residuos',
    title: 'Programa interno de gestão de resíduos',
    client_name: null,
    client_authorized: false,
    category_id: 'cat-gestao-ambiental',
    description: `${illustrativeNote} Cenário: unidade comercial que deseja organizar a segregação de resíduos.`,
    problem: 'Resíduos descartados sem separação adequada e sem registro das quantidades geradas.',
    solution: 'Plano de segregação, sinalização dos pontos de coleta, orientação da equipe e planilha de controle.',
    results: 'Em um projeto real, esta seção apresentaria indicadores medidos antes e depois da implantação.',
    images: ['/images/projects/residuos.svg'],
    executed_at: null,
    status: 'concluido',
    is_featured: true,
    is_published: true,
    is_illustrative: true,
    is_demo: true,
    updated_at: SEED_DATE,
  },
  {
    id: 'prj-exemplo-esg',
    slug: 'exemplo-diagnostico-de-praticas-sustentaveis',
    title: 'Diagnóstico de práticas sustentáveis',
    client_name: null,
    client_authorized: false,
    category_id: 'cat-sustentabilidade-esg',
    description: `${illustrativeNote} Cenário: empresa interessada em iniciar sua jornada ESG.`,
    problem: 'Ausência de informações organizadas sobre práticas ambientais, sociais e de governança.',
    solution: 'Questionário estruturado, entrevistas com gestores e matriz de priorização de ações.',
    results: 'Em um projeto real, esta seção apresentaria as entregas e os avanços confirmados pelo cliente.',
    images: ['/images/projects/esg.svg'],
    executed_at: null,
    status: 'em_andamento',
    is_featured: true,
    is_published: true,
    is_illustrative: true,
    is_demo: true,
    updated_at: SEED_DATE,
  },
  {
    id: 'prj-exemplo-documentos',
    slug: 'exemplo-organizacao-documental',
    title: 'Organização documental administrativa',
    client_name: null,
    client_authorized: false,
    category_id: 'cat-assessoria-regularizacao',
    description: `${illustrativeNote} Cenário: empresa com documentos dispersos em pastas físicas e digitais.`,
    problem: 'Dificuldade para localizar documentos e acompanhar vencimentos.',
    solution: 'Estrutura padronizada de arquivos, nomenclatura definida e controle de vencimentos.',
    results: 'Em um projeto real, esta seção apresentaria os resultados efetivamente obtidos.',
    images: ['/images/projects/documentos.svg'],
    executed_at: null,
    status: 'planejado',
    is_featured: false,
    is_published: true,
    is_illustrative: true,
    is_demo: true,
    updated_at: SEED_DATE,
  },
];

export const seedArticles: Article[] = [
  {
    id: 'art-importancia-gestao-ambiental',
    slug: 'a-importancia-da-gestao-ambiental-nas-empresas',
    title: 'A importância da gestão ambiental nas empresas',
    excerpt: 'Como integrar a variável ambiental à gestão ajuda a prevenir riscos e a gerar valor para o negócio.',
    content:
      'A gestão ambiental reúne práticas e procedimentos que permitem à empresa conhecer, controlar e reduzir os impactos de suas atividades sobre o meio ambiente.\n\nMais do que uma obrigação, ela contribui para o uso eficiente de recursos, a prevenção de riscos, a organização interna e o fortalecimento da imagem da organização perante clientes, parceiros e comunidade.\n\nUm bom ponto de partida é conhecer os principais aspectos ambientais da operação — consumo de água e energia, geração de resíduos, emissões — e definir metas simples e mensuráveis para cada um deles.',
    image_url: '/images/articles/gestao-ambiental.svg',
    is_published: true,
    published_at: SEED_DATE,
    is_demo: true,
    updated_at: SEED_DATE,
  },
  {
    id: 'art-reducao-desperdicios',
    slug: 'reducao-de-desperdicios-e-uso-eficiente-de-recursos',
    title: 'Redução de desperdícios e uso eficiente de recursos',
    excerpt: 'Pequenas mudanças de rotina podem gerar economia e reduzir impactos ambientais de forma consistente.',
    content:
      'Desperdício é custo. Água, energia, materiais de escritório e insumos de produção consumidos além do necessário afetam tanto o resultado financeiro quanto o meio ambiente.\n\nMedir é o primeiro passo: registrar consumos mensais permite identificar padrões e definir metas. Em seguida, vale envolver a equipe com orientações práticas e reconhecer as boas iniciativas.\n\nRevisar processos com foco em eficiência — eliminando etapas desnecessárias, reaproveitando materiais e planejando compras — costuma trazer ganhos rápidos.',
    image_url: '/images/articles/recursos.svg',
    is_published: true,
    published_at: SEED_DATE,
    is_demo: true,
    updated_at: SEED_DATE,
  },
  {
    id: 'art-esg-governanca',
    slug: 'esg-e-governanca-corporativa-por-onde-comecar',
    title: 'ESG e governança corporativa: por onde começar',
    excerpt: 'Entenda os três pilares do ESG e como empresas de qualquer porte podem dar os primeiros passos.',
    content:
      'ESG é a sigla em inglês para Ambiental, Social e Governança. Trata-se de um conjunto de critérios usados para avaliar como uma organização gerencia seus impactos e se relaciona com as partes interessadas.\n\nNo pilar ambiental, entram temas como resíduos, energia e emissões. No social, a relação com colaboradores, clientes e comunidade. Na governança, a ética, a transparência e a qualidade das decisões.\n\nPara começar, recomenda-se um diagnóstico das práticas atuais, a escolha de poucos indicadores relevantes e a definição de responsáveis por acompanhá-los.',
    image_url: '/images/articles/esg.svg',
    is_published: true,
    published_at: SEED_DATE,
    is_demo: true,
    updated_at: SEED_DATE,
  },
];

export function getSeedData(): PublicData {
  return {
    settings: structuredClone(defaultSettings),
    categories: structuredClone(seedCategories),
    services: structuredClone(seedServices),
    projects: structuredClone(seedProjects),
    team: [],
    articles: structuredClone(seedArticles),
  };
}
