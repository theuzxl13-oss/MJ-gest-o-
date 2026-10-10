export type ServiceStatus = 'draft' | 'approved';
export type ProjectStatus = 'planejado' | 'em_andamento' | 'concluido';
export type QuoteStatus = 'novo' | 'em_atendimento' | 'proposta_enviada' | 'concluido';

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface Service {
  id: string;
  slug: string;
  category_id: string;
  name: string;
  summary: string;
  description: string;
  icon: string;
  image_url: string | null;
  benefits: string[];
  steps: string[];
  status: ServiceStatus;
  is_active: boolean;
  sort_order: number;
  is_demo: boolean;
  updated_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client_name: string | null;
  client_authorized: boolean;
  category_id: string | null;
  description: string;
  problem: string;
  solution: string;
  results: string;
  images: string[];
  executed_at: string | null;
  status: ProjectStatus;
  is_featured: boolean;
  is_published: boolean;
  is_illustrative: boolean;
  is_demo: boolean;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  credentials: string | null;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  is_demo: boolean;
  updated_at: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service_id: string | null;
  service_name: string | null;
  message: string;
  consent_privacy: boolean;
  consent_marketing: boolean;
  status: QuoteStatus;
  internal_notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  instagram: string;
  linkedin: string;
  facebook: string;
  youtube: string;
}

export interface SiteSettings {
  company_name: string;
  slogan: string;
  logo_url: string | null;
  whatsapp: string;
  email: string;
  phone: string;
  address: string;
  business_hours: string;
  socials: SocialLinks;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  about_who: string;
  mission: string;
  vision: string;
  values: string[];
  privacy_contact: string;
  updated_at: string;
}

export interface PublicData {
  settings: SiteSettings;
  categories: ServiceCategory[];
  services: Service[];
  projects: Project[];
  team: TeamMember[];
  articles: Article[];
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  proposta_enviada: 'Proposta enviada',
  concluido: 'Concluído',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planejado: 'Planejado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
};

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  draft: 'Rascunho — aguardando aprovação',
  approved: 'Aprovado',
};
