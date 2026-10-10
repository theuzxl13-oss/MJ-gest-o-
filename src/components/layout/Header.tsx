'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useSiteData } from '@/context/SiteDataProvider';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, isActive } from './nav';

export function Header() {
  const pathname = usePathname();
  const { settings } = useSiteData();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled ? 'border-forest/10 bg-offwhite/90 shadow-sm backdrop-blur-md' : 'border-transparent bg-offwhite',
      )}
    >
      <div className="container flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="MJ Gestão & Ambiental — página inicial">
          <Logo src={settings.logo_url} />
        </Link>

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative rounded-full px-3.5 py-2 text-[15px] transition-colors xl:px-4',
                      active ? 'text-forest' : 'text-graphite/70 hover:text-forest',
                    )}
                  >
                    {item.label}
                    {active && <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gold" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/contato" size="sm" className="hidden sm:inline-flex">
            Solicitar Consultoria
          </ButtonLink>
          <button
            type="button"
            className="rounded-full p-2.5 text-forest transition hover:bg-forest/5 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-mobile"
            aria-label="Menu móvel"
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-offwhite lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="container flex flex-col py-6">
              {NAV_ITEMS.map((item) => (
                <li key={item.href} className="border-b border-forest/10">
                  <Link
                    href={item.href}
                    className={cn(
                      'block py-4 font-serif text-2xl',
                      isActive(pathname, item.href) ? 'text-forest' : 'text-graphite/70',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-8">
                <ButtonLink href="/contato" size="lg" className="w-full">
                  Solicitar Consultoria
                </ButtonLink>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
