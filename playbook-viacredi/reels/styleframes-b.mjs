// Quadros-chave do conceito "Mesma mensagem. Dois finais." (1080x1920) para aprovação antes do motion.
//   node reels/styleframes-b.mjs  -> dist/reels/sf-01.png … sf-07.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { CSS, LOGO, lineIcon, waScreen, m, wave } from '../src/deck.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'reels');
const page = (n) => pathToFileURL(path.join(ROOT, `dist/previews/slide-${String(n).padStart(2, '0')}.png`)).href;
const MSG = 'Tô reformando a cozinha. Esse crédito serve pra isso?';

const bubbleBig = `<div class="bigmsg"><span class="who">${lineIcon('person', 2)}</span><div class="bb">${MSG}<span class="bt">14:22 ${lineIcon('check', 2.4)}</span></div></div>`;

const B = (side, html, time, extra = '') => `<div class="bub ${side}">${html}<span class="bt">${time}${side === 'us' ? ' ' + lineIcon('check', 2.4) : ''}</span>${extra}</div>`;
const LBL = (bot) => `<span class="lbl">${bot ? `${lineIcon('ban', 2.4)}Bot de regras` : `${lineIcon('spark', 0)}Agente com contexto`}</span>`;
const half = (side) => {
  const bot = side === 'bot';
  return `<div class="half ${side}">${LBL(bot)}<div class="thread">
    ${B('us', MSG, '14:22')}
    ${bot ? B('ag', 'Não entendi. Digite 1 para SIM ou 2 para NÃO.', '14:22') : B('ag', 'Serve sim! Que legal, reforma de cozinha. Quer que eu simule um valor pra ela?', '14:22')}
    ${bot ? '' : B('us', 'Quero!', '14:23')}
  </div></div>`;
};
const halfEnd = (side) => {
  const bot = side === 'bot';
  return `<div class="half ${side} end">${LBL(bot)}<div class="thread">
    ${bot ? `${B('us', '?', '14:23')}${B('ag', 'Opção inválida. Digite 1 ou 2.', '14:23')}<p class="seen">${lineIcon('check', 2.4)} Visualizado às 14:23</p>`
      : `${B('ag', `Simulei pra sua reforma:<span class="sim2"><small>Crédito Reforma</small><b>R$ 15.000,00</b><em>24x · juros e IOF claros</em></span>`, '14:24')}<span class="cbtn2">${lineIcon('ext', 2.4)}Contratar pelo app</span>${B('us', 'Contratei!', '14:26', `<span class="react2">${lineIcon('check', 2.6)}Contratado</span>`)}`}
  </div><div class="verdict">${bot ? `${lineIcon('ban', 2.4)}Conversa encerrada` : `${lineIcon('check', 2.6)}Crédito contratado`}</div></div>`;
};

