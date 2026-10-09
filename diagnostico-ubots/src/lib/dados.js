const FASE_OPERACAO = "Sua operação";
const FASE_PRONTIDAO = "Sua prontidão";

// Textos que variam conforme o tipo de instituição.
export const termosPorTipo = {
  cooperativa: {
    inst: "a sua cooperativa",
    daInst: "da sua cooperativa",
    naInst: "na sua cooperativa",
    instCurta: "a cooperativa",
    campo: "Nome da cooperativa",
    cliente: "cooperado",
    clientes: "cooperados",
  },
  banco: {
    inst: "o seu banco",
    daInst: "do seu banco",
    naInst: "no seu banco",
    instCurta: "o banco",
    campo: "Nome do banco",
    cliente: "cliente",
    clientes: "clientes",
  },
  financeira: {
    inst: "a sua financeira",
    daInst: "da sua financeira",
    naInst: "na sua financeira",
    instCurta: "a financeira",
    campo: "Nome da financeira ou fintech",
    cliente: "cliente",
    clientes: "clientes",
  },
  outro: {
    inst: "a sua instituição",
    daInst: "da sua instituição",
    naInst: "na sua instituição",
    instCurta: "a instituição",
    campo: "Nome da instituição",
    cliente: "cliente",
    clientes: "clientes",
  },
};

const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const termos = (tipo) => termosPorTipo[tipo] || termosPorTipo.outro;

/** Substitui {chaves} (inst, daInst, Inst, cliente...) pelos termos do tipo. */
export const aplicarTermos = (texto, tipo) => {
  const t = termos(tipo);
  const mapa = { ...t, Inst: maiuscula(t.inst), Cliente: maiuscula(t.cliente) };
  return texto.replace(/\{(\w+)\}/g, (m, k) => mapa[k] ?? m);
};

