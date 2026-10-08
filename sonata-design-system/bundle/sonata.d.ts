/** Sonata Social — Ondas · tipos do motor de layout (documentação; window.Sonata). */

export type Modelo =
  | 'frase-foto' | 'frase' | 'educativo' | 'tecnologia' | 'data' | 'depoimento'
  | 'fono' | 'oferta' | 'carrossel-capa' | 'carrossel-passo' | 'carrossel-fim';
export type Formato = 'feed' | 'quadrado' | 'story';
/** Fundo do post. claro = branco · bruma = água-50 com halo · agua = água-400 · marinho = marinho-800 · mar = água-800 → marinho-900. */
export type Tema = 'claro' | 'bruma' | 'agua' | 'marinho' | 'mar';
export type Grafismo = 'arcos' | 'onda' | 'linha';

export interface Foto {
  /** URL ou chave registrada em Sonata.config({ fotos }). Sem src, aparece um espaço reservado com o assunto. */
  src?: string;
  /** Briefing da foto; também é o texto alternativo. */
  assunto?: string;
  /** object-position, ex.: '50% 20%'. Mantém rostos fora do véu. */
  foco?: string;
  /** Ponto da cabeça de quem escuta, em % do post: desenha ondas finas ao redor. */
  ondas?: string;
  /** PNG transparente de produto, flutuando sem caixa. */
  recorte?: boolean;
}

export interface Pessoa { nome: string; detalhe?: string; foto?: Foto; }

/** A ficha de um post. Texto entre *asteriscos* no titulo vira ênfase (Poppins 800 itálico). */
export interface PostProps {
  modelo: Modelo;
  formato?: Formato;
  tema?: Tema;
  rotulo?: string;
  titulo?: string;
  apoio?: string;
  corpo?: string;
  manuscrito?: string;
  legenda?: string;
  cta?: string;
  foto?: Foto;
  pessoa?: Pessoa;
  chips?: string[];
  preco?: { prefixo?: string; valor: string; sufixo?: string };
  selo?: { topo?: string; destaque: string; base?: string };
  passo?: string;
  pagina?: { atual: number; total: number };
  /** De onde sai o véu sobre a foto. */
  veu?: 'base' | 'esquerda' | 'topo';
  elementos?: Grafismo[];
  logo?: 'auto' | 'marinho' | 'agua' | 'branco' | false;
}

export interface Aviso { campo: string; aviso: string; }

export interface SonataAPI {
  versao: string;
  formatos: Record<Formato, { w: number; h: number; m: number; mt: number; mb: number }>;
  modelos: Record<Modelo, { nome: string; pilar: string; quando: string; temas: Tema[]; temaPadrao: Tema; obrigatorio: string[]; opcional: string[]; elementos: Grafismo[]; limites: Record<string, number> }>;
  vocabularioEvitado: string[];
  /** Registra logos e fotos por chave. */
  config(o: { logos?: Partial<Record<'marinho' | 'agua' | 'branco', string>>; fotos?: Record<string, string> }): unknown;
  /** Post em tamanho real (HTMLElement 1080 px de largura). */
  render(ficha: PostProps): HTMLElement;
  /** Renderiza dentro de `alvo`, reduzido para `largura`, e ajusta os títulos. */
  montar(ficha: PostProps, alvo?: HTMLElement, opcoes?: { largura?: number }): HTMLElement;
  /** Reduz títulos que não cabem (com o post no documento). */
  ajustar(post: HTMLElement): HTMLElement;
  /** Lista o que a ficha descumpre das regras (limites, vocabulário, ênfase, grafismos). */
  validar(ficha: PostProps): Aviso[];
  elementos: {
    arcos(o: { w: number; h: number; cx: number; cy: number; r?: number; passo?: number; espessura?: number; de?: number; ate?: number; cores?: string[]; opacidades?: number[] }): string;
    onda(o: { w: number; h: number; altura?: number; amplitude?: number; cores?: [string, string] }): string;
    veu(lado: 'base' | 'topo' | 'esquerda' | 'direita', tema: Tema, o?: { plato?: number; alcance?: number; forca?: number }): string;
    ondasNoFoco(F: { w: number; h: number }, ponto: string, cores?: string[]): string;
    linhaDeSom(o?: { largura?: number; altura?: number; cor?: string; corSuave?: string }): string;
  };
}

declare global { interface Window { Sonata: SonataAPI } }
