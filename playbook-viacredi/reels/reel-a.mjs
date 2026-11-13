// Reels A v3 · "Mesma pergunta, dois finais" (30 s, 1080x1920, 30 fps)
// Identidade e linguagem do vídeo de referência (creme com bokeh ouro, título em serifa com itálico ouro sublinhado,
// cards de produto, wipe ouro, cartão final com clique); storytelling próprio: gancho, comparação, necessidade, prova, método, CTA.
//   node reels/reel-a.mjs            -> dist/reels/reel-a.mp4 (+ .srt)
//   node reels/reel-a.mjs --stills   -> só stills de revisão
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { CSS, LOGO, lineIcon } from '../src/deck.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'reels');
const FR = '/tmp/claude-0/-home-user-Testes/551c6292-4d0f-5c04-8cdf-68fafee92925/scratchpad/frames-a';
fs.mkdirSync(OUT, { recursive: true });
const FPS = 30, DUR = 30, W = 1080, H = 1920;
const fileUrl = (p) => pathToFileURL(path.join(ROOT, p)).href;
const page = (n) => fileUrl(`dist/previews/slide-${String(n).padStart(2, '0')}.png`);
const font = (f) => `data:font/ttf;base64,${fs.readFileSync(path.join(ROOT, 'assets/fonts', f)).toString('base64')}`;
const MSG = 'Tô reformando a cozinha. Esse crédito serve pra isso?';

// ---------- títulos (também são a legenda) ----------
const HL = [
  ['h1', 0.1, 1.85, 'Seu cliente pergunta:', 'e o seu agente responde…', ''],
  ['h2', 1.95, 8.0, 'Mesma pergunta,', 'duas respostas.', ''],
  ['h3', 8.05, 11.35, 'Mesma pergunta,', 'dois finais.', ''],
  ['h4', 11.75, 15.45, 'A diferença não é a IA.', 'É o que você ensina a ela.', 'md'],
  ['h5', 15.55, 19.45, 'Viacredi, primeiros dias de teste:', '+R$ 150 mil em crédito.', 'md'],
  ['h6', 19.55, 24.95, 'Como fazer na', 'sua instituição?', ''],
  ['h7', 25.05, 31, 'Playbook', 'Agentes de IA na Oferta de Crédito', 'end'],
];
const hlHtml = HL.map(([id, , , a, b, c]) => `<h2 class="hl ${c}" id="${id}"><span class="l1">${a}</span><span class="l2"><em>${b}</em></span></h2>`).join('');

// ---------- componentes ----------
const tick = lineIcon('check', 2.4);
const bub = (id, side, html, time, extra = '') => `<div class="bub ${side}" id="${id}">${html}<span class="bt">${time}${side === 'us' ? ' ' + tick : ''}</span>${extra}</div>`;
const typing = (id) => `<div class="typ" id="${id}"><i></i><i></i><i></i></div>`;

// gancho
const HOOK = `
<div class="hook" id="hook">
  <div class="hk-who"><img src="${fileUrl('reels/fotos/personagem.jpg')}" alt=""><span><b>Cooperada</b><small>agora</small></span></div>
  ${bub('hb', 'us', MSG, '14:22')}
  <div class="hk-typ" id="hktyp"><span class="av">${lineIcon('spark', 0)}</span><i></i><i></i><i></i></div>
</div>`;

// tela dividida
const SPLIT = `
<div class="split" id="split">
  <div class="col bot" id="colL">
    <div class="ch"><span class="lbl">${lineIcon('ban', 2.4)}Bot de regras</span></div>
    <div class="vp"><div class="th" id="thL">
      ${bub('l0', 'us', MSG, '14:22')}
      ${typing('lt')}
      ${bub('l1', 'ag', 'Não entendi. Digite 1 para SIM ou 2 para NÃO.', '14:22')}
      ${bub('l2', 'us', 'Como assim?', '14:23')}
      ${bub('l3', 'ag', 'Opção inválida.', '14:23')}
      <p class="seen" id="lseen">${tick} Visualizado · 14:23</p>
    </div></div>
    <div class="verdict" id="vL">${lineIcon('ban', 2.4)}Conversa encerrada</div>
  </div>
  <div class="col ctx" id="colR">
    <div class="ch"><span class="lbl">${lineIcon('spark', 0)}Agente com contexto</span></div>
    <div class="vp"><div class="th" id="thR">
      ${bub('r0', 'us', MSG, '14:22')}
      ${typing('rt')}
      ${bub('r1', 'ag', 'Serve sim! Que legal, reforma de cozinha. Quer que eu simule um valor?', '14:22')}
      ${bub('r2', 'us', 'Quero!', '14:23')}
      ${bub('r3', 'ag', `Simulei pra sua reforma:<span class="sim"><small>Crédito Reforma</small><b>R$ 15.000,00</b><em>24x · juros e IOF claros</em></span>`, '14:24')}
      <span class="cta-in" id="rbtn">${lineIcon('ext', 2.4)}Contratar pelo app</span>
      ${bub('r4', 'us', 'Contratei!', '14:26', `<span class="react">${tick}Contratado</span>`)}
    </div></div>
    <div class="verdict" id="vR">${tick}Crédito contratado</div>
  </div>
</div>
<div class="confetti" id="conf">${Array.from({ length: 50 }, (_, i) => `<i style="left:${(i * 53) % 100}%;background:${['#FDC348', '#070401', '#FFFDF9', '#F4AE2A', '#25D366'][i % 5]};width:${10 + (i % 3) * 6}px;height:${16 + (i % 4) * 5}px"></i>`).join('')}</div>`;

