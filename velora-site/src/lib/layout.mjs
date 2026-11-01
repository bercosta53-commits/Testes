// Estrutura da página: <head>, navegação global e rodapé.
// v1 é one page: a navegação leva às seções da própria home.
import { html, raw } from './html.mjs';
import { botao, seta, pendente } from './componentes.mjs';
import { etapas } from '../conteudo/etapas.mjs';

// Navegação global (copy §1), adaptada para página única: ficam os itens que têm seção na home.
// "Insights" e "Sobre" voltam quando as páginas internas forem publicadas.
const NAV = [
  { texto: 'O sistema', href: '#sistema' },
  { texto: 'Como trabalhamos', href: '#como-trabalhamos' },
  { texto: 'Para quem', href: '#para-quem' },
  { texto: 'Velora Radar', href: '#velora-radar' },
];

const ancoraCta = '#agendar';

function itensNav(classeLink) {
  return NAV.map((item) => html`<li><a class="${classeLink}" href="${item.href}" data-nav-secao="${item.href.slice(1)}">${item.texto}</a></li>`);
}

function marca() {
  return html`<a class="marca" href="#inicio" aria-label="Velora · Growth &amp; Beyond, início da página">
    <span class="marca__nome">Velora</span><span class="marca__assinatura" aria-hidden="true">Growth &amp; Beyond</span>
  </a>`;
}

function cabecalho() {
  return html`<header class="cabecalho" data-cabecalho>
  <div class="wrap cabecalho__barra">
    ${marca()}
    <nav class="nav" aria-label="Principal">
      <ul class="nav__lista">${itensNav('nav__link')}</ul>
    </nav>
    <a class="botao botao--primario cabecalho__cta" href="${ancoraCta}"><span>Agendar diagnóstico</span>${seta}</a>
    <button class="cabecalho__menu" type="button" aria-expanded="false" aria-controls="menu-movel" data-menu-botao>
      <span class="cabecalho__menu-icone" aria-hidden="true"></span><span data-menu-texto>Menu</span>
    </button>
  </div>
  <div class="menu-movel" id="menu-movel" data-menu hidden>
    <div class="wrap">
      <nav aria-label="Principal, celular">
        <ul class="menu-movel__lista">${itensNav('menu-movel__link')}</ul>
      </nav>
      ${botao('Agendar diagnóstico', ancoraCta, { classe: 'menu-movel__cta' })}
    </div>
  </div>
</header>`;
}

function rodape(ctx) {
  const { email, linkedin } = ctx.config.contato;
  const contato = email || linkedin;
  return html`<footer class="rodape tema-escuro">
  <div class="wrap">
    <div class="rodape__grade">
      <div class="rodape__marca">
        ${marca()}
        <p class="rodape__manifesto">Estratégia faz diferença quando encontra a operação.</p>
        ${botao('Agendar diagnóstico', ancoraCta)}
      </div>
      <nav class="rodape__nav" aria-label="Rodapé">
        <div>
          <p class="rodape__titulo"><a href="#sistema">O sistema</a></p>
          <ul>${etapas.map((e) => html`<li><a href="#${e.id}"><span class="rodape__n">${e.n}</span>${e.nome}</a></li>`)}</ul>
        </div>
        <div>
          <p class="rodape__titulo">Velora</p>
          <ul>
            ${NAV.slice(1).map((i) => html`<li><a href="${i.href}">${i.texto}</a></li>`)}
            <li><a href="${ancoraCta}">Diagnóstico de Aquisição</a></li>
          </ul>
        </div>
        ${contato ? html`<div>
          <p class="rodape__titulo">Contato</p>
          <ul>
            ${email ? html`<li><a href="mailto:${email}">${email}</a></li>` : ''}
            ${linkedin ? html`<li><a href="${linkedin}" rel="noopener">LinkedIn</a></li>` : ''}
          </ul>
        </div>` : pendente(ctx, 'Contatos e LinkedIn da Velora')}
      </nav>
    </div>
    <div class="rodape__base">
      <p>© 2026 Velora · Growth &amp; Beyond</p>
    </div>
  </div>
</footer>`;
}

export function pagina(ctx, { titulo, descricao, corpo }) {
  const { config } = ctx;
  const canonical = config.urlBase ? config.urlBase.replace(/\/$/, '') + '/' : '';
  return `<!doctype html>
${html`<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<meta name="description" content="${descricao}">
${config.indexavel ? '' : raw('<meta name="robots" content="noindex, nofollow">')}
${canonical ? html`<link rel="canonical" href="${canonical}">` : ''}
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Velora">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${descricao}">
${canonical ? html`<meta property="og:url" content="${canonical}">` : ''}
<meta name="theme-color" content="#0B0B0C">
<link rel="icon" href="data:,">
<link rel="preload" href="assets/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/manrope-400-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css?v=${ctx.versao}">
<script>document.documentElement.classList.add('js')</script>
<script src="assets/js/site.js?v=${ctx.versao}" defer></script>
</head>
<body${ctx.revisao ? raw(' class="modo-revisao"') : ''}>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
${cabecalho()}
<main id="conteudo">
${corpo}
</main>
${rodape(ctx)}
</body>
</html>`}
`;
}
