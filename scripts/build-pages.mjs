/**
 * Build estático (GitHub Pages / modo demonstrativo).
 * A exportação estática não suporta rotas de API, então a pasta src/app/api
 * é movida para fora do app durante o build e restaurada ao final.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';

const API = 'src/app/api';
const PARKED = '.api-fora-do-build';

if (existsSync(PARKED) && !existsSync(API)) renameSync(PARKED, API); // recupera de um build interrompido

renameSync(API, PARKED);
let status = 1;
try {
  const res = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: 'true', NEXT_PUBLIC_DEMO_MODE: 'true' },
  });
  status = res.status ?? 1;
} finally {
  renameSync(PARKED, API);
}
process.exit(status);