// Agent Builder
const RULES = ['Não fale sobre outros produtos', 'Não responda fora do roteiro', 'Não ofereça outras linhas', 'Responda só SIM ou NÃO'];
const ROLE = [['Objetivo', 'oferecer crédito que faça sentido'], ['Contexto', 'o momento e o plano do cooperado'], ['Liberdade', 'para conversar como gente']];
const GUARD = ['Transparência sobre juros e IOF', 'Contratação pelo app, por segurança', 'Time humano quando precisar'];
const BUILDER = `
<div class="card bld" id="bld">
  <div class="bh"><span class="dots"><i></i><i></i><i></i></span><b>Agent Builder <span>· Agente Viacredi</span></b></div>
  <div class="layer" id="oldR"><p class="sec">Antes</p><ul class="rules">${RULES.map((r, i) => `<li id="fo${i}"><span class="bi">${lineIcon('ban', 2.2)}</span>${r}<s></s></li>`).join('')}</ul></div>
  <div class="layer" id="newR">
    <p class="sec">Agora · papel do agente</p>
    <ul class="role">${ROLE.map(([k, v], i) => `<li id="ro${i}"><i></i><span><b>${k}:</b> ${v}</span></li>`).join('')}</ul>
    <p class="sec g">Guardrails críticos</p>
    <ul class="guards">${GUARD.map((g, i) => `<li id="gd${i}"><span class="lk">${lineIcon('lock', 2.2)}</span>${g}<span class="tg"><i></i></span></li>`).join('')}</ul>
  </div>
</div>`;

// resultado
const DASH = `
<div class="card dash" id="dash">
  <div class="dh"><img src="${LOGO.ubots}" alt="Ubots"><span class="tab">${lineIcon('chat', 2)}Resultados do teste</span></div>
  <div class="kpi"><small>+R$</small> <b id="kv">0</b> <small>mil</small></div>
  <p class="kl">em crédito liberado</p>
  <div class="bars">${[18, 30, 26, 44, 52, 70, 92].map((v, i) => `<i style="height:${v}%"></i>`).join('')}</div>
  <div class="row" id="drow"><img src="${fileUrl('reels/fotos/personagem.jpg')}" alt=""><span><b>Carla · Reforma da cozinha</b><small>via WhatsApp · Agente de IA</small></span><em>${tick}Contratado</em></div>
  <div class="dchips"><span class="g" id="dc0">Primeiros dias de teste</span><span id="dc1">Transbordo baixo</span></div>
</div>`;

// método
const CHECKS = ['Papel do agente', 'Guardrails de segurança', 'Plano de teste em volume controlado', 'Indicadores para decidir se amplia'];
const METHOD = `
<div class="fan" id="fan">${[5, 9, 8].map((n, i) => `<img class="fp" id="fp${i}" src="${page(n)}">`).join('')}</div>
<div class="card chk" id="chk">
  <ul>${CHECKS.map((t, i) => `<li id="ck${i}"><span class="bx"><i>${lineIcon('check', 3)}</i></span>${t}</li>`).join('')}</ul>
  <p class="safe" id="safe">${lineIcon('shield', 2.2)}Teste com segurança, em volume controlado.</p>
</div>`;

// cartão final
const END = `
<p class="endsub" id="endsub">Case Viacredi + Ubots</p>
<div class="cover" id="cover"><img src="${page(1)}"></div>
<div class="dl" id="dl"><span>BAIXAR PLAYBOOK</span><b>${lineIcon('fwd', 2.6)}</b><i class="rip" id="rip"></i></div>
<img class="elogo" id="elogo" src="${LOGO.ubots}" alt="Ubots">`;

const CURSOR = `<div class="cursor" id="cur"><svg viewBox="0 0 24 24"><path d="M4 2l15 9.5-6.6 1.4L16.5 21l-3 1.3-4.1-8.1L4 18.6z" fill="#070401" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg></div>`;

