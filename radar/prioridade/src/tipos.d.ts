/**
 * Modelo de apresentação da visão integrada (briefing v2, seção 10).
 * Não é um contrato de banco: é o que o adaptador entrega aos componentes.
 */

export type ChaveDimensao = 'icp' | 'sinais' | 'clima' | 'oportunidadeDigital';
export type Classe = 'A1' | 'A2' | 'B1' | 'B2' | 'C';

export type OrigemNota = {
  campoOrigem: string | null;        // caminho real no payload
  escalaOriginal: string | null;     // ex.: "0-100", documentada
  transformacao: string | null;      // ex.: "1 + 4 * v / 100"
  mapeamento: 'documentado' | 'pendente' | 'indisponivel';
};

export type MotivoSemNota =
  | 'nao_coletado'
  | 'fora_do_intervalo'
  | 'metodo_nao_mapeado'
  | 'oculto_modo_apresentacao'
  | null;

export type Fonte = { url: string; titulo: string | null };

export type DimensaoIntegrada = {
  nota: number | null;               // 1 a 5; nunca NaN, Infinity ou zero
  resumo: string | null;
  status: 'avaliada' | 'sem_avaliacao' | 'desatualizada';
  motivoSemNota: MotivoSemNota;
  semAchados: boolean;               // busca concluída sem achados relevantes
  entraNoCalculo: boolean;           // false se desatualizada sem política, inválida ou oculta
  motivoExclusao: string | null;
  dataReferencia: string | null;     // ISO 8601, somente quando comprovável
  fontes: Fonte[];                   // apenas http(s)
  origem: OrigemNota;
  pendenciasQualidade: string[];     // ex.: "valor 112 fora do intervalo 0-100"
};

export type CriterioClasse = {
  chave: 'nota' | ChaveDimensao;
  rotulo: string;                    // "ICP ≥ 4"
  atendido: boolean;
  valor: number;
  minimo: number;
};

export type SituacaoSweetSpot =
  | 'a1'
  | 'candidata'
  | 'fora_por_criterio'
  | 'fora_por_falta_de_dados'
  | 'fora_por_classe';

export type Investigacao = {
  dimensao: ChaveDimensao;
  motivo: string | null;
  evidenciaNecessaria: string | null;
  notaMinimaParaA1: number | null;   // nunca expõe o valor do teste de viabilidade
  podeChegarA2: boolean;
};

/** Campos de conta que já existem no payload (nada é criado). */
export type DadosConta = {
  nome: string;
  nomesAlternativos: string[];
  setor: string | null;
  uf: string | null;
  evidenciaPrincipal: string | null;
  /** Campos oficiais preservados como vieram (contrato atual). */
  oficial: {
    score: number | null;            // = v2.vscs
    vscsStatus: string | null;
    tierIcp: string | null;
    acaoRecomendada: unknown;
    contatoAtivavel: boolean | null;
  };
};

export type VisaoIntegradaConta = {
  contaId: string;                   // ID opaco existente
  conta: DadosConta;
  dimensoes: Record<ChaveDimensao, DimensaoIntegrada>;
  cobertura: number;                 // dimensões com nota válida E entraNoCalculo
  notaIntegrada: number | null;
  classeIntegrada: Classe | null;
  versaoModelo: 'integrado-experimental-1';
  motivosClassificacao: string[];
  criteriosA1: CriterioClasse[] | null;
  criteriosA1Atendidos: number | null;
  dimensoesFaltantes: ChaveDimensao[];
  situacaoSweetSpot: SituacaoSweetSpot;
  /** Critério conhecido que impede A1 (só em 'fora_por_criterio'). */
  bloqueioA1: string[];
  investigacao: Investigacao | null;
  dataUltimaAvaliacao: string | null;
};

/** Mapeamento de uma dimensão: como ler o payload real. */
export type MapeamentoDimensao = {
  mapeamento: 'documentado' | 'pendente' | 'indisponivel';
  campoOrigem: string | null;
  escalaOriginal: string | null;
  transformacao: string | null;
  /** Limites da escala original para validar o dado. */
  min?: number;
  max?: number;
  /** Função pura que leva o valor original para 1..5. */
  converter?: (v: number) => number;
  campoResumo?: string | null;
  campoData?: string | null;
  campoFontes?: string | null;
  campoSemAchados?: string | null;
  campoDesatualizada?: string | null;
  /**
   * Política de validade existente. null = não definida: dado desatualizado
   * é exibido mas excluído do cálculo, com a pendência explicada.
   */
  desatualizadaEntraNoCalculo?: boolean | null;
  /** Oculta no modo apresentação (conta como faltante nesse modo). */
  ocultaEmApresentacao?: boolean;
  /** O que resolveria a lacuna (texto de investigação). */
  evidenciaNecessaria?: string | null;
  /** Descrição curta da fonte para a tabela "Origem das notas". */
  fonteNoProjeto?: string | null;
  /** true quando a linha descreve fixture de teste, não produção. */
  fixture?: boolean;
};

export type MapeamentoConta = {
  id: string;
  nome: string;
  nomesAlternativos: string[];
  setor: string[];
  uf: string[];
  evidenciaPrincipal: string[];
  score: string;
  vscsStatus: string;
  tierIcp: string[];
  acaoRecomendada: string;
  contatoAtivavel: string[];
};

export type Mapeamento = {
  rotulo: string;
  conta: MapeamentoConta;
  dimensoes: Record<ChaveDimensao, MapeamentoDimensao>;
};

export type Snapshot = {
  atualizadoEm?: string | null;
  contas: Array<Record<string, unknown>>;
};

export type OpcoesAdaptador = {
  modoApresentacao?: boolean;
};

export type ResultadoAdaptador = {
  contas: VisaoIntegradaConta[];
  atualizadoEm: string | null;       // última carga de SINAIS concluída
  camposDisponiveis: { setor: boolean; uf: boolean; contatoAtivavel: boolean; acaoRecomendada: boolean; evidencia: boolean };
  descartadas: Array<{ indice: number; motivo: string }>;
};
