import { NextResponse } from 'next/server';
import { isDemoMode, isSupabaseConfigured } from '@/lib/config';
import { isEmailConfigured } from '@/lib/server/notify';

export const dynamic = 'force-dynamic';

/** Informa ao painel quais integrações estão configuradas (sem expor valores). */
export function GET() {
  return NextResponse.json({
    supabase: isSupabaseConfigured,
    demo: isDemoMode,
    email: isEmailConfigured(),
    api: true,
  });
}
