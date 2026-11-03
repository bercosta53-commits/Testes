/* ==========================================================================
   Grêmio Náutico União · LP de novos associados
   Comportamentos: WhatsApp com origem, barra fixa, menu, sedes, formulário
   alternativo e eventos de mensuração (dataLayer).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Configuração (validar com o clube antes de publicar) ---------- */
  var CONFIG = Object.assign({
    // PENDENTE: confirmar o WhatsApp oficial da equipe de associação.
    whatsappNumber: '5551992387668',
    whatsappMessage: 'Olá! Quero conhecer melhor o Grêmio Náutico União e entender as opções de associação. Podem me orientar?',
    // PENDENTE: endpoint do CRM/atendimento. Vazio = envio simulado (protótipo).
    formEndpoint: '',
    // PENDENTE: URL da política de privacidade do clube.
    privacyUrl: '',
    campaign: 'lp_verao_encontros',
    // Modo protótipo de revisão: botões de WhatsApp mostram um aviso em vez de abrir a conversa.
    prototipo: false,
    foundingYear: 1906,
    anniversaryMonth: 3, // abril (0 = janeiro)
    debug: /[?&]debug\b/.test(location.search)
  }, window.GNU_LP_CONFIG || {});

  var root = document.documentElement;
  var heroVariant = root.getAttribute('data-hero') || 'full';
  var ctaVariant = root.getAttribute('data-cta') || 'conhecer';
  var barVariant = root.hasAttribute('data-barra') ? 'imediata' : 'apos_hero';

  /* ---------- Mensuração ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    var payload = Object.assign({
      event: event,
      campaign: CONFIG.campaign,
      hero_variant: heroVariant,
      cta_variant: ctaVariant
    }, data || {});
    window.dataLayer.push(payload);
    if (CONFIG.debug) console.info('[GNU LP]', event, payload);
  }

  function once(fn) {
    var done = false;
    return function () { if (!done) { done = true; fn.apply(this, arguments); } };
  }

  function observeOnce(elements, threshold, callback) {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          callback(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: threshold });
    elements.forEach(function (el) { io.observe(el); });
  }

  track('lp_view', { bar_variant: barVariant });

  /* ---------- Links do WhatsApp ---------- */
  var waHref = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(CONFIG.whatsappMessage);

  // Protótipo: aviso no lugar da conversa real
  var notice = CONFIG.prototipo ? document.querySelector('[data-proto-notice]') : null;
  var noticeReturn = null;
  function openNotice(link) {
    notice.querySelector('[data-proto-origin]').textContent = link.getAttribute('data-placement') || '';
    notice.hidden = false;
    noticeReturn = link;
    notice.querySelector('[data-proto-close]').focus();
  }
  function closeNotice() {
    notice.hidden = true;
    if (noticeReturn && noticeReturn.offsetParent !== null) noticeReturn.focus();
    noticeReturn = null;
  }
  if (notice) {
    notice.querySelector('[data-proto-close]').addEventListener('click', closeNotice);
    notice.addEventListener('click', function (e) { if (e.target === notice) closeNotice(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !notice.hidden) closeNotice(); });
  }

  document.querySelectorAll('[data-wa]').forEach(function (link) {
    if (notice) {
      link.href = '#whatsapp';
      link.removeAttribute('target');
      link.addEventListener('click', function (e) { e.preventDefault(); openNotice(link); });
    } else {
      link.href = waHref;
      link.target = '_blank';
      link.rel = 'noopener';
    }
    link.addEventListener('click', function () {
      var placement = link.getAttribute('data-placement') || 'indefinido';
      var label = link.textContent.replace(/\s+/g, ' ').trim();
      var visibleLabel = link.querySelector('.cta-label');
      if (visibleLabel) {
        var shown = Array.prototype.find.call(link.querySelectorAll('.cta-label'), function (el) {
          return el.offsetParent !== null;
        });
        if (shown) label = shown.textContent.trim();
      }
      if (placement === 'hero') track('hero_cta_click', { placement: placement, cta_label: label });
      track('whatsapp_click', { placement: placement, cta_label: label });
    });
  });

  /* ---------- Política de privacidade ---------- */
  document.querySelectorAll('[data-privacy-link]').forEach(function (link) {
    if (CONFIG.privacyUrl) {
      link.href = CONFIG.privacyUrl;
      link.target = '_blank';
      link.rel = 'noopener';
    } else {
      link.addEventListener('click', function (e) { e.preventDefault(); });
      link.title = 'Link da política de privacidade pendente de validação com o clube';
    }
  });

  /* ---------- Cabeçalho: superfície branca ao rolar ---------- */
  var header = document.querySelector('[data-header]');
  var ticking = false;
  function updateHeader() {
    header.classList.toggle('is-solid', window.scrollY > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateHeader); }
  }, { passive: true });
  updateHeader();

  /* ---------- Menu compacto (celular/tablet) ---------- */
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  var menuLabel = document.querySelector('[data-menu-label]');
  var menuOpen = false;

  function setMenu(open, returnFocus) {
    menuOpen = open;
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Fechar' : 'Menu';
    header.classList.toggle('is-menu-open', open);
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else if (returnFocus) {
      menuToggle.focus();
    }
    updateBar();
  }

  menuToggle.addEventListener('click', function () { setMenu(!menuOpen); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) setMenu(false, true);
  });
  document.addEventListener('click', function (e) {
    if (menuOpen && !header.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
    if (mq.matches && menuOpen) setMenu(false);
  });

  /* ---------- WhatsApp flutuante (canto inferior direito) ---------- */
  var bar = document.querySelector('[data-wa-bar]');
  var mobileMq = window.matchMedia('(max-width: 767px)');
  var heroCta = document.querySelector('[data-hero-cta]');
  var heroCtaPassed = barVariant === 'imediata';
  var blockers = new Set();

  function updateBar() {
    var show = heroCtaPassed && blockers.size === 0 && !menuOpen;
    bar.classList.toggle('is-visible', show);
    root.classList.toggle('has-wa-bar', show);
    bar.setAttribute('aria-hidden', String(!show));
    if (show) bar.removeAttribute('inert'); else bar.setAttribute('inert', '');
  }

  if ('IntersectionObserver' in window) {
    // Entra depois que o CTA do hero sai da tela por cima.
    if (heroCta && barVariant !== 'imediata') {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          heroCtaPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          updateBar();
        });
      }).observe(heroCta);
    }
    // Some quando outro CTA de WhatsApp ou o rodapé estão na tela, para não competir nem cobrir.
    var blockerIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) blockers.add(entry.target); else blockers.delete(entry.target);
      });
      updateBar();
    });
    document.querySelectorAll('[data-bar-blocker]').forEach(function (el) { blockerIo.observe(el); });
  }
  updateBar();

  // Celular: rolando para baixo, o botão vira só o ícone; ao subir ou parar de rolar, a frase volta.
  var lastY = window.scrollY;
  var idleTimer;
  function setCompact(on) { bar.classList.toggle('is-compact', on); }
  window.addEventListener('scroll', function () {
    if (!mobileMq.matches) { setCompact(false); return; }
    var y = window.scrollY;
    if (y > lastY + 8) setCompact(true);
    else if (y < lastY - 8) setCompact(false);
    lastY = y;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { setCompact(false); }, 1400);
  }, { passive: true });
  mobileMq.addEventListener('change', function () { setCompact(false); });

  /* ---------- Sedes: faixa em foco abre no desktop ---------- */
  var sedeList = document.querySelector('[data-sedes]');
  if (sedeList) {
    var sedes = Array.prototype.slice.call(sedeList.querySelectorAll('.sede'));
    var hoverTimer;
    var activate = function (sede) {
      sedes.forEach(function (s) { s.classList.toggle('is-active', s === sede); });
    };
    sedes.forEach(function (sede) {
      sede.addEventListener('mouseenter', function () {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () { activate(sede); }, 110);
      });
      sede.addEventListener('mouseleave', function () { clearTimeout(hoverTimer); });
      sede.addEventListener('focusin', function () { activate(sede); });
      sede.addEventListener('click', function (e) {
        if (!e.target.closest('a')) activate(sede);
      });
      sede.querySelector('.sede__map').addEventListener('click', function () {
        track('sede_location_click', { sede: sede.getAttribute('data-sede') });
      });
    });
    observeOnce(sedes, 0.5, function (sede) {
      track('sede_view', { sede: sede.getAttribute('data-sede') });
    });
  }

  /* ---------- Chegada ao bloco de associação ---------- */
  var assoc = document.querySelector('[data-associacao]');
  if (assoc) observeOnce([assoc], 0.25, function () { track('association_section_view'); });

  /* ---------- Idade do clube (evita peça desatualizada) ---------- */
  (function () {
    var now = new Date();
    var age = now.getFullYear() - CONFIG.foundingYear - (now.getMonth() < CONFIG.anniversaryMonth ? 1 : 0);
    document.querySelectorAll('[data-club-age]').forEach(function (el) { el.textContent = String(age); });
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(now.getFullYear()); });
  })();

  /* ---------- Revelação sutil ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIo.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealIo.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Movimento: fotos que acomodam e o "120" que conta ---------- */
  var motionOk = root.classList.contains('motion');
  var framed = Array.prototype.map.call(document.querySelectorAll('.frame'), function (f) { return f.parentElement; });
  if ('IntersectionObserver' in window) {
    var settleIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-settled');
          settleIo.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    framed.forEach(function (el) { settleIo.observe(el); });

    var counter = document.querySelector('[data-countup]');
    if (counter && motionOk) {
      var countIo = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        countIo.disconnect();
        var target = parseInt(counter.textContent, 10);
        if (!target) return;
        var t0 = null, dur = 1400;
        counter.textContent = '0';
        (function tick(ts) {
          if (t0 === null) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - k, 3);
          counter.textContent = String(Math.round(target * eased));
          if (k < 1) requestAnimationFrame(tick);
        })(performance.now());
      }, { threshold: 0.6 });
      countIo.observe(counter);
    }
  } else {
    framed.forEach(function (el) { el.classList.add('is-settled'); });
  }

  /* ---------- Formulário de contato (bloco final) ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;

  var success = document.querySelector('[data-form-success]');
  var statusEl = form.querySelector('[data-form-status]');
  var submitBtn = form.querySelector('[data-submit]');
  var submitLabel = form.querySelector('[data-submit-label]');
  var fields = {
    nome: form.elements.nome,
    whatsapp: form.elements.whatsapp,
    mensagem: form.elements.mensagem,
    consentimento: form.elements.consentimento,
    empresa: form.elements.empresa
  };

  // "Abertura" = primeira interação com o formulário
  form.addEventListener('focusin', once(function () { track('contact_form_open', { placement: 'fechamento' }); }));
  // Link do bloco de associação que leva ao formulário
  var formLink = document.querySelector('[data-track="form_link"]');
  if (formLink) formLink.addEventListener('click', function () { track('contact_form_link_click', { placement: 'associacao' }); });

  function digitsOf(value) { return value.replace(/\D/g, '').slice(0, 11); }
  function formatPhone(d) {
    if (!d) return '';
    if (d.length <= 2) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  fields.whatsapp.addEventListener('input', function () {
    var input = fields.whatsapp;
    var atEnd = input.selectionStart === input.value.length;
    input.value = formatPhone(digitsOf(input.value));
    if (atEnd) input.setSelectionRange(input.value.length, input.value.length);
  });

  function setError(input, message) {
    var errorEl = document.getElementById(input.id + '-erro') ||
      document.getElementById(input.getAttribute('aria-describedby').split(' ').pop());
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
  }

  function validate() {
    var errors = [];
    var nome = fields.nome.value.trim();
    var phone = digitsOf(fields.whatsapp.value);

    if (nome.length < 2) {
      setError(fields.nome, 'Informe seu nome para sabermos como chamar você.');
      errors.push(fields.nome);
    } else setError(fields.nome, '');

    if (!phone) {
      setError(fields.whatsapp, 'Informe seu WhatsApp com DDD.');
      errors.push(fields.whatsapp);
    } else if (phone.length < 10 || (phone.length === 11 && phone.charAt(2) !== '9')) {
      setError(fields.whatsapp, 'Confira o número: use DDD + número, por exemplo (51) 99999-9999.');
      errors.push(fields.whatsapp);
    } else setError(fields.whatsapp, '');

    if (!fields.consentimento.checked) {
      setError(fields.consentimento, 'Para entrarmos em contato, precisamos da sua autorização.');
      errors.push(fields.consentimento);
    } else setError(fields.consentimento, '');

    return errors;
  }

  // Revalida em tempo real só depois do primeiro envio
  var attempted = false;
  form.addEventListener('input', function () { if (attempted) validate(); });
  form.addEventListener('change', function () { if (attempted) validate(); });

  function utmParams() {
    var out = {};
    try {
      new URLSearchParams(location.search).forEach(function (value, key) {
        if (/^utm_/.test(key)) out[key] = value;
      });
    } catch (e) {}
    return out;
  }

  function send(payload) {
    if (!CONFIG.formEndpoint) {
      if (CONFIG.debug) console.info('[GNU LP] envio simulado', payload);
      return new Promise(function (resolve) { setTimeout(resolve, 700); });
    }
    return fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    attempted = true;
    statusEl.hidden = true;

    var errors = validate();
    if (errors.length) {
      errors[0].focus();
      return;
    }

    var nome = fields.nome.value.trim();
    var showSuccess = function () {
      form.hidden = true;
      document.querySelector('[data-success-name]').textContent = 'Obrigado, ' + nome.split(/\s+/)[0];
      success.hidden = false;
      success.focus();
    };

    // Armadilha anti-spam preenchida: finge sucesso, não envia.
    if (fields.empresa.value) { showSuccess(); return; }

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Enviando…';

    send(Object.assign({
      nome: nome,
      whatsapp: digitsOf(fields.whatsapp.value),
      mensagem: fields.mensagem.value.trim(),
      consentimento: true,
      consentimento_texto: form.querySelector('label[for="f-consent"]').textContent.trim(),
      origem: CONFIG.campaign,
      pagina: location.pathname,
      enviado_em: new Date().toISOString()
    }, utmParams()))
      .then(function () {
        // Sem dados pessoais no dataLayer.
        track('contact_form_submit', { placement: 'fechamento' });
        showSuccess();
      })
      .catch(function () {
        statusEl.textContent = 'Não foi possível enviar agora. Tente de novo em instantes ou fale com a equipe pelo WhatsApp.';
        statusEl.hidden = false;
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitLabel.textContent = 'Quero receber contato';
      });
  });
})();