export const perguntas = [
  {
    id: "tipo",
    fase: FASE_OPERACAO,
    titulo: "Que tipo de instituição você representa?",
    opcoes: [
      { label: "Cooperativa de crédito", value: "cooperativa" },
      { label: "Banco", value: "banco" },
      { label: "Financeira ou fintech", value: "financeira" },
      { label: "Outro tipo de instituição", value: "outro" },
    ],
  },
  {
    id: "pessoas",
    fase: FASE_OPERACAO,
    titulo: "Quantas pessoas negociam dívidas hoje?",
    tituloTipo: "Quantas pessoas negociam dívidas {naInst} hoje?",
    ajuda: "Conte todo mundo que negocia, mesmo sem dedicação exclusiva.",
    porque: "Usamos para calcular a capacidade atual da equipe.",
    opcoes: [
      { label: "1 a 5", value: 3 },
      { label: "6 a 10", value: 8 },
      { label: "11 a 20", value: 15 },
      { label: "21 a 50", value: 35 },
      { label: "51 a 100", value: 75 },
      { label: "Mais de 100", value: "mais-100", numero: 150 },
      { label: "Não sei", value: "nao-sei", numero: 15, naoSei: true },
    ],
  },
  {
    id: "contratos",
    fase: FASE_OPERACAO,
    titulo: "Quantos contratos estão em atraso na carteira?",
    tituloTipo: "Quantos contratos estão em atraso na carteira {daInst}?",
    porque: "Define o tamanho da fila a percorrer.",
    opcoes: [
      { label: "Até 1 mil", value: 500 },
      { label: "1 mil a 5 mil", value: 3000 },
      { label: "5 mil a 10 mil", value: 7500 },
      { label: "10 mil a 20 mil", value: 15000 },
      { label: "20 mil a 50 mil", value: 35000 },
      { label: "Mais de 50 mil", value: "mais-50mil", numero: 75000 },
      { label: "Não sei", value: "nao-sei", numero: 7500, naoSei: true },
    ],
  },
  {
    id: "ticket",
    fase: FASE_OPERACAO,
    titulo: "Qual o valor médio de uma dívida em atraso?",
    porque: "Usamos para estimar o saldo em atraso.",
    opcoes: [
      { label: "Até R$ 1 mil", value: 500 },
      { label: "R$ 1 mil a R$ 5 mil", value: 3000 },
      { label: "R$ 5 mil a R$ 10 mil", value: 7500 },
      { label: "R$ 10 mil a R$ 20 mil", value: 15000 },
      { label: "R$ 20 mil a R$ 50 mil", value: 35000 },
      { label: "Acima de R$ 50 mil", value: "acima-50mil", numero: 75000 },
      { label: "Não sei", value: "nao-sei", numero: 7500, naoSei: true },
    ],
  },
  {
    id: "ritmo",
    fase: FASE_OPERACAO,
    titulo: "Quantos acordos cada pessoa fecha por dia, em média?",
    porque: "Com esse número, calculamos o tempo para percorrer a fila.",
    opcoes: [
      { label: "Até 2", value: 1 },
      { label: "3 a 5", value: 4 },
      { label: "6 a 10", value: 8 },
      { label: "11 a 15", value: 13 },
      { label: "16 a 20", value: 18 },
    ],
  },
  {
    id: "regua",
    fase: FASE_PRONTIDAO,
    dim: "Régua de cobrança",
    titulo: "Como o cliente em atraso recebe a proposta hoje?",
    tituloTipo: "Como o {cliente} em atraso recebe a proposta hoje?",
    porque: "Mostra se o agente já parte de uma segmentação.",
    opcoes: [
      { label: "A mesma mensagem para todos", value: 0 },
      { label: "Mensagens por faixa de atraso", value: 1 },
      { label: "Propostas por perfil", value: 2 },
      { label: "Proposta calculada pela capacidade de pagamento de cada cliente", value: 3 },
    ],
    leituras: {
      0: "Mesma proposta para todos, sem olhar a capacidade de pagamento.",
      1: "Segmenta só por atraso, sem olhar a capacidade de pagamento.",
      2: "Propostas por perfil já podem orientar o agente.",
      3: "Proposta caso a caso: o agente leva esse ajuste para mais conversas.",
    },
  },
  {
    id: "canal",
    fase: FASE_PRONTIDAO,
    dim: "Canal de negociação",
    titulo: "Por onde acontece a maior parte das negociações?",
    porque: "Mostra quanto da negociação já está no canal do agente.",
    opcoes: [
      { label: "Ligação telefônica", value: 0 },
      { label: "SMS ou e-mail", value: 1 },
      { label: "WhatsApp com atendente", value: 2 },
      { label: "WhatsApp com alguma automação", value: 3 },
      { label: "Na agência, presencialmente", value: "agencia", pontos: 0 },
    ],
    leituras: {
      0: "Negociação por ligação, fora do canal do agente.",
      1: "SMS ou e-mail, fora do canal do agente.",
      2: "WhatsApp com atendente: o agente assume as etapas operacionais.",
      3: "WhatsApp com automação: o agente entra no canal que os {clientes} já usam.",
      agencia: "Negociação presencial, fora do canal do agente.",
    },
  },
  {
    id: "politica",
    fase: FASE_PRONTIDAO,
    dim: "Política de negociação",
    titulo: "Como são definidos desconto, prazo e parcela?",
    tituloTipo: "Como {inst} define desconto, prazo e parcela?",
    porque: "O agente só negocia sozinho dentro de regras escritas.",
    opcoes: [
      { label: "Cada caso depende de aprovação", value: 0 },
      { label: "Existem faixas, mas não estão escritas", value: 1 },
      { label: "Regras documentadas por faixa", value: 2 },
      { label: "Regras parametrizadas no sistema", value: 3 },
    ],
    leituras: {
      0: "Cada caso depende de aprovação: o agente não fecha acordos sozinho.",
      1: "Faixas não escritas: o agente ainda não tem alçadas para seguir.",
      2: "Regras documentadas: base para as alçadas do agente.",
      3: "Regras parametrizadas: o agente propõe dentro das alçadas.",
    },
  },
  {
    id: "integracao",
    fase: FASE_PRONTIDAO,
    dim: "Acesso aos dados",
    titulo: "Como a equipe consulta a dívida e as condições do cliente?",
    tituloTipo: "Como a equipe consulta a dívida e as condições do {cliente}?",
    porque: "O agente precisa consultar saldo, atraso e condições durante a conversa.",
    opcoes: [
      { label: "Planilhas e relatórios exportados", value: 0 },
      { label: "Sistema central, sem API disponível", value: 1 },
      { label: "Sistema com API que a TI pode liberar", value: 2 },
      { label: "API já usada em outros canais digitais", value: 3 },
      { label: "Outro", value: "outro", pontos: 1, comTexto: "Qual?" },
    ],
    leituras: {
      0: "Dados em planilhas, sem consulta direta para o agente.",
      1: "Sistema sem API: falta um caminho de consulta para o agente.",
      2: "API que a TI pode liberar: uma integração simples resolve.",
      3: "API já usada em canais digitais: a integração segue o mesmo caminho.",
      outro: "Outro caminho de consulta: vale confirmar com a TI se o agente pode usá-lo.",
    },
  },
  {
    id: "consentimento",
    fase: FASE_PRONTIDAO,
    dim: "Consentimento e LGPD",
    titulo: "Os clientes autorizaram contato por WhatsApp?",
    tituloTipo: "Os {clientes} autorizaram contato por WhatsApp?",
    porque: "Mensagens iniciadas pela instituição no WhatsApp exigem autorização do cliente, e o registro ajuda a demonstrar conformidade com a LGPD.",
    opcoes: [
      { label: "Não sabemos", value: 0 },
      { label: "Só uma parte da base", value: 1 },
      { label: "A maioria, sem registro", value: "sem-registro", pontos: 2 },
      { label: "A maioria, com registro", value: 3 },
    ],
    leituras: {
      0: "Não se sabe quem autorizou o contato por WhatsApp.",
      1: "Só parte da base autorizou: o agente começa por esse grupo.",
      "sem-registro": "A maioria autorizou, mas sem registro: falta formalizar para o agente iniciar o contato.",
      3: "Base autorizada, com registro: o agente pode iniciar o contato.",
    },
  },
];

