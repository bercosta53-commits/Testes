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

// tela do celular: a conversa que termina em contratação
const SCREEN = { x: 422, y: 531, w: 242, h: 517 };
const chat = waScreen({ status: true, date: false, input: true, name: 'Agente Viacredi', body: `<div class="flow">
  ${m('ag', 'Oi! Você tem crédito pré-aprovado. Posso te ajudar com algum plano?', '14:20')}
  ${m('us', 'Tô reformando a cozinha. Esse crédito serve pra isso?', '14:22')}
  ${m('ag', 'Serve sim! Quer que eu simule um valor pra sua reforma?', '14:22')}
  ${m('ag', `Simulei pra você:<span class="sim"><span class="sim-l">Crédito Reforma</span><b class="sim-v">R$ 15.000,00</b><span class="sim-d">24x · juros e IOF claros</span></span>`, '14:24', { cls: 'cont' })}
  ${m('us', 'Contratei!', '14:26', { react: `${tick}Contratado` })}
</div>` });

const A = `<section class="ad" id="a">
  <div class="scr" style="left:${SCREEN.x}px;top:${SCREEN.y}px;width:${SCREEN.w}px;height:${SCREEN.h}px"><div class="scl">${chat}</div></div>
  <img class="photo" src="${img('c1-celular-key.png')}" alt="">
  <div class="topfade"></div>
  ${head}
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
.scl{position:relative;width:372px;height:795px;transform:scale(.6505);transform-origin:0 0}
.scl .wa2{position:relative;width:372px;height:795px;border-radius:0}
.scl .w-sbar{padding:16px 30px 6px 36px}
.scl .w-chat{justify-content:flex-end}
.flow{display:flex;flex-direction:column;gap:5px}
.flow .m:has(.react){margin-bottom:16px}
.sim{display:flex;flex-direction:column;gap:4px;margin:8px 0 2px;background:#F7F4EE;border:1px solid #E8E2D7;border-radius:8px;padding:10px 11px}
.sim-l{font:500 11px/1 'Inter';color:#655F58}.sim-v{font:700 19px/1.1 'Inter';letter-spacing:-.02em}.sim-d{font:500 11.5px/1.3 'Inter';color:#6B4D00}
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
