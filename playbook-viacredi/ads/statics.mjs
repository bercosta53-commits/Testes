// Artes estáticas (feed 4:5, 1080x1350) das 10 copies do doc "Copies de anúncio · Playbook Viacredi + Ubots".
//   node ads/statics.mjs  -> dist/ads/static-01.png … static-10.png + dist/ads/statics-overview.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { CSS, LOGO, lineIcon, waScreen, m, wave } from '../src/deck.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'ads');
fs.mkdirSync(OUT, { recursive: true });
const fileUrl = (p) => pathToFileURL(path.join(ROOT, p)).href;
const page = (n) => fileUrl(`dist/previews/slide-${String(n).padStart(2, '0')}.png`);
const hl = (s) => s.replace(/==(.+?)==/g, '<em>$1</em>');
const tick = lineIcon('check', 2.6);
const ban = lineIcon('ban', 2.4);

const logos = (dark) => `<div class="lg"><img src="${dark ? LOGO.ubotsDark : LOGO.ubots}" alt="Ubots"><i></i><img class="vc" src="${dark ? LOGO.viaDark : LOGO.via}" alt="Viacredi"></div>`;
const cta = `<span class="cta-pill">${lineIcon('fwd', 2.6).replace('<svg', '<svg class="pa"')}Baixe o playbook</span>`;
const bub = (side, html, time, extra = '') => `<div class="bub ${side}">${html}<span class="bt">${time}${side === 'us' ? ' ' + lineIcon('check', 2.4) : ''}</span>${extra}</div>`;

// ---------- visuais ----------
const V = {
  1: `<div class="v1">
    <div class="card bld">
      <div class="bh"><span class="dots"><i></i><i></i><i></i></span><b>Agent Builder</b><span>· Agente Viacredi</span></div>
      <ul class="rules">${['Não fale sobre outros produtos', 'Não responda fora do roteiro', 'Não ofereça outras linhas', 'Responda só SIM ou NÃO'].map((r, i) => `<li style="transform:translateX(${[0, 60, 130, 220][i]}px) rotate(${[0, -2, 3, -5][i]}deg);opacity:${[1, .8, .55, .3][i]}"><span class="bi">${ban}</span>${r}<s></s></li>`).join('')}</ul>
    </div>
    <div class="card role">
      <p class="rk">${lineIcon('spark', 0)}Papel do agente</p>
      <ul>${[['Objetivo', 'oferecer crédito que faça sentido'], ['Contexto', 'o momento e o plano do cooperado'], ['Liberdade', 'para conversar como gente']].map(([k, v]) => `<li><i></i><span><b>${k}:</b> ${v}</span></li>`).join('')}</ul>
    </div>
  </div>`,
  2: `<div class="v2"><img class="photo" src="${fileUrl('reels/fotos/cozinha-reforma.jpg')}" alt=""><div class="shade"></div>
    <div class="v2c">${bub('ag', 'Serve sim! Que legal, reforma de cozinha. Quer que eu simule um valor?', '14:22')}${bub('us', 'Quero contratar!', '14:26', `<span class="react">${tick}Contratado</span>`)}</div>
    <span class="ilu">Imagem ilustrativa</span></div>`,
  3: `<div class="v3">
    <div class="col bot"><span class="cl">${ban}Bot de regras</span>${bub('us', 'Tô reformando a cozinha. Serve pra isso?', '14:22')}${bub('ag', 'Opção inválida. Digite 1 para SIM ou 2 para NÃO.', '14:22')}<span class="vd">${ban}Conversa encerrada</span></div>
    <div class="col ctx"><span class="cl">${lineIcon('spark', 0)}Agente com contexto</span>${bub('us', 'Tô reformando a cozinha. Serve pra isso?', '14:22')}${bub('ag', 'Serve sim! Quer que eu simule um valor pra reforma?', '14:22')}<span class="vd">${tick}Crédito contratado</span></div>
  </div>`,
  4: `<div class="card v4">
    <div class="dh"><img src="${LOGO.ubots}" alt="Ubots"><span class="tab">${lineIcon('chat', 2)}Resultados do teste</span></div>
    <div class="v4b"><div><p class="k">+R$ 150 mil<small>em crédito liberado</small></p><div class="bars">${[18, 30, 26, 44, 52, 70, 92].map((v) => `<i style="height:${v}%"></i>`).join('')}</div></div>
    <ul class="ck">${['Transbordo baixo', 'Conversa que vira contratação', '4 agentes no Agent Builder'].map((t) => `<li><span>${tick}</span>${t}</li>`).join('')}</ul></div>
  </div>`,
  5: `<div class="v5"><div class="phone2" style="width:430px;height:600px">${waScreen({ date: false, input: true, body: `
      ${m('ag', 'Temos crédito disponível. Digite 1 para SIM ou 2 para NÃO.', '10:02')}
      ${m('us', 'Depende… pra que serve?', '10:04')}
      ${m('ag', 'Opção inválida. Digite 1 ou 2.', '10:04', { cls: 'inv' })}` })}</div></div>`,
  6: `<div class="card v6"><p class="gk">${lineIcon('shield', 2.2)}Guardrails críticos</p>
    <ul>${['Transparência sobre juros e IOF', 'Contratação pelo app, por segurança', 'Time humano quando precisar'].map((g) => `<li><span class="lk">${lineIcon('lock', 2.2)}</span>${g}<span class="tg"><i></i></span></li>`).join('')}</ul></div>`,
  7: `<div class="v7"><img class="p a" src="${page(10)}"><img class="p b" src="${page(9)}"></div>`,
  8: `<div class="v8"><div class="crop"><img src="${page(9)}"></div>
    <span class="note n1">Oferecer crédito que faça sentido</span><span class="note n2">Cooperados com crédito pré-aprovado</span></div>`,
  9: `<div class="v9"><div class="crop"><img src="${page(7)}"></div></div>`,
  10: `<div class="v10"><img class="f f1" src="${page(9)}"><img class="f f2" src="${page(10)}"><img class="f f0" src="${page(1)}"></div>`,
};