const RCSS = `
@font-face{font-family:'ISerif';font-style:normal;font-weight:400;src:url(${font('InstrumentSerif-Regular.ttf')})}
@font-face{font-family:'ISerif';font-style:italic;font-weight:400;src:url(${font('InstrumentSerif-Italic.ttf')})}
@property --u{syntax:'<number>';inherits:true;initial-value:0}
html,body{margin:0;background:#000}
.stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#FFFDF9;font-family:'Nunito',sans-serif;color:#070401}
.bok{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(253,195,72,.5) 0%,rgba(253,195,72,.16) 45%,rgba(253,195,72,0) 70%)}
.hl{position:absolute;left:50px;right:50px;top:200px;margin:0;text-align:center;font:400 96px/1.02 'ISerif';letter-spacing:-.01em;opacity:0;z-index:6}
.hl .l1,.hl .l2{display:block}
.hl em{font-style:italic;color:#D8941A;position:relative;display:inline-block;padding:0 6px}
.hl em:after{content:"";position:absolute;left:6px;right:6px;bottom:4px;height:5px;border-radius:3px;background:#FDC348;transform-origin:0 50%;transform:scaleX(var(--u))}
.hl.md{font-size:80px}
.hl.end{top:190px}
.hl.end .l2 em{font-size:64px;line-height:1.2}
.card{position:absolute;background:#fff;border-radius:36px;box-shadow:0 2px 4px rgba(107,77,0,.06),0 40px 90px rgba(107,77,0,.18);overflow:hidden}
/* balões */
.bub{position:relative;max-width:86%;font:500 30px/1.3 'Inter';color:#141414;padding:18px 22px 42px;border-radius:24px;box-shadow:0 2px 2px rgba(0,0,0,.08),0 10px 24px rgba(107,77,0,.12)}
.bub.us{align-self:flex-end;background:#D9FDD3;border-top-right-radius:4px}
.bub.ag{align-self:flex-start;background:#fff;border-top-left-radius:4px}
.bt{position:absolute;right:16px;bottom:11px;display:flex;align-items:center;gap:6px;font:400 19px/1 'Inter';color:#655F58}
.bt svg{width:21px;height:21px;color:#C88D0A}
.typ{align-self:flex-start;display:flex;gap:9px;background:#fff;padding:20px 22px;border-radius:24px;border-top-left-radius:4px;box-shadow:0 10px 24px rgba(107,77,0,.12)}
.typ i{width:14px;height:14px;border-radius:50%;background:#AFAFB4}
/* gancho */
.hook{position:absolute;left:80px;right:80px;top:640px;display:flex;flex-direction:column;gap:30px}
.hk-who{display:flex;align-items:center;gap:18px;align-self:flex-end}
.hk-who img{width:96px;height:96px;border-radius:50%;object-fit:cover;object-position:50% 18%;box-shadow:0 10px 24px rgba(107,77,0,.2)}
.hk-who b{display:block;font:700 34px/1 'Poppins'} .hk-who small{display:block;font:500 24px/1.3 'Poppins';color:#6C6C71;margin-top:6px}
.hk-who{flex-direction:row-reverse;text-align:right}
#hb{font-size:54px;line-height:1.22;padding:30px 36px 64px;max-width:100%;border-radius:40px;border-top-right-radius:6px}
#hb .bt{font-size:26px;right:26px;bottom:20px} #hb .bt svg{width:28px;height:28px}
.hk-typ{align-self:flex-start;display:flex;align-items:center;gap:14px;background:#fff;padding:22px 30px 22px 22px;border-radius:999px;box-shadow:0 14px 30px rgba(107,77,0,.16)}
.hk-typ .av{width:60px;height:60px;border-radius:50%;background:#FDC348;display:grid;place-items:center}
.hk-typ .av svg{width:30px;height:30px;fill:#070401}
.hk-typ i{width:18px;height:18px;border-radius:50%;background:#AFAFB4}
/* tela dividida */
.split{position:absolute;left:30px;right:30px;top:500px;height:1000px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
.col{position:relative;border-radius:34px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 30px 70px rgba(107,77,0,.2)}
.col.bot{background:#ECE7DF}
.col.ctx{background:#FFF3D1;outline:4px solid #FDC348;outline-offset:-4px}
.ch{padding:22px 20px 14px;display:flex;justify-content:center}
.lbl{display:inline-flex;align-items:center;gap:10px;font:700 28px/1 'Poppins';padding:14px 20px;border-radius:999px}
.lbl svg{width:28px;height:28px}
.bot .lbl{background:#fff;color:#6C6C71}
.ctx .lbl{background:#070401;color:#FDC348} .ctx .lbl svg{fill:#FDC348}
.vp{position:relative;flex:1;overflow:hidden}
.th{position:absolute;left:0;right:0;top:0;padding:10px 18px 30px;display:flex;flex-direction:column;gap:16px}
.col .bub{font-size:27px;max-width:92%;padding:16px 18px 38px}
.col .bt{font-size:17px}
.seen{margin:0;align-self:flex-end;display:flex;align-items:center;gap:8px;font:500 22px/1 'Inter';color:#8D8780}
.seen svg{width:22px;height:22px}
.sim{display:flex;flex-direction:column;gap:6px;margin-top:12px;background:#F7F4EE;border:1px solid #E8E2D7;border-radius:14px;padding:14px 16px}
.sim small{font:500 20px/1 'Inter';color:#655F58}.sim b{font:700 38px/1.05 'Inter';letter-spacing:-.02em}.sim em{font:500 22px/1.2 'Inter';font-style:normal;color:#6B4D00}
.cta-in{align-self:flex-start;display:flex;align-items:center;gap:10px;background:#fff;color:#0E7A4B;font:600 26px/1 'Inter';padding:18px 20px;border-radius:18px;margin-top:-6px;box-shadow:0 6px 14px rgba(107,77,0,.12)}
.cta-in svg{width:26px;height:26px}
.react{position:absolute;left:14px;bottom:-20px;display:inline-flex;align-items:center;gap:6px;background:#070401;color:#FDC348;font:700 21px/1 'Poppins';padding:8px 12px;border-radius:999px}
.react svg{width:20px;height:20px;color:#FDC348}
.verdict{position:absolute;left:18px;right:18px;bottom:18px;display:flex;align-items:center;justify-content:center;gap:10px;font:800 32px/1 'Poppins';padding:24px 0;border-radius:22px}
.bot .verdict{background:#fff;color:#6C6C71}
.ctx .verdict{background:#070401;color:#FDC348}
.verdict svg{width:32px;height:32px}
.confetti{position:absolute;left:0;right:0;top:0;height:0;z-index:25}
.confetti i{position:absolute;top:0;border-radius:3px}
/* wipe */
.wipe{position:absolute;top:-300px;bottom:-300px;left:-2300px;width:1400px;background:linear-gradient(90deg,#FDC348,#F4AE2A);transform:skewX(-18deg);z-index:30}
/* builder */
.bld{left:70px;right:70px;top:560px;height:900px}
.bh{display:flex;align-items:center;gap:18px;padding:28px 32px;border-bottom:1px solid #EEE7D8;font:600 30px/1 'Poppins';white-space:nowrap}
.bh b{font-weight:700} .bh b span{font-weight:500;color:#6C6C71}
.bh .dots{display:flex;gap:9px}.bh .dots i{width:15px;height:15px;border-radius:50%;background:#E3DCCD}
.layer{position:absolute;left:0;right:0;top:100px}
.sec{margin:28px 40px 6px;font:700 24px/1 'Poppins';letter-spacing:.08em;text-transform:uppercase;color:#6C6C71}
.sec.g{color:#6B4D00;margin-top:30px}
.rules{list-style:none;margin:0;padding:6px 26px}
.rules li{position:relative;display:flex;align-items:center;gap:20px;padding:20px 12px;border-bottom:1px solid #F1ECE2;font:700 33px/1.2 'Nunito';color:#070401}
.rules li:before{display:none}
.rules li s{position:absolute;left:80px;top:50%;height:5px;width:0;background:#FDC348;border-radius:3px}
.bi{width:46px;height:46px;border-radius:12px;background:#F3EFE7;display:grid;place-items:center;flex:none}
.bi svg{width:24px;height:24px}
.role{list-style:none;margin:0;padding:10px 40px 0;display:flex;flex-direction:column;gap:20px}
.role li{display:flex;align-items:baseline;gap:16px;font:600 34px/1.3 'Nunito'}
.role li b{font-weight:800}
.role li i{width:16px;height:16px;border-radius:50%;background:#FDC348;flex:none;transform:translateY(-4px)}
.guards{list-style:none;margin:6px 26px 0;padding:0;background:#070401;border-radius:26px}
.guards li{display:flex;align-items:center;gap:18px;padding:22px 24px;color:#FFFDF9;font:600 31px/1.25 'Nunito';border-bottom:1px solid #2C2620}
.guards li:last-child{border-bottom:0}
.lk{width:48px;height:48px;border-radius:13px;background:rgba(253,195,72,.16);color:#FDC348;display:grid;place-items:center;flex:none}
.lk svg{width:24px;height:24px}
.tg{margin-left:auto;width:84px;height:46px;border-radius:999px;background:#3A332B;position:relative;flex:none}
.tg i{position:absolute;left:5px;top:5px;width:36px;height:36px;border-radius:50%;background:#fff}
/* dashboard */
.dash{left:80px;right:80px;top:600px;padding:0 0 34px}
.dh{display:flex;align-items:center;gap:22px;padding:26px 32px;border-bottom:1px solid #EEE7D8}
.dh img{height:36px}
.tab{display:inline-flex;align-items:center;gap:10px;font:600 24px/1 'Poppins';background:#FFF3D1;color:#6B4D00;padding:12px 18px;border-radius:12px}
.tab svg{width:24px;height:24px}
.kpi{padding:34px 40px 0;font:700 150px/1 'Poppins';letter-spacing:-.045em;white-space:nowrap}
.kpi small{font-size:72px;letter-spacing:-.02em;color:#6B4D00}
.kl{margin:10px 40px 0;font:600 36px/1.2 'Poppins';color:#6C6C71}
.bars{display:flex;align-items:flex-end;gap:16px;height:160px;margin:30px 40px 0;border-bottom:2px solid #EEE7D8}
.bars i{flex:1;background:linear-gradient(180deg,#FDC348,#F4AE2A);border-radius:12px 12px 0 0;transform-origin:50% 100%}
.bars i:last-child{background:#070401}
.row{display:flex;align-items:center;gap:20px;margin:26px 30px 0;padding:18px 20px;border-radius:22px;background:#FFF8E7;border:1px solid #F0DDAE}
.row img{width:80px;height:80px;border-radius:50%;object-fit:cover;object-position:50% 18%}
.row b{display:block;font:700 30px/1.15 'Poppins'} .row small{display:block;font:500 22px/1.3 'Poppins';color:#6C6C71;margin-top:4px}
.row em{margin-left:auto;display:inline-flex;align-items:center;gap:8px;font:700 24px/1 'Poppins';font-style:normal;background:#070401;color:#FDC348;padding:12px 16px;border-radius:999px}
.row em svg{width:22px;height:22px}
.dchips{display:flex;flex-wrap:wrap;gap:12px;margin:24px 40px 0}
.dchips span{font:600 25px/1 'Poppins';padding:14px 18px;border-radius:999px;background:#F3EFE7}
.dchips span.g{background:#FDC348}
/* método */
.fan{position:absolute;left:0;right:0;top:500px;height:480px;perspective:2000px}
.fp{position:absolute;left:50%;top:0;width:760px;margin-left:-380px;border-radius:20px;box-shadow:0 30px 70px rgba(107,77,0,.25)}
.chk{left:70px;right:70px;top:1010px;padding:30px 34px 28px}
.chk ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:20px}
.chk li{display:flex;align-items:center;gap:22px;font:700 40px/1.15 'Poppins'}
.bx{width:62px;height:62px;border-radius:18px;border:4px solid #070401;display:grid;place-items:center;flex:none;overflow:hidden}
.bx i{width:100%;height:100%;background:#FDC348;display:grid;place-items:center}
.bx svg{width:36px;height:36px}
.safe{display:flex;align-items:center;gap:14px;margin:26px 0 0;padding:20px 22px;border-radius:20px;background:#070401;color:#FDC348;font:700 30px/1.2 'Poppins'}
.safe svg{width:32px;height:32px;flex:none}
/* fim */
.endsub{position:absolute;left:0;right:0;top:480px;margin:0;text-align:center;font:600 30px/1 'Poppins';color:#6C6C71}
.cover{position:absolute;left:110px;top:570px;width:860px;height:484px;border-radius:28px;overflow:hidden;box-shadow:0 50px 100px rgba(107,77,0,.28)}
.cover img{width:100%;height:100%;display:block}
.dl{position:absolute;left:110px;right:110px;top:1120px;height:116px;border-radius:999px;background:#FDC348;display:flex;align-items:center;justify-content:space-between;padding:0 18px 0 46px;overflow:hidden;box-shadow:0 24px 50px rgba(244,174,42,.4)}
.dl span{font:700 42px/1 'Poppins';letter-spacing:.01em}
.dl b{width:82px;height:82px;border-radius:50%;background:#070401;color:#FDC348;display:grid;place-items:center}
.dl b svg{width:40px;height:40px}
.rip{position:absolute;right:59px;top:58px;width:20px;height:20px;margin:-10px;border-radius:50%;background:rgba(255,253,249,.8)}
.elogo{position:absolute;left:50%;top:1310px;height:58px;margin-left:-135px}
.cursor{position:absolute;left:0;top:0;width:78px;height:78px;z-index:40;filter:drop-shadow(0 6px 10px rgba(7,4,1,.3))}
.cursor svg{width:100%;height:100%}
`;