const opcaoDe = (idPergunta, valor) =>
  perguntas.find((p) => p.id === idPergunta)?.opcoes.find((o) => o.value === valor);

/** Pontos de uma resposta de prontidão (a opção pode valer diferente do seu identificador). */
export const pontosDaResposta = (idPergunta, valor) => {
  const o = opcaoDe(idPergunta, valor);
  return o ? (o.pontos ?? o.value) : typeof valor === "number" ? valor : 0;
};

/** Número usado no cálculo (faixas abertas e "Não sei" têm um valor de referência). */
export const numeroDaResposta = (idPergunta, valor) => {
  const o = opcaoDe(idPergunta, valor);
  return o?.numero ?? (typeof valor === "number" ? valor : 0);
};

export const respondeuNaoSei = (respostas) =>
  perguntas.some((p) => opcaoDe(p.id, respostas[p.id])?.naoSei);

/** Perguntas que compõem a pontuação de prontidão. */
export const dimensoes = perguntas.filter((p) => p.dim);

export const pontosMaxDaPergunta = (p) => Math.max(...p.opcoes.map((o) => o.pontos ?? o.value));

export const pontosMax = dimensoes.reduce((soma, d) => soma + pontosMaxDaPergunta(d), 0);

/** Área de atuação do contato (campo do formulário). */
export const areas = [
  "Recuperação de crédito/cobrança",
  "Relacionamento/agências",
  "TI",
  "Marketing",
  "Comercial/negócios",
  "Diretoria",
];

/** Níveis de prontidão e multiplicador de capacidade (faixa conservadora). */
export const niveis = [
  { max: 5, nome: "Preparar a base", mult: [2, 3] },
  { max: 10, nome: "Pronta para piloto", mult: [3, 5] },
  { max: pontosMax, nome: "Pronta para escalar", mult: [4, 7] },
];