const SF = [
  // 1 · gancho
  `<section class="sf dark">
    <p class="kick">Seu cliente manda:</p>
    ${bubbleBig}
    <h2 class="huge">E o seu agente<br><mark>responde…</mark></h2>
    <span class="typing"><i></i><i></i><i></i></span>
  </section>`,
  // 2 · tela dividida
  `<section class="sf split">
    <h2 class="top">Mesma <mark>mensagem.</mark></h2>
    <div class="halves">${half('bot')}${half('ctx')}</div>
    <span class="divider"></span>
  </section>`,
  // 3 · dois finais
  `<section class="sf split">
    <h2 class="top">Dois <mark>finais.</mark></h2>
    <div class="halves">${halfEnd('bot')}${halfEnd('ctx')}</div>
    <span class="divider"></span>
  </section>`,
  // 4 · virada
  `<section class="sf gold">
    <h2 class="manifesto">A diferença<br>não é a IA.</h2>
    <h2 class="manifesto b">É o que você<br><span class="hl">ensina</span> a ela.</h2>
    <div class="swap"><s>regra</s><s>regra</s><s>regra</s><span class="arrow">${lineIcon('fwd', 2.6)}</span><b>contexto</b></div>
    ${wave('var(--escuro)', 140, 3, 5)}
  </section>`,
  // 5 · prova
  `<section class="sf dark proof">
    <p class="kick">Viacredi + agente de IA Ubots</p>
    <div class="num"><small>+R$</small>150<small>mil</small></div>
    <p class="sub">em crédito liberado</p>
    <span class="tag">nos primeiros dias de teste</span>
    <div class="mini">${m('ag', 'Que legal, reforma de cozinha! Quer que eu simule?', '14:22')}${m('us', 'Contratei!', '14:26', { react: `${lineIcon('check', 2.6)}Contratado` })}</div>
  </section>`,
  // 6 · o que a pessoa leva
  `<section class="sf light">
    <h2 class="top dark">Como fazer na<br><mark>sua instituição?</mark></h2>
    <div class="fan"><img class="p1" src="${page(8)}"><img class="p2" src="${page(9)}"><img class="p3" src="${page(5)}"></div>
    <ul class="checks">${['Papel do agente', 'Guardrails de segurança', 'Plano de teste em volume controlado', 'Indicadores para decidir se amplia'].map((t) => `<li><span>${lineIcon('check', 3)}</span>${t}</li>`).join('')}</ul>
  </section>`,
  // 7 · CTA
  `<section class="sf dark cta">
    <img class="lg" src="${LOGO.ubotsDark}" alt="Ubots">
    <h2 class="huge sm">Menos regras.<br><mark>Mais contexto.</mark></h2>
    <img class="cover" src="${page(1)}">
    <span class="btn">Baixe o playbook ${lineIcon('fwd', 2.8)}</span>
    <p class="fine">Case Viacredi + Ubots · Agentes de IA na oferta de crédito</p>
  </section>`,
];

