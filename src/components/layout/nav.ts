export const NAV_ITEMS = [
  { href: '/', label: 'Início' },
  { href: '/sobre', label: 'Sobre Nós' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/portfolio', label: 'Portfólio' },
  { href: '/sustentabilidade', label: 'Sustentabilidade' },
  { href: '/contato', label: 'Contato' },
];

export function isActive(pathname: string, href: string) {
  const clean = pathname.replace(/\/$/, '') || '/';
  return href === '/' ? clean === '/' : clean === href || clean.startsWith(`${href}/`);
}
