# Construir o diagnóstico direto no Lovable

Alternativa ao script incorporável (`docs/INTEGRACAO.md`): o Lovable cria o diagnóstico como parte do projeto da LP
(React + Vite + Tailwind). A parte que **não pode variar** (perguntas, pontuação, textos, cálculo, envio ao HubSpot)
está pronta nos arquivos da seção "Código para colar". O Lovable só monta a interface em volta.

**Ordem:** Prompt 1 (código da lógica) → Prompt 2 (telas) → Prompt 3 (HubSpot). Mande um de cada vez e confira o
resultado antes de seguir. Não cole tudo numa mensagem só.

**Como conferir que a conta ficou igual (caso de teste):** Cooperativa de crédito; 1 a 5 pessoas; até 1 mil contratos;
até R$ 1 mil de dívida média; até 2 acordos por dia; e a **primeira opção** de cada pergunta de prontidão
(mesma mensagem para todos; ligação telefônica; cada caso depende de aprovação; planilhas e relatórios; não sabemos).
O resultado tem que ser exatamente:

| Item | Valor esperado |
| --- | --- |
| Nível | Preparar a base (0 de 15 pontos) |
| Resumo | Antes do agente, vale organizar a política de negociação e a autorização de contato. |
| Renegociações por mês | 63 hoje, 130 a 190 com IA |
| Prazo para negociar a carteira | 8 meses hoje, 3 a 4 meses com IA |
| Valor renegociado no 1º mês | R$ 32 mil hoje, R$ 63 a 95 mil com IA |
| Diferença estimada | +R$ 32 a 63 mil |
| Carteira em atraso | 500 contratos, cerca de R$ 250 mil |
| Dimensão com "Prioridade" | Política de negociação |

Se qualquer número divergir, o Lovable alterou a lógica: peça para restaurar `calculo.ts`, `dados.ts` e `formatar.ts`
exatamente como estão aqui. Compare também com `/diagnostico?demo=1` do protótipo.

---

## Prompt 1: lógica (cole no chat do Lovable)

> Vamos adicionar ao projeto um diagnóstico de recuperação de crédito. Primeiro só a lógica, sem telas.
> Crie os arquivos abaixo em `src/lib/diagnostico/`, **com exatamente este conteúdo e estas regras**, convertendo para
> TypeScript apenas com tipos (sem mudar nomes, textos, números ou fórmulas). Arquivos: `config.ts`, `dados.ts`,
> `formatar.ts`, `calculo.ts`, `eventos.ts`, `entrega.ts`. Os imports entre eles seguem os nomes de arquivo
> (`./dados`, `./formatar`...). Não altere nenhum texto em português. Não crie telas ainda. Ao terminar, me diga se
> o projeto compila sem erros.

### Código para colar

### `config.ts`

```js
// Configuração. Valores vêm de variáveis de ambiente (VITE_*) e podem ser
// sobrescritos em tempo de execução com `configurar()` (usado pelo bundle incorporável).
const env = import.meta.env || {};

export const config = {
  ctaUrl: "https://ubots.com.br/",
  // Materiais do CTA secundário do resultado.
  playbookUrl: env.VITE_PLAYBOOK_URL || "https://ubots.com.br/",
  listaInteresseUrl: env.VITE_LISTA_INTERESSE_URL || "https://ubots.com.br/",
  diasUteisMes: 21,
  hubspot: {
    portalId: env.VITE_HUBSPOT_PORTAL_ID || "",
    formGuid: env.VITE_HUBSPOT_FORM_GUID || "",
    // Opcional: form separado para o pedido de conversa (padrão: o mesmo form).
    formGuidInteresse: env.VITE_HUBSPOT_FORM_GUID_INTERESSE || "",
    // Nomes internos das propriedades do HubSpot. Todas precisam existir como campos do form.
    // Detalhes em docs/INTEGRACAO.md.
    campos: {
      nome: "firstname",
      email: "email",
      whatsapp: "phone",
      instituicao: "company",
      area: "diag_area_atuacao",
      tipo: "diag_tipo_instituicao",
      nivel: "diag_nivel_prontidao",
      pontos: "diag_pontos",
      capacidadeAtual: "diag_renegociacoes_mes_hoje",
      capacidadeIaMin: "diag_renegociacoes_mes_ia_min",
      capacidadeIaMax: "diag_renegociacoes_mes_ia_max",
      valorExtraMin: "diag_potencial_adicional_min",
      valorExtraMax: "diag_potencial_adicional_max",
      saldoAtraso: "diag_saldo_atraso",
      pontoCritico: "diag_ponto_critico",
      aproximada: "diag_estimativa_aproximada",
      respostas: "diag_respostas",
      origem: "diag_origem",
      pediuConversa: "diag_pediu_conversa",
      pedidoEm: "diag_pedido_conversa_em",
    },
    textoConsentimento: "Autorizo a Ubots a entrar em contato sobre este diagnóstico.",
  },
};

export const hubspotConfigurado = () => !!(config.hubspot.portalId && config.hubspot.formGuid);

export const cores = {
  bg: "#FFFBEF",
  card: "#FFFFFF",
  ink: "#141414",
  muted: "#6B6558",
  line: "#ECE4CF",
  yellow: "#FFC800",
  yellowSoft: "#FFF4C7",
  error: "#B42318",
};
```

