// Configuração do site da Velora — v1.
// Tudo o que depende de decisão ou validação do time fica aqui, num só lugar.

export default {
  // Enquanto false, todas as páginas saem com <meta name="robots" content="noindex, nofollow">
  // e o robots.txt bloqueia rastreamento. Trocar para true só na publicação.
  indexavel: false,

  // URL pública definitiva (ex.: 'https://www.dominio.com.br'). Vazio = sem canonical/og:url.
  urlBase: '',

  // Destino do formulário de diagnóstico (URL que recebe POST com FormData).
  // Vazio = modo demonstração: valida os campos e mostra a mensagem de sucesso,
  // mas NÃO envia os dados para lugar nenhum. Configurar antes de publicar.
  formularios: {
    diagnostico: '',
  },

  // PENDENTE (checklist da copy): "Confirmar faixas de faturamento do formulário".
  // Faixas abaixo são sugestão de trabalho, não texto aprovado.
  faixasFaturamento: [
    'Até R$ 5 milhões',
    'R$ 5 milhões a R$ 20 milhões',
    'R$ 20 milhões a R$ 50 milhões',
    'R$ 50 milhões a R$ 100 milhões',
    'Acima de R$ 100 milhões',
  ],

  // Fotos de produção própria, quando houver. Cada posição preenchida aqui substitui a foto
  // provisória (Pexels) de src/conteudo/fotos.mjs. Posições: 'hero', 'onde-trava', 'como',
  // 'icp-tecnologia', 'agendar'. Ex.:
  //   'onde-trava': { src: 'assets/img/onde-trava-proprio.webp', alt: '…', largura: 1600, altura: 1067 }
  fotos: {},

  // Casos validados (com autorização, números verificáveis e período). Vazio = bloco de casos não é publicado.
  // Ex.: { segmento: 'Tecnologia B2B', nome: '…', contexto: '…', trava: '…', conectamos: '…',
  //        resultado: { numero: '…', legenda: '…' }, link: '…' }
  casos: [],

  // Sócios validados (retratos na seção 09). Ex.: { nome: '…', papel: '…', foto: { src, alt, largura, altura } }
  socios: [],

  // Contatos do rodapé. Vazio = não aparece.
  contato: {
    email: '',
    linkedin: '',
  },
};
