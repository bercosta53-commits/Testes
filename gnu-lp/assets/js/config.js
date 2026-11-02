/*
 * GNU · LP de novos associados — CONFIGURAÇÃO
 * ------------------------------------------------------------------
 * Tudo que muda entre homologação e produção fica aqui.
 * Itens marcados com [VALIDAR] dependem de aprovação do GNU (briefing §8).
 * Rode `npm run verificar` antes de publicar.
 */
window.GNU_LP_CONFIG = {
  whatsapp: {
    // [VALIDAR] Número exibido na LP atual (associado.gnu.com.br).
    // Confirmar que é o número comercial e que recebe mensagens.
    // Formato wa.me: país + DDD + número, somente dígitos.
    numero: '5551992387668',

    // Mensagens por origem do CTA (briefing §5). Curtas, sem UTM nem dados pessoais.
    mensagens: {
      geral: 'Olá! Conheci o União pelo site e gostaria de entender melhor como funciona a associação.',
      familia: 'Olá! Tenho interesse em uma associação para minha família. Poderiam me orientar?',
      modalidades: 'Olá! Gostaria de conhecer as modalidades e condições de associação do União.'
    }
  },

  formulario: {
    // URL que recebe POST com JSON { nome, whatsapp, interesse, origem, pagina, enviado_em }.
    // Deve responder 2xx em caso de sucesso. [VALIDAR] destino aprovado pelo GNU.
    endpoint: '',

    // HOMOLOGAÇÃO: true simula um envio bem-sucedido sem transmitir dados.
    // PRODUÇÃO: false. Com endpoint vazio e modo demonstração desligado,
    // o formulário mostra erro e sugere o WhatsApp (nenhum lead é perdido em silêncio).
    modoDemonstracao: true
  },

  analytics: {
    // ID do Google Tag Manager (ex.: 'GTM-XXXXXXX'). Vazio = só alimenta window.dataLayer.
    // [VALIDAR] carregamento condicionado à política de cookies/consentimento do GNU.
    gtmId: '',
    // true = registra no console cada evento enviado ao dataLayer.
    debug: false
  },

  // HOMOLOGAÇÃO: true mostra, no lugar de cada foto ausente, o ID do arquivo e o briefing da foto.
  // PRODUÇÃO: false (e todas as fotos obrigatórias precisam estar em assets/img/).
  mostrarSlotsPendentes: true,

  /*
   * Galerias das sedes (lightbox).
   * - A primeira foto de cada sede é a mesma do mosaico.
   * - As demais (GNU_16_GAL_*) são opcionais: mantenha apenas as que tiverem foto aprovada.
   *   Se sobrar uma foto, o lightbox abre sem setas nem miniaturas.
   * - Legendas devem ser factuais ("Sede · ambiente") e corresponder à foto aprovada.
   * - Endereços: copiados da LP atual. [VALIDAR]
   */
  sedes: {
    'alto-petropolis': {
      nome: 'Alto Petrópolis',
      endereco: 'Av. João Obino, 300 · Petrópolis',
      fotos: [
        { id: 'GNU_02_AP_SEDE', ratio: '4/3', legenda: 'Alto Petrópolis · Vista geral', alt: 'Vista geral da sede Alto Petrópolis do Grêmio Náutico União', brief: 'Vista aberta da sede, mostrando a dimensão do espaço' },
        { id: 'GNU_16_GAL_AP_01', ratio: '3/2', legenda: 'Alto Petrópolis · Piscinas', alt: 'Piscinas da sede Alto Petrópolis do Grêmio Náutico União', brief: 'Detalhe real das piscinas da sede' },
        { id: 'GNU_16_GAL_AP_02', ratio: '3/2', legenda: 'Alto Petrópolis · Área verde', alt: 'Área verde da sede Alto Petrópolis do Grêmio Náutico União', brief: 'Detalhe real da área verde da sede' }
      ]
    },
    'moinhos-de-vento': {
      nome: 'Moinhos de Vento',
      endereco: 'R. Quintino Bocaiúva, 500 · Moinhos de Vento',
      fotos: [
        { id: 'GNU_03_MV_SEDE', ratio: '4/3', legenda: 'Moinhos de Vento · Piscinas', alt: 'Piscinas da sede Moinhos de Vento do Grêmio Náutico União', brief: 'Piscinas/ambiente com contexto urbano reconhecível' },
        { id: 'GNU_16_GAL_MV_01', ratio: '3/2', legenda: 'Moinhos de Vento · Ambientes de convivência', alt: 'Ambiente de convivência da sede Moinhos de Vento do Grêmio Náutico União', brief: 'Detalhe real de ambiente de convivência' }
      ]
    },
    'ilha-do-pavao': {
      nome: 'Ilha do Pavão',
      endereco: 'Av. Mauá, 1050 · Armazém C3, Doca 2 · Centro Histórico',
      fotos: [
        { id: 'GNU_04_IP_SEDE', ratio: '4/3', legenda: 'Ilha do Pavão · Natureza e Guaíba', alt: 'Área de lazer e natureza da sede Ilha do Pavão, junto ao Guaíba', brief: 'Paisagem ampla: natureza + Guaíba/área de lazer' },
        { id: 'GNU_16_GAL_IP_01', ratio: '3/2', legenda: 'Ilha do Pavão · Área de lazer', alt: 'Área de lazer da sede Ilha do Pavão do Grêmio Náutico União', brief: 'Detalhe real da área de lazer' }
      ]
    },
    'uniao-petropole': {
      nome: 'União Petrópole',
      endereco: 'Rua Reis Louzada, 166 · Petrópolis',
      fotos: [
        { id: 'GNU_05_UP_SEDE', ratio: '4/3', legenda: 'União Petrópole · Quadras de tênis', alt: 'Quadras de tênis da sede União Petrópole do Grêmio Náutico União', brief: 'Quadras de tênis e ambiente social ou piscinas' },
        { id: 'GNU_16_GAL_UP_01', ratio: '3/2', legenda: 'União Petrópole · Piscinas', alt: 'Piscinas da sede União Petrópole do Grêmio Náutico União', brief: 'Detalhe real das piscinas da sede' }
      ]
    }
  }
};