### `dados.ts`

```js
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
```

### `formatar.ts`

```js
const NBSP = " ";
const SEMANAS_POR_MES = 52 / 12;

export const numero = (n) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Math.round(n));

export const faixaNumero = (a, b, fmt = numero) =>
  fmt(a) === fmt(b) ? fmt(a) : `${fmt(a)} a ${fmt(b)}`;

/** Arredonda para 2 algarismos significativos. */
const arredondar = (n) => {
  if (!(n > 0)) return 0;
  const passo = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / passo) * passo;
};

export const numeroAprox = (n) => numero(arredondar(n));

const abreviar = (n) => {
  const v = arredondar(n);
  if (v < 1e4) return [numero(v), ""];
  if (v < 1e6) return [numero(v / 1e3), " mil"];
  return [numero(v / 1e6), " mi"];
};

export const moeda = (n) => {
  const [v, sufixo] = abreviar(n);
  return `R$${NBSP}${v}${sufixo.replace(" ", NBSP)}`;
};

export const faixaMoeda = ([a, b]) => {
  const [na, sa] = abreviar(a);
  const [nb, sb] = abreviar(b);
  if (na === nb && sa === sb) return moeda(a);
  if (sa === sb) return `R$${NBSP}${na} a ${nb}${sb.replace(" ", NBSP)}`;
  return `${moeda(a)} a ${moeda(b)}`;
};

const duracao = (meses) => {
  if (meses > 60) return "mais de 5 anos";
  if (Math.round(meses) >= 24) return `${Math.round(meses / 12)} anos`;
  if (meses >= 2) return `${Math.round(meses)} meses`;
  const semanas = Math.round(meses * SEMANAS_POR_MES);
  if (semanas < 1) return "menos de 1 semana";
  return `${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
};

export const faixaDuracao = ([a, b]) => {
  const [da, db] = [duracao(a), duracao(b)];
  if (da === db) return da;
  if (db === "mais de 5 anos") return `${da} ou mais`;
  if (da === "menos de 1 semana") return `até ${db}`;
  const unidade = (s) => s.replace(/^\d+ /, "").replace(/^semana$/, "semanas");
  return unidade(da) === unidade(db) ? `${da.split(" ")[0]} a ${db}` : `${da} a ${db}`;
};

export { duracao };

export const dataHora = (iso) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return "";
  }
};

export const formatarFone = (digitos = "") =>
  digitos.length === 11
    ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
    : digitos.length === 10
      ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
      : digitos;

