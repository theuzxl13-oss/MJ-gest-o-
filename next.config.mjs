/**
 * Dois alvos de build a partir do mesmo código:
 *  - Padrão (Vercel): rotas de API ativas, Supabase, cabeçalhos de segurança.
 *  - Exportação estática (GitHub Pages): NEXT_PUBLIC_STATIC_EXPORT=true.
 *    As rotas de API são retiradas temporariamente por scripts/build-pages.mjs.
 */
const isExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

function supabaseHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname;
  } catch {
    return null;
  }
}

const host = supabaseHost();

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: isExport ? 'export' : undefined,
  basePath: basePath || undefined,
  trailingSlash: isExport,
  images: {
    unoptimized: isExport,
    remotePatterns: host
      ? [{ protocol: 'https', hostname: host, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  ...(isExport
    ? {}
    : {
        async headers() {
          return [
            { source: '/(.*)', headers: securityHeaders },
            { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
          ];
        },
      }),
};

export default nextConfig;
