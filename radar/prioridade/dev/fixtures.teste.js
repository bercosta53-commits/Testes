// @ts-check
/**
 * FIXTURE DE TESTE — NÃO É PRODUÇÃO.
 *
 * Contas, setores, notas, evidências e fontes abaixo são FICTÍCIOS, gerados
 * de forma determinística só para desenvolvimento, testes e capturas de
 * tela (briefing v2, seção 9). Fontes apontam para example.com de propósito.
 * Este arquivo não é carregado pela página de produção (index.html).
 */
import { CAMPOS_CONTA_PADRAO, EVIDENCIA_NECESSARIA, linear0a100 } from '../src/mapeamento.js';

/** @typedef {import('../src/tipos').Mapeamento} Mapeamento */
/** @typedef {import('../src/tipos').MapeamentoDimensao} MapeamentoDimensao */

/** @param {'icp' | 'sinais' | 'clima' | 'digital'} k @param {string} nome @returns {MapeamentoDimensao} */
function dimFixture(k, nome) {
  return {
    mapeamento: 'documentado', fixture: true,
    campoOrigem: 'fixture.' + k + '.valor', escalaOriginal: '0-100', transformacao: '1 + 4 × v / 100',
    min: 0, max: 100, converter: linear0a100,
    campoResumo: 'fixture.' + k + '.resumo', campoData: 'fixture.' + k + '.data', campoFontes: 'fixture.' + k + '.fontes',
    campoSemAchados: 'fixture.' + k + '.semAchados', campoDesatualizada: 'fixture.' + k + '.desatualizada',
    desatualizadaEntraNoCalculo: null,
    fonteNoProjeto: 'Fixture de teste · ' + nome,
    evidenciaNecessaria: EVIDENCIA_NECESSARIA[k === 'digital' ? 'oportunidadeDigital' : k]
  };
}

/**
 * @param {'completo' | 'backlog'} cenario
 * @returns {Mapeamento}
 */
export function mapeamentoFixture(cenario) {
  return {
    rotulo: 'Fixture de teste (' + cenario + ')',
    conta: { ...CAMPOS_CONTA_PADRAO, nomesAlternativos: ['razaoSocial'], setor: ['setor'], uf: ['uf'], evidenciaPrincipal: ['evidenciaPrincipal'], tierIcp: ['tierIcp'], contatoAtivavel: ['contatoAtivavel'] },
    dimensoes: {
      icp: dimFixture('icp', 'ICP'),
      sinais: dimFixture('sinais', 'Sinais'),
      clima: cenario === 'backlog'
        ? { mapeamento: 'indisponivel', campoOrigem: null, escalaOriginal: null, transformacao: null, fonteNoProjeto: 'Clima do setor no backlog', evidenciaNecessaria: EVIDENCIA_NECESSARIA.clima, ocultaEmApresentacao: true }
        : { ...dimFixture('clima', 'Clima'), ocultaEmApresentacao: true },
      oportunidadeDigital: dimFixture('digital', 'Oportunidade digital')
    }
  };
}

/* ---------- Gerador determinístico ---------- */

