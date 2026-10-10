import { onlyDigits } from './utils';

export function whatsappMessage(serviceName?: string | null) {
  if (serviceName) {
    return `Olá! Conheci a MJ Gestão & Ambiental pelo site e gostaria de solicitar informações sobre ${serviceName}.`;
  }
  return 'Olá! Conheci a MJ Gestão & Ambiental pelo site e gostaria de solicitar informações.';
}

/** Retorna o link wa.me ou null quando o número não está configurado/é inválido. */
export function whatsappLink(phone: string | null | undefined, serviceName?: string | null): string | null {
  const digits = onlyDigits(phone ?? '');
  if (digits.length < 10 || digits.length > 15) return null;
  // Números brasileiros sem DDI recebem 55 automaticamente.
  const full = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(whatsappMessage(serviceName))}`;
}
