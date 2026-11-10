/* Navegação do deck. Sem dependências. */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var deck = doc.getElementById('deck');
  var slides = Array.prototype.slice.call(doc.querySelectorAll('.slide'));
  var total = slides.length;
  var atual = 0;
  var params = new URLSearchParams(location.search);
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var FASES = ['Diagnóstico', 'Preparação', 'Operação'];
  /* Configuração por deck, no <body>: partes do rodapé, parte que contém as fases e texto do topo */
  var PARTES = (body.dataset.partes || 'A Velora|A Talent Four|A proposta|Investimento e projeções').split('|');
  var PARTE_FASES = Number(body.dataset.parteFases || 3);
  var TOPO = body.dataset.topo || 'Velora × Talent Four · Novembro 2026';

  if (params.has('render')) body.classList.add('sem-anim');

  slides.forEach(function (s, i) {
    var fase = Number(s.dataset.fase || 0);
    var parte = Number(s.dataset.parte || 0);

    /* Cabeçalho leve: só o logo da Velora. Rodapé: só o número do slide. */
    var logo = s.classList.contains('escuro') ? 'img/logos/velora-claro.png' : 'img/logos/velora-escuro.png';
    var topo = s.classList.contains('capa') ? '' : '<header class="topo"><img class="topo__logo" src="' + logo + '" alt="Velora"></header>';
    s.insertAdjacentHTML('beforeend', topo + '<footer class="pe"><span class="pe__n">' + pad(i + 1) + '</span></footer>');

    /* Aberturas de parte: índice com a posição atual */
    if (s.classList.contains('divisor') && !s.classList.contains('divisor--fase')) {
      s.insertAdjacentHTML('beforeend', '<ol class="indice">' + PARTES.map(function (nome, k) {
        var sub = k + 1 === PARTE_FASES ? '<small>Diagnóstico · Preparação · Operação</small>' : '';
        return '<li' + (k + 1 === parte ? ' class="on"' : '') + '><span class="mono">' + pad(k + 1) + '</span><span class="t3">' + nome + '</span>' + sub + '</li>';
      }).join('') + '</ol>');
    }
    s.setAttribute('aria-label', (i + 1) + ' de ' + total + ': ' + (s.dataset.nome || ''));
  });

  /* Pontos das faixas de contas */
  doc.querySelectorAll('[data-pontos]').forEach(function (el) {
    el.innerHTML = new Array(Number(el.dataset.pontos) + 1).join('<i></i>');
  });

  function ajustar() {
    var e = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    deck.style.setProperty('--escala', e);
  }

  function ir(i) {
    i = Math.max(0, Math.min(total - 1, i));
    slides[atual].classList.remove('atual');
    slides[atual].setAttribute('aria-hidden', 'true');
    atual = i;
    slides[atual].classList.add('atual');
    slides[atual].removeAttribute('aria-hidden');
    if (!params.has('render')) history.replaceState(null, '', '#' + (atual + 1));
  }

  function visao(ligar) {
    body.classList.toggle('visao', ligar);
    if (ligar) slides[atual].scrollIntoView({ block: 'center' });
  }

  var digitos = '';
  doc.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (body.classList.contains('visao')) {
      if (k === 'g' || k === 'G' || k === 'Escape' || k === 'Enter') { e.preventDefault(); visao(false); }
      return;
    }
    if (/^[0-9]$/.test(k)) { digitos += k; return; }
    if (k === 'Enter' && digitos) { ir(Number(digitos) - 1); digitos = ''; return; }
    digitos = '';
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); ir(atual + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); ir(atual - 1); }
    else if (k === 'Home') { e.preventDefault(); ir(0); }
    else if (k === 'End') { e.preventDefault(); ir(total - 1); }
    else if (k === 'g' || k === 'G') { e.preventDefault(); visao(true); }
    else if (k === 'f' || k === 'F') {
      if (!doc.fullscreenElement) doc.documentElement.requestFullscreen && doc.documentElement.requestFullscreen();
      else doc.exitFullscreen && doc.exitFullscreen();
    }
  });

  deck.addEventListener('click', function (e) {
    var alvo = e.target.closest('.slide');
    if (body.classList.contains('visao')) { if (alvo) { ir(slides.indexOf(alvo)); visao(false); } return; }
    if (window.getSelection && String(window.getSelection())) return;
    ir(e.clientX > window.innerWidth / 2 ? atual + 1 : atual - 1);
  });

  var x0 = null;
  doc.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  doc.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) ir(dx < 0 ? atual + 1 : atual - 1);
    x0 = null;
  }, { passive: true });

  window.addEventListener('resize', ajustar);
  window.addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n) ir(n - 1); });

  slides.forEach(function (s) { s.setAttribute('aria-hidden', 'true'); });
  ajustar();
  var inicial = parseInt(location.hash.slice(1), 10);
  ir(inicial ? inicial - 1 : 0);

  window.deck = { ir: ir, total: total };
})();
