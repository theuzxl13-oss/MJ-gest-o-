'use client';

import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { resolveImage } from '@/lib/config';
import type { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function ArticleCard({ article, onOpen }: { article: Article; onOpen: () => void }) {
  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <button type="button" onClick={onOpen} className="block aspect-[16/9] overflow-hidden bg-forest-50" aria-label={`Ler: ${article.title}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resolveImage(article.image_url, '/images/articles/gestao-ambiental.svg')} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </button>
      <div className="flex flex-1 flex-col p-6">
        {article.published_at && <p className="text-xs font-medium uppercase tracking-wider text-gold-dark">{formatDate(article.published_at, { month: 'long', year: 'numeric' })}</p>}
        <h3 className="mt-2 text-xl leading-snug">{article.title}</h3>
        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-graphite/70">{article.excerpt}</p>
        <button type="button" onClick={onOpen} className="mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-forest hover:text-brand">
          Ler conteúdo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

export function ArticleModal({ article, onClose }: { article: Article | null; onClose: () => void }) {
  return (
    <Modal open={!!article} onClose={onClose} title={article?.title ?? ''}>
      {article && (
        <article>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveImage(article.image_url, '/images/articles/gestao-ambiental.svg')} alt="" className="mb-8 aspect-[16/7] w-full rounded-2xl object-cover" />
          <p className="mb-6 font-serif text-xl italic leading-relaxed text-forest">{article.excerpt}</p>
          <div className="prose-mj">
            {article.content.split(/\n{2,}/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-offwhite p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-forest">Quer aplicar estas práticas na sua empresa?</p>
            <ButtonLink href="/contato" size="sm">Fale com a MJ</ButtonLink>
          </div>
        </article>
      )}
    </Modal>
  );
}