/** Máscara do campo de WhatsApp: (51) 99999-9999. */
export const mascaraFone = (valor) => {
  let d = valor.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const decimal = (n) =>
  n == null ? "" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
```

### `calculo.ts`

```js
import { config } from "./config";
import {
  aplicarTermos,
  dimensoes,
  niveis,
  nomePorDimensao,
  numeroDaResposta,
  ordemPrioridade,
  passoIntegracao,
  passosGerais,
  passosPorDimensao,
  perguntas,
  pontosDaResposta,
  pontosMax,
  pontosMaxDaPergunta,
  respondeuNaoSei,
} from "./dados";
import {
  duracao,
  faixaDuracao,
  faixaMoeda,
  faixaNumero,
  moeda,
  numero,
  numeroAprox,
} from "./formatar";

const CAMPOS_NUMERICOS = ["pessoas", "contratos", "ticket", "ritmo"];

/** Rótulo da opção escolhida em uma pergunta (ou o número formatado). */
export const rotuloResposta = (idPergunta, valor) =>
  perguntas.find((p) => p.id === idPergunta)?.opcoes.find((o) => o.value === valor)?.label ??
  (typeof valor === "number" ? numero(valor) : "");

/** Valores numéricos das 4 perguntas de operação (resolve faixas abertas e "Não sei"). */
export const numerica = (r) => ({
  pessoas: numeroDaResposta("pessoas", r.pessoas),
  contratos: numeroDaResposta("contratos", r.contratos),
  ticket: numeroDaResposta("ticket", r.ticket),
  ritmo: numeroDaResposta("ritmo", r.ritmo),
});

/** Cálculo numérico: pontuação, nível e capacidade com/sem IA. null se faltar resposta. */
export function calcular(resp) {
  if ([...CAMPOS_NUMERICOS, ...dimensoes.map((d) => d.id)].some((id) => resp[id] === undefined)) {
    return null;
  }
  const r = numerica(resp);
  const pontos = dimensoes.reduce((s, d) => s + pontosDaResposta(d.id, resp[d.id]), 0);
  const nivel = niveis.find((n) => pontos <= n.max) || niveis[niveis.length - 1];
  const atual = r.pessoas * r.ritmo * config.diasUteisMes;
  const ia = [atual * nivel.mult[0], atual * nivel.mult[1]];
  const limitar = (n) => Math.min(n, r.contratos);
  const valorHoje = limitar(atual) * r.ticket;
  const valorIA = [limitar(ia[0]) * r.ticket, limitar(ia[1]) * r.ticket];
  return {
    pontos,
    nivel,
    atual,
    ia,
    filaCoberta: atual >= r.contratos,
    mesesHoje: r.contratos / atual,
    mesesIA: [r.contratos / ia[1], r.contratos / ia[0]],
    valorHoje,
    valorIA,
    extra: [valorIA[0] - valorHoje, valorIA[1] - valorHoje],
  };
}

function juntarComE(itens) {
  return itens.map((i) => nomePorDimensao[i.id]).join(", ").replace(/, ([^,]*)$/, " e $1");
}

/** Análise completa exibida no resultado (e reconstruída no painel). */
export function analisar(r) {
  const res = calcular(r);
  if (!res) return null;
  const nivel = res.nivel.nome;

  const num = numerica(r);
  const dims = dimensoes.map((d) => ({
    id: d.id,
    nome: d.dim,
    pontos: pontosDaResposta(d.id, r[d.id]),
    max: pontosMaxDaPergunta(d),
    resposta: rotuloResposta(d.id, r[d.id]),
    leitura: aplicarTermos(d.leituras[r[d.id]] ?? "", r.tipo),
  }));

  const fracas = dims
    .filter((d) => d.pontos < 2)
    .sort((a, b) => a.pontos - b.pontos || ordemPrioridade.indexOf(a.id) - ordemPrioridade.indexOf(b.id));
  const critico = fracas[0] || null;
  // Sem política, autorização e acesso aos dados (pontos 0 ou 1) o agente não negocia.
  const bloqueios = fracas.filter((d) => ["politica", "consentimento", "integracao"].includes(d.id));

  const resumo = aplicarTermos(
    {
      "Preparar a base": `Antes do agente, vale organizar ${juntarComE(fracas.slice(0, 2))}.`,
      "Pronta para piloto": bloqueios.length
        ? `{Inst} pode testar um agente numa campanha depois de resolver ${juntarComE(bloqueios)}.`
        : "{Inst} já tem o essencial para testar um agente em uma campanha.",
      "Pronta para escalar": critico
        ? `{Inst} tem quase toda a base pronta. Antes da operação contínua, resolva ${nomePorDimensao[critico.id]}.`
        : "Regras, canal e dados {daInst} estão maduros. O agente pode entrar na operação contínua.",
    }[nivel],
    r.tipo,
  );

  const gerais = nivel === "Pronta para escalar" ? [passoIntegracao, ...passosGerais.slice(1)] : passosGerais;
  const passos = [
    ...fracas.map((d) => ({
      rotulo: d.nome,
      texto: aplicarTermos(passosPorDimensao[d.id].texto, r.tipo),
      pronto: aplicarTermos(passosPorDimensao[d.id].pronto, r.tipo),
    })),
    ...gerais,
  ].slice(0, 3);

  const cta = {
    "Preparar a base": {
      titulo: "Quer organizar esses pontos com a Ubots?",
      texto: "O time da Ubots pode revisar o diagnóstico com você e indicar por onde começar antes de um piloto.",
    },
    "Pronta para piloto": {
      titulo: aplicarTermos("Quer desenhar o piloto {daInst}?", r.tipo),
      texto: "O time da Ubots pode revisar o diagnóstico com você e definir carteira, prazo e indicadores para um piloto de 5 a 15 dias.",
    },
    "Pronta para escalar": {
      titulo: "Quer levar o agente para a operação contínua?",
      texto: "O time da Ubots pode avaliar com você a integração e os critérios de transbordo para a equipe.",
    },
  }[nivel];

  return {
    res,
    nivel,
    pontos: res.pontos,
    pontosMax,
    resumo,
    dims,
    critico,
    passos,
    cta,
    capacidadeHoje: numeroAprox(res.atual),
    capacidadeIA: faixaNumero(res.ia[0], res.ia[1], numeroAprox),
    tempoHoje: duracao(res.mesesHoje),
    tempoIA: faixaDuracao(res.mesesIA),
    valorHoje: moeda(res.valorHoje),
    valorIA: faixaMoeda(res.valorIA),
    extra: res.extra[1] > 0 ? faixaMoeda(res.extra) : null,
    saldo: moeda(num.contratos * num.ticket),
    contratos: numeroAprox(num.contratos),
    aproximada: respondeuNaoSei(r),
  };
}

/** Frase de capacidade usada na transição entre as partes do quiz. */
export const capacidadeMensal = (r) => {
  const n = numerica(r);
  return numeroAprox(n.pessoas * n.ritmo * config.diasUteisMes);
};

// ---- Validação do formulário de captura ----
export const formularioVazio = { nome: "", email: "", fone: "", instituicao: "", area: "", aceite: false };

export function validarFormulario(form, campoInstituicao) {
  const erros = {};
  if (form.nome.trim().length < 2) erros.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    erros.email = "Informe um e-mail válido, como nome@instituicao.com.br.";
  }
  const digitos = form.fone.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11) erros.fone = "Informe o WhatsApp com DDD.";
  if (form.instituicao.trim().length < 2) {
    erros.instituicao = `Informe o ${campoInstituicao.charAt(0).toLowerCase()}${campoInstituicao.slice(1)}.`;
  }
  if (!form.area) erros.area = "Selecione a sua área de atuação.";
  if (!form.aceite) erros.aceite = "Marque a autorização para ver o diagnóstico.";
  return erros;
}

