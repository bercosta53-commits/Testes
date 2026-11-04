// Estrutura da página: <head>, cabeçalho, menu do celular e rodapé. One page: os links levam às seções.
import { html, raw } from './html.mjs';
import { botao, seta, pendente } from './componentes.mjs';
import { logo } from './logo.mjs';

// Navegação (copy v2, Rodapé · Navegação). No cabeçalho, "Conversar" vira o botão de CTA:
// curto e sem prometer agenda (a regra "Agendar só com agenda real" vale para os CTAs da página).
// O número é o da seção na página (design; não é texto da copy).
const NAV = [
  { n: '02', texto: 'O sistema', href: '#sistema' },
  { n: '03', texto: 'O que entregamos', href: '#entregas' },
  { n: '04', texto: 'Como trabalhamos', href: '#como-trabalhamos' },
  { n: '05', texto: 'Para quem', href: '#para-quem' },
];
const CONVERSAR = { n: '07', texto: 'Conversar', href: '#conversa' };

const setaCima = raw('<svg class="seta seta--cima" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 14.5v-12M3.5 7 8 2.5 12.5 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>');
const setaFora = raw('<svg class="seta seta--fora" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>');

// Contato e empresa: só o que estiver preenchido em config.mjs.
function itensContato(contato) {
  const itens = [];
  if (contato.email) itens.push(html`<li><a href="mailto:${contato.email}">${contato.email}</a></li>`);
  if (contato.telefone) itens.push(html`<li><a href="tel:${contato.telefone.replace(/[^\d+]/g, '')}">${contato.telefone}</a></li>`);
  if (contato.whatsapp) itens.push(html`<li><a href="https://wa.me/${contato.whatsapp.replace(/\D/g, '')}" rel="noopener">WhatsApp ${setaFora}</a></li>`);
  if (contato.linkedin) itens.push(html`<li><a href="${contato.linkedin}" rel="noopener">LinkedIn ${setaFora}</a></li>`);
  if (contato.instagram) itens.push(html`<li><a href="${contato.instagram}" rel="noopener">Instagram ${setaFora}</a></li>`);
  return itens;
}

function cabecalho() {
  return html`<header class="cabecalho" data-cabecalho>
  <div class="wrap cabecalho__barra">
    <a class="marca" href="#inicio" aria-label="Velora, início da página">${logo({ variante: 'compacto', classe: 'logo--entrada' })}</a>
    <nav class="nav" aria-label="Principal">
      <ul class="nav__lista">${NAV.map((i) => html`<li><a class="nav__link" href="${i.href}" data-nav-secao="${i.href.slice(1)}">${i.texto}</a></li>`)}</ul>
      <span class="nav__indicador" aria-hidden="true" data-nav-indicador></span>
    </nav>
    <a class="botao botao--primario cabecalho__cta" href="${CONVERSAR.href}"><span>${CONVERSAR.texto}</span>${seta}</a>
    <button class="cabecalho__menu" type="button" aria-expanded="false" aria-controls="menu-movel" data-menu-botao>
      <span class="cabecalho__menu-icone" aria-hidden="true"><span></span><span></span></span><span class="cabecalho__menu-texto" data-menu-texto>Menu</span>
    </button>
  </div>
  <div class="cabecalho__progresso" aria-hidden="true"><span class="cabecalho__progresso-barra" data-progresso></span></div>
</header>`;
}

// Menu do celular: tela inteira, itens numerados como as seções, entrada em sequência.
function menuMovel(ctx) {
  const contato = itensContato(ctx.config.contato);
  return html`<div class="menu-movel tema-escuro" id="menu-movel" data-menu hidden>
  <div class="wrap menu-movel__conteudo">
    <nav aria-label="Principal, celular">
      <ul class="menu-movel__lista">${NAV.map((i, k) => html`<li style="--i:${k}"><a class="menu-movel__link" href="${i.href}" data-nav-secao="${i.href.slice(1)}"><span class="menu-movel__n" aria-hidden="true">${i.n}</span> <span>${i.texto}</span></a></li>`)}</ul>
    </nav>
    <div class="menu-movel__rodape" style="--i:${NAV.length}">
      ${botao(CONVERSAR.texto, CONVERSAR.href, { classe: 'menu-movel__cta' })}
      ${contato.length ? html`<ul class="menu-movel__contato">${contato}</ul>` : ''}
    </div>
  </div>
</div>`;
}

