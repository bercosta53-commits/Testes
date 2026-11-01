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

// Assinatura "Velora" em escala de cartaz no rodapé: contorno das letras em Space Grotesk 700
// convertido em desenho (logotipo decorativo; não é texto).
const ASSINATURA = raw('<svg class="rodape__assinatura-grande" viewBox="18 -700 2807 714" aria-hidden="true" focusable="false"><path d="M196 0 18 -700H154L302 -85H316L464 -700H600L422 0ZM874 14Q800 14 743.5 -17.5Q687 -49 655.5 -106.5Q624 -164 624 -242V-254Q624 -332 655 -389.5Q686 -447 742 -478.5Q798 -510 872 -510Q945 -510 999 -477.5Q1053 -445 1083 -387.5Q1113 -330 1113 -254V-211H752Q754 -160 790 -128Q826 -96 878 -96Q931 -96 956 -119Q981 -142 994 -170L1097 -116Q1083 -90 1056.5 -59.5Q1030 -29 986 -7.5Q942 14 874 14ZM753 -305H985Q981 -348 950.5 -374Q920 -400 871 -400Q820 -400 790 -374Q760 -348 753 -305ZM1185 0V-700H1311V0ZM1647 14Q1573 14 1514 -16Q1455 -46 1421 -103Q1387 -160 1387 -240V-256Q1387 -336 1421 -393Q1455 -450 1514 -480Q1573 -510 1647 -510Q1721 -510 1780 -480Q1839 -450 1873 -393Q1907 -336 1907 -256V-240Q1907 -160 1873 -103Q1839 -46 1780 -16Q1721 14 1647 14ZM1647 -98Q1705 -98 1743 -135.5Q1781 -173 1781 -243V-253Q1781 -323 1743.5 -360.5Q1706 -398 1647 -398Q1589 -398 1551 -360.5Q1513 -323 1513 -253V-243Q1513 -173 1551 -135.5Q1589 -98 1647 -98ZM1983 0V-496H2107V-440H2125Q2136 -470 2161.5 -484Q2187 -498 2221 -498H2281V-386H2219Q2171 -386 2140 -360.5Q2109 -335 2109 -282V0ZM2493 14Q2440 14 2398 -4.5Q2356 -23 2331.5 -58.5Q2307 -94 2307 -145Q2307 -196 2331.5 -230.5Q2356 -265 2399.5 -282.5Q2443 -300 2499 -300H2635V-328Q2635 -363 2613 -385.5Q2591 -408 2543 -408Q2496 -408 2473 -386.5Q2450 -365 2443 -331L2327 -370Q2339 -408 2365.5 -439.5Q2392 -471 2436.5 -490.5Q2481 -510 2545 -510Q2643 -510 2700 -461Q2757 -412 2757 -319V-134Q2757 -104 2785 -104H2825V0H2741Q2704 0 2680 -18Q2656 -36 2656 -66V-67H2637Q2633 -55 2619 -35.5Q2605 -16 2575 -1Q2545 14 2493 14ZM2515 -88Q2568 -88 2601.5 -117.5Q2635 -147 2635 -196V-206H2508Q2473 -206 2453 -191Q2433 -176 2433 -149Q2433 -122 2454 -105Q2475 -88 2515 -88Z"/></svg>');

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
    ${ASSINATURA}
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
<link rel="preload" href="assets/fonts/jetbrains-mono-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="assets/img/hero-1400.webp" imagesrcset="assets/img/hero-700.webp 700w, assets/img/hero-1400.webp 1400w" imagesizes="(min-width: 1200px) 46vw, 100vw" fetchpriority="high">
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