export const lerUtms = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const utms = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
      if (params.get(k)) utms[k] = params.get(k);
    });
    return utms;
  } catch {
    return {};
  }
};
```

### `eventos.ts`

```js
// Avisa a página hospedeira (LP da Ubots) sobre o que acontece no diagnóstico.
// Quem integra pode ouvir `ubots-diagnostico` no window ou ler o dataLayer (GTM).
export function emitir(nome, detalhe = {}) {
  try {
    window.dispatchEvent(new CustomEvent("ubots-diagnostico", { detail: { evento: nome, ...detalhe } }));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: `diagnostico_${nome}`, ...detalhe });
  } catch {
    /* sem window ou dataLayer: ignora */
  }
}
```

### `entrega.ts`

```js
import { numerica, rotuloResposta } from "./calculo";
import { config, hubspotConfigurado } from "./config";
import { perguntas } from "./dados";
import { emitir } from "./eventos";

const CHAVE_PENDENTES = "ubots_diag_pendentes";
const TIMEOUT_MS = 8000;

/** Dados do lead + resultado, no formato interno (usado no painel e convertido para o HubSpot). */
export function montarPayload({ contato, respostas, analise, origem }) {
  const res = analise.res;
  const n = numerica(respostas);
  return {
    lead: contato,
    respostas,
    resultado: {
      nivel: res.nivel.nome,
      pontos: res.pontos,
      pontos_max: analise.pontosMax,
      capacidade_atual_mes: Math.round(res.atual),
      capacidade_ia_mes: res.ia.map(Math.round),
      valor_adicional_mes: res.extra.map(Math.round),
      saldo_atraso: n.contratos * n.ticket,
      ponto_critico: analise.critico?.nome ?? null,
      estimativa_aproximada: analise.aproximada,
    },
    origem,
    enviado_em: new Date().toISOString(),
  };
}

