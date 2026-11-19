// Carrega o Playwright: primeiro do projeto, depois da instalação global.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
export async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* tenta global */ }
  const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
  const req = createRequire(root + '/');
  return req('playwright');
}
