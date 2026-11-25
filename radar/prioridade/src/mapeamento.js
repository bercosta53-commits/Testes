// @ts-check
/**
 * Mapeamento do payload real (snapshot) para a visão integrada.
 *
 * ESTADO ATUAL: o código e o contrato do app (VELORA_RADAR_ADENDO_CONTRATO_V2,
 * public.radar_snapshots) não estavam disponíveis nesta sessão. Por isso
 * nenhuma dimensão tem mapeamento documentado em produção: todas aparecem
 * como "Pendente de mapeamento" (ou "Indisponível", no caso do Clima) e
 * NÃO entram no cálculo (seção 5.3). Preencher cada entrada só depois de
 * conferir campo, escala e significado no contrato.
 *
 * Não assumir que o VSCS (score = v2.vscs) representa só o eixo Sinais e não
 * reaproveitar scores compostos em vários eixos sem verificar contribuições.
 */

/** @typedef {import('./tipos').Mapeamento} Mapeamento */
/** @typedef {import('./tipos').ChaveDimensao} ChaveDimensao */

/** O que resolveria cada lacuna (texto da investigação acionável). */
/** @type {Record<ChaveDimensao, string>} */
export const EVIDENCIA_NECESSARIA = {
  icp: 'Avaliação de aderência pela metodologia de ICP (porte, segmento, região e modelo de venda).',
  sinais: 'Varredura de sinais recente, com fonte e data (contratações, liderança, captação, expansão).',
  clima: 'Leitura do Clima do setor para a vertical da conta, com fonte e data.',
  oportunidadeDigital: 'Diagnóstico de aquisição digital: lacunas, impacto potencial e viabilidade.'
};

/**
 * Transformação linear documentada no briefing para escalas 0–100.
 * Use só quando o significado da escala original for compatível.
 * @param {number} v
 */
export const linear0a100 = (v) => 1 + (4 * v) / 100;

/**
 * Campos de conta lidos do snapshot. Listas = candidatos em ordem; o
 * adaptador usa o primeiro que existir e não cria nenhum campo.
 * `score`, `vscsStatus` e `acaoRecomendada` vêm do contrato atual; os demais
 * nomes estão A CONFIRMAR contra o contrato e só são lidos se existirem.
 */
export const CAMPOS_CONTA_PADRAO = Object.freeze({
  id: 'id',
  nome: 'nome',
  nomesAlternativos: ['razaoSocial', 'nomeFantasia', 'nomeAlternativo'],
  setor: ['setor', 'vertical', 'segmento'],
  uf: ['uf'],
  evidenciaPrincipal: [],
  score: 'score',
  vscsStatus: 'vscsStatus',
  tierIcp: ['tierIcp', 'v2.tierIcp'],
  acaoRecomendada: 'acaoRecomendada',
  contatoAtivavel: ['contatoAtivavel']
});

/** @type {Mapeamento} */
export const MAPEAMENTO_PRODUCAO = {
  rotulo: 'Produção',
  conta: { ...CAMPOS_CONTA_PADRAO, nomesAlternativos: [...CAMPOS_CONTA_PADRAO.nomesAlternativos], setor: [...CAMPOS_CONTA_PADRAO.setor], uf: [...CAMPOS_CONTA_PADRAO.uf], evidenciaPrincipal: [], tierIcp: [...CAMPOS_CONTA_PADRAO.tierIcp], contatoAtivavel: [...CAMPOS_CONTA_PADRAO.contatoAtivavel] },
  dimensoes: {
    icp: { mapeamento: 'pendente', campoOrigem: null, escalaOriginal: null, transformacao: null, fonteNoProjeto: 'Campo real a confirmar no contrato', evidenciaNecessaria: EVIDENCIA_NECESSARIA.icp },
    sinais: { mapeamento: 'pendente', campoOrigem: null, escalaOriginal: null, transformacao: null, fonteNoProjeto: 'Campo real a confirmar; VSCS não equivale só a Sinais', evidenciaNecessaria: EVIDENCIA_NECESSARIA.sinais },
    clima: { mapeamento: 'indisponivel', campoOrigem: null, escalaOriginal: null, transformacao: null, fonteNoProjeto: 'Clima do setor no backlog', evidenciaNecessaria: EVIDENCIA_NECESSARIA.clima, ocultaEmApresentacao: true },
    oportunidadeDigital: { mapeamento: 'pendente', campoOrigem: null, escalaOriginal: null, transformacao: null, fonteNoProjeto: 'Campo real a confirmar no contrato', evidenciaNecessaria: EVIDENCIA_NECESSARIA.oportunidadeDigital }
  }
};
