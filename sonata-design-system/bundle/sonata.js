/* @ds-bundle: {"format":4,"namespace":"Sonata","components":[{"name":"Destaque"},{"name":"Bento"},{"name":"Lista"},{"name":"Retrato"},{"name":"Frase"},{"name":"Depoimento"},{"name":"Oferta"},{"name":"Tecnologia"},{"name":"DataComemorativa"},{"name":"Equipe"},{"name":"Carrossel"},{"name":"Story"},{"name":"Fotografia"},{"name":"Elementos"},{"name":"Assinatura"},{"name":"Grid"},{"name":"Hierarquia"}]} */
/*
 * Sonata Social — Ondas · motor de layout (v3)
 * Uma ficha (objeto JSON) descreve o post; Sonata.render() devolve o post pronto,
 * no tamanho real (1080 px de largura), seguindo as regras do design system:
 * composição modular (bento), cartões de texto, foto estourada ou em módulos de mesmo raio,
 * barra de assinatura no pé, ícones de linha e as ondas do logo como textura.
 * Sem dependências, sem rede. Script clássico: define window.Sonata.
 */
(function (root) {
  'use strict';

  // Margens menores e uma barra de assinatura fixa no pé (altura BARRA).
  var BARRA = 96;
  var FORMATOS = {
    feed: { w: 1080, h: 1350, m: 56, mt: 56, mb: 48 },
    quadrado: { w: 1080, h: 1080, m: 56, mt: 56, mb: 48 },
    story: { w: 1080, h: 1920, m: 64, mt: 220, mb: 300 }
  };

  var cfg = {
    logos: { marinho: '', agua: '', branco: '' },
    fotos: {},
    contato: { endereco: 'Av. Dr. Nilo Peçanha, 2564', cidade: 'Porto Alegre', telefone: '(51) 3022.2100', instagram: '@sonata.aparelhosauditivos' }
  };

  /* ---------- metadados dos modelos (lidos por pessoas e por IA) ---------- */
  var MODELOS = {
    destaque: {
      nome: 'Destaque', pilar: 'Afeto',
      quando: 'A foto ocupa o post inteiro; um cartão flutuante segura título, subtítulo e chamada. Aba vertical e selo de ícone opcionais. Abertura de campanha, frase com pessoas, datas.',
      temas: ['marinho', 'agua', 'claro'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'foto'], opcional: ['rotulo', 'apoio', 'cta', 'aba', 'icone'],
      limites: { titulo: 10, apoio: 18 }, teto: 35
    },
    bento: {
      nome: 'Bento', pilar: 'Cuidado',
      quando: 'Composição modular de fotos em módulos de mesmo raio e cartões de cor. Educativo, institucional, bastidores. layout a (manchete no topo + mosaico com foto alta, foto e cartão de chamada), b (cartão de texto + foto alta + foto) ou c (foto larga + cartão largo).',
      temas: ['marinho', 'nevoa', 'agua'], temaPadrao: 'nevoa',
      obrigatorio: ['titulo', 'fotos'], opcional: ['rotulo', 'apoio', 'corpo', 'cta', 'layout', 'chips', 'legenda', 'icone'],
      limites: { titulo: 10, apoio: 18, corpo: 20 }, teto: 40
    },
    lista: {
      nome: 'Lista', pilar: 'Sonata',
      quando: 'Serviços, diferenciais ou passos curtos: até 4 cartões em pílula, cada um com título, linha de texto e ícone.',
      temas: ['nevoa', 'marinho', 'claro'], temaPadrao: 'claro',
      obrigatorio: ['titulo', 'itens'], opcional: ['rotulo', 'cta'],
      limites: { titulo: 10 }, teto: 60
    },
    retrato: {
      nome: 'Retrato', pilar: 'Sonata',
      quando: 'Uma pessoa em destaque (sócia ou paciente autorizado) num módulo alto, ao lado de um cartão com título, chips de serviço e chamada.',
      temas: ['nevoa', 'marinho', 'agua'], temaPadrao: 'nevoa',
      obrigatorio: ['titulo', 'pessoa'], opcional: ['rotulo', 'apoio', 'chips', 'cta'],
      limites: { titulo: 10, apoio: 16 }, teto: 40
    },
    frase: {
      nome: 'Frase', pilar: 'Afeto',
      quando: 'Frase sem foto, centralizada, com muito respiro e um elemento de interface: controle de volume, linha de som ou botão.',
      temas: ['marinho', 'nevoa', 'agua', 'claro'], temaPadrao: 'marinho',
      obrigatorio: ['titulo'], opcional: ['rotulo', 'apoio', 'cta', 'elemento'],
      limites: { titulo: 10, apoio: 16 }, teto: 30
    },
    depoimento: {
      nome: 'Depoimento', pilar: 'Sonata',
      quando: 'A fala real de um paciente num cartão grande, com aspas, nome e detalhe. Com foto autorizada, a pessoa entra num módulo.',
      temas: ['marinho', 'nevoa', 'agua'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'pessoa'], opcional: [],
      limites: { titulo: 32 }, teto: 40
    },
    oferta: {
      nome: 'Oferta', pilar: 'Sonata',
      quando: 'Condição comercial real: preço de entrada, parcelamento e chamada num cartão escuro, ao lado de uma foto alta de pessoas. No máximo 1 em cada 5 posts.',
      temas: ['nevoa', 'marinho', 'agua'], temaPadrao: 'nevoa',
      obrigatorio: ['preco', 'cta'], opcional: ['rotulo', 'titulo', 'selo', 'legenda', 'foto', 'itens'],
      limites: { titulo: 8 }, teto: 40
    },
    tecnologia: {
      nome: 'Tecnologia', pilar: 'Tecnologia',
      quando: 'Aparelho recortado num módulo de cor com anéis de escuta, cartão com o benefício e chips com ícone; uma foto de uso real ao lado.',
      temas: ['nevoa', 'marinho'], temaPadrao: 'nevoa',
      obrigatorio: ['titulo', 'foto'], opcional: ['rotulo', 'apoio', 'chips', 'legenda', 'fotos'],
      limites: { titulo: 10, chips: 3 }, teto: 40
    },
    data: {
      nome: 'Data comemorativa', pilar: 'Afeto',
      quando: 'Foto estourada com um cartão claro que traz a data, o nome da data em manuscrito e uma frase.',
      temas: ['marinho', 'agua', 'claro'], temaPadrao: 'agua',
      obrigatorio: ['rotulo', 'manuscrito', 'foto'], opcional: ['apoio'],
      limites: { manuscrito: 4, apoio: 16 }, teto: 30
    },
    equipe: {
      nome: 'Equipe', pilar: 'Sonata',
      quando: 'As sócias lado a lado em módulos, com um cartão largo que apresenta a equipe.',
      temas: ['marinho', 'nevoa'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'pessoas'], opcional: ['rotulo', 'apoio', 'cta'],
      limites: { titulo: 10, apoio: 18 }, teto: 40
    },
    'carrossel-capa': {
      nome: 'Carrossel · capa', pilar: 'Cuidado',
      quando: 'Primeira lâmina: foto estourada, cartão com a promessa e o indicador de páginas.',
      temas: ['marinho', 'agua', 'claro'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'pagina', 'foto'], opcional: ['rotulo', 'apoio'],
      limites: { titulo: 10, apoio: 14 }, teto: 30
    },
    'carrossel-passo': {
      nome: 'Carrossel · passo', pilar: 'Cuidado',
      quando: 'Miolo: um passo por lâmina, com número em pílula, cartão de texto e foto em módulo.',
      temas: ['nevoa', 'claro', 'marinho'], temaPadrao: 'nevoa',
      obrigatorio: ['titulo', 'pagina'], opcional: ['passo', 'corpo', 'foto'],
      limites: { titulo: 8, corpo: 30 }, teto: 45
    },
    'carrossel-fim': {
      nome: 'Carrossel · fechamento', pilar: 'Sonata',
      quando: 'Última lâmina: convite com a fono em módulo, contato e chamada.',
      temas: ['marinho', 'nevoa', 'agua'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'cta', 'pagina'], opcional: ['apoio', 'pessoa'],
      limites: { titulo: 8, apoio: 14 }, teto: 35
    }
  };

  var PROIBIDAS = ['surdo', 'surda', 'surdez', 'deficiente', 'deficiência', 'velho', 'velha', 'velhinho', 'velhinha', 'vovozinha', 'vovozinho', 'imperdível', 'não perca', 'compre já', 'barato'];

  // Cor do cartão que melhor contrasta com cada fundo de página.
  var CARTAO = { marinho: 'claro', nevoa: 'marinho', agua: 'claro', claro: 'marinho' };
  var CARTAO_2 = { marinho: 'agua', nevoa: 'agua', agua: 'marinho', claro: 'agua' };
  var BARRA_TEMA = { marinho: 'claro', nevoa: 'claro', agua: 'claro', claro: 'nevoa' };

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // *palavra* vira destaque de cor; \n vira quebra de linha.
  function rich(s) {
    return esc(s).replace(/\*([^*]+)\*/g, '<em class="sn-enf">$1</em>').replace(/\n/g, '<br>');
  }
  function plain(s) { return String(s || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim(); }
  function words(s) { var p = plain(s); return p ? p.split(' ').length : 0; }
  function px(n) { return Math.round(n) + 'px'; }
  function has(list, x) { return list.indexOf(x) !== -1; }
  function seeded(seed) {
    var s = seed || 7;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  /* ---------- ícones de linha (24 × 24, traço 2) — base Feather Icons, licença MIT ---------- */
  var ICONES = {
    som: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    ondas: '<path d="M9 3a11 11 0 0 0 0 18"/><path d="M14 7a6 6 0 0 0 0 10"/><circle cx="19" cy="12" r="1.6"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    telefone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    local: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    coracao: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    seta: '<path d="M7 17L17 7M8 7h9v9"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    bateria: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M11 9l-2 3h3l-2 3"/>',
    bluetooth: '<path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/>',
    conversa: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    pessoas: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    cartao: '<rect x="1" y="4" width="22" height="16" rx="3"/><path d="M1 10h22"/>',
    ajuste: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'
  };
  function icone(nome, tam) {
    var p = ICONES[nome] || ICONES.ondas;
    return '<svg class="sn-icone" aria-hidden="true" viewBox="0 0 24 24" width="' + (tam || 34) + '" height="' + (tam || 34) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  // Botão redondo com ícone. tipo: 'cheio' (cta) ou 'contorno'.
  function botao(nome, tipo, tam) {
    return '<i class="sn-botao sn-botao-' + (tipo || 'cheio') + '"' + (tam ? ' style="width:' + px(tam) + ';height:' + px(tam) + '"' : '') + '>' + icone(nome, tam ? Math.round(tam * 0.44) : 32) + '</i>';
  }

  /* ---------- elementos ---------- */

  // Arcos de escuta: as ondas que abraçam o "S" do logo.
  function arcos(o) {
    o = o || {};
    var r = o.r || 300, passo = o.passo || 60, e = o.espessura || 22;
    var de = o.de == null ? 180 : o.de, ate = o.ate == null ? 270 : o.ate;
    var cores = o.cores || ['var(--grafismo-forte)', 'var(--grafismo-medio)', 'var(--grafismo-suave)'];
    var op = o.opacidades || [1, 1, 1];
    var n = o.quantidade || 3, paths = '';
    for (var i = 0; i < n; i++) {
      var ri = r + i * passo, w = e * (1 - i * 0.22);
      var a0 = de * Math.PI / 180, a1 = ate * Math.PI / 180;
      var x0 = o.cx + ri * Math.cos(a0), y0 = o.cy + ri * Math.sin(a0);
      var x1 = o.cx + ri * Math.cos(a1), y1 = o.cy + ri * Math.sin(a1);
      var large = (ate - de) % 360 > 180 ? 1 : 0;
      var d = (ate - de) >= 360
        ? 'M' + (o.cx - ri) + ' ' + o.cy + 'a' + ri + ' ' + ri + ' 0 1 1 ' + (2 * ri) + ' 0a' + ri + ' ' + ri + ' 0 1 1 ' + (-2 * ri) + ' 0'
        : 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + 'A' + ri + ' ' + ri + ' 0 ' + large + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1);
      paths += '<path d="' + d + '" fill="none" stroke="' + cores[i % cores.length] + '" stroke-opacity="' + op[i % op.length] + '" stroke-width="' + w.toFixed(1) + '" stroke-linecap="round"/>';
    }
    return '<svg class="sn-el sn-arcos" aria-hidden="true" width="' + o.w + '" height="' + o.h + '" viewBox="0 0 ' + o.w + ' ' + o.h + '">' + paths + '</svg>';
  }

  // Linhas de onda: textura de fundo, três ondas finas atravessando o post (eco do logo).
  function linhasDeOnda(F, o) {
    o = o || {};
    var W = F.w, H = F.h, out = '', base = o.base || [0.18, 0.5, 0.82];
    for (var k = 0; k < base.length; k++) {
      var y0 = H * base[k], amp = 34 + k * 8, comp = W * (1.1 + k * 0.25), d = '';
      for (var x = -20; x <= W + 20; x += 12) d += (x === -20 ? 'M' : 'L') + x + ' ' + (y0 + amp * Math.sin(x / comp * Math.PI * 2 + k * 1.7)).toFixed(1);
      out += '<path d="' + d + '" fill="none" stroke="var(--grafismo-medio)" stroke-width="3" stroke-opacity="' + (o.opacidade || 0.55) + '"/>';
    }
    return '<svg class="sn-el sn-linhas-onda" aria-hidden="true" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + out + '</svg>';
  }

  // Onda: faixa fluida em duas camadas.
  function caminhoOnda(W, H, base, amp, fase, compr) {
    var d = 'M0 ' + H;
    for (var x = 0; x <= W; x += 12) d += 'L' + x + ' ' + (base + amp * Math.sin((x / compr) * Math.PI * 2 + fase)).toFixed(1);
    return d + 'L' + W + ' ' + H + 'Z';
  }
  function onda(o) {
    var W = o.w, H = o.h, alt = o.altura || 220, A = o.amplitude || 34;
    var cores = o.cores || ['var(--grafismo-medio)', 'var(--grafismo-forte)'];
    var op = o.opacidades || [1, 1];
    return '<svg class="sn-el sn-onda" aria-hidden="true" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<path d="' + caminhoOnda(W, H, H - alt, A, 0.6, W * 1.15) + '" fill="' + cores[0] + '" fill-opacity="' + op[0] + '"/>' +
      '<path d="' + caminhoOnda(W, H, H - alt + A * 1.6, A * 0.8, 2.4, W * 0.95) + '" fill="' + cores[1] + '" fill-opacity="' + op[1] + '"/></svg>';
  }

  // Linha de som: barras simétricas que crescem no centro.
  function linhaDeSom(o) {
    o = o || {};
    var L = o.largura || 888, A = o.altura || 120, passo = o.passo || 22, larg = o.barra || 8;
    var rnd = seeded(o.semente || 11), n = Math.floor(L / passo), out = '';
    for (var i = 0; i <= n; i++) {
      var t = i / n, env = Math.exp(-Math.pow((t - 0.5) / 0.2, 2));
      var h = Math.max(larg, (0.12 + 0.88 * env) * A * (0.45 + 0.55 * rnd()));
      var x = i * passo + larg / 2, y0 = (A - h) / 2;
      var cor = env > 0.35 ? (o.cor || 'var(--grafismo-forte)') : (o.corSuave || 'var(--grafismo-medio)');
      out += '<line x1="' + x.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + (y0 + h).toFixed(1) + '" stroke="' + cor + '" stroke-width="' + larg + '" stroke-linecap="round"/>';
    }
    return '<svg class="sn-linha" aria-hidden="true" width="' + L + '" height="' + A + '" viewBox="0 0 ' + L + ' ' + A + '">' + out + '</svg>';
  }

  // Controle de volume: elemento de interface para frases ("como está a sua audição hoje?").
  function controleVolume(nivel) {
    var n = nivel == null ? 3 : nivel, out = '';
    for (var i = 0; i < 5; i++) out += '<i class="' + (i < n ? 'on' : '') + (i === n - 1 ? ' atual' : '') + '"></i>';
    return '<div class="sn-volume">' + icone('som', 34) + '<div class="sn-volume-trilho">' + out + '</div><span class="legenda">' + 'ouvir melhor' + '</span></div>';
  }

  function aspas(tam) {
    tam = tam || 96;
    return '<svg class="sn-aspas" aria-hidden="true" viewBox="0 0 100 80" width="' + tam + '" height="' + Math.round(tam * 0.8) + '"><path fill="var(--grafismo-forte)" d="M0 80V50C0 22 14 5 40 0l5 12C31 18 25 28 25 40h20v40zm55 0V50C55 22 69 5 95 0l5 12C86 18 80 28 80 40h20v40z"/></svg>';
  }

  function srcFoto(src) { return src ? (cfg.fotos[src] || src) : ''; }

  // Foto: preenche o módulo (ou o post) sem deformar. Sem src, espaço reservado com o briefing.
  function foto(f, estilo, attrs) {
    f = f || {};
    var src = srcFoto(f.src);
    var inner = src
      ? '<img src="' + esc(src) + '" alt="' + esc(f.assunto || '') + '" style="object-position:' + esc(f.foco || '50% 35%') + '">'
      : '<div class="sn-foto-vazia"><span class="rotulo">Foto</span><span class="legenda">' + esc(f.assunto || 'Pessoas 60+ em convívio, luz natural') + '</span></div>';
    return '<div class="sn-foto"' + (attrs || '') + (f.rosto ? ' data-rosto="' + esc(f.rosto) + '"' : '') + ' style="' + (estilo || 'position:absolute;inset:0;') + '">' + inner + '</div>';
  }
  // Módulo de foto: retângulo de raio padrão dentro do grid.
  function modulo(f, estilo, extra) {
    return '<div class="sn-modulo" style="' + (estilo || '') + '">' + foto(f, null, ' data-alvo="modulo"') + (extra || '') + '</div>';
  }
  // Recorte de produto (PNG transparente), flutuando sem caixa.
  function recorte(f, estilo) {
    var src = srcFoto((f || {}).src);
    return src ? '<img class="sn-recorte" src="' + esc(src) + '" alt="' + esc(f.assunto || '') + '" style="' + estilo + '">' : foto(f, estilo);
  }

  function logo(variante, estilo) {
    var src = cfg.logos[variante] || '';
    if (!src) return '<div class="sn-logo sn-logo-texto" style="' + (estilo || '') + '">SONATA<small>aparelhos auditivos</small></div>';
    return '<img class="sn-logo" src="' + esc(src) + '" alt="Sonata aparelhos auditivos" style="' + (estilo || '') + '">';
  }

  function dots(p) {
    if (!p || !p.total) return '';
    var out = '';
    for (var i = 1; i <= p.total; i++) out += '<i class="' + (i === p.atual ? 'on' : '') + '"></i>';
    return '<div class="sn-dots" aria-label="Lâmina ' + p.atual + ' de ' + p.total + '">' + out + '</div>';
  }
  // Marca do rótulo: as duas ondas do "S" do logo, em miniatura.
  function marca() {
    return '<svg class="sn-marca" aria-hidden="true" viewBox="0 0 30 34" width="24" height="28" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"><path d="M15 3A15 15 0 0 0 15 31"/><path d="M25 9A8.5 8.5 0 0 0 25 25" opacity=".55"/></svg>';
  }
  // CTA em pílula com seta num círculo.
  function cta(texto, nomeIcone) {
    return texto ? '<span class="sn-cta"><span class="chamada">' + esc(texto) + '</span><i class="sn-cta-seta">' + icone(nomeIcone || 'seta', 30) + '</i></span>' : '';
  }
  // Linha de chamada: botão de ícone + texto (sem pílula), para dentro de cartões.
  function linhaCta(texto, nomeIcone) {
    return texto ? '<div class="sn-linha-cta">' + botao(nomeIcone || 'calendario', 'cheio', 72) + '<span class="chamada">' + esc(texto) + '</span></div>' : '';
  }
  function rotulo(t) { return t ? '<div class="rotulo sn-rotulo">' + marca() + '<span>' + esc(t) + '</span></div>' : ''; }
  function apoio(t, cls) { return t ? '<p class="' + (cls || 'apoio') + ' sn-apoio">' + rich(t) + '</p>' : ''; }
  function corpo(t) { return t ? '<p class="corpo sn-corpo">' + rich(t) + '</p>' : ''; }
  function titulo(t, estilo, min) { return t ? '<h1 class="' + estilo + ' sn-titulo" data-fit="' + (min || 44) + '">' + rich(t) + '</h1>' : ''; }
  function chips(lista) {
    if (!lista || !lista.length) return '';
    return '<div class="sn-chips">' + lista.slice(0, 4).map(function (c) {
      var t = typeof c === 'string' ? c : c.texto, ic = typeof c === 'string' ? 'check' : (c.icone || 'check');
      return '<span class="sn-chip">' + icone(ic, 26) + '<span>' + esc(t) + '</span></span>';
    }).join('') + '</div>';
  }
  function quem(nome, detalhe) {
    return nome ? '<div class="sn-quem"><div class="nome">' + esc(nome) + '</div>' + (detalhe ? '<div class="legenda">' + esc(detalhe) + '</div>' : '') + '</div>' : '';
  }

  // Cartão: bloco de cor com o próprio tema (as cores do texto acompanham).
  function cartao(tema, conteudo, estilo, classe) {
    return '<div class="sn-cartao ' + (classe || '') + '" data-theme="' + tema + '" data-fit-box style="' + (estilo || '') + '"><div class="sn-cartao-in">' + conteudo + '</div></div>';
  }

  // Barra de assinatura: logo, endereço, telefone e seta. Fixa no pé de todo post.
  function barra(s, F) {
    if (s.barra === false) return '';
    var tema = BARRA_TEMA[s.tema] || 'claro', c = cfg.contato;
    var variante = tema === 'marinho' ? 'branco' : 'marinho';
    return '<div class="sn-barra" data-theme="' + tema + '" style="left:' + px(F.m) + ';right:' + px(F.m) + ';bottom:' + px(F.mb) + ';height:' + px(BARRA) + '">' +
      logo(variante, 'height:40px') +
      '<span class="sn-barra-item">' + icone('local', 26) + '<span>' + esc(c.endereco) + '</span></span>' +
      '<span class="sn-barra-item">' + icone('telefone', 26) + '<span>' + esc(c.telefone) + '</span></span>' +
      '<i class="sn-botao sn-botao-cheio" style="width:64px;height:64px;margin-left:auto">' + icone('seta', 28) + '</i>' +
      '</div>';
  }

  // Selo de ícone: círculo que morde o canto do cartão; contrasta com ele.
  function selo(nome, temaCartao) {
    return '<i class="sn-selo-icone" data-theme="' + (temaCartao === 'marinho' ? 'agua' : 'marinho') + '">' + icone(nome, 52) + '</i>';
  }

  // Área útil: entre a margem de cima e a barra de assinatura.
  function area(F, conteudo, classe, estilo, semBarra) {
    return '<div class="sn-area ' + (classe || '') + '" style="left:' + px(F.m) + ';right:' + px(F.m) + ';top:' + px(F.mt) + ';bottom:' + px(semBarra ? F.mb : F.mb + BARRA + 24) + ';' + (estilo || '') + '">' + conteudo + '</div>';
  }
  // Pé do cartão: chamada, assinatura e navegação descem juntas para a base.
  function pe(html) { return html ? '<div class="sn-pe">' + html + '</div>' : ''; }

  function fotoDe(s, i) {
    if (s.fotos && s.fotos[i]) return s.fotos[i];
    if (i === 0 && s.foto) return s.foto;
    return { assunto: 'Foto ' + (i + 1) + ': pessoas 60+ em convívio' };
  }

  /* ---------- modelos ---------- */
  var T = {};

  // Foto estourada + cartão flutuante + aba vertical + selo de ícone.
  T.destaque = function (s, F) {
    var tc = s.cartao || (s.tema === 'claro' ? 'marinho' : 'claro');
    var conteudo = rotulo(s.rotulo) + titulo(s.titulo, 'display', 52) + apoio(s.apoio) + pe((s.cta ? linhaCta(s.cta, s.iconeCta) : '') + (s._extra || ''));
    var aba = s.aba ? '<div class="sn-aba" data-theme="' + (s.tema === 'agua' ? 'marinho' : 'agua') + '"><span class="sn-aba-texto">' + esc(s.aba) + '</span>' + botao('seta', 'cheio', 72) + '</div>' : '';
    return foto(s.foto, null, ' data-alvo="destaque"') +
      '<div class="sn-veu-base"></div>' +
      area(F, '<div class="sn-destaque-linha">' + aba +
        '<div class="sn-destaque-cartao">' + cartao(tc, conteudo) +
        (s.icone !== false ? selo(s.icone || 'ondas', tc) : '') + '</div></div>', 'sn-l-destaque', '', s.barra === false) +
      barra(s, F);
  };

  // Bento: cartão de texto + fotos em módulos de mesmo raio.
  T.bento = function (s, F) {
    var lay = s.layout || 'a', tc = s.cartao || CARTAO[s.tema];
    var assina = s.legenda ? '<div class="legenda sn-assina">' + rich(s.legenda) + '</div>' : '';
    var html;
    if (lay === 'b') {
      var texto = rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 40) + apoio(s.apoio, 'corpo') + corpo(s.corpo) + chips(s.chips) + pe((s.cta ? linhaCta(s.cta) : '') + assina);
      html = '<div class="sn-grid sn-bento-b">' + cartao(tc, texto) + modulo(fotoDe(s, 0), 'grid-row:1 / span 2;grid-column:2;') + modulo(fotoDe(s, 1)) + '</div>';
    } else if (lay === 'c') {
      var largo = rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 44) + apoio(s.apoio) + corpo(s.corpo) + chips(s.chips) + pe((s.cta ? linhaCta(s.cta) : '') + assina);
      html = '<div class="sn-grid sn-bento-c">' + modulo(fotoDe(s, 0), 'grid-column:1 / span 2;') +
        '<div class="sn-destaque-cartao" style="grid-column:1 / span 2;">' + cartao(tc, largo) + selo(s.icone || 'ondas', tc) + '</div></div>';
    } else {
      // a: manchete solta no topo + mosaico (foto alta, foto e cartão de chamada)
      var manchete = '<div class="sn-texto-solto" data-fit-box><div class="sn-cartao-in">' + rotulo(s.rotulo) + titulo(s.titulo, 'display', 48) + apoio(s.apoio) + '</div></div>';
      var chamada = botao(s.icone || 'calendario', 'cheio', 80) + pe((s.cta ? '<div class="chamada sn-chamada-grande">' + esc(s.cta) + '</div>' : '') + (s.corpo ? corpo(s.corpo) : '') + assina);
      html = '<div class="sn-bento-a">' + manchete + '<div class="sn-grid sn-mosaico">' + modulo(fotoDe(s, 0), 'grid-row:1 / span 2;') + modulo(fotoDe(s, 1)) +
        cartao(CARTAO_2[s.tema], chamada, '', 'sn-cartao-chamada') + '</div></div>';
    }
    return linhasDeOnda(F) + area(F, html) + barra(s, F);
  };

  // Lista: título + até 4 cartões em pílula com ícone.
  T.lista = function (s, F) {
    var cores = s.tema === 'marinho' ? ['agua', 'claro', 'agua', 'claro'] : ['agua', 'marinho', 'agua', 'marinho'];
    var itens = (s.itens || []).slice(0, 4).map(function (it, i) {
      return '<div class="sn-item" data-theme="' + cores[i] + '"><div class="sn-item-texto"><div class="sn-item-titulo">' + esc(it.titulo) + '</div>' +
        (it.texto ? '<div class="sn-item-desc">' + esc(it.texto) + '</div>' : '') + '</div>' + botao(it.icone || 'mais', 'contorno', 64) + '</div>';
    }).join('');
    return linhasDeOnda(F) + area(F, '<div class="sn-lista" data-fit-box><div class="sn-cartao-in">' + rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 44) +
      apoio(s.apoio) + '<div class="sn-itens">' + itens + '</div>' + (s.cta ? '<div class="sn-acao">' + cta(s.cta, 'calendario') + '</div>' : '') + '</div></div>') + barra(s, F);
  };

  // Retrato: pessoa em módulo alto + cartão com texto, chips e chamada.
  T.retrato = function (s, F) {
    var p = s.pessoa || {}, tc = s.cartao || CARTAO[s.tema];
    var texto = rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 40) + apoio(s.apoio, 'corpo') + chips(s.chips) + pe(quem(p.nome, p.detalhe) + (s.cta ? linhaCta(s.cta) : ''));
    var botoes = '<div class="sn-botoes-v">' + botao('som', 'contorno', 64) + botao('calendario', 'contorno', 64) + botao('telefone', 'contorno', 64) + '</div>';
    return linhasDeOnda(F) + area(F, '<div class="sn-grid sn-retrato">' + cartao(tc, texto) +
      modulo(p.foto || { assunto: 'Retrato da pessoa' }, '', botoes) + '</div>') + barra(s, F);
  };

  // Frase: centralizada, com um elemento de interface.
  T.frase = function (s, F) {
    var el = s.elemento || 'volume', extra = '';
    if (el === 'volume') extra = controleVolume(3);
    else if (el === 'linha') extra = linhaDeSom({ largura: 720, altura: 100 });
    return linhasDeOnda(F) +
      area(F, '<div class="sn-frase" data-fit-box><div class="sn-cartao-in">' + rotulo(s.rotulo) + titulo(s.titulo, 'display', 56) + apoio(s.apoio) +
        extra + (s.cta ? '<div class="sn-acao">' + cta(s.cta, 'calendario') + '</div>' : '') + '</div></div>') + barra(s, F);
  };

  // Depoimento: cartão grande com aspas; com foto, a pessoa entra num módulo.
  T.depoimento = function (s, F) {
    var p = s.pessoa || {}, tc = s.cartao || CARTAO[s.tema];
    var texto = aspas(84) + '<blockquote class="titulo-compacto sn-titulo sn-citacao" data-fit="36">' + rich(s.titulo) + '</blockquote>' +
      pe(quem(p.nome || 'Nome da paciente', p.detalhe || 'Paciente Sonata'));
    var comFoto = p.foto && (p.foto.src || p.foto.assunto);
    var html = comFoto
      ? '<div class="sn-grid sn-bento-b">' + modulo(p.foto, 'grid-column:1 / span 2;') + cartao(tc, texto, 'grid-column:1 / span 2;') + '</div>'
      : '<div class="sn-grid sn-um"><div class="sn-destaque-cartao">' + cartao(tc, texto, '', 'sn-cartao-centro') + selo(s.icone || 'coracao', tc) + '</div></div>';
    return linhasDeOnda(F) + area(F, html) + barra(s, F);
  };

  // Oferta: cartão escuro com preço + foto alta + cartão de condição.
  T.oferta = function (s, F) {
    var p = s.preco || {}, se = s.selo;
    var preco = '<div class="sn-preco">' + (p.prefixo ? '<span class="legenda">' + esc(p.prefixo) + '</span>' : '') +
      '<span class="sn-preco-linha"><b class="numeral">' + esc(p.valor || '').replace(/^R\$\s*/, '<small>R$</small>') + '</b>' + (p.sufixo ? '<span class="apoio">' + esc(p.sufixo) + '</span>' : '') + '</span></div>';
    var texto = rotulo(s.rotulo) + titulo(s.titulo, 'titulo-compacto', 36) + preco +
      (se ? '<span class="sn-pilula-selo">' + icone('cartao', 26) + '<span>' + esc([se.topo, se.destaque, se.base].filter(Boolean).join(' ')) + '</span></span>' : '') +
      pe(linhaCta(s.cta, 'calendario') + (s.legenda ? '<div class="legenda sn-legal">' + esc(s.legenda) + '</div>' : ''));
    var itens = (s.itens || [{ titulo: 'Teste sem compromisso', icone: 'check' }, { titulo: 'Revisões sem custo', icone: 'escudo' }]).slice(0, 2).map(function (it) {
      return '<div class="sn-mini">' + botao(it.icone || 'check', 'cheio', 56) + '<span>' + esc(it.titulo) + '</span></div>';
    }).join('');
    var html = '<div class="sn-grid sn-oferta">' + cartao(s.cartao || 'marinho', texto) + modulo(fotoDe(s, 0), 'grid-row:1 / span 2;grid-column:2;') +
      cartao(s.tema === 'agua' ? 'claro' : 'agua', itens, '', 'sn-cartao-mini') + '</div>';
    return linhasDeOnda(F) + area(F, html) + barra(s, F);
  };

  // Tecnologia: módulo de produto com anéis + cartão + foto de uso.
  T.tecnologia = function (s, F) {
    var tc = s.cartao || CARTAO[s.tema];
    var produto = '<div class="sn-modulo sn-produto" data-theme="' + (s.tema === 'marinho' ? 'agua' : 'marinho') + '">' +
      '<div class="sn-halo-produto"></div>' +
      '<svg class="sn-el" aria-hidden="true" width="100%" height="100%" viewBox="0 0 968 560" preserveAspectRatio="xMidYMid slice">' +
        '<circle cx="484" cy="280" r="190" fill="none" stroke="var(--grafismo-forte)" stroke-opacity=".7" stroke-width="3"/>' +
        '<circle cx="484" cy="280" r="250" fill="none" stroke="var(--grafismo-forte)" stroke-opacity=".4" stroke-width="3"/>' +
        '<circle cx="484" cy="280" r="310" fill="none" stroke="var(--grafismo-forte)" stroke-opacity=".2" stroke-width="3"/></svg>' +
      recorte(s.foto, 'position:absolute;left:50%;top:50%;width:62%;height:78%;transform:translate(-50%,-50%);object-fit:contain;') +
      (s.legenda ? '<span class="legenda sn-produto-legenda">' + esc(s.legenda) + '</span>' : '') + '</div>';
    var texto = rotulo(s.rotulo) + titulo(s.titulo, 'titulo-compacto', 36) + apoio(s.apoio) + chips(s.chips);
    var html = '<div class="sn-grid sn-tec">' + produto + cartao(tc, texto) + modulo(fotoDe({ fotos: s.fotos }, 0)) + '</div>';
    return linhasDeOnda(F) + area(F, html) + barra(s, F);
  };

  // Data: foto estourada + cartão claro com data, manuscrito e frase.
  T.data = function (s, F) {
    var conteudo = '<span class="sn-pilula-data">' + icone('calendario', 26) + '<span>' + esc(s.rotulo || '') + '</span></span>' +
      (s.manuscrito ? '<div class="manuscrito sn-manuscrito" data-fit="96">' + esc(s.manuscrito) + '</div>' : '') + apoio(s.apoio);
    return foto(s.foto, null, ' data-alvo="destaque"') + '<div class="sn-veu-base"></div>' +
      area(F, '<div class="sn-destaque-linha"><div class="sn-destaque-cartao">' + cartao(s.cartao || 'claro', conteudo) +
        (s.icone !== false ? selo(s.icone || 'coracao', s.cartao || 'claro') : '') + '</div></div>', 'sn-l-destaque') + barra(s, F);
  };

  // Equipe: as sócias em módulos + cartão largo.
  T.equipe = function (s, F) {
    var ps = (s.pessoas || []).slice(0, 3), tc = s.cartao || CARTAO[s.tema];
    var mods = ps.map(function (p) {
      return modulo(p.foto || { assunto: p.nome }, '', '<div class="sn-nome-modulo" data-theme="claro"><b>' + esc(p.nome) + '</b><span>' + esc(p.detalhe || 'Fonoaudióloga') + '</span></div>');
    }).join('');
    var texto = rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 40) + apoio(s.apoio, 'corpo') + pe(s.cta ? linhaCta(s.cta, 'conversa') : '');
    return linhasDeOnda(F) + area(F, '<div class="sn-grid sn-equipe" style="grid-template-columns:repeat(' + Math.max(1, ps.length) + ',1fr)">' + mods +
      cartao(tc, texto, 'grid-column:1 / -1;') + '</div>') + barra(s, F);
  };

  T['carrossel-capa'] = function (s, F) {
    var s2 = {}; for (var k in s) s2[k] = s[k];
    s2._extra = '<div class="sn-navegar"><span class="chamada sn-deslize">Deslize' + icone('seta', 28) + '</span>' + dots(s.pagina) + '</div>';
    s2.cta = null;
    return T.destaque(s2, F);
  };

  T['carrossel-passo'] = function (s, F) {
    var tc = s.cartao || CARTAO[s.tema];
    var texto = (s.passo ? '<span class="sn-pilula-passo">' + icone(s.icone || 'check', 26) + '<span>Passo ' + esc(s.passo) + '</span></span>' : '') + titulo(s.titulo, 'titulo', 44) + corpo(s.corpo) +
      pe('<div class="sn-navegar">' + dots(s.pagina) + botao('seta', 'cheio', 64) + '</div>');
    var temFoto = s.foto && (s.foto.src || s.foto.assunto);
    var html = temFoto ? '<div class="sn-grid sn-passo">' + modulo(s.foto) + cartao(tc, texto) + '</div>' : '<div class="sn-grid sn-um">' + cartao(tc, texto, '', 'sn-cartao-centro') + '</div>';
    var s2 = {}; for (var k in s) s2[k] = s[k];
    if (s2.barra == null) s2.barra = false;
    return linhasDeOnda(F) + area(F, html, '', '', s2.barra === false) + barra(s2, F);
  };

  T['carrossel-fim'] = function (s, F) {
    var p = s.pessoa || {}, tc = s.cartao || CARTAO[s.tema];
    var c = cfg.contato;
    var texto = titulo(s.titulo, 'titulo', 44) + apoio(s.apoio) +
      '<div class="sn-contatos"><span class="sn-chip">' + icone('telefone', 26) + '<span>' + esc(c.telefone) + '</span></span>' +
      '<span class="sn-chip">' + icone('local', 26) + '<span>' + esc(c.endereco) + '</span></span></div>' +
      pe('<div class="sn-navegar">' + cta(s.cta, 'calendario') + dots(s.pagina) + '</div>');
    var tag = p.nome ? '<div class="sn-nome-modulo" data-theme="claro"><b>' + esc(p.nome) + '</b><span>' + esc(p.detalhe || 'Fonoaudióloga') + '</span></div>' : '';
    return linhasDeOnda(F) + area(F, '<div class="sn-grid sn-fim">' + modulo(p.foto || { assunto: 'Retrato da fono' }, '', tag) + cartao(tc, texto) + '</div>') + barra(s, F);
  };

  /* ---------- validação ---------- */
  function validar(spec) {
    var avisos = [], s = spec || {}, m = MODELOS[s.modelo];
    function av(campo, msg) { avisos.push({ campo: campo, aviso: msg }); }
    if (!m) { av('modelo', 'Modelo desconhecido. Use um de: ' + Object.keys(MODELOS).join(', ') + '.'); return avisos; }
    if (s.formato && !FORMATOS[s.formato]) av('formato', 'Formato desconhecido. Use feed, quadrado ou story.');
    if (s.tema && !has(m.temas, s.tema)) av('tema', 'O modelo ' + s.modelo + ' aceita os temas: ' + m.temas.join(', ') + '.');
    m.obrigatorio.forEach(function (c) { if (s[c] == null || s[c] === '') av(c, 'Campo obrigatório neste modelo.'); });
    for (var c in m.limites) {
      if (c === 'chips') { if (s.chips && s.chips.length > m.limites.chips) av('chips', 'No máximo ' + m.limites.chips + ' chips.'); continue; }
      var n = words(s[c]);
      if (n > m.limites[c]) av(c, n + ' palavras; o limite neste modelo é ' + m.limites[c] + '.');
    }
    var enf = String(s.titulo || '').match(/\*[^*]+\*/g) || [];
    if (enf.length > 1) av('titulo', 'Use só um trecho em destaque (*...*) por título.');
    if (enf.length === 1 && words(enf[0]) > 4) av('titulo', 'O destaque deve ter de 1 a 4 palavras.');
    if (/\*/.test(s.apoio || '') || /\*/.test(s.corpo || '')) av('apoio', 'Destaque de cor só no título; no apoio, reescreva sem asteriscos.');
    var itensTxt = (s.itens || []).map(function (i) { return [i.titulo, i.texto].join(' '); }).join(' ');
    var chipsTxt = (s.chips || []).map(function (c) { return typeof c === 'string' ? c : c.texto; }).join(' ');
    var tudo = [s.rotulo, s.titulo, s.apoio, s.corpo, s.manuscrito, s.cta, s.aba, itensTxt, chipsTxt].map(plain).join(' ');
    var total = words(tudo), teto = m.teto || 35;
    if (total > teto) av('texto', total + ' palavras na arte; o teto é ' + teto + '. Leve o resto para a legenda do Instagram.');
    var baixo = tudo.toLowerCase();
    PROIBIDAS.forEach(function (w) { if (baixo.indexOf(w) !== -1) av('texto', '"' + w + '" está fora do vocabulário da marca. Veja o guia de voz.'); });
    if ((tudo.match(/!/g) || []).length > 1) av('texto', 'No máximo um ponto de exclamação por arte.');
    if (/[☀-➿]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/.test(tudo)) av('texto', 'Sem emoji na arte; emoji só na legenda do post.');
    if (s.manuscrito && words(s.manuscrito) > 4) av('manuscrito', 'Manuscrito tem no máximo 4 palavras.');
    if (s.manuscrito && s.modelo !== 'data') av('manuscrito', 'Manuscrito é exclusivo do modelo data.');
    if (s.itens && s.itens.length > 4) av('itens', 'No máximo 4 itens.');
    if (s.aba && words(s.aba) > 5) av('aba', 'A aba vertical tem no máximo 5 palavras.');
    (s.itens || []).forEach(function (it, i) {
      if (words(it.titulo) > 4) av('itens', 'Item ' + (i + 1) + ': título com até 4 palavras.');
      if (words(it.texto) > 7) av('itens', 'Item ' + (i + 1) + ': texto com até 7 palavras.');
      if (it.icone && !ICONES[it.icone]) av('itens', 'Item ' + (i + 1) + ': ícone desconhecido. Use um de: ' + Object.keys(ICONES).join(', ') + '.');
    });
    (s.chips || []).forEach(function (c) {
      var t = typeof c === 'string' ? c : c.texto;
      if (t && t.length > 16) av('chips', '"' + t + '": chip com até 16 caracteres.');
      if (c && c.icone && !ICONES[c.icone]) av('chips', 'Ícone desconhecido em chip: ' + c.icone + '.');
    });
    if (s.icone && typeof s.icone === 'string' && !ICONES[s.icone]) av('icone', 'Ícone desconhecido. Use um de: ' + Object.keys(ICONES).join(', ') + '.');
    if (s.formato === 'quadrado' && s.modelo === 'bento' && (s.layout || 'a') !== 'c' && s.fotos && s.fotos.length > 1) av('fotos', 'No quadrado, o bento mostra só a primeira foto.');
    return avisos;
  }

  /* ---------- montagem ---------- */
  function normalizar(spec) {
    var s = {}, k;
    for (k in spec) s[k] = spec[k];
    var m = MODELOS[s.modelo];
    if (!m) throw new Error('Sonata: modelo desconhecido "' + s.modelo + '"');
    s.formato = FORMATOS[s.formato] ? s.formato : 'feed';
    s.tema = has(m.temas, s.tema) ? s.tema : m.temaPadrao;
    return s;
  }

  // Devolve o elemento do post em tamanho real. Não precisa estar no documento.
  function render(spec) {
    var s = normalizar(spec), F = FORMATOS[s.formato];
    var el = document.createElement('div');
    el.className = 'sn-post sn-' + s.modelo + ' sn-tema-' + s.tema + ' sn-fmt-' + s.formato;
    el.setAttribute('data-theme', s.tema);
    el.setAttribute('data-modelo', s.modelo);
    el.style.cssText = 'width:' + F.w + 'px;height:' + F.h + 'px;';
    el.innerHTML = T[s.modelo](s, F);
    return el;
  }

  // Reduz títulos que estouram o cartão e enquadra os rostos nas fotos. Chame com o post no documento.
  function ajustar(post) {
    var alvos = post.querySelectorAll('[data-fit]');
    for (var i = 0; i < alvos.length; i++) {
      var el = alvos[i], box = el.closest('[data-fit-box]');
      if (!box) continue;
      var stack = box.firstElementChild, min = +el.getAttribute('data-fit');
      var size = parseFloat(getComputedStyle(el).fontSize), guarda = 60;
      while ((stack.offsetHeight > box.clientHeight + 1 || box.scrollHeight > box.clientHeight + 1) && size > min && guarda--) {
        size -= 2; el.style.fontSize = size + 'px';
      }
    }
    enquadrarRosto(post);
    return post;
  }

  // Posiciona a foto para que o rosto (ponto em % da imagem) caia no alvo do módulo:
  // no destaque, no terço de cima (acima do cartão); nos módulos, no centro um pouco acima.
  // Se o corte não alcança o alvo, aproxima a foto (até 1,35×) em vez de deixar o rosto sob o cartão.
  var ALVO_ROSTO = { destaque: [0.5, 0.26], modulo: [0.5, 0.4] };
  var ZOOM_MAX = 1.35;
  function enquadrarRosto(post) {
    var caixas = post.querySelectorAll('.sn-foto[data-rosto]');
    for (var i = 0; i < caixas.length; i++) {
      var cx = caixas[i], img = cx.querySelector('img');
      if (!img || !img.naturalWidth) continue;
      var p = cx.getAttribute('data-rosto').split(/\s+/);
      var rx = Math.min(0.95, Math.max(0.05, parseFloat(p[0]) / 100)), ry = Math.min(0.95, Math.max(0.05, parseFloat(p[1]) / 100));
      var w = cx.offsetWidth, h = cx.offsetHeight, nw = img.naturalWidth, nh = img.naturalHeight;
      if (!w || !h) continue;
      var alvo = ALVO_ROSTO[cx.getAttribute('data-alvo')] || [0.5, 0.35];
      var base = Math.max(w / nw, h / nh);
      var precisa = Math.max(alvo[0] * w / (rx * nw), (1 - alvo[0]) * w / ((1 - rx) * nw), alvo[1] * h / (ry * nh), (1 - alvo[1]) * h / ((1 - ry) * nh));
      var k = Math.max(base, Math.min(base * ZOOM_MAX, precisa));
      var sw = nw * k, sh = nh * k;
      var ox = Math.min(0, Math.max(w - sw, alvo[0] * w - rx * sw));
      var oy = Math.min(0, Math.max(h - sh, alvo[1] * h - ry * sh));
      img.style.cssText = 'position:absolute;max-width:none;object-fit:fill;width:' + px(sw) + ';height:' + px(sh) + ';left:' + px(ox) + ';top:' + px(oy) + ';';
    }
  }

  // Monta o post dentro de `alvo`, reduzido para `largura` px (padrão: tamanho real).
  function montar(spec, alvo, opcoes) {
    opcoes = opcoes || {};
    var post = render(spec), F = FORMATOS[post.className.match(/sn-fmt-(\w+)/)[1]];
    var larg = opcoes.largura || F.w, k = larg / F.w;
    var moldura = document.createElement('div');
    moldura.className = 'sn-moldura-preview';
    moldura.style.cssText = 'width:' + larg + 'px;height:' + Math.round(F.h * k) + 'px;';
    post.style.transform = 'scale(' + k + ')';
    post.style.transformOrigin = '0 0';
    moldura.appendChild(post);
    if (alvo) alvo.appendChild(moldura);
    ajustar(post);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ajustar(post); });
    var imgs = post.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) if (!imgs[i].complete) imgs[i].addEventListener('load', function () { ajustar(post); });
    return moldura;
  }

  function config(o) {
    o = o || {};
    if (o.logos) for (var k in o.logos) cfg.logos[k] = o.logos[k];
    if (o.fotos) for (var f in o.fotos) cfg.fotos[f] = o.fotos[f];
    if (o.contato) for (var c in o.contato) cfg.contato[c] = o.contato[c];
    return cfg;
  }

  root.Sonata = {
    versao: '3.0.0',
    formatos: FORMATOS,
    modelos: MODELOS,
    icones: Object.keys(ICONES),
    vocabularioEvitado: PROIBIDAS,
    config: config,
    render: render,
    montar: montar,
    ajustar: ajustar,
    validar: validar,
    elementos: {
      icone: icone, botao: botao, cartao: cartao, modulo: modulo, barra: barra, chips: chips, cta: cta, linhaCta: linhaCta,
      arcos: arcos, linhasDeOnda: linhasDeOnda, onda: onda, linhaDeSom: linhaDeSom, controleVolume: controleVolume,
      foto: foto, recorte: recorte, logo: logo, dots: dots, aspas: aspas, marca: marca, enquadrarRosto: enquadrarRosto
    }
  };
})(typeof window !== 'undefined' ? window : this);