export const passosPorDimensao = {
  regua: {
    texto: "Segmente a carteira pela capacidade de pagamento, para propor parcelas que cabem no orçamento.",
    pronto: "cada faixa de atraso tem 2 ou 3 propostas por perfil de renda ou de risco.",
  },
  canal: {
    texto: "Leve a negociação para o WhatsApp, onde o {cliente} responde no tempo dele.",
    pronto: "há um número oficial e um modelo de mensagem aprovado para abrir a conversa.",
  },
  politica: {
    texto: "Escreva as alçadas: até onde vão desconto, prazo e carência sem aprovação.",
    pronto: "uma tabela por faixa de atraso, aprovada pela diretoria, diz o que o agente pode oferecer.",
  },
  integracao: {
    texto: "Liste com a TI os dados que o agente vai consultar (saldo, atraso, condições) e por onde eles saem.",
    pronto: "a TI indica um caminho de consulta, mesmo que seja um arquivo atualizado todo dia.",
  },
  consentimento: {
    texto: "Revise quem autorizou contato por WhatsApp e registre a autorização.",
    pronto: "você sabe quantos {clientes} em atraso autorizaram, e esse grupo abre o piloto.",
  },
};

export const passosGerais = [
  {
    rotulo: "Piloto",
    texto: "Comece com uma campanha com data para acabar, como a Crediauc fez no Desenrola.",
    pronto: "carteira, prazo de 5 a 15 dias e meta de valor renegociado estão definidos.",
  },
  {
    rotulo: "Transbordo",
    texto: "Defina quais exceções vão para um analista, sempre com o histórico da conversa.",
    pronto: "cada exceção tem um responsável e um prazo de resposta.",
  },
  {
    rotulo: "Acompanhamento",
    texto: "Acompanhe a reincidência dos acordos: parcela que cabe no orçamento é cumprida até o fim.",
    pronto: "um relatório semanal mostra acordos fechados, valor renegociado e parcelas pagas.",
  },
];

export const passoIntegracao = {
  rotulo: "Integração",
  texto: "Conecte o agente por API, para consultar a dívida e registrar o acordo sem etapa manual.",
  pronto: "o acordo fechado na conversa aparece no sistema sem ninguém digitar.",
};

// Desempate da dimensão prioritária quando há pontuação igual.
export const ordemPrioridade = ["politica", "consentimento", "integracao", "regua", "canal"];

export const nomePorDimensao = {
  regua: "a régua de cobrança",
  canal: "o canal de negociação",
  politica: "a política de negociação",
  integracao: "o acesso aos dados",
  consentimento: "a autorização de contato",
};

export const cenariosDemo = [
  {
    nome: "Cooperativa média",
    respostas: {
      tipo: "cooperativa", pessoas: 35, contratos: 15000, ticket: 7500, ritmo: 1,
      regua: 1, canal: 2, politica: 1, integracao: 2, consentimento: 1,
    },
  },
  {
    nome: "Banco regional maduro",
    respostas: {
      tipo: "banco", pessoas: 75, contratos: 35000, ticket: 15000, ritmo: 4,
      regua: 2, canal: 3, politica: 3, integracao: 3, consentimento: 3,
    },
  },
  {
    nome: "Cooperativa no início",
    respostas: {
      tipo: "cooperativa", pessoas: 8, contratos: 3000, ticket: 3000, ritmo: 1,
      regua: 0, canal: 0, politica: 0, integracao: 0, consentimento: 0,
    },
  },
];

const formBase = {
  nome: "Ana Souza",
  email: "ana@cooperativa-exemplo.com.br",
  fone: "(51) 99999-0000",
  instituicao: "Cooperativa Exemplo",
  area: "Recuperação de crédito/cobrança",
  aceite: true,
};
const formsPorTipo = {
  banco: { ...formBase, email: "ana@banco-exemplo.com.br", instituicao: "Banco Exemplo" },
  financeira: { ...formBase, email: "ana@financeira-exemplo.com.br", instituicao: "Financeira Exemplo" },
};
export const formularioDemo = (tipo) => formsPorTipo[tipo] || formBase;