const ADS = [
  [1, 'dark', '', 'A Viacredi tirou regras do agente de IA. ==A conversa virou contratação.==', 'Veja o passo a passo para testar essa virada com segurança na sua instituição.'],
  [2, 'photo', '', '==“Tô reformando a cozinha. Esse crédito serve pra isso?”==', 'Veja como o agente de IA da Viacredi respondeu e a conversa terminou em contratação, sem roteiro pronto.'],
  [3, 'dark', '', 'Mesma pergunta, ==duas respostas.== Qual é a do seu agente?', 'Veja como a Viacredi trocou o bot de fluxo por um agente de IA que conversa e vende crédito.'],
  [4, 'dark', '', '==+R$ 150 mil== em crédito liberado ainda na fase de testes', 'O método de uma cooperativa de 74 anos e mais de 1 milhão de cooperados para vender crédito no WhatsApp.'],
  [5, 'light', 'Para gestores de crédito e canais digitais', 'Seu bot ainda responde ==“opção inválida”==?', 'Conheça o método que a Viacredi usou para trocar regras fixas por um agente de IA que entende o cooperado.'],
  [6, 'dark', '', 'E se o agente de IA ==sair do script?==', 'Defina os guardrails que nunca mudam: juros e IOF às claras, contratação pelo app e time humano quando precisa.'],
  [7, 'dark', 'Para cooperativas e instituições financeiras', 'Agentes de IA na venda de crédito: ==por onde começar?==', 'Do papel do agente aos indicadores, o passo a passo do primeiro teste, inspirado no case Viacredi.'],
  [8, 'light', '', 'O que o seu agente precisa saber ==antes da primeira conversa?==', 'Objetivo, público, oferta, tom, transbordo e fechamento: preencha o papel do agente com o modelo do playbook.'],
  [9, 'light', '', 'Comece pequeno: teste IA na oferta de crédito em ==volume controlado==', 'Filtros de risco, pausas para ajuste e 6 indicadores para decidir se continua, ajusta ou amplia.'],
  [10, 'dark', '', '==11 páginas== para tirar seu primeiro agente de IA do papel', 'Papel do agente, guardrails, plano de teste e indicadores, com campos para preencher com a sua equipe.'],
];

