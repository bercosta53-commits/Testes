// Criativo 1 · "A Viacredi tirou regras do agente de IA. A conversa virou contratação." (feed 4:5, 1080x1350)
// A: foto do Nano Banana (mão + celular, tela em chroma key) com a conversa encaixada na tela.
// B: alternativa com a tesoura cortando a lista de regras.
//   node ads/creative-01.mjs -> dist/ads/criativo-01-a.png, criativo-01-b.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { CSS, LOGO, lineIcon, waScreen, m } from '../src/deck.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'ads');
fs.mkdirSync(OUT, { recursive: true });
const img = (p) => pathToFileURL(path.join(ROOT, 'ads/img', p)).href;
const tick = lineIcon('check', 2.6);

const head = `
  <div class="brand"><img src="${LOGO.ubotsDark}" alt="Ubots"><i></i><img class="vc" src="${LOGO.viaDark}" alt="Viacredi"></div>
  <h1>A Viacredi tirou regras do agente de IA. <em>A conversa virou contratação.</em></h1>
  <span class="cta">Baixe o playbook <b>${lineIcon('fwd', 2.6)}</b></span>`;

// tela do celular: foto ampliada 1.55x para o celular dominar a metade de baixo, à direita
const Z = 1.55, TX = -100, TY = -269;
const SCREEN = { x: 422 * Z + TX, y: 531 * Z + TY, w: 242 * Z, h: 517 * Z };
const CW = 296; // largura natural da tela; escala ~1.27 deixa a conversa legível
const chat = waScreen({ status: true, date: false, input: true, name: 'Agente Viacredi', body: `<div class="flow">
  ${m('ag', 'Oi! Você tem crédito pré-aprovado. Posso ajudar em algum plano?', '14:20')}
  ${m('us', 'Tô reformando a cozinha. Esse crédito serve pra isso?', '14:22')}
  ${m('ag', `Serve sim! Simulei pra sua reforma:<span class="sim"><span class="sim-l">Crédito Reforma</span><b class="sim-v">R$ 15.000,00</b><span class="sim-d">24x · juros e IOF claros</span></span>`, '14:23', { btns: [{ t: 'Contratar pelo app', icon: 'ext' }], cls: 'tap' })}
  <div class="ok"><span class="ok-i">${tick}</span><div><b>Crédito contratado</b><small>R$ 15.000,00 em 24x · pelo app</small></div></div>
</div>` });

const A = `<section class="ad" id="a">
  <div class="scr" style="left:${SCREEN.x}px;top:${SCREEN.y}px;width:${SCREEN.w}px;height:${SCREEN.h}px"><div class="scl" style="width:${CW}px;height:${(CW * SCREEN.h) / SCREEN.w}px;transform:scale(${SCREEN.w / CW})">${chat}</div></div>
  <img class="photo z" src="${img('c1-celular-key.png')}" style="width:${1080 * Z}px;height:${1350 * Z}px;left:${TX}px;top:${TY}px" alt="">
  <div class="shade"></div>
  <div class="brand"><img src="${LOGO.ubotsDark}" alt="Ubots"><i></i><img class="vc" src="${LOGO.viaDark}" alt="Viacredi"></div>
  <div class="col">
    <h1>A Viacredi tirou regras do agente de IA. <em>A conversa virou contratação.</em></h1>
    <h2>Menos regras, mais contexto: o método para vender crédito no WhatsApp com IA.</h2>
    <p>Mais de R$ 150 mil em crédito liberado ainda na fase de testes.</p>
    <span class="cta">Baixe o playbook <b>${lineIcon('fwd', 2.6)}</b></span>
  </div>
  <span class="tag t1"><i>${lineIcon('spark', 0)}</i>Agente de IA</span>
  <span class="tag t2"><i>${lineIcon('lock', 2.4)}</i>Contratação pelo app</span>
</section>`;

const B = `<section class="ad" id="b">
  <img class="photo" src="${img('c1-tesoura-1080.jpg')}" alt="">
  <div class="topfade"></div>
  ${head}
  <div class="role"><p>${lineIcon('spark', 0)}Papel do agente</p><span>objetivo · contexto · liberdade para conversar</span></div>
</section>`;