// momentos das mensagens (usados na rolagem de cada coluna)
const TL = { l0: 2.35, lt: 3.0, l1: 3.75, l2: 5.6, l3: 6.4, lseen: 8.3, r0: 2.45, rt: 3.0, r1: 3.55, r2: 4.9, r3: 5.9, rbtn: 6.6, r4: 9.15 };

const JS = `
const E = (s) => typeof s === 'string' ? document.querySelector(s) : s;
const A = [];
const ez = 'cubic-bezier(.22,.9,.24,1)', ez2 = 'cubic-bezier(.65,0,.35,1)', back = 'cubic-bezier(.34,1.56,.64,1)', inq = 'cubic-bezier(.55,0,.9,.4)';
const USED = new Map();
function an(sel, kf, t0, d, easing = ez) {
  const el = E(sel); if (!el) throw new Error('no ' + sel);
  const props = Object.keys(kf[0]).filter((k) => k !== 'offset' && k !== 'easing');
  const used = USED.get(el) || new Set(); const later = props.some((k) => used.has(k)); props.forEach((k) => used.add(k)); USED.set(el, used);
  const a = el.animate(kf, { delay: t0 * 1000, duration: d * 1000, fill: later ? 'forwards' : 'both', easing }); a.pause(); A.push(a); return a;
}
const show = (s, t0, t1) => { an(s, [{ visibility: 'hidden' }, { visibility: 'visible' }], t0, .001, 'step-start'); if (t1 < 30) an(s, [{ visibility: 'visible' }, { visibility: 'hidden' }], t1, .001, 'step-start'); };
const pop = (s, t0, d = .42, dy = 30) => an(s, [{ opacity: 0, transform: 'translateY(' + dy + 'px) scale(.9)' }, { opacity: 1, transform: 'none' }], t0, d, back);
const dots = (sel, t0, t1) => document.querySelectorAll(sel + ' i').forEach((d, i) => { for (let t = t0 + i * .12; t < t1 - .2; t += .6) an(d, [{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], t, .4, 'ease-in-out'); });
function headline(id, t0, t1) {
  const h = E('#' + id); show(h, t0, t1);
  an(h, [{ opacity: 0 }, { opacity: 1 }], t0, .25, 'linear');
  an(h.querySelector('.l1'), [{ filter: 'blur(14px)', transform: 'translateY(18px)', opacity: 0 }, { filter: 'blur(0px)', transform: 'none', opacity: 1 }], t0, .45);
  an(h.querySelector('.l2'), [{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'none' }], t0 + .25, .45);
  an(h.querySelector('em'), [{ '--u': 0 }, { '--u': 1 }], t0 + .55, .4, ez2);
  if (t1 < 30) an(h, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(12px)' }], t1 - .2, .2, 'linear');
}
${JSON.stringify(HL)}.forEach(([id, a, b]) => headline(id, a, b));
// h3 entra trocando só a 2ª linha (continuidade com h2)
document.querySelectorAll('.bok').forEach((b, i) => an(b, [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + (i % 2 ? -140 : 160) + 'px,' + (i % 3 ? 180 : -160) + 'px) scale(1.18)' }], 0, 30, 'linear'));

// ---- 1 · gancho (0–2.0)
show('#hook', 0, 2.05);
an('#hook .hk-who', [{ opacity: 0, transform: 'translateX(80px)' }, { opacity: 1, transform: 'none' }], 0.0, .4);
an('#hb', [{ opacity: 0, transform: 'translateY(-260px) rotate(-6deg) scale(1.25)' }, { opacity: 1, transform: 'rotate(-2deg)' }], 0.0, .55, back);
an('#hktyp', [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], 0.75, .35, back);
dots('#hktyp', 0.9, 2.0);
an('#hook', [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], 0.2, 1.6, 'linear');
// transição: o balão sobe e vira o topo das duas colunas
an('#hook', [{ transform: 'scale(1.06)', opacity: 1 }, { transform: 'scale(.55) translateY(-420px)', opacity: 0 }], 1.8, .3, inq);

// ---- 2/3 · tela dividida (1.85–11.45)
show('#split', 1.85, 11.75);
an('#colL', [{ transform: 'translateX(-600px) rotate(-6deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], 1.85, .55);
an('#colR', [{ transform: 'translateX(600px) rotate(6deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], 1.95, .55);
const T = ${JSON.stringify(TL)};
Object.entries(T).forEach(([id, t]) => { if (id === 'lt' || id === 'rt') return; pop('#' + id, t); });
// digitando: aparece, pulsa e sai
[['lt', 3.0, 3.7], ['rt', 3.0, 3.5]].forEach(([id, a, b]) => { an('#' + id, [{ opacity: 0, transform: 'scale(.7)', height: '0px', padding: '0px' }, { opacity: 1, transform: 'none', height: '54px', padding: '20px 22px' }], a, .25, back); dots('#' + id, a + .1, b); an('#' + id, [{ opacity: 1, height: '54px', padding: '20px 22px', marginTop: '0px' }, { opacity: 0, height: '0px', padding: '0px', marginTop: '-16px' }], b, .12, 'linear'); });
// bot erra: tremida
an('#colL', [{ translate: '0 0' }, { translate: '-14px 0' }, { translate: '12px 0' }, { translate: '-8px 0' }, { translate: '0 0' }], 6.45, .3, 'linear');
// zoom de foco alternado
an('#split', [{ transform: 'none' }, { transform: 'scale(1.03)' }], 2.5, 5.4, 'linear');
// dois finais
pop('#vL', 8.35, .4, 40); pop('#vR', 9.6, .4, 40);
an('#colL', [{ filter: 'grayscale(0)', opacity: 1, transform: 'none' }, { filter: 'grayscale(1)', opacity: .5, transform: 'scale(.93) rotate(-2deg)' }], 8.6, .6, ez2);
an('#colR', [{ transform: 'none' }, { transform: 'scale(1.05) rotate(1deg)' }], 8.6, .6, ez2);
an('#rbtn', [{ transform: 'scale(1)', background: '#fff' }, { transform: 'scale(.92)', background: '#FFF3D1' }, { transform: 'scale(1)', background: '#fff' }], 8.75, .3, 'linear');
an('#r4 .react', [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], 9.45, .4, back);
show('#conf', 9.5, 11.5);
document.querySelectorAll('#conf i').forEach((c, i) => {
  const x = ((i * 37) % 21 - 10) * 46, y = (i % 7) * 120, r = (i % 2 ? 1 : -1) * (300 + i * 23);
  an(c, [{ transform: 'translate(0px,1900px) rotate(0deg)', opacity: 0 }, { transform: 'translate(' + x / 2 + 'px,' + (500 + y) + 'px) rotate(' + r / 2 + 'deg)', opacity: 1, offset: .35 }, { transform: 'translate(' + x + 'px,' + (1300 + y) + 'px) rotate(' + r + 'deg)', opacity: 1 }], 9.55 + (i % 6) * .03, 1.5, 'cubic-bezier(.2,.7,.4,1)');
});
// wipe ouro (11.3–12.15)
an('#wipe', [{ transform: 'skewX(-18deg) translateX(0)' }, { transform: 'skewX(-18deg) translateX(5000px)' }], 11.3, .85, ez2);

// ---- 4 · Agent Builder (11.7–15.55)
show('#bld', 11.6, 15.55);
an('#bld', [{ transform: 'scale(.94)' }, { transform: 'none' }], 11.6, .6);
document.querySelectorAll('#oldR li s').forEach((s, i) => an(s, [{ width: '0' }, { width: '78%' }], 12.15 + i * .1, .3, ez2));
an('#oldR .sec', [{ opacity: 1 }, { opacity: 0 }], 12.7, .2, 'linear');
document.querySelectorAll('#oldR li').forEach((li, i) => an(li, [{ transform: 'none', opacity: 1 }, { transform: 'translate(' + [-900, 900, -850, 950][i] + 'px,' + [-400, -200, 300, 100][i] + 'px) rotate(' + [-40, 35, -30, 45][i] + 'deg)', opacity: 0 }], 12.7 + i * .08, .55, inq));
pop('#newR .sec', 13.15, .35, 14);
['#ro0', '#ro1', '#ro2'].forEach((s, i) => an(s, [{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 1, transform: 'none' }], 13.3 + i * .18, .4));
pop('#newR .sec.g', 13.9, .35, 14);
an('#newR .guards', [{ opacity: 0, transform: 'translateY(60px)' }, { opacity: 1, transform: 'none' }], 14.0, .4);
document.querySelectorAll('#newR .guards li').forEach((li, i) => {
  an(li.querySelector('.tg'), [{ background: '#3A332B' }, { background: '#FDC348' }], 14.35 + i * .25, .2, 'linear');
  an(li.querySelector('.tg i'), [{ transform: 'translateX(0)' }, { transform: 'translateX(38px)' }], 14.35 + i * .25, .25, back);
  an(li.querySelector('.lk'), [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 14.35 + i * .25, .35, ez2);
});
an('#bld', [{ transform: 'none' }, { transform: 'scale(1.04) translateY(-30px)' }], 13.8, 1.5, ez2);
an('#bld', [{ transform: 'scale(1.04) translateY(-30px)', opacity: 1 }, { transform: 'scale(.6) translateY(-200px)', opacity: 0 }], 15.3, .28, inq);

// ---- 5 · prova (15.45–19.6)
show('#dash', 15.45, 19.6);
an('#dash', [{ transform: 'scale(1.25)', opacity: 0, filter: 'blur(14px)' }, { transform: 'none', opacity: 1, filter: 'blur(0px)' }], 15.45, .55);
document.querySelectorAll('.bars i').forEach((b, i) => an(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], 15.95 + i * .1, .45, back));
an('#drow', [{ opacity: 0, transform: 'translateX(700px)' }, { opacity: 1, transform: 'none' }], 17.0, .5);
an('#drow em', [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], 17.4, .4, back);
pop('#dc0', 17.8, .35, 14); pop('#dc1', 18.0, .35, 14);
an('#dash', [{ transform: 'none' }, { transform: 'scale(1.04)' }], 16.0, 3.2, 'linear');
an('#dash', [{ transform: 'scale(1.04)' }, { transform: 'translateX(-1250px) rotate(-8deg)' }], 19.35, .28, inq);

// ---- 6 · método (19.4–25.15)
show('#fan', 19.4, 25.15); show('#chk', 19.4, 25.15);
[0, 1, 2].forEach((i) => an('#fp' + i, [{ transform: 'translateX(1300px) rotateY(-50deg) rotate(12deg)' }, { transform: 'translateY(' + (i * 46) + 'px) rotate(' + [-6, 4, -1][i] + 'deg)' }], 19.5 + i * .3, .6, ez));
an('#chk', [{ transform: 'translateY(900px)' }, { transform: 'none' }], 20.2, .6);
[0, 1, 2, 3].forEach((i) => {
  pop('#ck' + i, 20.5 + i * .12, .35, 20);
  an('#ck' + i + ' .bx i', [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], 21.2 + i * .45, .35, back);
});
an('#safe', [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], 23.1, .45, back);
an('#fan', [{ transform: 'none' }, { transform: 'scale(1.05)' }], 20.0, 5.0, 'linear');
an('#fan', [{ transform: 'scale(1.05)', opacity: 1 }, { transform: 'scale(.6) translateY(-200px)', opacity: 0 }], 24.9, .28, inq);
an('#chk', [{ transform: 'none', opacity: 1 }, { transform: 'translateY(400px)', opacity: 0 }], 24.9, .28, inq);

// ---- 7 · cartão final (25.0–30)
show('#endsub', 25.0, 31); show('#cover', 25.0, 31); show('#dl', 25.0, 31); show('#elogo', 25.0, 31);
pop('#endsub', 25.5, .4, 14);
an('#cover', [{ transform: 'translateY(200px) scale(.8) rotate(-4deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], 25.15, .7, back);
an('#cover', [{ transform: 'none' }, { transform: 'translateY(-14px)' }], 26.0, 4.0, 'ease-in-out');
an('#dl', [{ transform: 'translateY(160px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 25.5, .55, back);
pop('#elogo', 25.9, .4, 16);
an('#dl', [{ transform: 'none' }, { transform: 'scale(.96)' }, { transform: 'scale(1.03)' }, { transform: 'none' }], 27.45, .45, 'linear');
an('#rip', [{ transform: 'scale(0)', opacity: .9 }, { transform: 'scale(16)', opacity: 0 }], 27.5, .7, 'cubic-bezier(.2,.7,.4,1)');
an('#dl', [{ transform: 'none' }, { transform: 'scale(1.04)' }, { transform: 'none' }], 28.6, .6, ez2);
an('#cur', [{ visibility: 'hidden' }, { visibility: 'visible' }], 8.0, .001, 'step-start');
an('#cur', [{ visibility: 'visible' }, { visibility: 'hidden' }], 9.2, .001, 'step-start');
an('#cur', [{ visibility: 'hidden' }, { visibility: 'visible' }], 26.6, .001, 'step-start');

// rolagem de cada coluna: mantém a última mensagem à vista
function colScroll(th, ids) {
  const vh = E(th).parentElement.clientHeight - 120; let prev = 0;
  ids.forEach((id) => { const el = E('#' + id); const b = el.offsetTop + el.offsetHeight + 26; const tgt = Math.max(0, b - vh); if (tgt > prev + 1) { an(th, [{ transform: 'translateY(' + -prev + 'px)' }, { transform: 'translateY(' + -tgt + 'px)' }], T[id] - .05, .4, ez2); prev = tgt; } });
}
function cursorPath() {
  const st = E('.stage').getBoundingClientRect();
  const at = (t, sel) => { window.seek(t); const r = E(sel).getBoundingClientRect(); return [Math.round(r.left - st.left + r.width / 2 - 14), Math.round(r.top - st.top + r.height / 2 - 8)]; };
  const [x1, y1] = at(8.75, '#rbtn'), [x2, y2] = at(27.45, '#dl b');
  const P = (x, y, s = 1) => 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  an('#cur', [{ transform: P(1150, 1700) }, { transform: P(x1, y1) }], 8.0, .7, ez2);
  an('#cur', [{ transform: P(x1, y1) }, { transform: P(x1, y1, .82) }, { transform: P(x1, y1) }], 8.72, .3, 'linear');
  an('#cur', [{ transform: P(x1, y1) }, { transform: P(1150, 1700) }], 9.0, .25, inq);
  an('#cur', [{ transform: P(1150, 1700) }, { transform: P(x2, y2) }], 26.6, .8, ez2);
  an('#cur', [{ transform: P(x2, y2) }, { transform: P(x2, y2, .82) }, { transform: P(x2, y2) }], 27.4, .3, 'linear');
}
const kv = E('#kv');
window.seek = (t) => {
  for (const a of A) a.currentTime = t * 1000;
  const p = Math.min(1, Math.max(0, (t - 15.9) / 1.3)); kv.textContent = String(Math.round(150 * (1 - Math.pow(1 - p, 3))));
};
window.ready = document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => 0)))).then(() => {
  colScroll('#thL', ['l0', 'l1', 'l2', 'l3', 'lseen']);
  colScroll('#thR', ['r0', 'r1', 'r2', 'r3', 'rbtn', 'r4']);
  for (const a of A) a.pause();
  cursorPath();
  for (const a of A) a.pause();
});
`;

