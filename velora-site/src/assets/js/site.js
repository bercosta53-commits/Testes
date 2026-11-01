/* Velora — site (one page) · copy editorial v2. Sem dependências. */
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

  /* ---------- Um ponto Acid por tela: o CTA da navegação recua para contorno enquanto outro foco Acid
     (CTA principal, dado em destaque, etapa acesa, Radar, ponto de partida) está visível ---------- */
  function iniciarCtaDiscreto() {
    var cab = doc.querySelector('[data-cabecalho]');
    var principais = doc.querySelectorAll('[data-cta-principal], [data-foco-acid]');
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

  /* ---------- Circuito do sistema ----------
     Ao entrar na tela, a luz percorre as cinco etapas uma vez (menos de 5 s) e volta a 01.
     Depois, a etapa sob o mouse acende. Todo o texto fica sempre visível: o movimento só mostra o fluxo. */
  function iniciarCircuito() {
    var circuito = doc.querySelector('[data-circuito]');
    if (!circuito) return;
    var etapas = Array.prototype.slice.call(circuito.querySelectorAll('[data-etapa]'));
    var timers = [];
    var PADRAO = '1';

    function acender(n) {
      circuito.setAttribute('data-ativa', n);
      etapas.forEach(function (e) { e.classList.toggle('is-ativa', e.getAttribute('data-etapa') === n); });
    }
    function parar() {
      timers.forEach(window.clearTimeout);
      timers = [];
    }

    etapas.forEach(function (e) {
      e.addEventListener('mouseenter', function () { parar(); acender(e.getAttribute('data-etapa')); });
      e.addEventListener('mouseleave', function () { acender(PADRAO); });
    });

    if (!temIO || reduzMovimento.matches) return;
    circuito.addEventListener('velora:visivel', function () {
      parar();
      acender('');
      for (var i = 1; i <= etapas.length + 1; i++) {
        (function (k) {
          timers.push(window.setTimeout(function () { acender(String(k > etapas.length ? PADRAO : k)); }, 700 + (k - 1) * 760));
        })(i);
      }
    }, { once: true });
  }

  /* ---------- Medição sem dados pessoais (copy v2, §C: visualização, início, envio válido e agenda) ----------
     Eventos vão para window.dataLayer (Google Tag Manager ou equivalente). Só o nome do evento e o id do
     formulário: nunca nome, e-mail, empresa, cargo, telefone ou respostas. */
  function registrar(evento, form) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: evento, form_id: form.id });
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

      var iniciado = false;
      form.addEventListener('focusin', function () {
        if (iniciado) return;
        iniciado = true;
        registrar('velora_form_inicio', form);
      });
      if (temIO) {
        var vista = new IntersectionObserver(function (entradas) {
          if (!entradas.some(function (en) { return en.isIntersecting; })) return;
          registrar('velora_form_visualizacao', form);
          vista.disconnect();
        }, { threshold: 0.3 });
        vista.observe(form);
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
          registrar('velora_form_envio_valido', form);
          form.classList.add('is-enviado');
          mostrar(form.dataset.msgSucesso);
          status.focus();
          // "Agendar" só quando há agenda real: depois do envio validado, a agenda abre (copy v2, §C).
          var agenda = form.getAttribute('data-agenda');
          if (agenda) {
            registrar('velora_agenda_aberta', form);
            window.setTimeout(function () { window.location.assign(agenda); }, 1200);
          }
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
    iniciarCircuito();
    iniciarEntradas();
    iniciarFormularios();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
