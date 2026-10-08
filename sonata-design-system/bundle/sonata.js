/* @ds-bundle: {"format":4,"namespace":"Sonata","components":[{"name":"FraseFoto"},{"name":"Frase"},{"name":"Educativo"},{"name":"Tecnologia"},{"name":"DataComemorativa"},{"name":"Depoimento"},{"name":"ComAFono"},{"name":"Oferta"},{"name":"Carrossel"},{"name":"Story"},{"name":"Elementos"},{"name":"Assinatura"},{"name":"Grid"},{"name":"Hierarquia"}]} */
/*
 * Sonata Social — Ondas · motor de layout
 * Uma ficha (objeto JSON) descreve o post; Sonata.render() devolve o post pronto,
 * no tamanho real (1080 px de largura), seguindo as regras do design system.
 * Sem dependências, sem rede. Script clássico: define window.Sonata.
 */
(function (root) {
  'use strict';

  var FORMATOS = {
    feed: { w: 1080, h: 1350, m: 96, mt: 96, mb: 96 },
    quadrado: { w: 1080, h: 1080, m: 88, mt: 88, mb: 88 },
    story: { w: 1080, h: 1920, m: 96, mt: 250, mb: 320 }
  };

  var cfg = { logos: { marinho: '', agua: '', branco: '' }, fotos: {} };

  /* ---------- metadados dos modelos (lidos por pessoas e por IA) ---------- */
  var MODELOS = {
    'frase-foto': {
      nome: 'Frase com foto', pilar: 'Afeto',
      quando: 'Vida, convivência, emoção. A foto de pessoas juntas é o centro; a frase fecha a ideia.',
      temas: ['marinho'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'foto'], opcional: ['rotulo', 'apoio'],
      elementos: ['arcos'], limites: { titulo: 14, apoio: 18 }
    },
    frase: {
      nome: 'Frase com respiro', pilar: 'Afeto',
      quando: 'Reflexão, frase de impacto, abertura de campanha. Sem foto: o espaço vazio é o protagonista.',
      temas: ['claro', 'bruma', 'agua', 'marinho', 'mar'], temaPadrao: 'bruma',
      obrigatorio: ['titulo'], opcional: ['rotulo', 'apoio'],
      elementos: ['arcos', 'linha'], limites: { titulo: 10, apoio: 18 }
    },
    educativo: {
      nome: 'Educativo', pilar: 'Cuidado',
      quando: 'Saúde auditiva explicada com clareza: um fato, um conselho, um porquê. Assinado por uma fono.',
      temas: ['claro', 'bruma'], temaPadrao: 'claro',
      obrigatorio: ['titulo', 'foto'], opcional: ['rotulo', 'apoio', 'legenda'],
      elementos: ['arcos'], limites: { titulo: 12, apoio: 22 }
    },
    tecnologia: {
      nome: 'Tecnologia', pilar: 'Tecnologia',
      quando: 'Aparelho, recurso, novidade. O aparelho no centro de ondas sonoras; até 3 benefícios em chips.',
      temas: ['marinho', 'mar'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'foto'], opcional: ['rotulo', 'chips', 'legenda'],
      elementos: ['arcos'], limites: { titulo: 10, chips: 3 }
    },
    data: {
      nome: 'Data comemorativa', pilar: 'Afeto',
      quando: 'Dia dos Avós, Dia das Mães, Dia do Idoso, Natal, Dia do Gaúcho. Única vez em que o manuscrito aparece grande.',
      temas: ['agua', 'bruma', 'mar'], temaPadrao: 'agua',
      obrigatorio: ['rotulo', 'manuscrito', 'foto'], opcional: ['apoio'],
      elementos: ['onda'], limites: { manuscrito: 4, apoio: 16 }
    },
    depoimento: {
      nome: 'Depoimento', pilar: 'Sonata',
      quando: 'A voz de quem voltou a ouvir. Sempre com nome real, detalhe (idade ou cidade) e autorização.',
      temas: ['bruma', 'claro'], temaPadrao: 'bruma',
      obrigatorio: ['titulo', 'pessoa'], opcional: [],
      elementos: ['arcos'], limites: { titulo: 32 }
    },
    fono: {
      nome: 'Com a fono', pilar: 'Sonata',
      quando: 'As sócias falando de perto: dica, bastidor, opinião profissional. Próxima e técnica ao mesmo tempo.',
      temas: ['claro', 'bruma'], temaPadrao: 'claro',
      obrigatorio: ['titulo', 'pessoa'], opcional: ['rotulo', 'apoio'],
      elementos: ['arcos'], limites: { titulo: 12, apoio: 20 }
    },
    oferta: {
      nome: 'Oferta', pilar: 'Sonata',
      quando: 'Condição comercial real (parcelamento, preço de entrada, teste sem custo). No máximo 1 em cada 5 posts.',
      temas: ['marinho', 'mar'], temaPadrao: 'marinho',
      obrigatorio: ['preco', 'cta'], opcional: ['rotulo', 'titulo', 'selo', 'legenda'],
      elementos: ['arcos'], limites: { titulo: 10 }
    },
    'carrossel-capa': {
      nome: 'Carrossel · capa', pilar: 'Cuidado',
      quando: 'Primeira lâmina: promete o que o carrossel entrega.',
      temas: ['mar', 'marinho', 'bruma'], temaPadrao: 'mar',
      obrigatorio: ['titulo', 'pagina'], opcional: ['rotulo', 'apoio'],
      elementos: ['arcos'], limites: { titulo: 10, apoio: 14 }
    },
    'carrossel-passo': {
      nome: 'Carrossel · passo', pilar: 'Cuidado',
      quando: 'Miolo: um passo ou ideia por lâmina, numerado só quando a ordem importa.',
      temas: ['claro', 'bruma'], temaPadrao: 'claro',
      obrigatorio: ['titulo', 'pagina'], opcional: ['passo', 'corpo', 'foto'],
      elementos: [], limites: { titulo: 10, corpo: 30 }
    },
    'carrossel-fim': {
      nome: 'Carrossel · fechamento', pilar: 'Sonata',
      quando: 'Última lâmina: um convite claro, com a fono como rosto do atendimento.',
      temas: ['agua', 'bruma', 'marinho'], temaPadrao: 'agua',
      obrigatorio: ['titulo', 'cta', 'pagina'], opcional: ['apoio', 'pessoa'],
      elementos: ['onda'], limites: { titulo: 8, apoio: 14 }
    }
  };

  var PROIBIDAS = ['surdo', 'surda', 'surdez', 'deficiente', 'deficiência', 'velho', 'velha', 'velhinho', 'velhinha', 'vovozinha', 'vovozinho', 'imperdível', 'não perca', 'compre já', 'barato'];

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // *palavra* vira ênfase (Poppins 800 itálico); \n vira quebra de linha.
  function rich(s) {
    return esc(s).replace(/\*([^*]+)\*/g, '<em class="sn-enf">$1</em>').replace(/\n/g, '<br>');
  }
  function plain(s) { return String(s || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim(); }
  function words(s) { var p = plain(s); return p ? p.split(' ').length : 0; }
  function attr(o) {
    var out = '';
    for (var k in o) if (o[k] != null && o[k] !== false) out += ' ' + k + '="' + esc(o[k]) + '"';
    return out;
  }
  function px(n) { return Math.round(n) + 'px'; }
  function has(list, x) { return list.indexOf(x) !== -1; }
  function seeded(seed) {
    var s = seed || 7;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  /* ---------- elementos ---------- */

  // Arcos de escuta: as ondas que abraçam o "S" do logo. Três traços concêntricos,
  // do mais forte (dentro) ao mais suave (fora), com pontas arredondadas.
  // o: { cx, cy, r, passo, espessura, de, ate, cores[], opacidades[], w, h }
  function arcos(o) {
    o = o || {};
    var r = o.r || 300, passo = o.passo || 60, e = o.espessura || 22;
    var de = o.de == null ? 180 : o.de, ate = o.ate == null ? 270 : o.ate;
    var cores = o.cores || ['var(--grafismo-forte)', 'var(--grafismo-medio)', 'var(--grafismo-suave)'];
    var op = o.opacidades || [1, 1, 1];
    var n = o.quantidade || 3;
    var paths = '';
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

  // Onda: faixa fluida na base do post, em duas camadas. Movimento, nunca enfeite.
  // o: { w, h, altura, amplitude, cores[2] }
  function onda(o) {
    var W = o.w, H = o.h, alt = o.altura || 220, A = o.amplitude || 34;
    var cores = o.cores || ['var(--grafismo-medio)', 'var(--grafismo-forte)'];
    function path(base, amp, fase, compr) {
      var d = 'M0 ' + H;
      for (var x = 0; x <= W; x += 12) {
        var y = base + amp * Math.sin((x / compr) * Math.PI * 2 + fase);
        d += 'L' + x + ' ' + y.toFixed(1);
      }
      return d + 'L' + W + ' ' + H + 'Z';
    }
    var tras = path(H - alt, A, 0.6, W * 1.15);
    var frente = path(H - alt + A * 1.6, A * 0.8, 2.4, W * 0.95);
    return '<svg class="sn-el sn-onda" aria-hidden="true" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<path d="' + tras + '" fill="' + cores[0] + '"/><path d="' + frente + '" fill="' + cores[1] + '"/></svg>';
  }

  // Linha de som: barras de forma de onda, simétricas, que crescem no centro.
  // o: { largura, altura, cor, corSuave, semente }
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

  function aspas() {
    return '<svg class="sn-aspas" aria-hidden="true" viewBox="0 0 100 80" width="128" height="102"><path fill="var(--grafismo-forte)" d="M0 80V50C0 22 14 5 40 0l5 12C31 18 25 28 25 40h20v40zm55 0V50C55 22 69 5 95 0l5 12C86 18 80 28 80 40h20v40z"/></svg>';
  }
  function seta() {
    return '<svg class="sn-seta" aria-hidden="true" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }

  function iniciais(nome) {
    return String(nome || '').split(/\s+/).filter(Boolean).map(function (w) { return w[0]; }).filter(function (c, i, a) { return i === 0 || i === a.length - 1; }).join('').toUpperCase();
  }
  function srcFoto(src) { return src ? (cfg.fotos[src] || src) : ''; }

  // Moldura de foto. forma: 'gota' (cantos raio-48 + UM canto raio-onda), 'circulo', 'livre' (sem raio, sangrada)
  // canto: qual canto recebe o raio-onda — 'se' (superior esquerdo), 'sd', 'ie', 'id'
  function foto(f, estilo, forma, canto) {
    f = f || {};
    var R = 'var(--raio-48)', O = 'var(--raio-onda)';
    var raio = '';
    if (forma === 'circulo') raio = 'border-radius:50%;';
    else if (forma === 'gota') {
      var c = { se: [O, R, R, R], sd: [R, O, R, R], id: [R, R, O, R], ie: [R, R, R, O] }[canto || 'se'];
      raio = 'border-radius:' + c.join(' ') + ';';
    } else if (forma === 'sangra') {
      var s = { se: [O, 0, 0, 0], sd: [0, O, 0, 0], id: [0, 0, O, 0], ie: [0, 0, 0, O] }[canto || 'se'];
      raio = 'border-radius:' + s.join(' ') + ';';
    }
    var src = srcFoto(f.src);
    if (!src && f.iniciais) return '<div class="sn-foto sn-iniciais" style="' + raio + estilo + '"><span>' + esc(f.iniciais) + '</span></div>';
    var inner = src
      ? '<img src="' + esc(src) + '" alt="' + esc(f.assunto || '') + '" style="object-position:' + esc(f.foco || '50% 40%') + '">'
      : '<div class="sn-foto-vazia"><span class="rotulo">Foto</span><span class="legenda">' + esc(f.assunto || 'pessoas 60+ em convívio, luz natural') + '</span></div>';
    return '<div class="sn-foto" style="' + raio + estilo + '">' + inner + '</div>';
  }

  function logo(variante, estilo) {
    var src = cfg.logos[variante] || '';
    if (!src) return '<div class="sn-logo sn-logo-texto" style="' + (estilo || '') + '">SONATA<small>aparelhos auditivos</small></div>';
    return '<img class="sn-logo" src="' + esc(src) + '" alt="Sonata aparelhos auditivos" style="' + (estilo || '') + '">';
  }
  function logoDoTema(tema, pedido) {
    if (pedido === false) return null;
    if (pedido && pedido !== 'auto') return pedido;
    return (tema === 'marinho' || tema === 'mar') ? 'branco' : 'marinho';
  }

  function dots(p) {
    if (!p || !p.total) return '';
    var out = '';
    for (var i = 1; i <= p.total; i++) out += '<i class="' + (i === p.atual ? 'on' : '') + '"></i>';
    return '<div class="sn-dots" aria-label="Lâmina ' + p.atual + ' de ' + p.total + '">' + out + '</div>';
  }
  function cta(texto) { return texto ? '<span class="sn-cta chamada">' + esc(texto) + seta() + '</span>' : ''; }
  function rotulo(t) { return t ? '<div class="rotulo sn-rotulo">' + esc(t) + '</div>' : ''; }
  function apoio(t, cls) { return t ? '<p class="' + (cls || 'apoio') + ' sn-apoio">' + rich(t) + '</p>' : ''; }
  function titulo(t, estilo, min) { return t ? '<h1 class="' + estilo + ' sn-titulo" data-fit="' + (min || 64) + '">' + rich(t) + '</h1>' : ''; }

  /* ---------- modelos ---------- */
  var T = {};

  T['frase-foto'] = function (s, F) {
    var W = F.w, H = F.h;
    return foto(s.foto, 'position:absolute;inset:0;', 'livre') +
      '<div class="sn-veu"></div><div class="sn-veu-topo"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: W + 40, cy: -40, r: 250, passo: 64, espessura: 16, de: 90, ate: 180,
        cores: ['var(--agua-300)', 'var(--branco)', 'var(--branco)'], opacidades: [0.95, 0.55, 0.28] }) : '') +
      '<div class="sn-safe">' +
        '<div class="sn-topo">' + (s._logo ? logo(s._logo) : '') + '</div>' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-fim">' +
          rotulo(s.rotulo) + titulo(s.titulo, 'display', 72) + apoio(s.apoio) +
        '</div></div>' +
      '</div>';
  };

  T.frase = function (s, F) {
    var W = F.w, H = F.h, temOnda = has(s.elementos, 'onda');
    return '<div class="sn-halo"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: W + 30, cy: -30, r: 230, passo: 70, espessura: 22, de: 90, ate: 180 }) : '') +
      (temOnda ? onda({ w: W, h: H, altura: F.mb + 120 }) : '') +
      '<div class="sn-safe"' + (temOnda ? ' style="bottom:' + px(F.mb + 150) + '"' : '') + '>' +
        '<div class="sn-topo">' + (s._logo ? logo(s._logo) : '') + '</div>' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-centro">' +
          rotulo(s.rotulo) + titulo(s.titulo, 'display', 80) + apoio(s.apoio) +
        '</div></div>' +
        (has(s.elementos, 'linha') ? '<div class="sn-base">' + linhaDeSom({ largura: W - 2 * F.m, altura: 112 }) + '</div>' : '') +
      '</div>';
  };

  T.educativo = function (s, F) {
    var W = F.w, H = F.h;
    var fw = F.h === 1080 ? 470 : 600, fh = F.h === 1920 ? 820 : (F.h === 1080 ? 470 : 620);
    var x0 = W - fw, y0 = H - fh, raio = 280;
    var maxMain = y0 - F.mt - 48;
    return '<div class="sn-halo sn-halo-baixo"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: x0 + raio, cy: y0 + raio, r: raio + 52, passo: 46, espessura: 18, de: 182, ate: 268 }) : '') +
      foto(s.foto, 'position:absolute;left:' + px(x0) + ';top:' + px(y0) + ';width:' + px(fw) + ';height:' + px(fh) + ';', 'sangra', 'se') +
      '<div class="sn-safe" style="bottom:auto;height:' + px(maxMain + 120) + '">' +
        '<div class="sn-topo">' + (s._logo ? logo(s._logo) : '') + '</div>' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-inicio">' +
          rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 60) + apoio(s.apoio) +
        '</div></div>' +
      '</div>' +
      (s.legenda ? '<div class="legenda sn-assina" style="left:' + px(F.m) + ';bottom:' + px(F.mb) + ';width:' + px(x0 - F.m - 48) + '">' + rich(s.legenda) + '</div>' : '');
  };

  T.tecnologia = function (s, F) {
    var W = F.w, H = F.h;
    var d = F.h === 1920 ? 600 : (F.h === 1080 ? 400 : 500);
    var cx = W - F.m - d / 2 + 60, cy = F.mt + (F.h === 1080 ? 40 : 72) + d / 2;
    return '<div class="sn-halo" style="background:radial-gradient(circle at ' + px(cx) + ' ' + px(cy) + ', var(--fundo-2) 0, transparent ' + px(d * 1.1) + ')"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: cx, cy: cy, r: d / 2 + 52, passo: 56, espessura: 14, de: 0, ate: 360, opacidades: [0.9, 0.9, 0.9] }) : '') +
      foto(s.foto, 'position:absolute;left:' + px(cx - d / 2) + ';top:' + px(cy - d / 2) + ';width:' + px(d) + ';height:' + px(d) + ';box-shadow:var(--sombra-flutuante);', 'circulo') +
      '<div class="sn-safe">' +
        '<div class="sn-topo">' + (s._logo ? logo(s._logo) : '') + '</div>' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-fim">' +
          rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 60) +
          (s.chips && s.chips.length ? '<div class="sn-chips">' + s.chips.slice(0, 3).map(function (c) { return '<span class="sn-chip chamada"><i></i>' + esc(c) + '</span>'; }).join('') + '</div>' : '') +
          (s.legenda ? '<div class="legenda sn-legal">' + esc(s.legenda) + '</div>' : '') +
        '</div></div>' +
      '</div>';
  };

  T.data = function (s, F) {
    var W = F.w, H = F.h;
    var ondaAlt = F.mb + 110;
    var fh = F.h === 1920 ? 760 : (F.h === 1080 ? 380 : 560);
    return '<div class="sn-halo"></div>' +
      onda({ w: W, h: H, altura: ondaAlt, amplitude: 30, cores: s.tema === 'agua' ? ['var(--agua-300)', 'var(--branco)'] : ['var(--grafismo-medio)', 'var(--grafismo-forte)'] }) +
      '<div class="sn-safe" style="bottom:' + px(ondaAlt + 40) + '">' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-inicio">' +
          rotulo(s.rotulo) +
          foto(s.foto, 'position:relative;width:100%;height:' + px(fh) + ';flex:none;', 'gota', 'ie') +
          (s.manuscrito ? '<div class="manuscrito sn-manuscrito" data-fit="120">' + esc(s.manuscrito) + '</div>' : '') +
          apoio(s.apoio) +
        '</div></div>' +
      '</div>' +
      (s._logo ? '<div class="sn-logo-base" style="bottom:' + px(Math.max(56, F.mb - 40)) + '">' + logo(s.tema === 'mar' ? 'marinho' : s._logo) + '</div>' : '');
  };

  T.depoimento = function (s, F) {
    var W = F.w, H = F.h, p = s.pessoa || {};
    var d = 168, fx = F.m, fy = H - F.mb - d;
    return '<div class="sn-halo"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: fx + d / 2, cy: fy + d / 2, r: d / 2 + 30, passo: 30, espessura: 12, de: 196, ate: 284 }) : '') +
      foto(p.foto || { iniciais: iniciais(p.nome) }, 'position:absolute;left:' + px(fx) + ';top:' + px(fy) + ';width:' + px(d) + ';height:' + px(d) + ';', 'circulo') +
      '<div class="sn-safe" style="bottom:' + px(F.mb + d + 64) + '">' +
        '<div class="sn-topo">' + aspas() + '</div>' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-centro">' +
          '<blockquote class="titulo-compacto sn-titulo sn-citacao" data-fit="46">' + rich(s.titulo) + '</blockquote>' +
        '</div></div>' +
      '</div>' +
      '<div class="sn-autor" style="left:' + px(fx + d + 40) + ';bottom:' + px(F.mb) + ';height:' + px(d) + '">' +
        '<div class="nome">' + esc(p.nome || 'Nome da paciente') + '</div>' +
        '<div class="legenda">' + esc(p.detalhe || 'idade · cidade') + '</div>' +
      '</div>' +
      (s._logo ? logo(s._logo, 'position:absolute;right:' + px(F.m) + ';bottom:' + px(F.mb + 8) + ';height:52px') : '');
  };

  T.fono = function (s, F) {
    var W = F.w, H = F.h, p = s.pessoa || {};
    var x0 = Math.round(W * 0.44), fh = F.h === 1920 ? 980 : (F.h === 1080 ? 560 : 740), raio = 280;
    return (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: x0 + raio, cy: fh - raio, r: raio + 44, passo: 40, espessura: 18, de: 92, ate: 178 }) : '') +
      foto(p.foto, 'position:absolute;left:' + px(x0) + ';top:0;width:' + px(W - x0) + ';height:' + px(fh) + ';', 'sangra', 'ie') +
      '<div class="sn-safe" style="top:' + px(F.mt) + '">' +
        '<div class="sn-topo">' + (s._logo ? logo(s._logo) : '') + '</div>' +
      '</div>' +
      '<div class="sn-quem" style="left:' + px(F.m) + ';top:' + px(F.mt + 160) + ';width:' + px(x0 - F.m - 40) + '">' +
        rotulo(s.rotulo || 'Com a fono') +
        '<div class="nome">' + esc(p.nome || 'Nome da fono') + '</div>' +
        '<div class="legenda">' + esc(p.detalhe || 'Fonoaudióloga · sócia da Sonata') + '</div>' +
      '</div>' +
      '<div class="sn-safe" style="top:' + px(fh + 64) + '">' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-inicio">' +
          titulo(s.titulo, 'titulo', 56) + apoio(s.apoio) +
        '</div></div>' +
      '</div>';
  };

  T.oferta = function (s, F) {
    var W = F.w, H = F.h, sd = 248, sx = W - F.m - sd, sy = F.mt + (F.h === 1920 ? 40 : 0);
    var p = s.preco || {}, se = s.selo;
    return '<div class="sn-halo"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: sx + sd / 2, cy: sy + sd / 2, r: sd / 2 + 40, passo: 44, espessura: 16, de: 100, ate: 200 }) : '') +
      (se ? '<div class="sn-selo" style="left:' + px(sx) + ';top:' + px(sy) + ';width:' + px(sd) + ';height:' + px(sd) + '">' +
        '<span class="chamada">' + esc(se.topo || '') + '</span><b class="numeral">' + esc(se.destaque || '') + '</b><span class="chamada">' + esc(se.base || '') + '</span></div>' : '') +
      '<div class="sn-safe">' +
        '<div class="sn-topo">' + (s._logo ? logo(s._logo) : '') + '</div>' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-fim">' +
          rotulo(s.rotulo) + titulo(s.titulo, 'titulo-compacto', 52) +
          '<div class="sn-preco">' + (p.prefixo ? '<span class="apoio">' + esc(p.prefixo) + '</span>' : '') +
            '<span class="sn-preco-linha"><b class="numeral">' + esc(p.valor || '') + '</b>' + (p.sufixo ? '<span class="apoio">' + esc(p.sufixo) + '</span>' : '') + '</span></div>' +
          '<div class="sn-acao">' + cta(s.cta) + '</div>' +
          (s.legenda ? '<div class="legenda sn-legal">' + esc(s.legenda) + '</div>' : '') +
        '</div></div>' +
      '</div>';
  };

  T['carrossel-capa'] = function (s, F) {
    var W = F.w, H = F.h;
    return '<div class="sn-halo"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: W + 30, cy: -30, r: 230, passo: 70, espessura: 22, de: 90, ate: 180 }) : '') +
      '<div class="sn-safe">' +
        '<div class="sn-topo">' + (s._logo ? logo(s._logo) : '') + '</div>' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-centro">' +
          rotulo(s.rotulo) + titulo(s.titulo, 'display', 80) + apoio(s.apoio) +
        '</div></div>' +
        '<div class="sn-base sn-entre"><span class="chamada sn-deslize">Deslize' + seta() + '</span>' + dots(s.pagina) + '</div>' +
      '</div>';
  };

  T['carrossel-passo'] = function (s, F) {
    var temFoto = s.foto && (s.foto.src || s.foto.assunto);
    var fh = F.h === 1920 ? 640 : (F.h === 1080 ? 0 : 380);
    return '<div class="sn-safe">' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-inicio sn-preenche">' +
          (s.passo ? '<div class="numeral sn-passo">' + esc(s.passo) + '</div>' : '') +
          titulo(s.titulo, 'titulo-compacto', 52) +
          (s.corpo ? '<p class="corpo sn-apoio">' + rich(s.corpo) + '</p>' : '') +
          (temFoto && fh ? foto(s.foto, 'position:relative;width:100%;height:' + px(fh) + ';flex:none;margin-top:auto;', 'gota', 'sd') : '') +
        '</div></div>' +
        '<div class="sn-base sn-entre">' + dots(s.pagina) + (s._logo ? logo(s._logo, 'height:44px') : '') + '</div>' +
      '</div>';
  };

  T['carrossel-fim'] = function (s, F) {
    var W = F.w, H = F.h, p = s.pessoa, ondaAlt = F.mb + 100;
    return '<div class="sn-halo"></div>' +
      onda({ w: W, h: H, altura: ondaAlt, amplitude: 28, cores: s.tema === 'agua' ? ['var(--agua-300)', 'var(--branco)'] : ['var(--grafismo-medio)', 'var(--grafismo-forte)'] }) +
      '<div class="sn-safe" style="bottom:' + px(ondaAlt + 40) + '">' +
        '<div class="sn-topo sn-entre">' + (s._logo ? logo(s._logo) : '<span></span>') + dots(s.pagina) + '</div>' +
        '<div class="sn-main" data-fit-box><div class="sn-stack sn-centro">' +
          (p ? '<div class="sn-pessoa">' + foto(p.foto, 'width:144px;height:144px;flex:none;', 'circulo') +
            '<div><div class="nome">' + esc(p.nome || '') + '</div><div class="legenda">' + esc(p.detalhe || '') + '</div></div></div>' : '') +
          titulo(s.titulo, 'titulo', 60) + apoio(s.apoio) +
          '<div class="sn-acao">' + cta(s.cta) + '</div>' +
        '</div></div>' +
      '</div>';
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
    if (enf.length > 1) av('titulo', 'Use só um trecho em ênfase (*...*) por título.');
    if (enf.length === 1 && words(enf[0]) > 3) av('titulo', 'A ênfase deve ter de 1 a 3 palavras.');
    if (/\*/.test(s.apoio || '') || /\*/.test(s.corpo || '')) av('apoio', 'Ênfase colorida só no título; no apoio, reescreva sem asteriscos.');
    var tudo = [s.rotulo, s.titulo, s.apoio, s.corpo, s.manuscrito, s.cta].map(plain).join(' ');
    var total = words(tudo);
    var teto = /^carrossel/.test(s.modelo) ? 45 : 35;
    if (total > teto) av('texto', total + ' palavras na arte; o teto é ' + teto + '. Leve o resto para a legenda do Instagram.');
    var baixo = tudo.toLowerCase();
    PROIBIDAS.forEach(function (w) { if (baixo.indexOf(w) !== -1) av('texto', '"' + w + '" está fora do vocabulário da marca. Veja o guia de voz.'); });
    if ((tudo.match(/!/g) || []).length > 1) av('texto', 'No máximo um ponto de exclamação por arte.');
    if (/[☀-➿]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/.test(tudo)) av('texto', 'Sem emoji na arte; emoji só na legenda do post.');
    if (s.manuscrito && words(s.manuscrito) > 4) av('manuscrito', 'Manuscrito tem no máximo 4 palavras.');
    if (s.manuscrito && s.modelo !== 'data') av('manuscrito', 'Manuscrito grande é exclusivo do modelo data.');
    var graf = (s.elementos || []).filter(function (e) { return has(['arcos', 'onda', 'linha'], e); });
    if (graf.length > 2) av('elementos', 'No máximo dois grafismos por post.');
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
    if (!s.elementos) s.elementos = m.elementos.slice();
    s._logo = logoDoTema(s.modelo === 'frase-foto' ? 'marinho' : s.tema, s.logo);
    if (s.modelo === 'carrossel-passo' && s.logo == null) s._logo = null;
    return s;
  }

  // Devolve o elemento do post em tamanho real. Não precisa estar no documento.
  function render(spec) {
    var s = normalizar(spec), F = FORMATOS[s.formato];
    var temaTokens = s.modelo === 'frase-foto' ? 'marinho' : s.tema;
    var el = document.createElement('div');
    el.className = 'sn-post sn-' + s.modelo + ' sn-tema-' + s.tema + ' sn-fmt-' + s.formato;
    el.setAttribute('data-theme', temaTokens);
    el.setAttribute('data-modelo', s.modelo);
    el.style.cssText = 'width:' + F.w + 'px;height:' + F.h + 'px;--m:' + F.m + 'px;--mt:' + F.mt + 'px;--mb:' + F.mb + 'px;';
    el.innerHTML = T[s.modelo](s, F);
    return el;
  }

  // Reduz títulos que estouram a área (até o mínimo de cada estilo). Chame com o post no documento.
  function ajustar(post) {
    var alvos = post.querySelectorAll('[data-fit]');
    for (var i = 0; i < alvos.length; i++) {
      var el = alvos[i], box = el.closest('[data-fit-box]');
      if (!box) continue;
      var stack = box.firstElementChild, min = +el.getAttribute('data-fit');
      var size = parseFloat(getComputedStyle(el).fontSize), guarda = 60;
      while (stack.offsetHeight > box.clientHeight + 1 && size > min && guarda--) {
        size -= 2; el.style.fontSize = size + 'px';
      }
    }
    return post;
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
    return moldura;
  }

  function config(o) {
    o = o || {};
    if (o.logos) for (var k in o.logos) cfg.logos[k] = o.logos[k];
    if (o.fotos) for (var f in o.fotos) cfg.fotos[f] = o.fotos[f];
    return cfg;
  }

  root.Sonata = {
    versao: '1.0.0',
    formatos: FORMATOS,
    modelos: MODELOS,
    vocabularioEvitado: PROIBIDAS,
    config: config,
    render: render,
    montar: montar,
    ajustar: ajustar,
    validar: validar,
    elementos: { arcos: arcos, onda: onda, linhaDeSom: linhaDeSom, foto: foto, logo: logo, cta: cta, dots: dots, aspas: aspas }
  };
})(typeof window !== 'undefined' ? window : this);
