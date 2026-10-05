/* Cenários do modo demonstração (CLAUDE_prototipo_diagnostico.md). */
export const CENARIOS = [
  {
    nome: "Cooperativa média",
    respostas: { tipo: "cooperativa", pessoas: 35, contratos: 6000, ticket: 5000, ritmo: 2, regua: 1, canal: 2, politica: 1, integracao: 2, consentimento: 1 },
  },
  {
    nome: "Banco regional maduro",
    respostas: { tipo: "banco", pessoas: 100, contratos: 25000, ticket: 20000, ritmo: 6, regua: 2, canal: 3, politica: 3, integracao: 3, consentimento: 3 },
  },
  {
    nome: "Cooperativa no início",
    respostas: { tipo: "cooperativa", pessoas: 12, contratos: 1200, ticket: 1500, ritmo: 0.5, regua: 0, canal: 0, politica: 0, integracao: 0, consentimento: 0 },
  },
];

export const FORM_DEMO = {
  nome: "Ana Souza",
  email: "ana@cooperativa-exemplo.com.br",
  fone: "(51) 99999-0000",
  instituicao: "Cooperativa Exemplo",
  aceite: true,
};
