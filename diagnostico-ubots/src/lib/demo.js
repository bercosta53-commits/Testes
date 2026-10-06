/* Cenários do modo demonstração (CLAUDE_prototipo_diagnostico.md). */
export const FORM_DEMO = {
  nome: "Ana Souza",
  email: "ana@cooperativa-exemplo.com.br",
  fone: "(51) 99999-0000",
  instituicao: "Cooperativa Exemplo",
  aceite: true,
};

/* Para o banco, o formulário usa um banco fictício: assim o texto "o seu banco" combina com o nome. */
export const FORM_DEMO_POR_TIPO = {
  banco: { ...FORM_DEMO, email: "ana@banco-exemplo.com.br", instituicao: "Banco Exemplo" },
  financeira: { ...FORM_DEMO, email: "ana@financeira-exemplo.com.br", instituicao: "Financeira Exemplo" },
};
export const formDemo = (tipo) => FORM_DEMO_POR_TIPO[tipo] || FORM_DEMO;

export const CENARIOS = [
  {
    nome: "Cooperativa média",
    respostas: { tipo: "cooperativa", pessoas: 35, contratos: 15000, ticket: 7500, ritmo: 1, regua: 1, canal: 2, politica: 1, integracao: 2, consentimento: 1 },
  },
  {
    nome: "Banco regional maduro",
    respostas: { tipo: "banco", pessoas: 75, contratos: 35000, ticket: 15000, ritmo: 4, regua: 2, canal: 3, politica: 3, integracao: 3, consentimento: 3 },
  },
  {
    nome: "Cooperativa no início",
    respostas: { tipo: "cooperativa", pessoas: 8, contratos: 3000, ticket: 3000, ritmo: 1, regua: 0, canal: 0, politica: 0, integracao: 0, consentimento: 0 },
  },
];
