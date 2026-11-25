// @ts-check
/** Entrada de DESENVOLVIMENTO com fixture de teste (nunca usada em produção). */
import { iniciar } from '../src/ui/app.js';
import { mapeamentoFixture, snapshotFixture } from './fixtures.teste.js';

const p = new URLSearchParams(location.search);
const cenario = p.get('cenario') === 'backlog' ? 'backlog' : 'completo';
const raiz = /** @type {HTMLElement} */ (document.getElementById('radar'));

iniciar(raiz, {
  fixture: true,
  logo: raiz.dataset.logo,
  modoApresentacao: p.get('apresentacao') === '1',
  rotas: { clima: null, sinais: null },
  climaVinculadoAoSetor: false,
  carregar: async () => {
    if (p.get('estado') === 'erro') throw new Error('Falha simulada ao ler o snapshot (fixture).');
    if (p.get('estado') === 'carregando') await new Promise(() => {});
    return { snapshot: p.get('estado') === 'vazio' ? { atualizadoEm: null, contas: [] } : snapshotFixture(), mapeamento: mapeamentoFixture(cenario) };
  }
});
