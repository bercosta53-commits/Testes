/* Vocabulário por tipo de instituição. O tipo muda o texto, nunca os números. */

export const PERFIS = {
  cooperativa: {
    inst: "a sua cooperativa", Inst: "A sua cooperativa", daInst: "da sua cooperativa", naInst: "na sua cooperativa",
    aInst: "à sua cooperativa", instCurta: "a cooperativa", campoNome: "Nome da cooperativa",
    exemploEmail: "ana@cooperativa.com.br", preposicao: "da",
    cliente: "cooperado", clientes: "cooperados", oCliente: "o cooperado", OsClientes: "Os cooperados",
    osClientes: "os cooperados", doCliente: "do cooperado", dosClientes: "dos cooperados",
  },
  banco: {
    inst: "o seu banco", Inst: "O seu banco", daInst: "do seu banco", naInst: "no seu banco",
    aInst: "ao seu banco", instCurta: "o banco", campoNome: "Nome do banco",
    exemploEmail: "ana@banco.com.br", preposicao: "do",
    cliente: "cliente", clientes: "clientes", oCliente: "o cliente", OsClientes: "Os clientes",
    osClientes: "os clientes", doCliente: "do cliente", dosClientes: "dos clientes",
  },
  financeira: {
    inst: "a sua financeira", Inst: "A sua financeira", daInst: "da sua financeira", naInst: "na sua financeira",
    aInst: "à sua financeira", instCurta: "a financeira", campoNome: "Nome da financeira ou fintech",
    exemploEmail: "ana@financeira.com.br", preposicao: "da",
    cliente: "cliente", clientes: "clientes", oCliente: "o cliente", OsClientes: "Os clientes",
    osClientes: "os clientes", doCliente: "do cliente", dosClientes: "dos clientes",
  },
  outro: {
    inst: "a sua instituição", Inst: "A sua instituição", daInst: "da sua instituição", naInst: "na sua instituição",
    aInst: "à sua instituição", instCurta: "a instituição", campoNome: "Nome da instituição",
    exemploEmail: "ana@instituicao.com.br", preposicao: "de",
    cliente: "cliente", clientes: "clientes", oCliente: "o cliente", OsClientes: "Os clientes",
    osClientes: "os clientes", doCliente: "do cliente", dosClientes: "dos clientes",
  },
};

export const perfil = (tipo) => PERFIS[tipo] || PERFIS.outro;

/* Redação das perguntas adaptada ao tipo. O título original continua em QUESTIONS
   e é o que o painel e o CSV usam. */
const TITULOS = {
  pessoas: (p) => `Quantas pessoas negociam dívidas ${p.naInst} hoje?`,
  contratos: (p) => `Quantos contratos estão em atraso na carteira ${p.daInst}?`,
  regua: (p) => `Como ${p.oCliente} em atraso recebe a proposta hoje?`,
  politica: (p) => `Como ${p.inst} define desconto, prazo e parcela?`,
  integracao: (p) => `Como a equipe consulta a dívida e as condições ${p.doCliente}?`,
  consentimento: (p) => `${p.OsClientes} autorizaram contato por WhatsApp?`,
};

const AJUDAS = {
  pessoas: {
    cooperativa: "Conte gerentes e demais colaboradores que negociam, mesmo sem dedicação exclusiva.",
    banco: "Conte a equipe de cobrança e os gerentes que negociam, mesmo sem dedicação exclusiva.",
  },
  ticket: { todos: "Considere o saldo em atraso por contrato." },
};

/* Por que cada pergunta é feita: mostra que cada resposta alimenta o resultado. */
const MOTIVOS = {
  pessoas: () => "Usamos para calcular a capacidade atual da equipe.",
  contratos: () => "Define o tamanho da fila a percorrer.",
  ticket: () => "Usamos para estimar o saldo em atraso.",
  ritmo: () => "Com ele, calculamos quanto tempo a equipe leva para percorrer a fila.",
  regua: () => "Mostra se o agente já parte de uma segmentação.",
  canal: () => "Mostra quanto da negociação já está no canal do agente.",
  politica: () => "O agente só negocia sozinho dentro de regras escritas.",
  integracao: () => "O agente precisa consultar saldo, atraso e condições durante a conversa.",
  consentimento: (p) => `Contato com registro protege ${p.instCurta} perante o CDC e a LGPD.`,
};

export const tituloPara = (q, tipo) => (TITULOS[q.id] && tipo ? TITULOS[q.id](perfil(tipo)) : q.titulo);
export const ajudaPara = (q, tipo) => AJUDAS[q.id]?.[tipo] ?? AJUDAS[q.id]?.todos ?? q.ajuda;
export const motivoPara = (q, tipo) => MOTIVOS[q.id]?.(perfil(tipo)) ?? null;

/* Minúsculas para o meio da frase, preservando siglas como LGPD. */
export const minusculas = (s) =>
  s.split(" ").map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase())).join(" ");
