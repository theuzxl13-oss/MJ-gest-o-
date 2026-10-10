import type {
  Article,
  Project,
  PublicData,
  QuoteRequest,
  QuoteStatus,
  Service,
  ServiceCategory,
  SiteSettings,
  TeamMember,
} from '../types';
import type { QuoteRequestInput } from '../validation';

export interface AdminSession {
  email: string;
  isDemo: boolean;
}

export type SubmitResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export interface QuoteSubmission extends Omit<QuoteRequestInput, 'consent_privacy'> {
  consent_privacy: boolean;
  website?: string;
  started_at: number;
}

/** Contrato único de acesso a dados — implementado em modo demo e Supabase. */
export interface DataRepository {
  readonly mode: 'demo' | 'supabase';

  // Público
  loadPublicData(): Promise<PublicData>;
  submitQuote(input: QuoteSubmission): Promise<SubmitResult>;

  // Autenticação
  getSession(): Promise<AdminSession | null>;
  signIn(email: string, password: string): Promise<AdminSession>;
  signOut(): Promise<void>;

  // Administração
  loadAdminData(): Promise<PublicData>;
  saveSettings(settings: SiteSettings): Promise<SiteSettings>;
  saveCategory(category: ServiceCategory): Promise<ServiceCategory>;
  deleteCategory(id: string): Promise<void>;
  saveService(service: Service): Promise<Service>;
  deleteService(id: string): Promise<void>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  saveTeamMember(member: TeamMember): Promise<TeamMember>;
  deleteTeamMember(id: string): Promise<void>;
  saveArticle(article: Article): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  listQuotes(): Promise<QuoteRequest[]>;
  updateQuote(id: string, patch: { status?: QuoteStatus; internal_notes?: string | null }): Promise<QuoteRequest>;
  deleteQuote(id: string): Promise<void>;
  uploadImage(file: File, folder: string): Promise<string>;
  removeDemoData(): Promise<void>;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif'];

export function assertImage(file: File, maxBytes = MAX_UPLOAD_BYTES) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Formato não suportado. Use JPG, PNG, WEBP, AVIF ou SVG.');
  }
  if (file.size > maxBytes) {
    throw new Error(`Imagem muito grande. Tamanho máximo: ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }
}
