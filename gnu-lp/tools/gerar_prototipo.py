#!/usr/bin/env python3
"""Gera o protótipo navegável de revisão da LP (para publicar como página de revisão).

Uso:
  python3 tools/gerar_prototipo.py --saida /caminho/prototipo.html

O protótipo tem o mesmo visual e as mesmas interações da LP, mas:
  - uma faixa fixa no topo avisa que é um protótipo e não o site oficial;
  - os botões de WhatsApp mostram um aviso em vez de abrir a conversa (o número não vai no arquivo);
  - o formulário valida os campos, mas não envia nada, e diz isso;
  - saem os metadados de compartilhamento (og:*), o schema.org do clube e a indexação.
O arquivo sai sem <html>/<head>/<body>: a página de revisão é envolvida por um esqueleto ao publicar.
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_html_unico  # noqa: E402

TITLE = 'Protótipo LP Verão União'

STRIP = '''
    <div class="proto-strip" role="note">
      <span>Protótipo para revisão</span><span aria-hidden="true">·</span><span>não é o site oficial<span class="proto-strip__long"> do Grêmio Náutico União</span></span>
      <button class="proto-strip__fs" type="button" data-proto-fs aria-pressed="false" hidden>
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
        <span data-proto-fs-label>Tela cheia</span>
      </button>
    </div>
'''

FULLSCREEN_JS = '''
  <script>
    (function () {
      var d = document, el = d.documentElement, btn = d.querySelector('[data-proto-fs]');
      if (!btn) return;
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      var exit = d.exitFullscreen || d.webkitExitFullscreen;
      if (!req || !exit || !(d.fullscreenEnabled || d.webkitFullscreenEnabled)) return;
      var label = btn.querySelector('[data-proto-fs-label]');
      function isFs() { return !!(d.fullscreenElement || d.webkitFullscreenElement); }
      function sync() {
        var on = isFs();
        label.textContent = on ? 'Sair da tela cheia' : 'Tela cheia';
        btn.setAttribute('aria-pressed', String(on));
      }
      btn.hidden = false;
      btn.addEventListener('click', function () {
        try {
          var r = isFs() ? exit.call(d) : req.call(el);
          if (r && r.catch) r.catch(function () { btn.hidden = true; });
        } catch (e) { btn.hidden = true; }
      });
      d.addEventListener('fullscreenchange', sync);
      d.addEventListener('webkitfullscreenchange', sync);
      sync();
    })();
  </script>
'''

NOTICE = '''
  <div class="proto-notice" data-proto-notice hidden>
    <div class="proto-notice__card" role="dialog" aria-modal="true" aria-labelledby="proto-notice-title">
      <p class="proto-notice__eyebrow">Protótipo de revisão</p>
      <h2 id="proto-notice-title" class="proto-notice__title">Aqui abre o WhatsApp da equipe de associação</h2>
      <p>No site publicado, este botão abre uma conversa no WhatsApp com a equipe de associação, já com a mensagem:</p>
      <blockquote>Olá! Quero conhecer melhor o Grêmio Náutico União e entender as opções de associação. Podem me orientar?</blockquote>
      <p class="proto-notice__meta">Origem registrada no clique: <code data-proto-origin></code></p>
      <button class="btn btn--primary" type="button" data-proto-close>Entendi</button>
    </div>
  </div>
'''

CSS = '''
/* ---------- Protótipo de revisão ---------- */
:root { --strip-h: 30px; --header-h: 94px; }
@media (min-width: 1024px) { :root { --header-h: 110px; } }
.site-header { top: env(safe-area-inset-top, 0px); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 60; background: var(--ink); }
.site-header__inner { height: calc(var(--header-h) - var(--strip-h)); }
.proto-strip {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  height: var(--strip-h);
  padding-inline: max(16px, env(safe-area-inset-left, 0px)) max(16px, env(safe-area-inset-right, 0px));
  background: var(--ink); color: #fff;
  font: 500 .8125rem/1.2 var(--font-sans);
  white-space: nowrap; overflow: hidden;
}
@media (max-width: 560px) { .proto-strip__long { display: none; } }
.proto-strip { position: relative; }
.proto-strip__fs {
  position: absolute;
  top: 50%;
  right: max(16px, env(safe-area-inset-right, 0px));
  transform: translateY(-50%);
  display: inline-flex; align-items: center; gap: 6px;
  height: 24px; padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, .4); border-radius: 2px;
  background: rgba(255, 255, 255, .1); color: #fff;
  font: 500 .75rem/1 var(--font-sans);
  cursor: pointer;
}
.proto-strip__fs:hover { background: rgba(255, 255, 255, .2); }
.proto-strip__fs:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.proto-strip__fs svg { width: 12px; height: 12px; }
@media (max-width: 767px) { .proto-strip__fs { display: none; } }
.proto-notice {
  position: fixed; inset: 0; z-index: 90;
  display: grid; place-items: center;
  padding: 24px max(16px, env(safe-area-inset-right, 0px)) 24px max(16px, env(safe-area-inset-left, 0px));
  background: rgba(16, 42, 59, .6);
}
.proto-notice__card {
  width: 100%; max-width: 460px;
  padding: 28px;
  background: var(--white); color: var(--text);
  border-radius: var(--radius);
  box-shadow: 0 24px 64px rgba(16, 42, 59, .35);
}
.proto-notice__eyebrow { color: var(--ink-muted); font-size: var(--fs-micro); font-weight: 500; }
.proto-notice__title { margin: 8px 0 12px; font-size: 1.5rem; line-height: 1.15; }
.proto-notice__card p { font-size: var(--fs-small); }
.proto-notice__card blockquote {
  margin: 14px 0; padding: 12px 14px;
  background: var(--sand); color: var(--ink);
  border-left: 3px solid var(--brand);
  font-size: var(--fs-small);
}
.proto-notice__meta { color: var(--ink-muted); }
.proto-notice__meta code { font-size: .8125rem; color: var(--ink); }
.proto-notice .btn { margin-top: 20px; width: 100%; }
'''


def make(doc):
    def sub(pattern, repl, flags=re.S, count=0, expect=None):
        nonlocal doc
        doc, n = re.subn(pattern, repl, doc, count=count, flags=flags)
        if expect is not None and n != expect:
            raise SystemExit(f'Padrão não encontrado ({n}x, esperado {expect}x): {pattern[:60]}')

    # Esqueleto: a página de revisão fornece doctype, html, head, body, charset e viewport
    sub(r'<!doctype html>\s*', '', flags=re.I | re.S, expect=1)
    sub(r'<html\b[^>]*>\s*', '', expect=1)
    sub(r'</?head>\s*', '', expect=2)
    sub(r'<body>\s*', '', expect=1)
    sub(r'\s*</body>\s*</html>\s*$', '\n', expect=1)
    sub(r'\s*<meta charset="utf-8">', '', expect=1)
    sub(r'\s*<meta name="viewport"[^>]*>', '', expect=1)

    # Nome da página, sem metadados que façam o link parecer o site oficial
    sub(r'<title>.*?</title>', f'<title>{TITLE}</title>\n  <meta name="robots" content="noindex, nofollow">', expect=1)
    sub(r'\s*<meta (?:property="og:|name="twitter:|name="description")[^>]*>', '')
    sub(r'\s*<script type="application/ld\+json">.*?</script>', '', expect=1)
    doc = doc.lstrip()

    # O número do WhatsApp não vai no arquivo
    sub(r'href="https://wa\.me/[^"]*"', 'href="#whatsapp"')
    sub(r"whatsappNumber: '\d+'", "whatsappNumber: ''", expect=1)
    sub(r"var waHref = 'https://wa\.me/' \+[^;]*;", "var waHref = '#whatsapp';", expect=1)
    if 'wa.me' in doc or '99238' in doc:
        raise SystemExit('O número do WhatsApp ainda aparece no protótipo.')

    # Hero padrão (o atributo ficava no <html>) e modo protótipo, antes da pintura
    sub(r"(h\.classList\.add\('js'\);)",
        r"\1\n      h.lang = 'pt-BR';\n      if (!h.hasAttribute('data-hero')) h.setAttribute('data-hero', 'full');\n      window.GNU_LP_CONFIG = { prototipo: true };",
        expect=1)

    # Faixa fixa dentro do cabeçalho; aviso do WhatsApp antes do script principal
    sub(r'(<header class="site-header" data-header>)', r'\1' + STRIP.replace('\\', r'\\'), expect=1)
    idx = doc.rindex('<script>')
    doc = doc[:idx] + NOTICE.lstrip('\n') + FULLSCREEN_JS.lstrip('\n') + doc[idx:]
    sub(r'(</style>)', CSS.replace('\\', r'\\') + r'\1', count=1, expect=1)

    # Formulário: deixa claro que nada é enviado
    sub(r'(<p class="form__intro">).*?(</p>)',
        r'\1Protótipo: o formulário valida os campos, mas não envia nada. Não use dados reais.\2', expect=1)
    sub(r'<h3>Recebemos seu contato\.</h3>\s*<p>.*?</p>',
        '<h3>Formulário validado.</h3>\n                <p><span data-success-name hidden></span>Protótipo: nada foi enviado. '
        'No site publicado, a equipe de associação recebe este contato e chama pelo WhatsApp.</p>', expect=1)

    # Rodapé
    sub(r'(Algumas imagens são ilustrativas e foram criadas com inteligência artificial\.)',
        r'\1 Protótipo para revisão; não é o site oficial.', expect=1)
    return doc


def main():
    ap = argparse.ArgumentParser(description='Gera o protótipo navegável de revisão da LP.')
    ap.add_argument('--saida', required=True, help='arquivo de saída')
    args = ap.parse_args()
    doc = make(gerar_html_unico.build())
    with open(args.saida, 'w', encoding='utf-8') as fh:
        fh.write(doc)
    print(f'{args.saida} · {os.path.getsize(args.saida) / 1024 / 1024:.1f} MB')


if __name__ == '__main__':
    main()