const SCSS = `
html,body{margin:0;background:#111}
.sf{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:'Poppins',sans-serif}
.sf.dark{background:radial-gradient(900px 700px at 80% 0%,rgba(253,195,72,.18),rgba(253,195,72,0) 70%),#070401;color:#FFFDF9}
.sf.gold{background:linear-gradient(160deg,#FFD978,#FDC348 45%,#F4AE2A);color:#070401}
.sf.light{background:radial-gradient(900px 800px at 100% 0%,#FFF3D1,rgba(255,243,209,0) 70%),#FFFDF9;color:#070401}
.sf.split{background:#070401;color:#FFFDF9}
mark{background:none;color:inherit;position:relative;z-index:0;padding:0 8px}
mark:before{content:"";position:absolute;left:0;right:0;bottom:6%;height:42%;background:#FDC348;z-index:-1;border-radius:6px}
.dark mark,.split mark{color:#070401}
.dark mark:before,.split mark:before{bottom:4%;height:88%}
.kick{position:absolute;left:90px;top:260px;margin:0;font:600 40px/1 'Poppins';color:#AFAFB4;letter-spacing:.01em}
.huge{position:absolute;left:90px;right:60px;top:1230px;margin:0;font:800 118px/1.02 'Poppins';letter-spacing:-.045em}
.huge.sm{top:330px;font-size:104px}
.bigmsg{position:absolute;left:90px;right:90px;top:520px;display:flex;align-items:flex-start;gap:24px;transform:rotate(-2deg)}
.who{width:110px;height:110px;border-radius:50%;background:#2A241C;color:#AFAFB4;display:grid;place-items:center;flex:none}
.who svg{width:56px;height:56px}
.bb{position:relative;background:#D9FDD3;color:#141414;font:500 56px/1.25 'Inter';padding:34px 40px 64px;border-radius:0 40px 40px 40px;box-shadow:0 30px 70px rgba(0,0,0,.5)}
.bt{position:absolute;right:30px;bottom:20px;display:flex;align-items:center;gap:8px;font:400 26px/1 'Inter';color:#655F58}
.bt svg{width:28px;height:28px}
.typing{position:absolute;right:110px;top:1000px;display:flex;gap:16px;background:#1C1813;padding:30px 36px;border-radius:40px}
.typing i{width:22px;height:22px;border-radius:50%;background:#FDC348}
.typing i:nth-child(2){opacity:.6}.typing i:nth-child(3){opacity:.3}
.top{position:absolute;left:0;right:0;top:230px;margin:0;text-align:center;font:800 104px/1.04 'Poppins';letter-spacing:-.045em}
.top.dark{color:#070401}
.halves{position:absolute;left:0;right:0;top:430px;bottom:200px;display:grid;grid-template-columns:1fr 1fr}
.half{position:relative;display:flex;flex-direction:column;align-items:center;padding-top:30px}
.half.bot{background:#1A1714}
.half.ctx{background:linear-gradient(180deg,#FDC348,#F4AE2A)}
.half.bot .wp{filter:grayscale(1) contrast(.9);opacity:.8}
.lbl{display:inline-flex;align-items:center;gap:12px;font:700 32px/1 'Poppins';padding:16px 22px;border-radius:999px;margin-bottom:30px}
.lbl svg{width:30px;height:30px}
.bot .lbl{background:#2A241C;color:#AFAFB4}
.ctx .lbl{background:#070401;color:#FDC348}
.ctx .lbl svg{fill:#FDC348}
.wp{zoom:1.38;border-radius:24px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.35)}
.wp .wa2{height:100%}
.divider{position:absolute;left:536px;top:430px;bottom:200px;width:8px;background:#070401}
.verdict{position:absolute;left:30px;right:30px;bottom:40px;display:flex;align-items:center;justify-content:center;gap:12px;font:800 38px/1 'Poppins';padding:26px 0;border-radius:24px}
.bot .verdict{background:#2A241C;color:#AFAFB4}
.ctx .verdict{background:#070401;color:#FDC348}
.verdict svg{width:38px;height:38px}
.sim{display:flex;flex-direction:column;gap:4px;margin:8px 0 2px;background:#F7F4EE;border:1px solid #E8E2D7;border-radius:8px;padding:10px 11px}
.sim-l{font:500 11px/1 'Inter';color:#655F58}.sim-v{font:700 19px/1.1 'Inter'}.sim-d{font:500 11.5px/1.3 'Inter';color:#6B4D00}
.manifesto{position:absolute;left:90px;right:60px;top:300px;margin:0;font:800 128px/1.0 'Poppins';letter-spacing:-.05em;opacity:.35}
.manifesto.b{top:610px;opacity:1}
.hl{background:#070401;color:#FDC348;padding:0 18px;border-radius:14px}
.swap{position:absolute;left:90px;right:90px;top:1040px;display:flex;flex-wrap:wrap;align-items:center;gap:16px}
.swap s{font:700 46px/1 'Poppins';padding:18px 26px;border-radius:999px;background:rgba(7,4,1,.12);text-decoration-thickness:5px}
.swap .arrow{width:70px;height:70px}.swap .arrow svg{width:70px;height:70px}
.swap b{font:800 60px/1 'Poppins';padding:24px 36px;border-radius:999px;background:#070401;color:#FDC348}
.gold > .wave{position:absolute;left:90px;top:1330px}
.proof .num{position:absolute;left:80px;top:1060px;font:800 300px/1 'Poppins';letter-spacing:-.06em;color:#FDC348;white-space:nowrap}
.proof .num small{font-size:110px;letter-spacing:-.03em;margin:0 10px}
.proof .sub{position:absolute;left:90px;top:1390px;margin:0;font:700 64px/1.1 'Poppins'}
.proof .tag{position:absolute;left:90px;top:1500px;font:700 40px/1 'Poppins';background:#FDC348;color:#070401;padding:20px 28px;border-radius:999px}
.mini{position:absolute;left:30px;top:250px;width:440px;display:flex;flex-direction:column;gap:8px;zoom:2.1}
.fan{position:absolute;left:0;right:0;top:560px;height:600px}
.fan img{position:absolute;left:90px;width:900px;border-radius:22px;box-shadow:0 30px 70px rgba(107,77,0,.3)}
.fan .p1{top:0;transform:rotate(-5deg)}.fan .p2{top:70px;transform:rotate(3deg)}.fan .p3{top:140px;transform:rotate(-1deg)}
.checks{position:absolute;left:90px;right:90px;top:1270px;list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:22px}
.checks li{display:flex;align-items:center;gap:22px;font:700 44px/1.15 'Poppins'}
.checks span{width:64px;height:64px;border-radius:18px;background:#070401;color:#FDC348;display:grid;place-items:center;flex:none}
.checks span svg{width:36px;height:36px}
.cta .lg{position:absolute;left:90px;top:240px;height:52px}
.cta .cover{position:absolute;left:110px;top:700px;width:860px;border-radius:26px;box-shadow:0 40px 90px rgba(0,0,0,.6)}
.cta .btn{position:absolute;left:110px;right:110px;top:1250px;display:flex;align-items:center;justify-content:center;gap:20px;background:#FDC348;color:#070401;font:800 54px/1 'Poppins';padding:40px 0;border-radius:999px}
.cta .btn svg{width:54px;height:54px}
.fine{position:absolute;left:0;right:0;top:1420px;margin:0;text-align:center;font:500 28px/1 'Poppins';color:#AFAFB4}
`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}\n${SCSS}
.thread{width:100%;padding:0 24px;box-sizing:border-box;display:flex;flex-direction:column;gap:18px}
.bub{position:relative;max-width:88%;font:500 34px/1.3 'Inter';color:#141414;padding:20px 24px 46px;border-radius:26px;box-shadow:0 10px 24px rgba(0,0,0,.25)}
.bub.us{align-self:flex-end;background:#D9FDD3;border-top-right-radius:4px}
.bub.ag{align-self:flex-start;background:#fff;border-top-left-radius:4px}
.bub .bt{position:absolute;right:18px;bottom:12px;display:flex;align-items:center;gap:6px;font:400 20px/1 'Inter';color:#655F58}
.bub .bt svg{width:22px;height:22px}
.half.bot .bub{filter:grayscale(1);opacity:.85}
.seen{margin:0;align-self:flex-end;display:flex;align-items:center;gap:8px;font:500 24px/1 'Inter';color:#8D8780}
.seen svg{width:24px;height:24px}
.sim2{display:flex;flex-direction:column;gap:6px;margin-top:14px;background:#F7F4EE;border:1px solid #E8E2D7;border-radius:14px;padding:16px 18px}
.sim2 small{font:500 22px/1 'Inter';color:#655F58}.sim2 b{font:700 40px/1.05 'Inter';letter-spacing:-.02em}.sim2 em{font:500 24px/1.2 'Inter';font-style:normal;color:#6B4D00}
.cbtn2{align-self:flex-start;display:flex;align-items:center;gap:10px;background:#fff;color:#0E7A4B;font:600 28px/1 'Inter';padding:18px 22px;border-radius:18px;margin-top:-8px}
.cbtn2 svg{width:28px;height:28px}
.react2{position:absolute;left:16px;bottom:-22px;display:inline-flex;align-items:center;gap:6px;background:#070401;color:#FDC348;font:700 22px/1 'Poppins';padding:8px 12px;border-radius:999px}
.react2 svg{width:20px;height:20px}
</style></head><body>${SF.join('')}</body></html>`;
const HTML = path.join(OUT, 'styleframes-b.html');
fs.writeFileSync(HTML, html);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(pathToFileURL(HTML).href);
await p.evaluate(() => document.fonts.ready);
const secs = await p.$$('section.sf');
for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: path.join(OUT, `sf-${String(i + 1).padStart(2, '0')}.png`) });
await browser.close();
console.log('styleframes', secs.length);
