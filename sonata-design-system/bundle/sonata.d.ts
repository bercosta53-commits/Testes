/** Sonata Social — Ondas · tipos do motor de layout v3 (documentação; window.Sonata). */

export type Modelo =
  | 'destaque' | 'bento' | 'lista' | 'retrato' | 'frase' | 'depoimento' | 'oferta'
  | 'tecnologia' | 'data' | 'equipe' | 'carrossel-capa' | 'carrossel-passo' | 'carrossel-fim';
export type Formato = 'feed' | 'quadrado' | 'story';
/** Fundo do post ou de um cartão. claro = branco · nevoa = marinho-100 · agua = água-400 · marinho = marinho-800. */
export type Tema = 'claro' | 'nevoa' | 'agua' | 'marinho';
export type Icone =
  | 'som' | 'ondas' | 'calendario' | 'telefone' | 'local' | 'coracao' | 'seta' | 'mais'
  | 'check' | 'bateria' | 'bluetooth' | 'conversa' | 'pessoas' | 'escudo' | 'cartao' | 'ajuste';

export interface Foto {
  /** URL ou chave registrada em Sonata.config({ fotos }). Sem src, aparece um espaço reservado com o assunto. */
  src?: string;
  /** Briefing da foto; também é o texto alternativo. */
  assunto?: string;
  /** Onde está o rosto na imagem (% da largura e da altura da foto), ex.: '48% 40%'. O motor enquadra e, se preciso, aproxima até 1,35×. */
  rosto?: string;
  /** Alternativa a rosto: object-position aplicado direto. */
  foco?: string;
  /** PNG transparente de produto (tecnologia). */
  recorte?: boolean;
}

export interface Pessoa { nome: string; detalhe?: string; foto?: Foto; }
export interface Item { titulo: string; texto?: string; icone?: Icone; }
export type Chip = string | { texto: string; icone?: Icone };

/** A ficha de um post. Texto entre *asteriscos* no titulo vira ênfase (mesmo peso, cor enfase). */
export interface PostProps {
  modelo: Modelo;
  formato?: Formato;
  tema?: Tema;
  /** Força o tema do cartão principal (normalmente escolhido pelo contraste com o fundo). */
  cartao?: Tema;
  /** bento: a (manchete + mosaico), b (cartão + foto alta + foto), c (foto larga + cartão largo). */
  layout?: 'a' | 'b' | 'c';
  rotulo?: string;
  titulo?: string;
  apoio?: string;
  corpo?: string;
  manuscrito?: string;
  legenda?: string;
  cta?: string;
  /** Texto da aba vertical (destaque, capa). Até 3 palavras. */
  aba?: string;
  /** Ícone do selo (destaque, bento c, depoimento) ou do cartão de chamada (bento a). false tira o selo. */
  icone?: Icone | false;
  /** frase: elemento de interface sob o texto. */
  elemento?: 'volume' | 'linha' | 'nenhum';
  foto?: Foto;
  fotos?: Foto[];
  pessoa?: Pessoa;
  pessoas?: Pessoa[];
  itens?: Item[];
  chips?: Chip[];
  preco?: { prefixo?: string; valor: string; sufixo?: string };
  selo?: { topo?: string; destaque: string; base?: string };
  passo?: string;
  pagina?: { atual: number; total: number };
  /** false tira a barra de assinatura (padrão no miolo do carrossel). */
  barra?: boolean;
}

export interface Aviso { campo: string; aviso: string; }

export interface SonataAPI {
  versao: string;
  formatos: Record<Formato, { w: number; h: number; m: number; mt: number; mb: number }>;
  modelos: Record<Modelo, { nome: string; pilar: string; quando: string; temas: Tema[]; temaPadrao: Tema; obrigatorio: string[]; opcional: string[]; limites: Record<string, number>; teto: number }>;
  icones: Icone[];
  vocabularioEvitado: string[];
  /** Registra logos, fotos por chave e os contatos da barra de assinatura. */
  config(o: {
    logos?: Partial<Record<'marinho' | 'agua' | 'branco', string>>;
    fotos?: Record<string, string>;
    contato?: Partial<{ endereco: string; cidade: string; telefone: string; instagram: string }>;
  }): unknown;
  /** Post em tamanho real (HTMLElement 1080 px de largura). */
  render(ficha: PostProps): HTMLElement;
  /** Renderiza dentro de `alvo`, reduzido para `largura`, e ajusta títulos e rostos. */
  montar(ficha: PostProps, alvo?: HTMLElement, opcoes?: { largura?: number }): HTMLElement;
  /** Reduz títulos que não cabem no cartão e enquadra os rostos (com o post no documento). */
  ajustar(post: HTMLElement): HTMLElement;
  /** Lista o que a ficha descumpre das regras (limites, vocabulário, ênfase, ícones, formato). */
  validar(ficha: PostProps): Aviso[];
  elementos: {
    icone(nome: Icone, tamanho?: number): string;
    botao(nome: Icone, tipo?: 'cheio' | 'contorno', tamanho?: number): string;
    cartao(tema: Tema, conteudo: string, estilo?: string, classe?: string): string;
    modulo(foto: Foto, estilo?: string, extra?: string): string;
    barra(ficha: { tema: Tema; barra?: boolean }, formato: { m: number; mb: number }): string;
    chips(lista: Chip[]): string;
    cta(texto: string, icone?: Icone): string;
    linhaCta(texto: string, icone?: Icone): string;
    linhasDeOnda(formato: { w: number; h: number }, o?: { base?: number[]; opacidade?: number }): string;
    controleVolume(nivel?: number): string;
    linhaDeSom(o?: { largura?: number; altura?: number; cor?: string; corSuave?: string }): string;
    arcos(o: { w: number; h: number; cx: number; cy: number; r?: number; passo?: number; espessura?: number; de?: number; ate?: number; cores?: string[]; opacidades?: number[] }): string;
    onda(o: { w: number; h: number; altura?: number; amplitude?: number; cores?: [string, string] }): string;
    foto(f: Foto, estilo?: string, attrs?: string): string;
    recorte(f: Foto, estilo: string): string;
    logo(variante: 'marinho' | 'agua' | 'branco', estilo?: string): string;
    dots(p: { atual: number; total: number }): string;
    aspas(tamanho?: number): string;
    marca(): string;
    enquadrarRosto(post: HTMLElement): void;
  };
}

declare global { interface Window { Sonata: SonataAPI } }