const resumoRespostas = (respostas) =>
  perguntas
    .map((p) => {
      const rotulo = rotuloResposta(p.id, respostas[p.id]);
      const extra = p.id === "integracao" && respostas.integracao_outro ? ` (${respostas.integracao_outro})` : "";
      return `${p.titulo} ${rotulo}${extra}`;
    })
    .join("\n");

const lerCookie = (nome) => {
  try {
    return document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`))?.[1] || undefined;
  } catch {
    return undefined;
  }
};

/** Converte o payload nos campos do formulário do HubSpot. */
export function camposHubspot(payload, extras = {}) {
  const c = config.hubspot.campos;
  const { lead, respostas, resultado: r } = payload;
  const valores = {
    [c.nome]: lead.nome,
    [c.email]: lead.email,
    [c.whatsapp]: lead.whatsapp,
    [c.instituicao]: lead.instituicao,
    [c.area]: lead.area,
    [c.tipo]: rotuloResposta("tipo", respostas.tipo),
    [c.nivel]: r.nivel,
    [c.pontos]: `${r.pontos} de ${r.pontos_max}`,
    [c.capacidadeAtual]: r.capacidade_atual_mes,
    [c.capacidadeIaMin]: r.capacidade_ia_mes[0],
    [c.capacidadeIaMax]: r.capacidade_ia_mes[1],
    [c.valorExtraMin]: r.valor_adicional_mes[0],
    [c.valorExtraMax]: r.valor_adicional_mes[1],
    [c.saldoAtraso]: r.saldo_atraso,
    [c.pontoCritico]: r.ponto_critico ?? "Nenhum",
    [c.aproximada]: r.estimativa_aproximada ? "Sim" : "Não",
    [c.respostas]: resumoRespostas(respostas),
    [c.origem]: payload.origem?.utm_content ?? "Acesso direto",
    ...extras,
  };
  return Object.entries(valores)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([name, value]) => ({ objectTypeId: "0-1", name, value: String(value) }));
}

/** Envia ao formulário do HubSpot (API pública de submissão, sem token). */
async function enviarAoHubspot(payload, { guid, extras } = {}) {
  const { portalId, formGuid, textoConsentimento } = config.hubspot;
  const corpo = {
    submittedAt: Date.now(),
    fields: camposHubspot(payload, extras),
    context: {
      hutk: lerCookie("hubspotutk"),
      pageUri: payload.origem?.pagina || window.location.href,
      pageName: document.title,
    },
    legalConsentOptions: { consent: { consentToProcess: true, text: textoConsentimento } },
  };
  const resposta = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${guid || formGuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout?.(TIMEOUT_MS),
    },
  );
  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(`HubSpot respondeu ${resposta.status}: ${detalhe.slice(0, 300)}`);
  }
}

// ---- Fila de reenvio: se o envio falhar, o lead não se perde ----
const lerPendentes = () => {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PENDENTES)) || [];
  } catch {
    return [];
  }
};
const gravarPendentes = (lista) => {
  try {
    localStorage.setItem(CHAVE_PENDENTES, JSON.stringify(lista));
  } catch {
    /* sem armazenamento: sem fila */
  }
};

/** Tenta reenviar o que ficou pendente (chamado ao abrir o diagnóstico). */
export async function reenviarPendentes() {
  if (!hubspotConfigurado()) return;
  const restantes = [];
  for (const item of lerPendentes()) {
    try {
      await enviarAoHubspot(item.payload, { guid: item.guid, extras: item.extras });
    } catch {
      restantes.push(item);
    }
  }
  gravarPendentes(restantes);
}

async function entregar(payload, { fila = true, ...opcoes } = {}) {
  if (!hubspotConfigurado()) {
    console.info("[Diagnóstico] HubSpot não configurado (modo de teste), nada foi enviado:", payload);
    return true;
  }
  try {
    await enviarAoHubspot(payload, opcoes);
    return true;
  } catch (e) {
    console.error("[Diagnóstico] falha ao enviar ao HubSpot, guardado para reenvio:", e);
    if (fila) gravarPendentes([...lerPendentes(), { payload, ...opcoes }]);
    return false;
  }
}

/** Entrega o lead. O resultado aparece para a pessoa mesmo que o envio falhe (fica na fila). */
export async function entregarLead(payload, utmContent) {
  const ok = await entregar(payload);
  emitir("lead_enviado", { nivel: payload.resultado.nivel, enviado: ok, origem: payload.origem?.utm_content ?? null });
  return { id: null, payload, enviado: ok };
}

/** Registra o pedido de conversa, associado ao mesmo contato (e-mail) e ao resultado. Retorna true se registrou. */
export async function registrarPedidoConversa(lead) {
  const c = config.hubspot.campos;
  const em = new Date().toISOString();
  const ok = hubspotConfigurado()
    ? await entregar(lead.payload, {
        fila: false, // se falhar, a pessoa vê o erro e tenta de novo
        guid: config.hubspot.formGuidInteresse || undefined,
        extras: { [c.pediuConversa]: "Sim", [c.pedidoEm]: em },
      })
    : (console.info("[Diagnóstico] pedido de conversa (modo de teste):", lead.payload.lead.email), true);
  if (ok) emitir("pedido_conversa", { nivel: lead.payload.resultado.nivel });
  return ok;
}
```


---

## Prompt 2: telas

> Usando a lógica de `src/lib/diagnostico/`, crie a página `/diagnostico` com o fluxo abaixo. Use o visual do site
> da Ubots (ver "Visual"). Não reescreva textos: use os de `dados.ts` e os desta lista.
>
> **Visual:** fundo creme `#FFFBEF`, texto `#141414`, texto secundário `#6B6558`, linhas `#ECE4CF`, amarelo da marca
> `#FFC800` (suave `#FFF4C7`), erro `#B42318`. Fonte Sora (400, 600, 700). Cartões brancos com borda `#ECE4CF` e
> raio 16px. Botão principal: pílula amarela, texto preto, semibold, altura mínima 52px. Títulos com
> `text-wrap: balance`. Respeite `prefers-reduced-motion`.
>
> **Estado:** etapa (`intro` | `quiz` | `captura` | `resultado`), índice da pergunta, `respostas` (objeto), formulário, erros.
>
> **1. Intro.** Duas colunas no desktop (uma no celular).
> Título: "Descubra o que falta para usar IA na recuperação de crédito da sua instituição".
> Texto: "Responda 10 perguntas sobre a sua operação de recuperação de crédito. Ao final, você informa seus dados e recebe o diagnóstico completo na hora."
> Cartão com a pergunta 1 ("Para começar, que tipo de instituição você representa?") e as 4 opções como botões.
> Rodapé do cartão: "10 perguntas · cerca de 2 minutos · sem custo".
> Abaixo do título, separado por uma linha: "No Sicoob Crediauc, depois de 75 dias de campanha, um agente de IA passou a apoiar um colaborador nas negociações mais complexas. Em 5 dias, foram R$ 23,4 mil renegociados em 6 contratos."
>
> **2. Perguntas** (índices 1 a 9 de `perguntas`). Coluna centralizada de 576px.
> Topo: nome da fase (`pergunta.fase`) à esquerda e "N de 10" à direita. Barra de progresso com 10 segmentos
> (concluídos amarelo, atual preto, futuros `#ECE4CF`), com 8px de espaço extra antes do primeiro segmento da fase
> "Sua prontidão".
> Título da pergunta: use `tituloTipo` quando existir, trocando as chaves com `aplicarTermos(texto, respostas.tipo)`; senão `titulo`.
> Mostre `ajuda` e `porque` (este com ícone de informação) abaixo do título, também com `aplicarTermos`.
> Opções como botões largos (altura mínima 56px) com um círculo à direita que vira preto com check amarelo quando selecionada.
> Ao escolher uma opção, espere 280 ms e avance. Exceção: opção com `comTexto` ("Outro") não avança; mostre um campo de
> texto com o rótulo dessa opção e um botão "Continuar", que grava `respostas.integracao_outro` (máx. 120 caracteres).
> Botão "Voltar" (texto, com seta) abaixo: na primeira pergunta volta à intro.
> Quando a pergunta atual for a primeira de prontidão (`dimensoes[0]`), mostre antes do título o aviso: **"Parte 1 concluída."**
> seguido de `aplicarTermos("A equipe {daInst} consegue abordar cerca de " + capacidadeMensal(respostas) + " contratos por mês. Agora, a prontidão para um agente de IA.", respostas.tipo)`.
> A cada troca de pergunta: rolar suavemente ao topo da seção e mover o foco para o título (h1 com `tabIndex=-1`).
> Após a última pergunta, vá para `captura`.
>
> **3. Captura.** Título: `aplicarTermos("O diagnóstico {daInst} está pronto.", tipo)`; subtítulo "Informe seus dados para ver, nesta tela:" e 3 itens com check amarelo:
> "O potencial com um agente de IA: renegociações por mês e tempo para percorrer a carteira",
> "A prontidão nas 5 dimensões, com a leitura de cada resposta" e `aplicarTermos("Por onde começar {naInst}", tipo)`.
> Formulário em cartão: Nome, E-mail de trabalho, WhatsApp (use `mascaraFone`), campo da instituição com o rótulo `termos(tipo).campo`,
> lista "Cargo/área" (`areas`, opção inicial "Selecione"), caixa "Autorizo a Ubots a entrar em contato sobre este diagnóstico."
> Botão "Ver diagnóstico completo" (com seta; durante o envio, "Preparando o diagnóstico" com ícone girando).
> Linha final com ícone de escudo: "Seus dados serão utilizados pelo time da Ubots para dar continuidade ao diagnóstico."
> Valide com `validarFormulario(form, termos(tipo).campo)`; mostre cada erro abaixo do campo e foque o primeiro campo com erro.
> Link "Revisar respostas" volta à última pergunta.
> Ao enviar: monte o payload com `montarPayload`, chame `entregarLead` e vá para `resultado` **mesmo se o envio falhar**.
>
> **4. Resultado** (use `analisar(respostas)`; `a` = resultado).
> - Cabeçalho: "Diagnóstico · {nome da instituição}", título `a.nivel`, texto `a.resumo`. À direita, 3 níveis (`niveis`) como trilha: o atual amarelo, os anteriores pretos, os seguintes cinza.
> - Cartão "O potencial com um agente de IA": "Carteira em atraso: {a.contratos} contratos, cerca de {a.saldo}." Tabela Hoje x "Com agente de IA" (coluna amarela suave) com as linhas: "Renegociações por mês" (`capacidadeHoje` / `capacidadeIA`), "Prazo para negociar toda a carteira" (`tempoHoje` / `tempoIA`), "Valor renegociado no 1º mês" (`valorHoje` / `valorIA`).
>   Frase: se `a.extra`, "Diferença estimada no 1º mês: +{a.extra} renegociados."; senão "A equipe já negocia a carteira inteira em {tempoHoje}. Com o agente, a estimativa é de {tempoIA}."
>   Nota pequena: "Estimativa com base nas suas respostas e em premissas de mercado. Não é uma promessa de resultado. Valores arredondados. Renegociado não é o mesmo que recebido." + se `a.aproximada`: " Você respondeu “Não sei” em alguma pergunta, então usamos um valor intermediário de referência."
> - Cartão "Prontidão por dimensão" com `pontos/pontosMax` e uma barra por dimensão (`a.dims`: nome, `pontos/max`, `leitura`). Na dimensão `a.critico`, uma etiqueta amarela "Prioridade" **separada do nome por um espaço**. As barras animam de 0 até o valor (sem animação se o usuário prefere menos movimento).
> - "Por onde começar": 3 passos (`a.passos`) em colunas, cada um com rótulo em caixa alta, texto e "**Pronto quando:** …". O primeiro passo com número amarelo e linha superior preta.
> - Bloco preto "CTA": título e texto de `a.cta`, botão "Conversar com um especialista". Ao clicar, chame `registrarPedidoConversa`. Sucesso: troque o botão por "Pronto! Um especialista da Ubots vai falar com você em até 1 dia útil." (com check amarelo, `role="status"`). Falha: mostre "Não conseguimos registrar o pedido agora. Tente de novo em instantes." e mantenha o botão.
> - Abaixo do bloco: dois links que abrem em nova aba: "Baixe o Playbook de recuperação de crédito com IA" e "Quer ouvir o time do Sicoob Crediauc? Entre na lista de interesse." (URLs em `config.playbookUrl` e `config.listaInteresseUrl`).
> - Rodapé: "Como calculamos: pessoas × renegociações por dia × 21 dias úteis, multiplicado pela faixa do nível. Cada resposta usa um valor de referência dentro da faixa escolhida, e os resultados são arredondados. O resultado nunca passa do tamanho da carteira informada." e botão "Refazer diagnóstico" (limpa tudo e volta à intro).
>
> **Acessibilidade:** o foco vai para o título de cada tela; botões de opção com `aria-pressed`; erros com `aria-invalid` e `aria-describedby`;
> barra de progresso com `role="progressbar"`; tudo operável por teclado.
>
> Faça a página funcionar em 360px de largura sem rolagem horizontal. Não crie painel de leads.

---

## Prompt 3: HubSpot

> Configure o envio ao HubSpot de `src/lib/diagnostico/entrega.ts`. Ele já faz o POST para a API pública de formulários
> do HubSpot. Faça apenas isto:
> 1. Em `config.ts`, leia `portalId` e `formGuid` de `import.meta.env.VITE_HUBSPOT_PORTAL_ID` e `VITE_HUBSPOT_FORM_GUID`
>    (e, opcionalmente, `VITE_HUBSPOT_FORM_GUID_INTERESSE`). Me diga onde cadastrar essas variáveis.
> 2. Chame `reenviarPendentes()` uma vez quando a página `/diagnostico` abrir.
> 3. Chame `emitir("visualizado")` ao abrir a página, `emitir("iniciado")` ao responder a primeira pergunta do quiz
>    e `emitir("concluido")` ao chegar na captura.
> 4. Se o site já tiver o script de tracking do HubSpot, não adicione outro.
> Não altere os nomes dos campos em `config.hubspot.campos`. Eles precisam existir como campos ocultos no formulário do
> HubSpot (lista em `docs/INTEGRACAO.md`).

---

## Depois de montar

- Rode o caso de conferência da seção inicial e um cenário de banco: o texto **não** pode mencionar "cooperado".
- Escolha "Não sei" em contratos e confira o aviso de estimativa aproximada no resultado.
- Com o HubSpot configurado, confirme no HubSpot que o contato foi criado com os campos `diag_*` e que o pedido de
  conversa marcou `diag_pediu_conversa = Sim`.
