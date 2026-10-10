import { describe, expect, it } from 'vitest';
import { whatsappLink, whatsappMessage } from '@/lib/whatsapp';

describe('whatsapp', () => {
  it('gera a mensagem personalizada com o nome do serviço', () => {
    expect(whatsappMessage('Gestão de resíduos sólidos')).toBe(
      'Olá! Conheci a MJ Gestão & Ambiental pelo site e gostaria de solicitar informações sobre Gestão de resíduos sólidos.',
    );
  });

  it('adiciona o DDI 55 a números brasileiros', () => {
    expect(whatsappLink('(11) 91234-5678')).toMatch(/^https:\/\/wa\.me\/5511912345678\?text=/);
  });

  it('mantém números já com DDI', () => {
    expect(whatsappLink('+55 11 91234-5678')).toMatch(/wa\.me\/5511912345678/);
  });

  it('retorna null quando o número não está configurado ou é inválido', () => {
    expect(whatsappLink('')).toBeNull();
    expect(whatsappLink('123')).toBeNull();
  });

  it('codifica a mensagem na URL', () => {
    const link = whatsappLink('11912345678', 'ESG & Governança')!;
    expect(decodeURIComponent(link.split('text=')[1])).toContain('sobre ESG & Governança.');
  });
});