// Rodapé: logo completo, manifesto (copy v2, Rodapé · Assinatura), navegação com os cinco links,
// contato e dados da empresa quando houver, linha legal e a assinatura "velora." em escala de cartaz.
function rodape(ctx) {
  const { contato, empresa, privacidade } = ctx.config;
  const itensDeContato = itensContato(contato);
  const temEmpresa = empresa.razaoSocial || empresa.endereco;
  return html`<footer class="rodape tema-escuro">
  <div class="wrap">
    <div class="rodape__topo">
      <a class="rodape__logo" href="#inicio" aria-label="Velora · Growth &amp; Beyond, voltar ao início">${logo({ variante: 'completo', classe: 'logo--entrada desenhar' })}</a>
      <p class="rodape__manifesto">Estratégia faz diferença quando encontra a operação.</p>
    </div>
    <div class="rodape__colunas">
      <nav class="rodape__coluna rodape__coluna--nav" aria-labelledby="rodape-nav">
        <p class="rodape__titulo" id="rodape-nav">Navegação</p>
        <ul class="rodape__links">${[...NAV, CONVERSAR].map((i) => html`<li><a href="${i.href}"><span class="rodape__n" aria-hidden="true">${i.n}</span> <span class="rodape__link-texto">${i.texto}</span></a></li>`)}</ul>
      </nav>
      ${itensDeContato.length ? html`<div class="rodape__coluna">
        <p class="rodape__titulo">Contato</p>
        <ul class="rodape__links rodape__links--contato">${itensDeContato}</ul>
      </div>` : pendente(ctx, 'Contato: e-mail, telefone/WhatsApp e LinkedIn (config.mjs → contato).', { classe: 'rodape__coluna' })}
      ${temEmpresa ? html`<div class="rodape__coluna">
        <p class="rodape__titulo">Empresa</p>
        <address class="rodape__empresa">${empresa.razaoSocial ? html`<span>${empresa.razaoSocial}</span>` : ''}${empresa.endereco ? html`<span>${empresa.endereco}</span>` : ''}</address>
      </div>` : pendente(ctx, 'Empresa: razão social, CNPJ e endereço (config.mjs → empresa).', { classe: 'rodape__coluna' })}
    </div>
    <div class="rodape__base">
      <p class="rodape__direitos">© 2026 Velora · Growth &amp; Beyond</p>
      ${empresa.cnpj || privacidade.url ? html`<ul class="rodape__legal">
        ${empresa.cnpj ? html`<li>CNPJ ${empresa.cnpj}</li>` : ''}
        ${privacidade.url ? html`<li><a href="${privacidade.url}">${privacidade.rotuloLink || 'Política de privacidade'}</a></li>` : ''}
      </ul>` : ''}
      <a class="rodape__voltar" href="#inicio"><span>Voltar ao topo</span><span class="rodape__voltar-icone">${setaCima}</span></a>
    </div>
  </div>
  <div class="rodape__cartaz desenhar" aria-hidden="true" data-foco-acid>${logo({ variante: 'palavra', classe: 'logo--cartaz' })}</div>
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
${canonical ? html`<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${canonical}assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Velora: Crescimento não trava por falta de esforço. Trava por falta de sistema.">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B0B0C">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/manrope-400-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/jetbrains-mono-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="assets/img/hero-1400.webp" imagesrcset="assets/img/hero-700.webp 700w, assets/img/hero-1400.webp 1400w" imagesizes="(min-width: 1200px) 50vw, 100vw" fetchpriority="high">
<link rel="stylesheet" href="assets/css/site.css?v=${ctx.versao}">
<script>document.documentElement.classList.add('js')</script>
<script src="assets/js/site.js?v=${ctx.versao}" defer></script>
</head>
<body${ctx.revisao ? raw(' class="modo-revisao"') : ''}>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
${cabecalho()}
${menuMovel(ctx)}
<main id="conteudo">
${corpo}
</main>
${rodape(ctx)}
</body>
</html>`}
`;
}
