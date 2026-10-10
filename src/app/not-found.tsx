import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 text-center">
      <Logo />
      <p className="eyebrow mt-12">Erro 404</p>
      <h1 className="mt-4 text-4xl md:text-5xl">Página não encontrada</h1>
      <p className="mt-4 max-w-md text-graphite/70">O endereço acessado não existe ou foi alterado.</p>
      <Link href="/" className="mt-8 rounded-full bg-forest px-6 py-3 font-medium text-white hover:bg-brand">
        Voltar para o início
      </Link>
    </main>
  );
}
