// @ts-check
/**
 * Entrada de PRODUÇÃO. Não carrega fixtures.
 *
 * O app hospedeiro injeta a fonte de dados antes deste módulo:
 *
 *   window.VELORA_RADAR = {
 *     carregar: async () => snapshot,     // leitura do snapshot atual (somente leitura)
 *     mapeamento?: Mapeamento,            // padrão: MAPEAMENTO_PRODUCAO (tudo pendente)
 *     modoApresentacao?: boolean,
 *     rotas?: { clima?: string, sinais?: string },
 *     climaVinculadoAoSetor?: boolean     // true só se a taxonomia de setor for a do Clima
 *   };
 */
import { MAPEAMENTO_PRODUCAO } from './mapeamento.js';
import { iniciar } from './ui/app.js';

/** @type {any} */
const cfg = /** @type {any} */ (window).VELORA_RADAR || {};
const raiz = /** @type {HTMLElement} */ (document.getElementById('radar'));

iniciar(raiz, {
  logo: raiz.dataset.logo,
  modoApresentacao: !!cfg.modoApresentacao,
  rotas: cfg.rotas,
  climaVinculadoAoSetor: !!cfg.climaVinculadoAoSetor,
  carregar: async () => {
    if (typeof cfg.carregar !== 'function') {
      throw new Error('Fonte de dados não configurada: defina window.VELORA_RADAR.carregar com a leitura do snapshot (ver README).');
    }
    const snapshot = await cfg.carregar();
    return { snapshot, mapeamento: cfg.mapeamento || MAPEAMENTO_PRODUCAO };
  }
});
