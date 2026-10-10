import { Info } from 'lucide-react';
import { isDemoMode } from '@/lib/config';

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div className="bg-gold/15 text-[13px] text-forest">
      <div className="container flex items-center justify-center gap-2 py-2 text-center">
        <Info className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Versão demonstrativa.</strong> Serviços em rascunho e projetos ilustrativos;
          dados salvos apenas neste navegador.
        </p>
      </div>
    </div>
  );
}