const art = ([n, theme, eyebrow, title, sub]) => `
<section class="ad ${theme === 'photo' ? 'dark photo' : theme}" id="a${n}">
  ${theme === 'dark' ? '<i class="glow g1"></i><i class="glow g2"></i>' : ''}
  ${theme === 'light' ? '<i class="glow g1 lt"></i>' : ''}
  ${logos(theme !== 'light')}
  <div class="txt">
    ${eyebrow ? `<span class="eb">${eyebrow}</span>` : ''}
    <h1>${hl(title)}</h1>
    <p>${sub}</p>
    ${cta}
  </div>
  <div class="vis">${V[n]}</div>
</section>`;

const ACSS = `
html,body{margin:0;background:#222}
.ad{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:'Nunito',sans-serif}
.ad.dark{background:#070401;color:#FFFDF9}
.ad.light{background:#FFFDF9;color:#070401}
.glow{position:absolute;border-radius:50%;filter:blur(10px)}
.g1{right:-260px;top:-260px;width:760px;height:760px;background:radial-gradient(circle,rgba(253,195,72,.32),rgba(253,195,72,0) 65%)}
.g2{left:-300px;bottom:-320px;width:820px;height:820px;background:radial-gradient(circle,rgba(253,195,72,.26),rgba(253,195,72,0) 65%)}
.g1.lt{background:radial-gradient(circle,#FFF3D1,rgba(255,243,209,0) 65%);width:900px;height:900px}
.lg{position:absolute;left:80px;top:70px;display:flex;align-items:center;gap:24px;z-index:5}
.lg img{height:40px}.lg img.vc{height:48px}
.lg i{width:2px;height:40px;background:rgba(175,175,180,.5)}
.txt{position:absolute;left:80px;right:80px;top:180px;z-index:5}
.eb{display:inline-block;font:600 22px/1 'Poppins';letter-spacing:.1em;text-transform:uppercase;padding:14px 20px;border-radius:999px;margin-bottom:26px}
.dark .eb{border:1.5px solid rgba(253,195,72,.5);color:#FDC348}
.light .eb{background:#070401;color:#FDC348}
.txt h1{margin:0;font:700 70px/1.08 'Poppins';letter-spacing:-.035em}
.dark h1 em{font-style:normal;color:#FDC348}
.light h1 em{font-style:normal;background:linear-gradient(transparent 12%,#FDC348 12%,#FDC348 92%,transparent 92%);padding:0 8px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.txt p{margin:26px 0 0;font:500 30px/1.42 'Nunito';max-width:860px}
.dark .txt p{color:#D6D3CF}.light .txt p{color:#45433F}
.cta-pill{display:inline-flex;align-items:center;gap:16px;margin-top:34px;background:#FDC348;color:#070401;font:700 30px/1 'Poppins';padding:14px 34px 14px 14px;border-radius:999px;box-shadow:0 14px 34px rgba(244,174,42,.3)}
.pa{width:52px;height:52px;padding:12px;border-radius:50%;background:#070401;color:#FDC348;box-sizing:border-box}
.vis{position:absolute;left:0;right:0;bottom:0;z-index:2}
.card{background:#fff;color:#070401;border-radius:30px;box-shadow:0 40px 90px rgba(0,0,0,.35);overflow:hidden}
.light .card{box-shadow:0 30px 70px rgba(107,77,0,.2)}
/* bolhas */
.bub{position:relative;max-width:88%;font:500 27px/1.3 'Inter';color:#141414;padding:16px 20px 38px;border-radius:22px;box-shadow:0 8px 20px rgba(0,0,0,.22)}
.bub.us{align-self:flex-end;background:#D9FDD3;border-top-right-radius:4px}
.bub.ag{align-self:flex-start;background:#fff;border-top-left-radius:4px}
.bt{position:absolute;right:16px;bottom:10px;display:flex;align-items:center;gap:6px;font:400 18px/1 'Inter';color:#655F58}
.bt svg{width:20px;height:20px;color:#C88D0A}
.react{position:absolute;left:14px;bottom:-22px;display:inline-flex;align-items:center;gap:8px;background:#FDC348;color:#070401;font:700 22px/1 'Poppins';padding:9px 14px;border-radius:999px;border:3px solid #070401}
.react svg{width:22px;height:22px}
/* 1 */
.v1{position:relative;height:640px}
.bld{position:absolute;left:80px;right:180px;top:40px;padding-bottom:20px}
.bh{display:flex;align-items:center;gap:14px;padding:24px 28px;border-bottom:1px solid #EEE7D8;font:600 26px/1 'Poppins'}
.bh span:last-child{color:#6C6C71;font-weight:500}
.bh .dots{display:flex;gap:8px}.bh .dots i{width:13px;height:13px;border-radius:50%;background:#E3DCCD}
.rules{list-style:none;margin:0;padding:10px 26px}
.rules li{position:relative;display:flex;align-items:center;gap:18px;padding:18px 6px;font:700 28px/1.2 'Nunito';color:#070401;counter-increment:none}
.rules li:before{display:none}
.rules li s{position:absolute;left:70px;right:20px;top:50%;height:5px;background:#FDC348;border-radius:3px}
.bi{width:44px;height:44px;border-radius:12px;background:#F3EFE7;display:grid;place-items:center;flex:none}.bi svg{width:22px;height:22px}
.role{position:absolute;left:240px;right:60px;bottom:40px;padding:30px 34px;border:4px solid #FDC348;transform:rotate(-2deg)}
.rk{display:flex;align-items:center;gap:12px;margin:0 0 18px;font:700 32px/1 'Poppins'}
.rk svg{width:32px;height:32px;fill:#E3A21A}
.role ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.role li{display:flex;align-items:baseline;gap:14px;font:600 27px/1.3 'Nunito'}
.role li i{width:13px;height:13px;border-radius:50%;background:#FDC348;flex:none}
/* 2 */
.photo .vis{top:0}
.v2{position:absolute;inset:0}
.v2 .photo{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:50% 70%}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,#070401 0%,rgba(7,4,1,.94) 46%,rgba(7,4,1,.35) 72%,rgba(7,4,1,.55) 100%)}
.v2c{position:absolute;left:80px;right:80px;bottom:90px;display:flex;flex-direction:column;gap:34px}
.ilu{position:absolute;right:30px;bottom:26px;font:600 18px/1 'Poppins';color:#fff;background:rgba(7,4,1,.5);padding:8px 12px;border-radius:999px}
.photo h1{font-family:'Inter';font-weight:700;letter-spacing:-.03em}
/* 3 */
.v3{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:0 50px 60px;height:600px}
.v3 .col{position:relative;border-radius:28px;padding:26px 22px 110px;display:flex;flex-direction:column;gap:18px}
.v3 .bot{background:#1C1813}
.v3 .bot .bub{filter:grayscale(1);opacity:.75}
.v3 .ctx{background:linear-gradient(180deg,#FDC348,#F4AE2A)}
.v3 .bub{font-size:24px;max-width:96%}
.cl{align-self:center;display:inline-flex;align-items:center;gap:10px;font:700 24px/1 'Poppins';padding:12px 18px;border-radius:999px;margin-bottom:8px}
.cl svg{width:24px;height:24px}
.bot .cl{background:#2A241C;color:#AFAFB4}.ctx .cl{background:#070401;color:#FDC348}.ctx .cl svg{fill:#FDC348}
.vd{position:absolute;left:18px;right:18px;bottom:18px;display:flex;align-items:center;justify-content:center;gap:10px;font:800 26px/1 'Poppins';padding:22px 0;border-radius:18px}
.vd svg{width:28px;height:28px}
.bot .vd{background:#2A241C;color:#AFAFB4}.ctx .vd{background:#070401;color:#FDC348}
/* 4 */
.v4{margin:0 80px 80px;padding-bottom:30px}
.dh{display:flex;align-items:center;gap:20px;padding:24px 30px;border-bottom:1px solid #EEE7D8}
.dh img{height:32px}
.tab{display:inline-flex;align-items:center;gap:10px;font:600 22px/1 'Poppins';background:#FFF3D1;color:#6B4D00;padding:11px 16px;border-radius:12px}.tab svg{width:22px;height:22px}
.v4b{display:grid;grid-template-columns:1fr 1fr;gap:30px;padding:28px 30px 0}
.v4 .k{margin:0;font:700 44px/1.1 'Poppins';letter-spacing:-.03em}
.v4 .k small{display:block;font:600 22px/1.3 'Poppins';color:#6C6C71;letter-spacing:0;margin-top:6px}
.bars{display:flex;align-items:flex-end;gap:12px;height:190px;margin-top:20px;border-bottom:2px solid #EEE7D8}
.bars i{flex:1;background:linear-gradient(180deg,#FDC348,#F4AE2A);border-radius:10px 10px 0 0}
.bars i:last-child{background:#070401}
.ck{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px;justify-content:center}
.ck li{display:flex;align-items:center;gap:14px;font:700 26px/1.2 'Poppins'}
.ck span{width:44px;height:44px;border-radius:12px;background:#070401;color:#FDC348;display:grid;place-items:center;flex:none}.ck svg{width:24px;height:24px}
/* 5 */
.v5{position:relative;height:640px}
.v5 .phone2{position:absolute;left:250px;top:40px;zoom:1.35;transform:rotate(-4deg)}
.v5 .m.inv .mb{outline:4px solid #FDC348;outline-offset:3px}
.slash{position:absolute;left:180px;right:180px;top:405px;height:12px;background:#FDC348;border-radius:6px;transform:rotate(-10deg);box-shadow:0 8px 20px rgba(244,174,42,.35)}
/* 6 */
.v6{margin:0 80px 110px;background:#15110C;border:1px solid #2C2620;color:#FFFDF9;padding:40px 40px 24px}
.gk{display:flex;align-items:center;gap:14px;margin:0 0 14px;font:700 30px/1 'Poppins';color:#FDC348}.gk svg{width:34px;height:34px}
.v6 ul{list-style:none;margin:0;padding:0}
.v6 li{display:flex;align-items:center;gap:20px;padding:30px 0;border-top:1px solid #2C2620;font:600 34px/1.25 'Nunito'}
.lk{width:54px;height:54px;border-radius:14px;background:rgba(253,195,72,.16);color:#FDC348;display:grid;place-items:center;flex:none}.lk svg{width:26px;height:26px}
.tg{margin-left:auto;width:92px;height:50px;border-radius:999px;background:#FDC348;position:relative;flex:none}
.tg i{position:absolute;right:5px;top:5px;width:40px;height:40px;border-radius:50%;background:#fff}
/* 7 */
.v7{position:relative;height:600px}
.v7 .p{position:absolute;width:760px;border-radius:18px;box-shadow:0 40px 90px rgba(0,0,0,.5)}
.v7 .a{left:250px;top:90px;transform:rotate(5deg)}
.v7 .b{left:70px;top:150px;transform:rotate(-4deg)}
/* 8 */
.v8{position:relative;height:640px}
.v8 .crop{position:absolute;left:80px;right:80px;top:40px;height:560px;border-radius:24px;overflow:hidden;box-shadow:0 30px 70px rgba(107,77,0,.25);transform:rotate(-2deg)}
.v8 .crop img{position:absolute;width:1700px;left:-130px;top:-280px}
.note{position:absolute;font:500 30px/1.2 'Caveat','Nunito';font-style:italic;color:#1E4FD8;color:#6B4D00;background:#FFF3D1;padding:10px 16px;border-radius:10px;box-shadow:0 8px 16px rgba(107,77,0,.2)}
.n1{left:120px;top:270px;transform:rotate(-4deg)}.n2{left:460px;top:420px;transform:rotate(3deg)}
/* 9 */
.v9{position:relative;height:620px}
.v9 .crop{position:absolute;left:60px;right:60px;top:60px;height:520px;border-radius:24px;overflow:hidden;box-shadow:0 30px 70px rgba(107,77,0,.25)}
.v9 .crop img{position:absolute;width:1500px;left:-90px;top:-225px}
/* 10 */
.v10{position:relative;height:600px}
.v10 .f{position:absolute;left:150px;width:780px;border-radius:18px;box-shadow:0 40px 90px rgba(0,0,0,.55)}
.v10 .f1{top:120px;transform:rotate(-8deg) translateX(-90px)}
.v10 .f2{top:100px;transform:rotate(7deg) translateX(90px)}
.v10 .f0{top:150px}
`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}\n${ACSS}</style></head><body>${ADS.map(art).join('')}</body></html>`;
const HTML = path.join(OUT, 'statics.html');
fs.writeFileSync(HTML, html);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto(pathToFileURL(HTML).href);
await p.evaluate(() => document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => 0)))));
const secs = await p.$$('section.ad');
for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: path.join(OUT, `static-${String(i + 1).padStart(2, '0')}.png`) });
await browser.close();
console.log('statics', secs.length);
