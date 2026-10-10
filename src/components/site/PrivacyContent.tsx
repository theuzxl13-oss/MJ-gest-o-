'use client';

import Link from 'next/link';
import { useSiteData } from '@/context/SiteDataProvider';

export function PrivacyContent() {
  const { settings } = useSiteData();
  const contact = settings.privacy_contact || settings.email;
  return (
    <div className="prose-mj mx-auto max-w-3xl [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_li]:mb-2 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-graphite/80">
      <p>
        Esta Política de Privacidade descreve como a <strong>{settings.company_name}</strong> trata os dados pessoais
        coletados por meio deste site, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2>1. Dados coletados</h2>
      <p>Coletamos apenas os dados informados voluntariamente no formulário de contato/orçamento:</p>
      <ul>
        <li>Nome completo, empresa, e-mail e telefone;</li>
        <li>Serviço de interesse e descrição da necessidade;</li>
        <li>Registro dos consentimentos fornecidos e data/hora do envio.</li>
      </ul>
      <p>Para prevenir abusos e envios automatizados, podemos registrar um identificador técnico anonimizado (hash) da origem da requisição.</p>

      <h2>2. Finalidades e bases legais</h2>
      <ul>
        <li><strong>Responder à sua solicitação e elaborar propostas</strong> — com base no seu consentimento e em procedimentos preliminares relacionados a contrato (art. 7º, I e V, da LGPD);</li>
        <li><strong>Envio de comunicações sobre serviços e conteúdos</strong> — somente se você marcar o consentimento específico, que pode ser revogado a qualquer momento;</li>
        <li><strong>Segurança do site e prevenção a fraudes</strong> — legítimo interesse (art. 7º, IX).</li>
      </ul>

      <h2>3. Compartilhamento</h2>
      <p>
        Não vendemos nem compartilhamos seus dados para fins comerciais de terceiros. Os dados são armazenados em
        provedores de infraestrutura contratados (hospedagem e banco de dados), que atuam como operadores e seguem
        medidas de segurança adequadas.
      </p>

      <h2>4. Armazenamento e segurança</h2>
      <p>
        As solicitações são armazenadas em banco de dados com acesso restrito a administradores autenticados, com
        políticas de controle de acesso por registro e conexão criptografada. Os dados são mantidos pelo tempo
        necessário ao atendimento da finalidade ou ao cumprimento de obrigações legais.
      </p>

      <h2>5. Cookies e armazenamento local</h2>
      <p>
        Este site não utiliza cookies de rastreamento, publicidade ou análise de terceiros. Utilizamos apenas
        armazenamento local essencial para registrar a ciência deste aviso, manter a sessão da área administrativa e,
        na versão demonstrativa, guardar os dados de exemplo no seu navegador.
      </p>

      <h2>6. Seus direitos</h2>
      <p>Você pode, a qualquer momento, solicitar:</p>
      <ul>
        <li>Confirmação da existência de tratamento e acesso aos dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
        <li>Revogação do consentimento e eliminação dos dados tratados com base nele;</li>
        <li>Informações sobre compartilhamento.</li>
      </ul>

      <h2>7. Contato</h2>
      <p>
        Para exercer seus direitos ou esclarecer dúvidas sobre esta política,{' '}
        {contact ? (
          <>entre em contato pelo e-mail <a href={`mailto:${contact}`} className="font-medium text-brand underline">{contact}</a>.</>
        ) : (
          <>utilize o nosso <Link href="/contato" className="font-medium text-brand underline">formulário de contato</Link>.</>
        )}
      </p>

      <p className="mt-12 text-sm text-graphite/50">Última atualização: {new Date(settings.updated_at).toLocaleDateString('pt-BR')}.</p>
    </div>
  );
}