const bok = [[-200, 300, 700], [600, -150, 760], [-150, 1350, 640], [700, 1500, 720]].map(([x, y, s]) => `<i class="bok" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px"></i>`).join('');
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}\n${RCSS}</style></head>
<body><div class="stage">${bok}${HOOK}${SPLIT}${BUILDER}${DASH}${METHOD}${END}${hlHtml}<div class="wipe" id="wipe"></div>${CURSOR}</div><script>${JS}</script></body></html>`;
const HTML = path.join(OUT, 'reel-a.html');
fs.writeFileSync(HTML, html);

// ---------- SRT ----------
const ts = (s) => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
fs.writeFileSync(path.join(OUT, 'reel-a.srt'), HL.map(([, a, b, x, y], i) => `${i + 1}\n${ts(a)} --> ${ts(Math.min(b, 30))}\n${x} ${y}\n`).join('\n'));

// ---------- render ----------
const stillsOnly = process.argv.includes('--stills');
const browser = await chromium.launch();
async function open() {
  const p = await browser.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', (e) => { console.error('page error', e.message); process.exitCode = 1; });
  await p.goto(pathToFileURL(HTML).href);
  await p.evaluate(() => window.ready);
  return p;
}
const STILLS = [0.5, 1.5, 2.6, 3.3, 4.2, 5.4, 6.8, 8.9, 10.0, 12.0, 12.9, 14.8, 16.4, 18.4, 20.4, 22.6, 24.0, 25.6, 27.5, 29.4];
{
  const p = await open();
  fs.readdirSync(OUT).filter((f) => f.startsWith('still-a-')).forEach((f) => fs.rmSync(path.join(OUT, f)));
  for (const t of STILLS) { await p.evaluate((t) => window.seek(t), t); await p.screenshot({ path: path.join(OUT, `still-a-${t.toFixed(1).padStart(4, '0')}s.jpg`), type: 'jpeg', quality: 80 }); }
  await p.close(); console.log('stills', STILLS.length);
}
if (!stillsOnly) {
  fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
  const N = FPS * DUR, queue = [...Array(N).keys()]; let done = 0; const t0 = Date.now();
  await Promise.all([0, 1, 2, 3].map(async () => {
    const p = await open();
    while (queue.length) {
      const f = queue.shift();
      await p.evaluate((t) => window.seek(t), f / FPS);
      await p.screenshot({ path: path.join(FR, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
      if (++done % 150 === 0) console.log(`${done}/${N} frames · ${(done / ((Date.now() - t0) / 1000)).toFixed(1)} fps`);
    }
    await p.close();
  }));
  const wav = path.join(OUT, 'trilha-a.wav');
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(FR, 'f%04d.jpg'), ...(fs.existsSync(wav) ? ['-i', wav] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    ...(fs.existsSync(wav) ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []), path.join(OUT, 'reel-a.mp4')], { stdio: 'inherit' });
  if (r.status) process.exitCode = 1;
  fs.rmSync(FR, { recursive: true, force: true });
  console.log('mp4', path.join(OUT, 'reel-a.mp4'));
}
await browser.close();
