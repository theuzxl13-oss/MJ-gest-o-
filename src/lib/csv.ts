import { QUOTE_STATUS_LABELS, type QuoteRequest } from './types';

/**
 * Escapa um valor para CSV (separador ";" — padrão do Excel em pt-BR) e
 * neutraliza injeção de fórmulas (=, +, -, @) em planilhas.
 */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[";\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function quotesToCsv(rows: QuoteRequest[]): string {
  const header = [
    'Data',
    'Nome',
    'Empresa',
    'E-mail',
    'Telefone',
    'Serviço',
    'Mensagem',
    'Status',
    'Aceita comunicações',
    'Observações internas',
  ];
  const lines = rows.map((r) =>
    [
      new Date(r.created_at).toLocaleString('pt-BR'),
      r.name,
      r.company,
      r.email,
      r.phone,
      r.service_name,
      r.message,
      QUOTE_STATUS_LABELS[r.status],
      r.consent_marketing ? 'Sim' : 'Não',
      r.internal_notes,
    ]
      .map(csvCell)
      .join(';'),
  );
  return '﻿' + [header.join(';'), ...lines].join('\r\n');
}

export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
