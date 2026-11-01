// As cinco etapas do sistema. Textos transcritos de velora-copy-site-v1.md (§2 · 03 O sistema).
//
// `ligacao` é o rótulo curto que aparece sobre a linha que sai da etapa nos diagramas
// ("o que passa de uma etapa para a outra", briefing de design §7). É extraído da linha
// "Entrega" de cada etapa.

export const etapas = [
  {
    n: '01',
    id: 'etapa-inteligencia',
    nome: 'Inteligência',
    titulo: 'Decidir onde concentrar o esforço',
    texto: 'Partimos do perfil de cliente que mais gera valor, dos mercados possíveis e dos sinais de oportunidade.',
    entrega: 'contas priorizadas e motivos claros para abordá-las.',
    ligacao: ['Contas', 'priorizadas'],
  },
  {
    n: '02',
    id: 'etapa-acesso',
    nome: 'Acesso',
    titulo: 'Chegar às pessoas certas',
    texto: 'Com as contas definidas, identificamos decisores e as pessoas que influenciam a compra. Organizamos abordagens relevantes.',
    entrega: 'conversas iniciadas com quem pode fazer o negócio avançar.',
    ligacao: ['Conversas', 'iniciadas'],
  },
  {
    n: '03',
    id: 'etapa-demanda',
    nome: 'Demanda',
    titulo: 'Construir confiança antes e durante a conversa',
    texto: 'Usamos conteúdo, LinkedIn e mídia quando fazem sentido para a estratégia.',
    entrega: 'maior familiaridade com a empresa e argumentos que preparam as próximas interações comerciais.',
    ligacao: ['Familiaridade', 'e argumentos'],
  },
  {
    n: '04',
    id: 'etapa-conversao',
    nome: 'Conversão',
    titulo: 'Fazer as conversas avançarem',
    texto: 'Conectamos processo comercial, materiais, páginas e CRM.',
    entrega: 'oportunidades acompanhadas até a decisão, com registro dos motivos de ganho ou perda.',
    ligacao: ['Motivos de', 'ganho ou perda'],
  },
  {
    n: '05',
    id: 'etapa-medicao',
    nome: 'Medição',
    titulo: 'Aprender com o que trouxe receita',
    texto: 'Acompanhamos a origem, a evolução e o resultado dos negócios.',
    entrega: 'informações que voltam à Inteligência e melhoram a próxima rodada de aquisição.',
    ligacao: ['Informações que', 'voltam à Inteligência'],
  },
];
