// Criativo 2 · a pergunta da cooperada (feed 4:5, 1080x1350)
// Grid medido da peça clara "Recuperação de crédito com IA + WhatsApp: o passo a passo" do Crediauc:
// faixa clara no topo (~36%) com título à esquerda e apoio + CTA à direita; foto sangrando embaixo
// com elementos de produto flutuando; logos na base (Ubots à esquerda, parceiro à direita).
//   node ads/creative-02.mjs -> dist/ads/criativo-02-a.png, criativo-02-b.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { CSS, LOGO, lineIcon } from '../src/deck.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'ads');
const img = (p) => pathToFileURL(path.join(ROOT, 'ads/img', p)).href;
const tick = lineIcon('check', 2.6);
const BAND = 486; // altura da faixa clara (36% da peça, como na referência)

// v: foto, recorte (linha da foto original que encosta na faixa), posição da bolha e do card
const V = [
  { id: 'a', photo: 'c2-cooperada-em-pe.webp', y0: 150, bub: { left: 74, top: 600, w: 470 }, ok: { left: 74, top: 905 } },
  { id: 'b', photo: 'c2-cooperada-ilha.webp', y0: 110, bub: { left: 74, top: 590, w: 440 }, ok: { left: 74, top: 870 } },
];

const ad = (v) => {
  const s = 1080 / 825;
  return `<section class="ad" id="${v.id}">
  <div class="topband">
    <h1>“Tô reformando a cozinha. Esse crédito <mark>serve pra isso?”</mark></h1>
    <div class="side">
      <p>Veja como o agente de IA da Viacredi respondeu e a conversa <b>terminou em contratação</b>, sem roteiro pronto.</p>
      <span class="cta"><b>${lineIcon('fwd', 2.8)}</b>Baixe o playbook</span>
    </div>
  </div>
  <div class="pic"><img src="${img(v.photo)}" style="width:1080px;top:${-v.y0 * s}px" alt=""><i class="fade"></i></div>
  <div class="bub" style="left:${v.bub.left}px;top:${v.bub.top}px;width:${v.bub.w}px">
    <span class="who"><i>${lineIcon('spark', 0)}</i>Agente de IA · Viacredi</span>
    <p>Serve sim! Que legal, reforma de cozinha. Quer que eu simule um valor pra ela?</p>
    <span class="tm">14:22</span>
  </div>
  <div class="ok" style="left:${v.ok.left}px;top:${v.ok.top}px"><span class="oi">${tick}</span><div><b>Crédito contratado</b><small>R$ 15.000,00 em 24x · pelo app</small></div></div>
  <span class="ilu">Imagem ilustrativa</span>
  <div class="logos"><img src="${LOGO.ubots}" alt="Ubots"><img class="vc" src="${LOGO.via}" alt="Viacredi"></div>
</section>`;
};

const ACSS = `
html,body{margin:0;background:#222}
.ad{position:relative;width:1080px;height:1350px;overflow:hidden;background:#FFFDF9;font-family:'Poppins',sans-serif;color:#070401}
.topband{position:absolute;left:0;right:0;top:0;height:${BAND}px;display:grid;grid-template-columns:560px 1fr;gap:44px;align-items:center;padding:0 74px;box-sizing:border-box;background:#FFFDF9;z-index:3}
h1{margin:0;font:700 56px/1.12 'Poppins';letter-spacing:-.035em}
mark{background:linear-gradient(transparent 58%,#FDC348 58%,#FDC348 92%,transparent 92%);color:inherit;padding:0 4px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.side p{margin:0;font:400 26px/1.45 'Poppins';color:#2B2925;letter-spacing:-.01em}
.side p b{font-weight:700;color:#070401}
.cta{display:inline-flex;align-items:center;gap:16px;margin-top:30px;background:#FDC348;color:#070401;font:600 28px/1 'Poppins';padding:11px 30px 11px 11px;border-radius:999px;box-shadow:0 12px 28px rgba(244,174,42,.32)}
.cta b{width:52px;height:52px;border-radius:50%;background:#070401;color:#FDC348;display:grid;place-items:center}
.cta b svg{width:26px;height:26px}
.pic{position:absolute;left:0;right:0;top:${BAND}px;bottom:0;overflow:hidden;z-index:1}
.pic img{position:absolute;left:0}
.fade{position:absolute;left:0;right:0;bottom:0;height:190px;background:linear-gradient(180deg,rgba(255,253,249,0),rgba(255,253,249,.92) 70%,#FFFDF9)}
.bub{position:absolute;z-index:4;background:#fff;border-radius:28px;border-top-left-radius:6px;padding:20px 26px 22px;box-shadow:0 24px 50px rgba(107,77,0,.22)}
.who{display:inline-flex;align-items:center;gap:10px;font:600 20px/1 'Poppins';color:#6B4D00;background:#FFF3D1;padding:7px 12px 7px 7px;border-radius:999px}
.who i{width:28px;height:28px;border-radius:50%;background:#070401;display:grid;place-items:center}
.who i svg{width:15px;height:15px;fill:#FDC348}
.bub p{margin:14px 0 0;font:500 28px/1.36 'Inter';color:#141414;letter-spacing:-.01em}
.tm{position:absolute;right:22px;bottom:12px;font:400 17px/1 'Inter';color:#8D8780}
.ok{position:absolute;z-index:4;display:flex;align-items:center;gap:16px;background:#070401;color:#FFFDF9;border-radius:22px;padding:18px 26px 18px 18px;box-shadow:0 24px 50px rgba(7,4,1,.35)}
.oi{width:52px;height:52px;border-radius:50%;background:#FDC348;color:#070401;display:grid;place-items:center;flex:none}
.oi svg{width:28px;height:28px}
.ok b{display:block;font:700 28px/1.1 'Poppins';color:#FDC348}
.ok small{display:block;margin-top:6px;font:500 20px/1.2 'Poppins';color:#D6D3CF}
.ilu{position:absolute;right:24px;top:${BAND + 20}px;z-index:4;font:600 16px/1 'Poppins';color:#fff;background:rgba(7,4,1,.4);padding:7px 11px;border-radius:999px}
.logos{position:absolute;left:74px;right:74px;bottom:62px;z-index:4;display:flex;justify-content:space-between;align-items:center}
.logos img{height:46px}.logos img.vc{height:56px}
`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}\n${ACSS}</style></head><body>${V.map(ad).join('')}</body></html>`;
const HTML = path.join(OUT, 'criativo-02.html');
fs.writeFileSync(HTML, html);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto(pathToFileURL(HTML).href);
await p.evaluate(() => document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => 0)))));
for (const v of V) await (await p.$('#' + v.id)).screenshot({ path: path.join(OUT, `criativo-02-${v.id}.png`) });
await browser.close();
fs.rmSync(HTML);
console.log('ok');