const ACSS = `
html,body{margin:0;background:#222}
.ad{position:relative;width:1080px;height:1350px;overflow:hidden;background:#070401;color:#FFFDF9;font-family:'Poppins',sans-serif}
.photo{position:absolute;left:0;top:0;width:1080px;height:1350px;z-index:2}
.topfade{position:absolute;left:0;right:0;top:0;height:560px;z-index:3;background:linear-gradient(180deg,rgba(7,4,1,.92) 0%,rgba(7,4,1,.75) 55%,rgba(7,4,1,0) 100%)}
.brand{position:absolute;left:90px;top:80px;display:flex;align-items:center;gap:22px;z-index:5}
.brand img{height:38px}.brand img.vc{height:46px}
.brand i{width:2px;height:38px;background:rgba(175,175,180,.45)}
h1{position:absolute;left:90px;right:110px;top:170px;margin:0;z-index:5;font:700 64px/1.1 'Poppins';letter-spacing:-.035em;text-shadow:0 4px 30px rgba(7,4,1,.6)}
h1 em{font-style:normal;color:#FDC348}
.cta{position:absolute;left:90px;top:418px;z-index:5;display:inline-flex;align-items:center;gap:18px;background:#FDC348;color:#070401;font:700 30px/1 'Poppins';padding:12px 12px 12px 34px;border-radius:999px;box-shadow:0 14px 34px rgba(244,174,42,.35)}
.cta b{width:54px;height:54px;border-radius:50%;background:#070401;color:#FDC348;display:grid;place-items:center}
.cta b svg{width:28px;height:28px}
/* tela */
.scr{position:absolute;z-index:1;overflow:hidden;border-radius:30px;background:#EFE7DC}
.scl{position:relative;transform-origin:0 0}
.scl .wa2{position:relative;width:100%;height:100%;border-radius:0}
.scl .w-sbar{padding:16px 30px 6px 36px}
.scl .w-chat{justify-content:flex-start;gap:6px;padding-top:12px}
.m.tap .mbtn{background:#FFF3D1;color:#6B4D00;font-weight:700;position:relative;box-shadow:0 0 0 2px #FDC348}
.m.tap .mbtn:after{content:"";position:absolute;right:26px;top:50%;width:26px;height:26px;margin-top:-13px;border-radius:50%;background:rgba(253,195,72,.55);box-shadow:0 0 0 7px rgba(253,195,72,.25)}
.ok{display:flex;align-items:center;gap:10px;margin-top:6px;background:#070401;color:#FFFDF9;border-radius:14px;padding:12px 14px;box-shadow:0 8px 18px rgba(7,4,1,.25)}
.ok-i{width:34px;height:34px;border-radius:50%;background:#FDC348;color:#070401;display:grid;place-items:center;flex:none}
.ok-i svg{width:20px;height:20px}
.ok b{display:block;font:700 16px/1.15 'Inter';color:#FDC348}
.ok small{display:block;font:500 12px/1.3 'Inter';color:#D6D3CF;margin-top:3px}
.flow{display:flex;flex-direction:column;gap:5px}
.flow .m:has(.react){margin-bottom:16px}
.sim{display:flex;flex-direction:column;gap:4px;margin:8px 0 2px;background:#F7F4EE;border:1px solid #E8E2D7;border-radius:8px;padding:10px 11px}
.sim-l{font:500 11px/1 'Inter';color:#655F58}.sim-v{font:700 19px/1.1 'Inter';letter-spacing:-.02em}.sim-d{font:500 11.5px/1.3 'Inter';color:#6B4D00}
/* A refinada */
.photo.z{position:absolute;max-width:none}
.shade{position:absolute;inset:0;z-index:3;background:linear-gradient(90deg,rgba(7,4,1,.94) 0%,rgba(7,4,1,.8) 42%,rgba(7,4,1,0) 64%),linear-gradient(180deg,rgba(7,4,1,.75) 0%,rgba(7,4,1,0) 28%);-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 58%,transparent 78%);mask-image:linear-gradient(180deg,#000 0%,#000 58%,transparent 78%)}
#a .brand{left:80px;top:80px}
.col{position:absolute;left:80px;top:170px;width:610px;z-index:5}
#a h1{position:static;font-size:54px;line-height:1.12}
.col h2{margin:24px 0 0;font:600 30px/1.3 'Poppins';color:#FFFDF9;max-width:470px;letter-spacing:-.01em}
.col p{margin:14px 0 0;font:500 25px/1.4 'Nunito';color:#CFCAC2;max-width:450px}
#a .cta{position:static;margin-top:36px;font-size:34px;padding:16px 16px 16px 42px;gap:22px;box-shadow:0 0 0 10px rgba(253,195,72,.16),0 22px 50px rgba(244,174,42,.5)}
#a .cta b{width:66px;height:66px}
#a .cta b svg{width:32px;height:32px}
.tag{position:absolute;z-index:6;display:inline-flex;align-items:center;gap:12px;background:#FFFDF9;color:#070401;font:700 26px/1 'Poppins';padding:12px 22px 12px 12px;border-radius:999px;box-shadow:0 20px 44px rgba(0,0,0,.45)}
.tag i{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#070401;color:#FDC348}
.tag i svg{width:22px;height:22px;fill:#FDC348}
.t1{right:60px;top:500px;transform:rotate(4deg)}
.t2{left:80px;top:1110px;transform:rotate(-4deg)}
.tag i svg{width:22px;height:22px}
/* B */
.role{position:absolute;right:70px;bottom:90px;z-index:5;background:#FFFDF9;color:#070401;border:4px solid #FDC348;border-radius:24px;padding:22px 26px;transform:rotate(-3deg);box-shadow:0 24px 50px rgba(0,0,0,.45)}
.role p{display:flex;align-items:center;gap:10px;margin:0;font:700 30px/1 'Poppins'}
.role p svg{width:28px;height:28px;fill:#E3A21A}
.role span{display:block;margin-top:10px;font:600 22px/1.2 'Nunito';color:#45433F}
`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}\n${ACSS}</style></head><body>${A}${B}</body></html>`;
const HTML = path.join(OUT, 'criativo-01.html');
fs.writeFileSync(HTML, html);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto(pathToFileURL(HTML).href);
await p.evaluate(() => document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => 0)))));
await (await p.$('#a')).screenshot({ path: path.join(OUT, 'criativo-01-a.png') });
await (await p.$('#b')).screenshot({ path: path.join(OUT, 'criativo-01-b.png') });
await browser.close();
fs.rmSync(HTML);
console.log('ok');
