/* Velora — site v1. Sem dependências. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  var temIO = 'IntersectionObserver' in window;

  /* ---------- Menu no celular ---------- */
  function iniciarMenu() {
    var botao = doc.querySelector('[data-menu-botao]');
    var menu = doc.querySelector('[data-menu]');
    if (!botao || !menu) return;
    var texto = botao.querySelector('[data-menu-texto]');

    function definir(aberto) {
      botao.setAttribute('aria-expanded', String(aberto));
      menu.hidden = !aberto;
      root.classList.toggle('menu-aberto', aberto);
      if (texto) texto.textContent = aberto ? 'Fechar' : 'Menu';
      if (aberto) {
        var primeiro = menu.querySelector('a');
        if (primeiro) primeiro.focus();
      }
    }

    botao.addEventListener('click', function () {
      definir(botao.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) definir(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
        definir(false);
        botao.focus();
      }
    });
    window.matchMedia('(min-width: 1200px)').addEventListener('change', function (m) {
      if (m.matches) definir(false);
    });
  }

  /* ---------- Um ponto Acid por tela: CTA da navegação recua enquanto o CTA principal está visível ---------- */
  function iniciarCtaDiscreto() {
    var cab = doc.querySelector('[data-cabecalho]');
    var principais = doc.querySelectorAll('[data-cta-principal]');
    if (!cab || !principais.length || !temIO) return;
    var visiveis = new Set();
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) visiveis.add(en.target); else visiveis.delete(en.target);
      });
      cab.classList.toggle('cabecalho--discreto', visiveis.size > 0);
    }, { rootMargin: '-72px 0px 0px 0px' });
    principais.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Navegação: marca a seção em que o leitor está (página única) ---------- */
  function iniciarSecaoAtual() {
    var links = doc.querySelectorAll('[data-nav-secao]');
    if (!links.length || !temIO) return;
    var ids = [];
    links.forEach(function (a) {
      var id = a.getAttribute('data-nav-secao');
      if (ids.indexOf(id) === -1) ids.push(id);
    });
    var secoes = ids.map(function (id) { return doc.getElementById(id); }).filter(Boolean);
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var id = en.target.id;
        links.forEach(function (a) {
          if (a.getAttribute('data-nav-secao') !== id) return;
          if (en.isIntersecting) a.setAttribute('data-atual', ''); else a.removeAttribute('data-atual');
        });
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    secoes.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Entrada de seções e desenho de diagramas ---------- */
  function iniciarEntradas() {
    var alvos = doc.querySelectorAll('.revelar, .desenhar');
    if (!temIO || reduzMovimento.matches) {
      alvos.forEach(function (el) { el.classList.add('is-visivel'); });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visivel');
        io.unobserve(en.target);
        en.target.dispatchEvent(new CustomEvent('velora:visivel'));
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    alvos.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Ciclo do sistema ---------- */
  function iniciarCiclos() {
    doc.querySelectorAll('[data-ciclo]').forEach(function (ciclo) {
      var modo = ciclo.getAttribute('data-modo');
      var padrao = ciclo.getAttribute('data-padrao') || '1';
      var atual = padrao; // etapa "de repouso": a da página ou a da rolagem
      var emFoco = null;

      function aplicar(n) {
        ciclo.setAttribute('data-ativa', n || '');
      }
      function repousar() {
        if (!emFoco) aplicar(atual);
      }

      ciclo.querySelectorAll('[data-no]').forEach(function (no) {
        var n = no.getAttribute('data-no');
        var alvo = no.matches('a') ? no : no.querySelector('a');
        no.addEventListener('mouseenter', function () { aplicar(n); });
        no.addEventListener('mouseleave', repousar);
        if (alvo) {
          alvo.addEventListener('focus', function () { emFoco = n; aplicar(n); });
          alvo.addEventListener('blur', function () { emFoco = null; repousar(); });
        }
      });

      // Abertura: as linhas se desenham em sequência (Inteligência → … → Medição → Inteligência)
      // e só então a etapa 01 acende. Sem repetição automática.
      if (modo === 'abertura' && temIO && !reduzMovimento.matches) {
        aplicar('');
        ciclo.addEventListener('velora:visivel', function () {
          window.setTimeout(function () { if (!emFoco) aplicar(atual); }, 1750);
        }, { once: true });
      }

      // Rolagem: a etapa ativa acompanha o bloco de texto que está no centro da tela.
      if (modo === 'rolagem') {
        var grupo = ciclo.closest('[data-sistema]');
        var blocos = grupo ? grupo.querySelectorAll('[data-etapa-bloco]') : [];
        if (!blocos.length || !temIO) return;
        var marcar = function (n) {
          atual = n;
          blocos.forEach(function (b) { b.classList.toggle('is-ativa', b.getAttribute('data-etapa-bloco') === n); });
          repousar();
        };
        var io = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (en) {
            if (en.isIntersecting) marcar(en.target.getAttribute('data-etapa-bloco'));
          });
        }, { rootMargin: '-48% 0px -48% 0px' });
        blocos.forEach(function (b) { io.observe(b); });
        marcar('1');
      }
    });
  }

  /* ---------- Formulários ---------- */
  function iniciarFormularios() {
    doc.querySelectorAll('[data-form]').forEach(function (form) {
      var status = form.querySelector('[data-status]');
      var botao = form.querySelector('[type="submit"]');
      var campos = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea')).filter(function (c) { return c.name; });

      function marcarCampo(c) {
        var ok = c.checkValidity();
        c.setAttribute('aria-invalid', ok ? 'false' : 'true');
        var caixa = c.closest('.campo');
        if (caixa) caixa.classList.toggle('is-invalido', !ok);
        return ok;
      }
      function mostrar(msg) {
        status.textContent = msg;
      }

      campos.forEach(function (c) {
        var evento = c.tagName === 'SELECT' ? 'change' : 'input';
        c.addEventListener(evento, function () {
          if (c.getAttribute('aria-invalid') === 'true') marcarCampo(c);
          if (!form.querySelector('[aria-invalid="true"]') && status.textContent === form.dataset.msgValidacao) mostrar('');
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var invalidos = campos.filter(function (c) { return !marcarCampo(c); });
        if (invalidos.length) {
          mostrar(form.dataset.msgValidacao);
          invalidos[0].focus();
          return;
        }

        var endpoint = form.getAttribute('data-endpoint');
        botao.disabled = true;
        form.setAttribute('aria-busy', 'true');
        mostrar('');

        var envio;
        if (endpoint) {
          envio = fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
        } else {
          // Modo demonstração: nenhum destino configurado em config.mjs → os dados NÃO são enviados.
          console.warn('[Velora] Formulário "' + form.id + '" sem destino configurado (config.mjs → formularios). Envio simulado; nenhum dado foi enviado.');
          envio = Promise.resolve();
        }

        envio.then(function () {
          form.classList.add('is-enviado');
          mostrar(form.dataset.msgSucesso);
          status.focus();
        }).catch(function () {
          mostrar(form.dataset.msgErro);
          botao.disabled = false;
        }).then(function () {
          form.removeAttribute('aria-busy');
        });
      });
    });
  }

  function iniciar() {
    iniciarMenu();
    iniciarCtaDiscreto();
    iniciarSecaoAtual();
    iniciarEntradas();
    iniciarCiclos();
    iniciarFormularios();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
