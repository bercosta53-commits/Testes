/* @ds-bundle: {"format":4,"namespace":"Sonata","components":[{"name":"FraseFoto"},{"name":"Frase"},{"name":"Educativo"},{"name":"Tecnologia"},{"name":"DataComemorativa"},{"name":"Depoimento"},{"name":"ComAFono"},{"name":"Oferta"},{"name":"Carrossel"},{"name":"Story"},{"name":"Fotografia"},{"name":"Elementos"},{"name":"Assinatura"},{"name":"Grid"},{"name":"Hierarquia"}]} */
/*
 * Sonata Social — Ondas · motor de layout
 * Uma ficha (objeto JSON) descreve o post; Sonata.render() devolve o post pronto,
 * no tamanho real (1080 px de largura), seguindo as regras do design system.
 * Foto sempre sangrada; a legibilidade vem dos véus em degradê da paleta.
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

  // Cores dos véus (RGB dos tokens): marinho-900, agua-900, branco, agua-50, agua-400.
  var VEU_RGB = { marinho: '7,35,58', mar: '0,64,65', claro: '255,255,255', bruma: '241,253,252', agua: '102,210,205' };

  /* ---------- metadados dos modelos (lidos por pessoas e por IA) ---------- */
  var MODELOS = {
    'frase-foto': {
      nome: 'Frase com foto', pilar: 'Afeto',
      quando: 'Vida, convivência, emoção. A foto de pessoas juntas ocupa o post inteiro; a frase pousa no véu.',
      temas: ['marinho', 'mar', 'claro'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'foto'], opcional: ['rotulo', 'apoio', 'veu'],
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
      quando: 'Saúde auditiva explicada com clareza: um fato, um conselho, um porquê. Foto sangrada, texto no véu claro, assinado por uma fono.',
      temas: ['claro', 'bruma'], temaPadrao: 'claro',
      obrigatorio: ['titulo', 'foto'], opcional: ['rotulo', 'apoio', 'legenda', 'veu'],
      elementos: ['arcos'], limites: { titulo: 12, apoio: 22 }
    },
    tecnologia: {
      nome: 'Tecnologia', pilar: 'Tecnologia',
      quando: 'Aparelho, recurso, novidade. O aparelho recortado flutua no centro das ondas, ou uma foto de uso real sob véu marinho.',
      temas: ['marinho', 'mar'], temaPadrao: 'marinho',
      obrigatorio: ['titulo', 'foto'], opcional: ['rotulo', 'chips', 'legenda'],
      elementos: ['arcos'], limites: { titulo: 10, chips: 3 }
    },
    data: {
      nome: 'Data comemorativa', pilar: 'Afeto',
      quando: 'Dia dos Avós, Dia das Mães, Dia do Idoso, Natal, Dia do Gaúcho. A foto ocupa o post e uma onda de cor sobe da base com o manuscrito.',
      temas: ['agua', 'bruma', 'mar'], temaPadrao: 'agua',
      obrigatorio: ['rotulo', 'manuscrito', 'foto'], opcional: ['apoio'],
      elementos: ['onda'], limites: { manuscrito: 4, apoio: 16 }
    },
    depoimento: {
      nome: 'Depoimento', pilar: 'Sonata',
      quando: 'A voz de quem voltou a ouvir. Com foto autorizada, a pessoa ocupa o post; sem foto, a frase ocupa o espaço. Sempre com nome real e detalhe.',
      temas: ['bruma', 'claro', 'marinho'], temaPadrao: 'bruma',
      obrigatorio: ['titulo', 'pessoa'], opcional: ['veu'],
      elementos: ['arcos'], limites: { titulo: 32 }
    },
    fono: {
      nome: 'Com a fono', pilar: 'Sonata',
      quando: 'As sócias falando de perto: dica, bastidor, opinião profissional. A foto da fono ocupa o post; o texto pousa no véu claro.',
      temas: ['claro', 'bruma'], temaPadrao: 'claro',
      obrigatorio: ['titulo', 'pessoa'], opcional: ['rotulo', 'apoio', 'veu'],
      elementos: ['arcos'], limites: { titulo: 12, apoio: 20 }
    },
    oferta: {
      nome: 'Oferta', pilar: 'Sonata',
      quando: 'Condição comercial real (parcelamento, preço de entrada, teste sem custo). Com foto de pessoas sob véu marinho, ou só cor. No máximo 1 em cada 5 posts.',
      temas: ['marinho', 'mar'], temaPadrao: 'marinho',
      obrigatorio: ['preco', 'cta'], opcional: ['rotulo', 'titulo', 'selo', 'legenda', 'foto'],
      elementos: ['arcos'], limites: { titulo: 10 }
    },
    'carrossel-capa': {
      nome: 'Carrossel · capa', pilar: 'Cuidado',
      quando: 'Primeira lâmina: promete o que o carrossel entrega. Com foto sangrada sob véu, ou só cor.',
      temas: ['mar', 'marinho', 'bruma'], temaPadrao: 'mar',
      obrigatorio: ['titulo', 'pagina'], opcional: ['rotulo', 'apoio', 'foto'],
      elementos: ['arcos'], limites: { titulo: 10, apoio: 14 }
    },
    'carrossel-passo': {
      nome: 'Carrossel · passo', pilar: 'Cuidado',
      quando: 'Miolo: um passo ou ideia por lâmina, numerado só quando a ordem importa. A foto, se houver, sobe da base numa onda.',
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
  function px(n) { return Math.round(n) + 'px'; }
  function has(list, x) { return list.indexOf(x) !== -1; }
  function seeded(seed) {
    var s = seed || 7;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function pct(v, total, padrao) {
    var n = parseFloat(v);
    return isNaN(n) ? padrao * total : n / 100 * total;
  }

  /* ---------- elementos ---------- */

  // Arcos de escuta: as ondas que abraçam o "S" do logo. Três traços concêntricos,
  // do mais forte (dentro) ao mais suave (fora), com pontas arredondadas.
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

  // Ondas no foco: arcos finos ao redor de quem escuta (ponto em % da foto, ex.: "70% 32%").
  // Abrem para o lado do texto, como o som chegando à pessoa.
  function ondasNoFoco(F, ponto, cores, opacidades) {
    var p = String(ponto).split(/\s+/);
    var cx = pct(p[0], F.w, 0.7), cy = pct(p[1], F.h, 0.3);
    var esquerda = cx > F.w / 2;
    return arcos({ w: F.w, h: F.h, cx: cx, cy: cy, r: 150, passo: 58, espessura: 9,
      de: esquerda ? 145 : -55, ate: esquerda ? 235 : 35,
      cores: cores || ['var(--branco)'], opacidades: opacidades || [0.9, 0.6, 0.32] });
  }

  // Véu: degradê suave (curva senoidal) da cor do tema para o transparente.
  // lado: base | topo | esquerda | direita. o: { plato, alcance, forca } em frações do canvas.
  function veu(lado, tema, o) {
    o = o || {};
    var rgb = VEU_RGB[tema] || VEU_RGB.marinho;
    var plato = o.plato == null ? 0.2 : o.plato, alcance = o.alcance == null ? 0.75 : o.alcance, forca = o.forca == null ? 0.94 : o.forca;
    var dir = { base: 'to top', topo: 'to bottom', esquerda: 'to right', direita: 'to left' }[lado] || 'to top';
    var stops = ['rgba(' + rgb + ',' + forca + ') 0%', 'rgba(' + rgb + ',' + forca + ') ' + (plato * 100).toFixed(1) + '%'];
    for (var i = 1; i <= 10; i++) {
      var t = i / 10, a = forca * (1 - (1 - Math.cos(Math.PI * t)) / 2);
      stops.push('rgba(' + rgb + ',' + a.toFixed(3) + ') ' + ((plato + t * (alcance - plato)) * 100).toFixed(1) + '%');
    }
    return '<div class="sn-veu" style="background:linear-gradient(' + dir + ',' + stops.join(',') + ')"></div>';
  }

  // Onda: faixa fluida em duas camadas. Na base de posts de cor, ou subindo sobre a foto (campo).
  function caminhoOnda(W, H, base, amp, fase, compr) {
    var d = 'M0 ' + H;
    for (var x = 0; x <= W; x += 12) d += 'L' + x + ' ' + (base + amp * Math.sin((x / compr) * Math.PI * 2 + fase)).toFixed(1);
    return d + 'L' + W + ' ' + H + 'Z';
  }
  // O mesmo desenho, preenchendo do topo até a onda (costura entre cor e foto que sobe da base).
  function caminhoOndaTopo(W, base, amp, fase, compr) {
    var d = 'M0 0';
    for (var x = 0; x <= W; x += 12) d += 'L' + x + ' ' + (base + amp * Math.sin((x / compr) * Math.PI * 2 + fase)).toFixed(1);
    return d + 'L' + W + ' 0Z';
  }
  function onda(o) {
    var W = o.w, H = o.h, alt = o.altura || 220, A = o.amplitude || 34;
    var cores = o.cores || ['var(--grafismo-medio)', 'var(--grafismo-forte)'];
    var op = o.opacidades || [1, 1];
    return '<svg class="sn-el sn-onda" aria-hidden="true" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      (o.defs || '') +
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

  function aspas(tam) {
    tam = tam || 112;
    return '<svg class="sn-aspas" aria-hidden="true" viewBox="0 0 100 80" width="' + tam + '" height="' + Math.round(tam * 0.8) + '"><path fill="var(--grafismo-forte)" d="M0 80V50C0 22 14 5 40 0l5 12C31 18 25 28 25 40h20v40zm55 0V50C55 22 69 5 95 0l5 12C86 18 80 28 80 40h20v40z"/></svg>';
  }
  function seta() {
    return '<svg class="sn-seta" aria-hidden="true" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }

  function srcFoto(src) { return src ? (cfg.fotos[src] || src) : ''; }

  // Foto sangrada: ocupa toda a área dada, sem moldura. Sem src, um espaço reservado com o briefing.
  function foto(f, estilo) {
    f = f || {};
    var src = srcFoto(f.src);
    var inner = src
      ? '<img src="' + esc(src) + '" alt="' + esc(f.assunto || '') + '" style="object-position:' + esc(f.foco || '50% 35%') + '">'
      : '<div class="sn-foto-vazia"><span class="rotulo">Foto</span><span class="legenda">' + esc(f.assunto || 'Pessoas 60+ em convívio, luz natural') + '</span></div>';
    return '<div class="sn-foto" style="' + (estilo || 'position:absolute;inset:0;') + '">' + inner + '</div>';
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
  function assinatura(nome, detalhe) {
    return nome ? '<div class="sn-quem"><div class="nome">' + esc(nome) + '</div>' + (detalhe ? '<div class="legenda">' + esc(detalhe) + '</div>' : '') + '</div>' : '';
  }
  function topo(s) { return '<div class="sn-topo">' + (s._logo ? logo(s._logo) : '') + '</div>'; }
  function pilha(classe, conteudo, largura) {
    return '<div class="sn-main" data-fit-box><div class="sn-stack ' + classe + '"' + (largura ? ' style="max-width:' + px(largura) + '"' : '') + '>' + conteudo + '</div></div>';
  }
  // Coluna de texto ao lado da foto: ~56% do canvas no feed, largura total no story.
  function colunaTexto(F) { return F.h === 1920 ? null : Math.round(F.w * 0.56); }

  /* ---------- modelos ---------- */
  var T = {};

  T['frase-foto'] = function (s, F) {
    var lado = s.veu || 'base', tema = s.tema;
    var col = lado === 'esquerda' && F.h !== 1920 ? Math.round(F.w * 0.6) : null;
    return foto(s.foto) +
      (lado === 'esquerda'
        ? veu('esquerda', tema, { plato: 0.22, alcance: 0.82, forca: 0.95 })
        : veu('base', tema, { plato: F.h === 1920 ? 0.26 : 0.16, alcance: 0.72, forca: 0.94 })) +
      (tema !== 'claro' ? veu('topo', 'marinho', { plato: 0, alcance: 0.26, forca: 0.55 }) : '') +
      (s.foto && s.foto.ondas ? ondasNoFoco(F, s.foto.ondas) :
        has(s.elementos, 'arcos') ? arcos({ w: F.w, h: F.h, cx: F.w + 40, cy: -40, r: 250, passo: 64, espessura: 10, de: 90, ate: 180,
          cores: ['var(--branco)'], opacidades: [0.85, 0.5, 0.25] }) : '') +
      '<div class="sn-safe">' + topo(s) +
        pilha(lado === 'esquerda' ? 'sn-centro' : 'sn-fim', rotulo(s.rotulo) + titulo(s.titulo, 'display', 72) + apoio(s.apoio), col) +
      '</div>';
  };

  T.frase = function (s, F) {
    var W = F.w, H = F.h, temOnda = has(s.elementos, 'onda');
    return '<div class="sn-halo"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: W + 30, cy: -30, r: 230, passo: 70, espessura: 20, de: 90, ate: 180 }) : '') +
      (temOnda ? onda({ w: W, h: H, altura: F.mb + 120 }) : '') +
      '<div class="sn-safe"' + (temOnda ? ' style="bottom:' + px(F.mb + 150) + '"' : '') + '>' + topo(s) +
        pilha('sn-centro', rotulo(s.rotulo) + titulo(s.titulo, 'display', 80) + apoio(s.apoio)) +
        (has(s.elementos, 'linha') ? '<div class="sn-base">' + linhaDeSom({ largura: W - 2 * F.m, altura: 112 }) + '</div>' : '') +
      '</div>';
  };

  // Foto sangrada + véu claro: educativo e fono compartilham a composição.
  function fotoComVeuClaro(s, F, fotoFicha, conteudoTopo, rodape) {
    var story = F.h === 1920, lado = s.veu || (story ? 'base' : 'esquerda');
    var v = lado === 'base' ? veu('base', s.tema, { plato: story ? 0.3 : 0.34, alcance: story ? 0.66 : 0.7, forca: 0.98 })
      : lado === 'topo' ? veu('topo', s.tema, { plato: 0.3, alcance: 0.66, forca: 0.97 })
      : veu('esquerda', s.tema, { plato: 0.3, alcance: 0.8, forca: 0.97 });
    var col = lado === 'esquerda' ? colunaTexto(F) : null;
    return foto(fotoFicha) + v +
      (lado !== 'topo' ? veu('topo', s.tema, { plato: 0, alcance: F.h === 1920 ? 0.3 : 0.2, forca: 0.85 }) : '') +
      (fotoFicha && fotoFicha.ondas ? ondasNoFoco(F, fotoFicha.ondas) : '') +
      '<div class="sn-safe">' + topo(s) +
        pilha(lado === 'base' ? 'sn-fim' : 'sn-inicio', conteudoTopo, col) +
        (rodape ? '<div class="sn-base">' + rodape + '</div>' : '') +
      '</div>';
  }

  T.educativo = function (s, F) {
    return fotoComVeuClaro(s, F, s.foto,
      rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 60) + apoio(s.apoio),
      s.legenda ? '<div class="legenda sn-assina">' + rich(s.legenda) + '</div>' : '');
  };

  T.fono = function (s, F) {
    var p = s.pessoa || {};
    var s2 = {}; for (var k in s) s2[k] = s[k];
    if (!s.veu) s2.veu = 'base';
    return fotoComVeuClaro(s2, F, p.foto,
      rotulo(s.rotulo || 'Com a fono') + titulo(s.titulo, 'titulo', 56) + apoio(s.apoio) +
      assinatura(p.nome || 'Nome da fono', p.detalhe || 'Fonoaudióloga · sócia da Sonata'), '');
  };

  T.tecnologia = function (s, F) {
    var W = F.w, H = F.h, f = s.foto || {};
    if (!f.recorte) {
      return foto(f) + veu('base', s.tema, { plato: 0.2, alcance: 0.7, forca: 0.95 }) +
        veu('topo', 'marinho', { plato: 0, alcance: 0.26, forca: 0.55 }) +
        (f.ondas ? ondasNoFoco(F, f.ondas, ['var(--agua-300)', 'var(--branco)', 'var(--branco)']) : '') +
        '<div class="sn-safe">' + topo(s) + pilha('sn-fim', conteudoTec(s)) + '</div>';
    }
    var d = F.h === 1920 ? 760 : (F.h === 1080 ? 480 : 640);
    var cx = W * 0.6, cy = F.mt + (F.h === 1080 ? 30 : 60) + d / 2;
    return '<div class="sn-halo" style="background:radial-gradient(circle at ' + px(cx) + ' ' + px(cy) + ', var(--fundo-2) 0, transparent ' + px(d * 0.95) + ')"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: cx, cy: cy, r: d * 0.42, passo: d * 0.11, espessura: 6, de: 0, ate: 360,
        cores: ['var(--agua-400)'], opacidades: [0.75, 0.45, 0.22] }) : '') +
      recorte(f, 'position:absolute;left:' + px(cx - d / 2) + ';top:' + px(cy - d / 2) + ';width:' + px(d) + ';height:' + px(d) + ';object-fit:contain;') +
      '<div class="sn-safe">' + topo(s) + pilha('sn-fim', conteudoTec(s)) + '</div>';
  };
  function conteudoTec(s) {
    return rotulo(s.rotulo) + titulo(s.titulo, 'titulo', 60) +
      (s.chips && s.chips.length ? '<div class="sn-chips">' + s.chips.slice(0, 3).map(function (c) { return '<span class="sn-chip chamada"><i></i>' + esc(c) + '</span>'; }).join('') + '</div>' : '') +
      (s.legenda ? '<div class="legenda sn-legal">' + esc(s.legenda) + '</div>' : '');
  }

  T.data = function (s, F) {
    var W = F.w, H = F.h;
    var campo = F.h === 1920 ? 820 : (F.h === 1080 ? 470 : 590);
    var base = H - campo;
    var fill = { agua: 'var(--agua-400)', bruma: 'var(--agua-50)', mar: 'url(#sn-mar)' }[s.tema] || 'var(--agua-400)';
    var tras = { agua: 'var(--agua-200)', bruma: 'var(--branco)', mar: 'var(--agua-600)' }[s.tema] || 'var(--agua-200)';
    var defs = '<defs><linearGradient id="sn-mar" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="var(--agua-800)"/><stop offset="1" stop-color="var(--marinho-900)"/></linearGradient></defs>';
    return foto(s.foto, 'position:absolute;left:0;right:0;top:0;height:' + px(base + 120) + ';') +
      '<svg class="sn-el sn-campo" aria-hidden="true" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + defs +
        '<path d="' + caminhoOnda(W, H, base - 18, 30, 0.5, W * 1.25) + '" fill="' + tras + '" fill-opacity="0.85"/>' +
        '<path d="' + caminhoOnda(W, H, base + 16, 26, 2.2, W * 1.05) + '" fill="' + fill + '"/></svg>' +
      '<div class="sn-safe" style="top:' + px(base + 96) + '">' +
        pilha('sn-inicio', rotulo(s.rotulo) +
          (s.manuscrito ? '<div class="manuscrito sn-manuscrito" data-fit="120">' + esc(s.manuscrito) + '</div>' : '') +
          apoio(s.apoio)) +
        (s._logo ? '<div class="sn-base">' + logo(s._logo) + '</div>' : '') +
      '</div>';
  };

  T.depoimento = function (s, F) {
    var W = F.w, H = F.h, p = s.pessoa || {};
    if (p.foto && (p.foto.src || p.foto.assunto)) {
      var lado = s.veu || (F.h === 1920 ? 'base' : 'esquerda'), escuro = s.tema === 'marinho';
      return foto(p.foto) +
        veu(lado, s.tema, lado === 'base' ? { plato: 0.24, alcance: 0.72, forca: 0.96 } : { plato: 0.3, alcance: 0.82, forca: 0.97 }) +
        (escuro ? '' : '') +
        '<div class="sn-safe">' + topo(s) +
          pilha(lado === 'base' ? 'sn-fim' : 'sn-centro', aspas(84) +
            '<blockquote class="titulo-compacto sn-titulo sn-citacao" data-fit="44">' + rich(s.titulo) + '</blockquote>' +
            assinatura(p.nome, p.detalhe), lado === 'esquerda' ? colunaTexto(F) : null) +
        '</div>';
    }
    return '<div class="sn-halo"></div>' +
      (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: W + 30, cy: -30, r: 230, passo: 70, espessura: 20, de: 90, ate: 180 }) : '') +
      '<div class="sn-safe">' + '<div class="sn-topo">' + aspas(120) + '</div>' +
        pilha('sn-centro', '<blockquote class="titulo-compacto sn-titulo sn-citacao" data-fit="46">' + rich(s.titulo) + '</blockquote>' +
          assinatura(p.nome || 'Nome da paciente', p.detalhe || 'Paciente Sonata')) +
        (s._logo ? '<div class="sn-base" style="justify-content:flex-end">' + logo(s._logo, 'height:52px') + '</div>' : '') +
      '</div>';
  };

  T.oferta = function (s, F) {
    var W = F.w, H = F.h, sd = 248, sx = W - F.m - sd, sy = F.mt + (F.h === 1920 ? 40 : 0);
    var p = s.preco || {}, se = s.selo, comFoto = s.foto && (s.foto.src || s.foto.assunto);
    var fundo = comFoto
      ? foto(s.foto) + veu(F.h === 1920 ? 'base' : 'esquerda', s.tema, F.h === 1920 ? { plato: 0.3, alcance: 0.75, forca: 0.95 } : { plato: 0.34, alcance: 0.86, forca: 0.95 }) +
        veu('topo', 'marinho', { plato: 0, alcance: 0.26, forca: 0.55 })
      : '<div class="sn-halo"></div>' +
        (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: sx + sd / 2, cy: sy + sd / 2, r: sd / 2 + 40, passo: 44, espessura: 14, de: 100, ate: 200 }) : '');
    return fundo +
      (se ? '<div class="sn-selo" style="left:' + px(sx) + ';top:' + px(sy) + ';width:' + px(sd) + ';height:' + px(sd) + '">' +
        '<span class="chamada">' + esc(se.topo || '') + '</span><b class="numeral">' + esc(se.destaque || '') + '</b><span class="chamada">' + esc(se.base || '') + '</span></div>' : '') +
      '<div class="sn-safe">' + topo(s) +
        pilha('sn-fim', rotulo(s.rotulo) + titulo(s.titulo, 'titulo-compacto', 52) +
          '<div class="sn-preco">' + (p.prefixo ? '<span class="apoio">' + esc(p.prefixo) + '</span>' : '') +
            '<span class="sn-preco-linha"><b class="numeral">' + esc(p.valor || '') + '</b>' + (p.sufixo ? '<span class="apoio">' + esc(p.sufixo) + '</span>' : '') + '</span></div>' +
          '<div class="sn-acao">' + cta(s.cta) + '</div>' +
          (s.legenda ? '<div class="legenda sn-legal">' + esc(s.legenda) + '</div>' : ''), comFoto && F.h !== 1920 ? Math.round(W * 0.62) : null) +
      '</div>';
  };

  T['carrossel-capa'] = function (s, F) {
    var W = F.w, H = F.h, comFoto = s.foto && (s.foto.src || s.foto.assunto);
    var fundo = comFoto
      ? foto(s.foto) + veu('base', s.tema === 'bruma' ? 'bruma' : s.tema, { plato: 0.3, alcance: 0.84, forca: 0.96 }) +
        veu('topo', 'marinho', { plato: 0, alcance: 0.26, forca: 0.55 }) +
        (s.foto.ondas ? ondasNoFoco(F, s.foto.ondas) : '')
      : '<div class="sn-halo"></div>' +
        (has(s.elementos, 'arcos') ? arcos({ w: W, h: H, cx: W + 30, cy: -30, r: 230, passo: 70, espessura: 20, de: 90, ate: 180 }) : '');
    return fundo +
      '<div class="sn-safe">' + topo(s) +
        pilha(comFoto ? 'sn-fim' : 'sn-centro', rotulo(s.rotulo) + titulo(s.titulo, 'display', 80) + apoio(s.apoio)) +
        '<div class="sn-base sn-entre"><span class="chamada sn-deslize">Deslize' + seta() + '</span>' + dots(s.pagina) + '</div>' +
      '</div>';
  };

  T['carrossel-passo'] = function (s, F) {
    var W = F.w, H = F.h, temFoto = s.foto && (s.foto.src || s.foto.assunto);
    var fh = F.h === 1920 ? 860 : (F.h === 1080 ? 0 : 560), y0 = H - fh;
    return (temFoto && fh ? foto(s.foto, 'position:absolute;left:0;right:0;bottom:0;height:' + px(fh + 60) + ';') +
        '<svg class="sn-el" aria-hidden="true" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><path d="' +
          caminhoOndaTopo(W, y0 + 10, 26, 1.2, W * 1.1) + '" fill="var(--fundo)"/></svg>' : '') +
      '<div class="sn-safe"' + (temFoto && fh ? ' style="bottom:' + px(fh + 40) + '"' : '') + '>' +
        pilha('sn-inicio', (s.passo ? '<div class="numeral sn-passo">' + esc(s.passo) + '</div>' : '') +
          titulo(s.titulo, 'titulo-compacto', 52) + (s.corpo ? '<p class="corpo sn-apoio">' + rich(s.corpo) + '</p>' : '')) +
      '</div>' +
      '<div class="sn-rodape-carrossel" style="left:' + px(F.m) + ';right:' + px(F.m) + ';bottom:' + px(F.mb) + '">' + dots(s.pagina) + (s._logo ? logo(s._logo, 'height:44px') : '') + '</div>';
  };

  T['carrossel-fim'] = function (s, F) {
    var W = F.w, H = F.h, p = s.pessoa, comFoto = p && p.foto && (p.foto.src || p.foto.assunto);
    if (comFoto) {
      var lado = s.veu || (F.h === 1920 ? 'base' : 'esquerda');
      return foto(p.foto) + veu(lado, s.tema, lado === 'base' ? { plato: 0.3, alcance: 0.75, forca: 0.97 } : { plato: 0.34, alcance: 0.84, forca: 0.97 }) +
        '<div class="sn-safe"><div class="sn-topo sn-entre">' + (s._logo ? logo(s._logo) : '<span></span>') + dots(s.pagina) + '</div>' +
          pilha(lado === 'base' ? 'sn-fim' : 'sn-centro', titulo(s.titulo, 'titulo', 60) + apoio(s.apoio) + '<div class="sn-acao">' + cta(s.cta) + '</div>' +
            assinatura(p.nome, p.detalhe), lado === 'esquerda' ? Math.round(W * 0.58) : null) +
        '</div>';
    }
    var ondaAlt = F.mb + 100;
    return '<div class="sn-halo"></div>' +
      onda({ w: W, h: H, altura: ondaAlt, amplitude: 28, cores: s.tema === 'agua' ? ['var(--agua-300)', 'var(--branco)'] : ['var(--grafismo-medio)', 'var(--grafismo-forte)'] }) +
      '<div class="sn-safe" style="bottom:' + px(ondaAlt + 40) + '"><div class="sn-topo sn-entre">' + (s._logo ? logo(s._logo) : '<span></span>') + dots(s.pagina) + '</div>' +
        pilha('sn-centro', titulo(s.titulo, 'titulo', 60) + apoio(s.apoio) + '<div class="sn-acao">' + cta(s.cta) + '</div>') +
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
    if (s.veu && !has(['base', 'esquerda', 'topo'], s.veu)) av('veu', 'Véu aceita base, esquerda ou topo.');
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
    s._logo = logoDoTema(s.tema, s.logo);
    if (s.modelo === 'carrossel-passo' && s.logo == null) s._logo = null;
    return s;
  }

  // Devolve o elemento do post em tamanho real. Não precisa estar no documento.
  function render(spec) {
    var s = normalizar(spec), F = FORMATOS[s.formato];
    var el = document.createElement('div');
    el.className = 'sn-post sn-' + s.modelo + ' sn-tema-' + s.tema + ' sn-fmt-' + s.formato;
    el.setAttribute('data-theme', s.tema);
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
    versao: '2.0.0',
    formatos: FORMATOS,
    modelos: MODELOS,
    vocabularioEvitado: PROIBIDAS,
    config: config,
    render: render,
    montar: montar,
    ajustar: ajustar,
    validar: validar,
    elementos: { arcos: arcos, ondasNoFoco: ondasNoFoco, veu: veu, onda: onda, linhaDeSom: linhaDeSom, foto: foto, recorte: recorte, logo: logo, cta: cta, dots: dots, aspas: aspas }
  };
})(typeof window !== 'undefined' ? window : this);