function prng(semente) {
  let s = semente >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const SETORES = [
  ['Software B2B', ['Software', 'Sistemas', 'Cloud', 'ERP']],
  ['Fintech', ['Pagamentos', 'Crédito', 'Bank', 'Seguros Digitais']],
  ['Healthtech', ['Saúde', 'Clínicas', 'Diagnósticos', 'Care']],
  ['Logística', ['Logística', 'Frotas', 'Cargas', 'Entregas']],
  ['Indústria', ['Indústria', 'Automação', 'Máquinas', 'Metais']],
  ['Educação', ['Educação', 'Escolas', 'Cursos', 'Ensino']],
  ['Varejo digital', ['Store', 'Marketplace', 'Moda', 'Casa']],
  ['Serviços de TI', ['Integrações', 'Dados', 'Consultoria', 'Tech']]
];
const RAIZES = ['Tramo', 'Selva', 'Nuvia', 'Quadra', 'Fenda', 'Arvo', 'Lumen', 'Brisa', 'Ápice', 'Estrada', 'Nexo', 'Coral', 'Vértice', 'Órbita', 'Pampa', 'Ipê', 'Duna', 'Rumo', 'Prisma', 'Sólida', 'Faro', 'Ícaro', 'Lince', 'Maré', 'Norte', 'Onda', 'Pétala', 'Quartzo', 'Raiz', 'Siena', 'Tiê', 'Urca', 'Vela', 'Xisto', 'Zênite', 'Âmbar', 'Bússola', 'Cálamo', 'Delta', 'Éter', 'Fúcsia', 'Gávea', 'Hélio', 'Índigo', 'Jacarandá', 'Kairós', 'Lótus', 'Mirante', 'Nimbo', 'Oásis'];
const UFS = ['SP', 'SP', 'SP', 'PR', 'SC', 'RS', 'MG', 'RJ'];

const RESUMO = {
  icp: ['Porte e modelo de venda fora do perfil.', 'Segmento aderente, porte abaixo do ideal.', 'Aderência parcial: segmento certo, região secundária.', 'Porte, segmento e venda consultiva aderentes.', 'Encaixe completo em porte, segmento, região e ciclo de venda.'],
  sinais: ['Congelamento de vagas comerciais anunciado.', 'Uma vaga antiga de SDR, sem outros fatos.', 'Nova vaga de marketing nos últimos 30 dias.', 'Vagas de vendas e nova liderança comercial recentes.', 'Captação, nova liderança e vagas comerciais no mesmo trimestre.'],
  clima: ['Retração forte do setor documentada no trimestre.', 'Setor com demanda em queda.', 'Setor estável, sem tendência clara.', 'Setor em expansão de investimento.', 'Ciclo forte de investimento e contratação no setor.'],
  digital: ['Aquisição digital madura; pouco espaço para atuar.', 'Lacunas pequenas em mídia paga.', 'Site sem conversão clara e mídia sem rastreio consistente.', 'Funil digital incompleto, com orçamento e time para evoluir.', 'Grande espaço em aquisição e conversão, com capacidade de investir.']
};
const EVIDENCIA = [
  'Abriu 6 vagas de vendas em 21 dias.', 'Nova diretora comercial há 3 semanas.', 'Captou Série A no último trimestre.', 'Anunciou expansão para o Sul.',
  'Lançou nova linha de produto.', 'Trocou de CRM nos últimos 60 dias.', 'Visitou a página de preços 4 vezes.', 'Contratou a primeira head de marketing.'
];

/** @param {number} v */
const nivel = (v) => Math.min(4, Math.max(0, Math.floor(v / 20.0001)));

/**
 * @param {() => number} r @param {'icp' | 'sinais' | 'clima' | 'digital'} k @param {number} valor @param {string} slug
 */
function dim(r, k, valor, slug) {
  const dia = 1 + Math.floor(r() * 24);
  const mes = r() < 0.7 ? '11' : '10';
  return {
    valor,
    resumo: RESUMO[k][nivel(valor)],
    data: '2026-' + mes + '-' + String(dia).padStart(2, '0'),
    fontes: [{ url: 'https://example.com/fixture/' + slug + '/' + k, titulo: 'Fonte fictícia (fixture)' }]
  };
}

/**
 * @param {number} i
 * @param {() => number} r
 * @param {Set<string>} usados
 */
function gerarConta(i, r, usados) {
  const [setor, sufixos] = SETORES[Math.floor(r() * SETORES.length)];
  const raiz = RAIZES[i % RAIZES.length];
  let j = Math.floor(r() * 4), nome = raiz + ' ' + sufixos[j % 4];
  for (let t = 1; usados.has(nome) && t < 4; t++) nome = raiz + ' ' + sufixos[(j + t) % 4];
  if (usados.has(nome)) nome += ' Brasil';
  usados.add(nome);
  const slug = 'fx-' + String(i).padStart(3, '0');
  const q = 0.35 + r() * 0.65; // qualidade latente
  const v = (/** @type {number} */ ruido) => Math.max(0, Math.min(100, Math.round((q * 100 + (r() - 0.5) * ruido) * 2) / 2));
  const fixture = {
    icp: dim(r, 'icp', v(40), slug),
    sinais: dim(r, 'sinais', v(70), slug),
    clima: dim(r, 'clima', Math.max(30, v(50)), slug),
    digital: dim(r, 'digital', v(50), slug)
  };
  // Lacunas e condições de dado, em proporções plausíveis.
  if (r() < 0.06) /** @type {any} */ (fixture).icp = {};
  if (r() < 0.10) /** @type {any} */ (fixture).sinais = r() < 0.4 ? { semAchados: true, data: '2026-11-18' } : {};
  if (r() < 0.12) /** @type {any} */ (fixture).clima = {};
  if (r() < 0.16) /** @type {any} */ (fixture).digital = {};
  if (r() < 0.04 && fixture.clima.valor != null) /** @type {any} */ (fixture.clima).desatualizada = true;
  return {
    id: slug,
    nome,
    razaoSocial: nome + ' Ltda.',
    setor,
    uf: UFS[Math.floor(r() * UFS.length)],
    score: Math.round(30 + q * 60 + (r() - 0.5) * 20),
    vscsStatus: 'calculado',
    tierIcp: q > 0.75 ? 'A' : q > 0.55 ? 'B' : 'C',
    contatoAtivavel: r() < 0.6,
    acaoRecomendada: r() < 0.45 ? 'Abordagem consultiva com diagnóstico de funil (ação fictícia de fixture).' : null,
    evidenciaPrincipal: fixture.sinais.valor != null ? EVIDENCIA[Math.floor(r() * EVIDENCIA.length)] : null,
    fixture
  };
}

/** Casos de borda deliberados (briefing v2, seções 4.1, 5.2, 8.5 e 12). */
function casosDeBorda() {
  const d = (/** @type {number} */ valor, /** @type {any} */ extra = {}) => ({ valor, resumo: null, data: '2026-11-20', fontes: [{ url: 'https://example.com/fixture/borda', titulo: 'Fonte fictícia (fixture)' }], ...extra });
  const base = (/** @type {string} */ id, /** @type {string} */ nome, /** @type {string | null} */ setor, /** @type {any} */ fx, /** @type {any} */ extra = {}) => ({
    id, nome, razaoSocial: nome + ' S.A.', setor, uf: 'SP', score: 70, vscsStatus: 'calculado', tierIcp: 'A', contatoAtivavel: true,
    acaoRecomendada: null, evidenciaPrincipal: 'Caso de borda da fixture.', fixture: fx, ...extra
  });
  return [
    // Exemplo da seção 5.2: B1 e não A2 (ICP 3,5; Sinais 4,5; Clima 4,0; Digital 4,2 → 4,05).
    base('fx-b01', 'Cálamo Software', 'Software B2B', { icp: d(62.5), sinais: d(87.5), clima: d(75), digital: d(80) }),
    // Fronteira em ponto flutuante: soma exata 18 → A1 (float daria 4,4999…).
    base('fx-b02', 'Delta Pagamentos', 'Fintech', { icp: d(82), sinais: d(95), clima: d(76), digital: d(97) }),
    // Trava: ICP < 3 com o resto no máximo → C.
    base('fx-b03', 'Éter Marketplace', 'Varejo digital', { icp: d(45), sinais: d(100), clima: d(100), digital: d(100) }),
    // Candidata: Clima faltando, precisa de ≥ 3,2 para A1.
    base('fx-b04', 'Hélio Automação', 'Indústria', { icp: d(100), sinais: d(95), clima: {}, digital: d(100) }),
    // 1 faltando, mas ICP 3,5 já impede A1 → fora por critério.
    base('fx-b05', 'Gávea Frotas', 'Logística', { icp: d(62.5), sinais: d(100), clima: {}, digital: d(100) }),
    // Dado fora do intervalo (112) → pendência de qualidade e sem avaliação.
    base('fx-b06', 'Índigo Diagnósticos', 'Healthtech', { icp: d(112), sinais: d(90), clima: d(80), digital: d(85) }),
    // Clima desatualizado sem política → exibido, fora do cálculo.
    base('fx-b07', 'Jacarandá Escolas', 'Educação', { icp: d(90), sinais: d(85), clima: d(80, { desatualizada: true, data: '2026-08-02' }), digital: d(85) }),
    // Busca de sinais concluída sem achados → nunca vira nota 1.
    base('fx-b08', 'Kairós Dados', 'Serviços de TI', { icp: d(95), sinais: { semAchados: true, data: '2026-11-18' }, clima: d(70), digital: d(90) }),
    // Conta sem setor (aparece em "Sem setor", nunca descartada).
    base('fx-b09', 'Lótus Holding', null, { icp: d(80), sinais: d(70), clima: d(60), digital: d(75) }),
    // Nome com acento e pontuação, para a busca.
    base('fx-b10', 'Ótica São João & Cia.', 'Varejo digital', { icp: d(77.5), sinais: d(82.5), clima: d(70), digital: d(90) }, { razaoSocial: 'Comercial Otica Sao Joao Ltda.' }),
    // Duas dimensões faltando → sem métrica.
    base('fx-b11', 'Mirante Crédito', 'Fintech', { icp: d(95), sinais: {}, clima: {}, digital: d(95) })
  ];
}

/**
 * Snapshot fictício no formato que o adaptador lê.
 * @param {number} [quantidade]
 */
export function snapshotFixture(quantidade = 130) {
  const r = prng(20261125);
  const contas = [...casosDeBorda()];
  const usados = new Set(contas.map((c) => c.nome));
  for (let i = 0; i < quantidade; i++) contas.push(gerarConta(i, r, usados));
  return { atualizadoEm: '2026-11-25T07:40:00-03:00', contas };
}
