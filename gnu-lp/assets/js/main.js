/*
 * GNU · LP de novos associados — comportamento
 * Sem dependências. Configuração em assets/js/config.js.
 */
(function () {
  'use strict';

  var C = window.GNU_LP_CONFIG || {};
  var doc = document;
  var root = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  root.classList.add('js');
  if (C.mostrarSlotsPendentes) root.dataset.slots = 'on';
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ------------------------------------------------------------------
   * Analytics (GA4 via GTM / dataLayer) — briefing §7
   * Nunca enviar nome, telefone, e-mail ou conteúdo de mensagens.
   * ------------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];
  var analytics = C.analytics || {};

  var utm = (function () {
    var out = {};
    try {
      var params = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
        var v = params.get(k);
        if (v) out[k] = v.slice(0, 100);
      });
    } catch (e) { /* noop */ }
    return out;
  })();

  function deviceType() {
    if (window.matchMedia('(max-width: 767px)').matches) return 'mobile';
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
    return 'desktop';
  }

  function track(event, params) {
    var payload = Object.assign({ event: event }, params || {});
    window.dataLayer.push(payload);
    if (analytics.debug && window.console) console.debug('[GNU LP]', payload);
  }

  if (analytics.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var gtm = doc.createElement('script');
    gtm.async = true;
    gtm.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(analytics.gtmId);
    doc.head.appendChild(gtm);
  }

  track('lp_view', {
    utm_source: utm.utm_source || '(direto)',
    utm_medium: utm.utm_medium || '(nenhum)',
    utm_campaign: utm.utm_campaign || '(nenhuma)',
    device_type: deviceType()
  });

  /* ------------------------------------------------------------------
   * Estado compartilhado da barra fixa de WhatsApp
   * ------------------------------------------------------------------ */
  var ui = { heroPassed: false, closingVisible: false, menu: false, modal: false, typing: false };
  var sticky = $('[data-sticky-cta]');

  function updateSticky() {
    if (!sticky) return;
    var show = ui.heroPassed && !ui.closingVisible && !ui.menu && !ui.modal && !ui.typing;
    sticky.classList.toggle('is-visible', show);
  }

  /* ------------------------------------------------------------------
   * WhatsApp — caminho primário de todos os CTAs comerciais (briefing §5)
   * ------------------------------------------------------------------ */
  var wa = C.whatsapp || {};
  var mensagens = wa.mensagens || {};

  function waUrl(key) {
    var msg = mensagens[key] || mensagens.geral || '';
    return 'https://wa.me/' + String(wa.numero || '').replace(/\D/g, '') + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }

  function visibleLabel(el) {
    var clone = el.cloneNode(true);
    $$('.sr-only, [aria-hidden="true"]', clone).forEach(function (n) { n.remove(); });
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function sectionOf(el) {
    var s = el.closest('[data-section]');
    if (s) return s.id;
    if (el.closest('[data-header]')) return 'header';
    if (el.closest('[data-sticky-cta]')) return 'barra_mobile';
    return '(fora_de_secao)';
  }

  $$('[data-wa]').forEach(function (a) {
    if (wa.numero) a.href = waUrl(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () {
      // Medido antes da navegação; a conversa só começa por ação do visitante.
      track('lp_whatsapp_click', {
        cta_location: a.dataset.cta || '(sem_id)',
        cta_label: visibleLabel(a),
        section_id: sectionOf(a),
        campaign: utm.utm_campaign || '(nenhuma)'
      });
      try { window.sessionStorage.setItem('gnu_lp_whatsapp_click', '1'); } catch (e) { /* noop */ }
      if (ui.menu) setMenu(false, false);
    });
  });

  /* ------------------------------------------------------------------
   * Fotos: marca slots sem arquivo (homologação) e logo ausente
   * ------------------------------------------------------------------ */
  function watchPhoto(img) {
    var fig = img.closest('.photo');
    if (!fig) return;
    var missing = function () { fig.classList.add('is-missing'); };
    var loaded = function () { fig.classList.remove('is-missing'); };
    img.addEventListener('error', missing);
    img.addEventListener('load', loaded);
    if (img.complete) (img.naturalWidth === 0 ? missing : loaded)();
  }
  $$('.photo img').forEach(watchPhoto);

  $$('[data-brand]').forEach(function (brand) {
    var img = $('img', brand);
    if (!img) return;
    var fallback = function () { brand.classList.add('is-fallback'); };
    img.addEventListener('error', fallback);
    if (img.complete && img.naturalWidth === 0) fallback();
  });

  /* ------------------------------------------------------------------
   * Cabeçalho: borda após scroll + link ativo
   * ------------------------------------------------------------------ */
  var header = $('[data-header]');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 4); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = $$('.site-nav a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var activeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    $$('main > section[id]').forEach(function (s) { activeIO.observe(s); });
  }

  /* ------------------------------------------------------------------
   * Menu mobile (painel com âncoras)
   * ------------------------------------------------------------------ */
  var toggle = $('[data-menu-toggle]');
  var panel = $('[data-menu-panel]');
  var toggleLabel = $('[data-menu-label]');
  var mainEl = $('main');
  var footerEl = $('.site-footer');

  function setMenu(open, returnFocus) {
    if (!toggle || !panel) return;
    ui.menu = open;
    toggle.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Fechar menu' : 'Abrir menu';
    panel.hidden = !open;
    doc.body.classList.toggle('is-locked', open || ui.modal);
    if (mainEl) mainEl.inert = open;
    if (footerEl) footerEl.inert = open;
    updateSticky();
    if (!open && returnFocus) toggle.focus();
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function () { setMenu(!ui.menu, false); });
    $$('a[href^="#"]', panel).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false, false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ui.menu) setMenu(false, true);
    });
    var desktopMQ = window.matchMedia('(min-width: 960px)');
    var onMQ = function (e) { if (e.matches && ui.menu) setMenu(false, false); };
    if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', onMQ);
  }

  /* ------------------------------------------------------------------
   * Barra fixa: aparece depois do hero, some perto do CTA final,
   * com menu/galeria abertos ou enquanto o teclado está ativo.
   * ------------------------------------------------------------------ */
  if ('IntersectionObserver' in window) {
    var heroCta = $('[data-hero-cta]');
    var closingCta = $('[data-closing-cta]');
    if (heroCta) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        ui.heroPassed = !e.isIntersecting && e.boundingClientRect.top < 0;
        updateSticky();
      }).observe(heroCta);
    }
    if (closingCta) {
      new IntersectionObserver(function (entries) {
        ui.closingVisible = entries[0].isIntersecting;
        updateSticky();
      }).observe(closingCta);
    }
  }
  var isField = function (el) { return el && el.matches && el.matches('input:not([type="radio"]):not([type="checkbox"]), textarea, select'); };
  doc.addEventListener('focusin', function (e) { if (isField(e.target)) { ui.typing = true; updateSticky(); } });
  doc.addEventListener('focusout', function (e) {
    if (!isField(e.target)) return;
    setTimeout(function () { ui.typing = isField(doc.activeElement); updateSticky(); }, 50);
  });

  /* ------------------------------------------------------------------
   * lp_section_view — entrada real de cada dobra na viewport
   * ------------------------------------------------------------------ */
  if ('IntersectionObserver' in window) {
    var seen = {};
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        if (seen[id] || !entry.isIntersecting) return;
        var needed = Math.min(entry.boundingClientRect.height, window.innerHeight) * 0.4;
        if (entry.intersectionRect.height >= needed) {
          seen[id] = true;
          track('lp_section_view', { section_id: id });
          sectionIO.unobserve(entry.target);
        }
      });
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1] });
    $$('[data-section]').forEach(function (s) { sectionIO.observe(s); });
  }

  /* ------------------------------------------------------------------
   * Lightbox das sedes — <dialog> nativo: foco preso, Esc fecha,
   * setas do teclado, gesto de arrastar e retorno do foco ao acionador.
   * ------------------------------------------------------------------ */
  var lb = $('[data-lightbox]');
  var sedes = C.sedes || {};
  var WIDTHS = [640, 1024, 1600];
  var lbState = { key: null, fotos: [], index: 0, trigger: null };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ratioNumber(r) {
    var p = String(r || '3/2').split('/');
    return (parseFloat(p[0]) / parseFloat(p[1])) || 1.5;
  }
  function srcset(id, ext) {
    return WIDTHS.map(function (w) { return 'assets/img/' + id + '-' + w + '.' + ext + ' ' + w + 'w'; }).join(', ');
  }
  function galleryPhoto(f) {
    var sizes = '(min-width: 1400px) 1300px, 92vw';
    return '' +
      '<figure class="lightbox__figure">' +
        '<div class="photo" style="--ratio: ' + esc(f.ratio || '3/2') + '; --ratio-n: ' + ratioNumber(f.ratio) + '" data-asset="' + esc(f.id) + '">' +
          '<picture>' +
            '<source type="image/avif" srcset="' + srcset(f.id, 'avif') + '" sizes="' + sizes + '">' +
            '<source type="image/webp" srcset="' + srcset(f.id, 'webp') + '" sizes="' + sizes + '">' +
            '<img src="assets/img/' + esc(f.id) + '-1024.jpg" alt="' + esc(f.alt) + '" decoding="async">' +
          '</picture>' +
          '<span class="photo__slot" aria-hidden="true"><span class="photo__slot-tag">Foto do acervo GNU · pendente</span>' +
            '<span><span class="photo__slot-id">' + esc(f.id) + '</span><span class="photo__slot-brief">' + esc(f.brief || '') + ' · ' + esc(String(f.ratio || '3/2').replace('/', ':')) + '</span></span></span>' +
        '</div>' +
        '<figcaption>' + esc(f.legenda) + '</figcaption>' +
      '</figure>';
  }

  if (lb) {
    var lbTitle = $('[data-lb-title]', lb);
    var lbCount = $('[data-lb-count]', lb);
    var lbFrame = $('[data-lb-frame]', lb);
    var lbThumbs = $('[data-lb-thumbs]', lb);
    var lbAddress = $('[data-lb-address]', lb);
    var lbPrev = $('[data-lb-prev]', lb);
    var lbNext = $('[data-lb-next]', lb);
    var lbClose = $('[data-lb-close]', lb);
    var lbStage = $('[data-lb-stage]', lb);

    var renderSlide = function () {
      var fotos = lbState.fotos;
      var f = fotos[lbState.index];
      var many = fotos.length > 1;
      lbFrame.innerHTML = galleryPhoto(f);
      watchPhoto($('img', lbFrame));
      lbCount.textContent = many ? (lbState.index + 1) + ' / ' + fotos.length : '';
      lbPrev.hidden = !many;
      lbNext.hidden = !many;
      $$('button', lbThumbs).forEach(function (b, i) {
        if (i === lbState.index) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    };

    var buildThumbs = function () {
      var fotos = lbState.fotos;
      lbThumbs.hidden = fotos.length < 2;
      lbThumbs.innerHTML = fotos.length < 2 ? '' : fotos.map(function (f, i) {
        return '<li><button type="button" data-index="' + i + '" aria-label="Foto ' + (i + 1) + ' de ' + fotos.length + ': ' + esc(f.legenda) + '">' +
          '<img src="assets/img/' + esc(f.id) + '-640.webp" alt="" loading="lazy" decoding="async">' +
          '<span class="thumb__n" aria-hidden="true">' + (i + 1) + '</span></button></li>';
      }).join('');
      $$('img', lbThumbs).forEach(function (img) {
        img.addEventListener('error', function () { img.remove(); });
      });
    };

    var go = function (delta) {
      var n = lbState.fotos.length;
      if (n < 2) return;
      lbState.index = (lbState.index + delta + n) % n;
      renderSlide();
    };

    var openGallery = function (key, trigger) {
      var sede = sedes[key];
      if (!sede || !sede.fotos || !sede.fotos.length) return;
      lbState = { key: key, fotos: sede.fotos, index: 0, trigger: trigger || null };
      lbTitle.textContent = sede.nome || '';
      lbAddress.textContent = sede.endereco || '';
      buildThumbs();
      renderSlide();
      ui.modal = true;
      doc.body.classList.add('is-locked');
      updateSticky();
      if (typeof lb.showModal === 'function') lb.showModal();
      else lb.setAttribute('open', '');
      lbClose.focus();
      track('lp_sede_gallery_open', { sede: key });
    };

    var closeGallery = function () {
      if (lb.open && typeof lb.close === 'function') lb.close();
      else lb.removeAttribute('open');
    };

    lb.addEventListener('close', function () {
      ui.modal = false;
      doc.body.classList.toggle('is-locked', ui.menu);
      updateSticky();
      lbFrame.innerHTML = '';
      if (lbState.trigger) lbState.trigger.focus();
    });

    lbClose.addEventListener('click', closeGallery);
    lbPrev.addEventListener('click', function () { go(-1); });
    lbNext.addEventListener('click', function () { go(1); });
    lbThumbs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-index]');
      if (!b) return;
      lbState.index = Number(b.dataset.index);
      renderSlide();
    });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });

    // Gesto de arrastar (toque/caneta/mouse).
    var startX = null, startY = null;
    lbStage.addEventListener('pointerdown', function (e) { startX = e.clientX; startY = e.clientY; });
    lbStage.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      startX = startY = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
    });
    lbStage.addEventListener('pointercancel', function () { startX = startY = null; });

    $$('[data-gallery]').forEach(function (btn) {
      btn.addEventListener('click', function () { openGallery(btn.dataset.gallery, btn); });
    });
  }

  /* ------------------------------------------------------------------
   * Formulário secundário (Nome, WhatsApp, interesse opcional)
   * ------------------------------------------------------------------ */
  var form = $('[data-form]');
  if (form) {
    var cfgForm = C.formulario || {};
    var fNome = form.elements.nome;
    var fTel = form.elements.whatsapp;
    var fHp = form.elements.site;
    var alertBox = $('[data-form-alert]', form);
    var submitBtn = $('[data-form-submit]', form);
    var success = $('[data-form-success]');
    var started = false;
    var attempted = false;
    var sending = false;

    var digitsOf = function (v) {
      var d = String(v || '').replace(/\D/g, '');
      if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);   // colado com +55
      if (d.length > 11 && d.charAt(0) === '0') d = d.slice(1);     // colado com 0 de longa distância
      return d.slice(0, 11);
    };
    var formatTel = function (d) {
      if (!d) return '';
      if (d.length <= 2) return '(' + d;
      var ddd = d.slice(0, 2), rest = d.slice(2);
      if (rest.length <= 4) return '(' + ddd + ') ' + rest;
      if (d.length <= 10) return '(' + ddd + ') ' + rest.slice(0, 4) + '-' + rest.slice(4);
      return '(' + ddd + ') ' + rest.slice(0, 5) + '-' + rest.slice(5);
    };

    // Máscara BR preservando a posição do cursor.
    fTel.addEventListener('input', function () {
      var pos = fTel.selectionStart == null ? fTel.value.length : fTel.selectionStart;
      var digitsBefore = fTel.value.slice(0, pos).replace(/\D/g, '').length;
      var formatted = formatTel(digitsOf(fTel.value));
      fTel.value = formatted;
      var count = 0, caret = formatted.length;
      if (digitsBefore === 0) caret = formatted.indexOf('(') === 0 ? 1 : 0;
      else {
        for (var i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) count++;
          if (count === digitsBefore) { caret = i + 1; break; }
        }
      }
      try { fTel.setSelectionRange(caret, caret); } catch (e) { /* noop */ }
    });

    var rules = {
      nome: function (v) { return v.trim().length >= 2 ? '' : 'Informe seu nome.'; },
      whatsapp: function (v) {
        var d = digitsOf(v);
        var valid = (d.length === 10 || d.length === 11) && /^[1-9]{2}/.test(d) && (d.length === 10 || d.charAt(2) === '9');
        return valid ? '' : 'Informe um WhatsApp com DDD, por exemplo (51) 99999-9999.';
      }
    };

    var showError = function (input, msg) {
      var box = doc.getElementById(input.id + '-erro');
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        if (box) { box.textContent = msg; box.hidden = false; }
      } else {
        input.removeAttribute('aria-invalid');
        if (box) { box.textContent = ''; box.hidden = true; }
      }
    };
    var validateField = function (input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var msg = rule(input.value);
      showError(input, msg);
      return !msg;
    };

    form.addEventListener('input', function (e) {
      if (!started) {
        started = true;
        track('lp_form_start', { form_id: 'contato' });
      }
      if (attempted && rules[e.target.name]) validateField(e.target);
    });
    [fNome, fTel].forEach(function (input) {
      input.addEventListener('blur', function () { if (attempted) validateField(input); });
    });

    var setSending = function (on) {
      sending = on;
      form.setAttribute('aria-busy', String(on));
      submitBtn.disabled = on;
      submitBtn.textContent = on ? 'Enviando…' : 'Solicitar contato';
    };

    var showSuccess = function () {
      form.hidden = true;
      success.hidden = false;
      success.focus();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      attempted = true;
      alertBox.hidden = true;

      var okNome = validateField(fNome);
      var okTel = validateField(fTel);
      if (!okNome || !okTel) {
        (!okNome ? fNome : fTel).focus();
        track('lp_form_error', { form_id: 'contato', error_type: 'validacao' });
        return;
      }

      // Robôs preenchem o campo invisível: finge sucesso e não envia.
      if (fHp && fHp.value) { showSuccess(); return; }

      var interesseEl = form.querySelector('input[name="interesse"]:checked');
      var interesse = interesseEl ? interesseEl.value : '';
      var payload = {
        nome: fNome.value.trim(),
        whatsapp: '+55' + digitsOf(fTel.value),
        interesse: interesse,
        origem: utm,
        pagina: window.location.origin + window.location.pathname,
        enviado_em: new Date().toISOString()
      };

      setSending(true);
      var request;
      if (cfgForm.endpoint) {
        var controller = 'AbortController' in window ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;
        request = fetch(cfgForm.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          signal: controller ? controller.signal : undefined
        }).then(function (res) {
          if (timer) clearTimeout(timer);
          if (!res.ok) { var err = new Error('servidor'); err.type = 'servidor'; throw err; }
        });
      } else if (cfgForm.modoDemonstracao) {
        if (window.console) console.info('[GNU LP] Modo demonstração: o formulário NÃO enviou dados. Configure formulario.endpoint em config.js.');
        request = new Promise(function (resolve) { setTimeout(resolve, 700); });
      } else {
        var cfgErr = new Error('configuracao');
        cfgErr.type = 'configuracao';
        request = Promise.reject(cfgErr);
      }

      request.then(function () {
        track('lp_form_submit', { form_id: 'contato', interest: interesse || '(nao_informado)' });
        setSending(false);
        showSuccess();
      }).catch(function (err) {
        setSending(false);
        alertBox.hidden = false;   // campos preenchidos são mantidos
        track('lp_form_error', { form_id: 'contato', error_type: (err && err.type) || 'rede' });
      });
    });
  }
})();
