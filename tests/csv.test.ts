import { describe, expect, it } from 'vitest';
import { csvCell, quotesToCsv } from '@/lib/csv';
import type { QuoteRequest } from '@/lib/types';

describe('csv', () => {
  it('escapa separadores, aspas e quebras de linha', () => {
    expect(csvCell('a;b')).toBe('"a;b"');
    expect(csvCell('diz "olá"')).toBe('"diz ""olá"""');
    expect(csvCell('linha1\nlinha2')).toBe('"linha1\nlinha2"');
    expect(csvCell(null)).toBe('');
  });

  it('neutraliza injeção de fórmulas', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+5511')).toBe("'+5511");
    expect(csvCell('@SUM(A1)')).toBe("'@SUM(A1)");
  });

  it('gera cabeçalho, BOM e uma linha por solicitação', () => {
    const q: QuoteRequest = {
      id: '1', name: 'Maria', company: null, email: 'm@x.com', phone: null, service_id: null, service_name: 'ESG',
      message: 'Mensagem', consent_privacy: true, consent_marketing: true, status: 'proposta_enviada', internal_notes: null,
      source: 'site', created_at: '2026-01-01T12:00:00Z', updated_at: '2026-01-01T12:00:00Z',
    };
    const csv = quotesToCsv([q]);
    expect(csv.startsWith('﻿Data;Nome')).toBe(true);
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('Proposta enviada');
    expect(lines[1]).toContain(';Sim;');
  });
});
