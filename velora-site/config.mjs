// Configuração do site da Velora.
// Tudo o que depende de decisão ou validação do time fica aqui, num só lugar.

export default {
  // Enquanto false, a página sai com <meta name="robots" content="noindex, nofollow">
  // e o robots.txt bloqueia rastreamento. Trocar para true só na publicação.
  indexavel: false,

  // URL pública definitiva (ex.: 'https://www.dominio.com.br'). Vazio = sem canonical/og:url.
  urlBase: '',

  // Destino do formulário (URL que recebe POST com FormData; ex.: endpoint do HubSpot ou de um webhook).
  // Vazio = modo demonstração: valida os campos e mostra a mensagem de sucesso,
  // mas NÃO envia os dados para lugar nenhum. Configurar antes de publicar.
  formularios: {
    conversa: '',
  },

  // Agenda real (ex.: link de agendamento do HubSpot ou Calendly). Regra da copy v2:
  // com agenda, os CTAs dizem "Agendar conversa de diagnóstico" e o envio validado abre a agenda;
  // sem agenda, os CTAs dizem "Solicitar conversa".
  agendaUrl: '',

  // PENDENTE: confirmar faixas e se o campo deve ser obrigatório para triagem (copy v2, §C).
  // Faixas abaixo são sugestão de trabalho, não texto aprovado.
  faixasFaturamento: [
    'Até R$ 5 milhões',
    'R$ 5 milhões a R$ 20 milhões',
    'R$ 20 milhões a R$ 50 milhões',
    'R$ 50 milhões a R$ 100 milhões',
    'Acima de R$ 100 milhões',
  ],
  faturamentoObrigatorio: false,

  // PENDENTE: aviso de privacidade / LGPD exigido pela copy v2 (§C · Implementação de conversão).
  // O texto não faz parte da copy aprovada: preencher com a redação validada. Vazio = nada aparece.
  // Ex.: { texto: '…', url: '/privacidade', rotuloLink: 'Política de privacidade' }
  privacidade: { texto: '', url: '', rotuloLink: '' },

  // PENDENTE: dados de contato e da empresa para o rodapé (e o menu do celular).
  // Só aparece o que estiver preenchido; nada é inventado. Ex.:
  //   contato: { email: 'contato@…', telefone: '+55 11 …', whatsapp: '5511…', linkedin: 'https://www.linkedin.com/company/…', instagram: '' }
  //   empresa: { razaoSocial: 'Velora … Ltda.', cnpj: '00.000.000/0001-00', endereco: 'Rua …, São Paulo – SP' }
  contato: { email: '', telefone: '', whatsapp: '', linkedin: '', instagram: '' },
  empresa: { razaoSocial: '', cnpj: '', endereco: '' },

  // Para trocar uma foto sem reprocessar: cada posição preenchida aqui substitui a foto
  // de src/conteudo/fotos.mjs. Posições: 'hero', 'onde-trava', 'como', 'icp-tecnologia', 'agendar'. Ex.:
  //   'onde-trava': { src: 'assets/img/onde-trava-proprio.webp', alt: '…', largura: 1600, altura: 1067 }
  fotos: {},

  // Casos validados (números, período, atribuição e autorização de divulgação). Vazio = nada aparece.
  // Ex.: { segmento: 'Tecnologia B2B', nome: '…', contexto: '…', obstaculo: '…', acoes: '…',
  //        resultado: { numero: '…', comparacao: '…' } }
  casos: [],

  // Equipe validada (retrato e duas linhas de senioridade). Vazio = nada aparece.
  // Ex.: { nome: '…', papel: '…', senioridade: '…', foto: { src, alt, largura, altura } }
  equipe: [],
};
