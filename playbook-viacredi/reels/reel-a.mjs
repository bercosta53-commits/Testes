// Reels A v2 · "Menos regras, mais contexto" (30 s, 1080x1920, 30 fps)
// Linguagem do vídeo de referência: título em serifa (2ª linha itálica ouro sublinhada), produto em cena o tempo todo,
// personagem com foto, chat curto em etapas, cursor, confete, wipe diagonal ouro e cartão final com clique.
//   node reels/reel-a.mjs            -> dist/reels/reel-a.mp4 (+ .srt)
//   node reels/reel-a.mjs --stills   -> só stills de revisão
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { CSS, LOGO, lineIcon, waScreen, m } from '../src/deck.mjs';

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

// ---------- títulos (são também a legenda) ----------
const HL = [
  ['h1', 0.15, 3.5, 'Seu agente de IA', 'pode estar robótico.'],
  ['h2', 3.65, 6.75, 'Regra atrás de regra,', 'conversa travada.'],
  ['h3', 7.1, 10.55, 'A Viacredi fez', 'o contrário.'],
  ['h4', 10.7, 13.5, 'Uma cooperada', 'reformando a cozinha.'],
  ['h5', 21.1, 23.95, 'Nos primeiros dias de teste,', '+R$ 150 mil em crédito.'],
  ['h6', 24.05, 26.5, 'O método está', 'no playbook.'],
  ['h7', 26.65, 31, 'Playbook', 'Agentes de IA na Oferta de Crédito'],
];
const STEPS = [['01', 'Escuta', 13.6, 15.4], ['02', 'Contexto', 15.4, 17.2], ['03', 'Oferta com sentido', 17.2, 19.25], ['04', 'Decisão dela', 19.25, 21.0]];
const hlHtml = HL.map(([id, , , a, b]) => `<h2 class="hl ${id === 'h7' ? 'end' : ''}" id="${id}"><span class="l1">${a}</span><span class="l2"><em>${b}</em></span></h2>`).join('')
  + STEPS.map(([n, t], i) => `<h2 class="hl stp" id="st${i}"><span class="l1"><b>${n}</b> ${t}</span></h2>`).join('');

// ---------- cenas ----------
const RULES = ['Não fale sobre outros produtos', 'Não responda fora do roteiro', 'Não ofereça outras linhas', 'Sempre use a frase padrão', 'Não saia do fluxo', 'Responda só SIM ou NÃO'];
const ban = lineIcon('ban', 2.2);
const B1 = `
<div class="card bld" id="bld">
  <div class="bh"><span class="dots"><i></i><i></i><i></i></span><b>Agente Viacredi <span>· Instruções</span></b><span class="cnt" id="rcnt">0 regras</span></div>
  <ul class="rules">${RULES.map((r, i) => `<li id="ru${i}"><span class="bi">${ban}</span>${r}<em>regra</em></li>`).join('')}</ul>
</div>`;

const B2 = `
<div class="chatw" id="chat1" style="width:420px;height:470px">
  ${waScreen({ date: false, input: true, size: 'lg', body: `
    <div id="c1a">${m('ag', 'Temos crédito disponível. Responda SIM ou NÃO.', '10:02', { btns: [{ t: 'SIM' }, { t: 'NÃO' }], cls: 'btn-row' })}</div>
    <div id="c1b">${m('us', 'Depende… pra que serve?', '10:04')}</div>
    <div id="c1c">${m('ag', 'Não entendi. Responda SIM ou NÃO.', '10:04')}</div>` })}
</div>
<div class="stamp" id="stamp">${lineIcon('ban', 2.4)}Conversa travada</div>`;

const ROLE = [['Objetivo', 'oferecer crédito que faça sentido'], ['Contexto', 'o momento e o plano do cooperado'], ['Liberdade', 'para conversar como gente']];
const GUARD = ['Transparência sobre juros e IOF', 'Contratação pelo app, por segurança', 'Time humano quando precisar'];
const B4 = `
<div class="card bld b2" id="bld2">
  <div class="bh"><span class="dots"><i></i><i></i><i></i></span><b>Agente Viacredi <span>· Papel do agente</span></b><span class="cnt gold" id="gcnt">${lineIcon('shield', 2.2)}Guardrails</span></div>
  <div class="layer" id="oldR"><ul class="rules">${RULES.slice(0, 5).map((r, i) => `<li id="fo${i}"><span class="bi">${ban}</span>${r}<em>regra</em></li>`).join('')}</ul></div>
  <div class="layer" id="newR">
    <ul class="role">${ROLE.map(([k, v], i) => `<li id="ro${i}"><i></i><span><b>${k}:</b> ${v}</span></li>`).join('')}</ul>
    <p class="gsub" id="gsub">Guardrails críticos</p>
    <ul class="guards">${GUARD.map((g, i) => `<li id="gd${i}"><span class="lk">${lineIcon('lock', 2.2)}</span>${g}<span class="tg"><i></i></span></li>`).join('')}</ul>
  </div>
</div>`;

const B5 = `
<div class="kit" id="kit"><img src="${fileUrl('reels/fotos/cozinha-reforma.jpg')}" alt=""><span class="ilu">Imagem ilustrativa</span></div>
<div class="persona" id="persona">
  <img src="${fileUrl('reels/fotos/personagem.jpg')}" alt="">
  <div><b>Carla</b><small>Cooperada desde 2015</small>
  <span class="pchips"><i>Crédito ativo</i><i class="g">Nova linha disponível</i></span></div>
</div>`;

const CHAT2 = [
  ['us', 'Já tenho um crédito, mas gostei de saber dessa opção.', '14:21', 13.9],
  ['ag', 'Que bom! O que você está planejando?', '14:21', 14.75],
  ['us', 'Reformar a cozinha!', '14:22', 15.65],
  ['ag', 'Que projeto bacana! Móveis, eletros e obra ao mesmo tempo, né?', '14:22', 16.35],
];
const offer = `Essa linha pode ajudar na reforma:<span class="sim"><span class="sim-l">Crédito Reforma</span><b class="sim-v">R$ 15.000,00</b><span class="sim-d">24x · juros e IOF mostrados antes</span></span>`;
const B6 = `
<div class="chatw big" id="chat2" style="width:420px;height:500px">
  ${waScreen({ date: true, input: true, size: 'lg', body: `<div class="kw" id="kw">
    ${CHAT2.map(([s, t, h], i) => `<div class="cm" id="cm${i}">${m(s, t, h)}</div>`).join('')}
    <div class="cm" id="cm4">${m('ag', offer, '14:23', { btns: [{ t: 'Ver condições', icon: 'ext' }] })}</div>
    <div class="cm" id="cm5">${m('us', 'Quero contratar!', '14:24', { react: `${lineIcon('check', 2.6)}Contratado` })}</div>
  </div>` })}
</div>
<div class="confetti" id="conf">${Array.from({ length: 46 }, (_, i) => `<i style="left:${(i * 53) % 100}%;background:${['#FDC348', '#070401', '#FFFDF9', '#F4AE2A', '#25D366'][i % 5]};width:${10 + (i % 3) * 6}px;height:${16 + (i % 4) * 5}px"></i>`).join('')}</div>`;

const B7 = `
<div class="card dash" id="dash">
  <div class="dh"><img src="${LOGO.ubots}" alt="Ubots"><span class="tab">${lineIcon('chat', 2)}Resultados do teste</span></div>
  <div class="kpi"><small>+R$</small> <b id="kv">0</b> <small>mil</small></div>
  <p class="kl">em crédito liberado</p>
  <div class="bars">${[18, 30, 26, 44, 52, 70, 92].map((v, i) => `<i id="bar${i}" style="height:${v}%"></i>`).join('')}</div>
  <div class="dchips"><span class="g" id="dc0">Primeiros dias de teste</span><span id="dc1">Transbordo baixo</span><span id="dc2">4 agentes no Agent Builder</span></div>
</div>`;

const B8 = `
<div class="pages" id="pages">
  ${[[6, 'Segurança na conversa'], [8, 'Papel do agente e guardrails'], [9, 'Plano de teste e indicadores']].map(([n, t], i) => `<div class="pg" id="pg${i}"><img src="${page(n)}"><span class="ptag">${t}</span></div>`).join('')}
</div>`;

const B9 = `
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
.hl{position:absolute;left:50px;right:50px;top:210px;margin:0;text-align:center;font:400 94px/1.02 'ISerif';letter-spacing:-.01em;opacity:0;z-index:6}
.hl .l1,.hl .l2{display:block}
.hl em{font-style:italic;color:#D8941A;position:relative;display:inline-block;padding:0 6px}
.hl em:after{content:"";position:absolute;left:6px;right:6px;bottom:4px;height:5px;border-radius:3px;background:#FDC348;transform-origin:0 50%;transform:scaleX(var(--u))}
.hl.stp{top:240px}
.hl.stp b{font:700 88px/1 'Poppins';color:#FDC348;letter-spacing:-.04em;margin-right:14px}
.hl.end{top:200px}
.hl.end .l2 em{font-size:64px;line-height:1.2}
.card{position:absolute;background:#fff;border-radius:36px;box-shadow:0 2px 4px rgba(107,77,0,.06),0 40px 90px rgba(107,77,0,.18);overflow:hidden}
/* builder */
.bld{left:80px;right:80px;top:540px;padding-bottom:16px}
.bh{display:flex;align-items:center;gap:18px;padding:28px 32px;border-bottom:1px solid #EEE7D8;font:600 30px/1 'Poppins';white-space:nowrap}
.bh b{font-weight:700} .bh b span{font-weight:500;color:#6C6C71}
.bh .dots{display:flex;gap:9px}.bh .dots i{width:15px;height:15px;border-radius:50%;background:#E3DCCD}
.cnt{margin-left:auto;display:inline-flex;align-items:center;gap:8px;background:#070401;color:#FDC348;font:600 24px/1 'Poppins';padding:12px 18px;border-radius:999px}
.cnt.gold{background:#FDC348;color:#070401} .cnt svg{width:22px;height:22px}
.rules{list-style:none;margin:0;padding:14px 26px}
.rules li{display:flex;align-items:center;gap:20px;padding:20px 12px;border-bottom:1px solid #F1ECE2;font:700 33px/1.2 'Nunito';border-radius:16px;color:#070401}
.rules li:before{display:none}
.rules li:last-child{border-bottom:0}
.rules em{margin-left:auto;font:600 20px/1 'Poppins';font-style:normal;color:#6C6C71;background:#F3EFE7;padding:8px 12px;border-radius:999px}
.bi{width:46px;height:46px;border-radius:12px;background:#F3EFE7;color:#070401;display:grid;place-items:center;flex:none}
.bi svg{width:24px;height:24px}
.bld.b2{height:790px}
.layer{position:absolute;left:0;right:0;top:100px}
.role{list-style:none;margin:0;padding:30px 40px 6px;display:flex;flex-direction:column;gap:22px}
.role li{display:flex;align-items:baseline;gap:16px;font:600 34px/1.3 'Nunito'}
.role li b{font-weight:800}
.role li i{width:16px;height:16px;border-radius:50%;background:#FDC348;flex:none;transform:translateY(-4px)}
.gsub{margin:30px 40px 12px;font:700 24px/1 'Poppins';letter-spacing:.08em;text-transform:uppercase;color:#6B4D00}
.guards{list-style:none;margin:0 26px;padding:0;background:#070401;border-radius:26px}
.guards li{display:flex;align-items:center;gap:18px;padding:22px 24px;color:#FFFDF9;font:600 31px/1.25 'Nunito';border-bottom:1px solid #2C2620}
.guards li:last-child{border-bottom:0}
.lk{width:48px;height:48px;border-radius:13px;background:rgba(253,195,72,.16);color:#FDC348;display:grid;place-items:center;flex:none}
.lk svg{width:24px;height:24px}
.tg{margin-left:auto;width:84px;height:46px;border-radius:999px;background:#3A332B;position:relative;flex:none}
.tg i{position:absolute;left:5px;top:5px;width:36px;height:36px;border-radius:50%;background:#fff}
/* chat */
.chatw{position:absolute;left:50%;top:560px;margin-left:-210px;transform-origin:50% 0;border-radius:30px;overflow:hidden;box-shadow:0 30px 70px rgba(107,77,0,.22)}
.chatw .wa2{height:100%}
.chatw.big{top:470px}
.kw{display:flex;flex-direction:column;gap:5px}
.stamp{position:absolute;left:50%;top:1600px;transform:translateX(-50%);display:inline-flex;align-items:center;gap:14px;background:#070401;color:#FFFDF9;font:700 42px/1 'Poppins';padding:24px 36px;border-radius:999px;white-space:nowrap;box-shadow:0 20px 40px rgba(7,4,1,.3);z-index:5}
.stamp svg{width:40px;height:40px;color:#FDC348}
/* wipe */
.wipe{position:absolute;top:-300px;bottom:-300px;left:-2300px;width:1400px;background:linear-gradient(90deg,#FDC348,#F4AE2A);transform:skewX(-18deg);z-index:30}
/* personagem */
.kit{position:absolute;left:150px;top:500px;width:780px;height:900px;border-radius:40px;overflow:hidden;box-shadow:0 40px 90px rgba(107,77,0,.25)}
.kit img{width:100%;height:100%;object-fit:cover;transform-origin:50% 60%}
.ilu{position:absolute;right:22px;top:22px;font:600 18px/1 'Poppins';color:#fff;background:rgba(7,4,1,.45);padding:8px 12px;border-radius:999px}
.persona{position:absolute;left:70px;top:1230px;width:800px;display:flex;gap:26px;align-items:center;background:#fff;border-radius:32px;padding:22px 26px;box-shadow:0 30px 60px rgba(107,77,0,.25);z-index:2}
.persona img{width:156px;height:156px;border-radius:24px;object-fit:cover;object-position:50% 20%;flex:none}
.persona b{display:block;font:700 48px/1 'Poppins'}
.persona small{display:block;font:500 26px/1.2 'Poppins';color:#6C6C71;margin-top:8px}
.pchips{display:flex;gap:10px;margin-top:16px}
.pchips i{font:600 23px/1 'Poppins';font-style:normal;padding:11px 15px;border-radius:999px;background:#F3EFE7}
.pchips i.g{background:#FDC348}
/* oferta */
.sim{display:flex;flex-direction:column;gap:4px;margin:8px 0 2px;background:#F7F4EE;border:1px solid #E8E2D7;border-radius:8px;padding:10px 11px}
.sim-l{font:500 11px/1 'Inter';color:#655F58}
.sim-v{font:700 19px/1.1 'Inter';letter-spacing:-.02em}
.sim-d{font:500 11.5px/1.3 'Inter';color:#6B4D00}
.confetti{position:absolute;left:0;right:0;top:0;height:0;z-index:25}
.confetti i{position:absolute;top:0;border-radius:3px}
/* dashboard */
.dash{left:80px;right:80px;top:560px;padding:0 0 34px}
.dh{display:flex;align-items:center;gap:22px;padding:26px 32px;border-bottom:1px solid #EEE7D8}
.dh img{height:36px}
.tab{display:inline-flex;align-items:center;gap:10px;font:600 24px/1 'Poppins';background:#FFF3D1;color:#6B4D00;padding:12px 18px;border-radius:12px}
.tab svg{width:24px;height:24px}
.kpi{padding:40px 40px 0;font:700 150px/1 'Poppins';letter-spacing:-.045em;white-space:nowrap}
.kpi small{font-size:72px;letter-spacing:-.02em;color:#6B4D00}
.kl{margin:12px 40px 0;font:600 36px/1.2 'Poppins';color:#6C6C71}
.bars{display:flex;align-items:flex-end;gap:16px;height:200px;margin:34px 40px 0;border-bottom:2px solid #EEE7D8}
.bars i{flex:1;background:linear-gradient(180deg,#FDC348,#F4AE2A);border-radius:12px 12px 0 0;transform-origin:50% 100%}
.bars i:last-child{background:#070401}
.dchips{display:flex;flex-wrap:wrap;gap:12px;margin:30px 40px 0}
.dchips span{font:600 25px/1 'Poppins';padding:14px 18px;border-radius:999px;background:#F3EFE7}
.dchips span.g{background:#FDC348}
/* páginas */
.pages{position:absolute;left:0;right:0;top:600px;height:760px;perspective:2200px}
.pg{position:absolute;left:50%;top:40px;width:900px;height:506px;margin-left:-450px;border-radius:24px;box-shadow:0 40px 80px rgba(107,77,0,.25)}
.pg img{width:100%;height:100%;display:block;border-radius:24px}
.ptag{position:absolute;left:24px;top:-26px;font:700 28px/1 'Poppins';background:#070401;color:#FDC348;padding:14px 20px;border-radius:999px;white-space:nowrap}
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

const JS = `
const E = (s) => typeof s === 'string' ? document.querySelector(s) : s;
const A = [];
const ez = 'cubic-bezier(.22,.9,.24,1)', ez2 = 'cubic-bezier(.65,0,.35,1)', back = 'cubic-bezier(.34,1.56,.64,1)', inq = 'cubic-bezier(.55,0,.9,.4)';
const USED = new Map();
// a 1ª animação de uma propriedade num elemento preenche para trás; as seguintes só para frente
function an(sel, kf, t0, d, easing = ez) {
  const el = E(sel); if (!el) throw new Error('no ' + sel);
  const props = Object.keys(kf[0]).filter((k) => k !== 'offset' && k !== 'easing');
  const used = USED.get(el) || new Set(); const later = props.some((k) => used.has(k)); props.forEach((k) => used.add(k)); USED.set(el, used);
  const a = el.animate(kf, { delay: t0 * 1000, duration: d * 1000, fill: later ? 'forwards' : 'both', easing }); a.pause(); A.push(a); return a;
}
const show = (s, t0, t1) => { an(s, [{ visibility: 'hidden' }, { visibility: 'visible' }], t0, .001, 'step-start'); if (t1 < 30) an(s, [{ visibility: 'visible' }, { visibility: 'hidden' }], t1, .001, 'step-start'); };
const pop = (s, t0, d = .45, dy = 30) => an(s, [{ opacity: 0, transform: 'translateY(' + dy + 'px) scale(.92)' }, { opacity: 1, transform: 'none' }], t0, d, back);
function headline(id, t0, t1) {
  const h = E('#' + id); show(h, t0, t1);
  an(h, [{ opacity: 0 }, { opacity: 1 }], t0, .3, 'linear');
  an(h.querySelector('.l1'), [{ filter: 'blur(14px)', transform: 'translateY(18px)', opacity: 0 }, { filter: 'blur(0px)', transform: 'none', opacity: 1 }], t0, .5);
  const l2 = h.querySelector('.l2'); if (l2) {
    an(l2, [{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'none' }], t0 + .3, .5);
    an(h.querySelector('em'), [{ '--u': 0 }, { '--u': 1 }], t0 + .65, .45, ez2);
  }
  if (t1 < 30) an(h, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(12px)' }], t1 - .25, .25, 'linear');
}
${JSON.stringify(HL)}.forEach(([id, a, b]) => headline(id, a, b));
${JSON.stringify(STEPS)}.forEach(([n, t, a, b], i) => {
  const h = E('#st' + i); show(h, a, b);
  an(h, [{ opacity: 0, transform: 'translateX(140px)' }, { opacity: 1, transform: 'none' }], a, .45);
  an(h, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-140px)' }], b - .2, .2, inq);
});
document.querySelectorAll('.bok').forEach((b, i) => an(b, [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + (i % 2 ? -140 : 160) + 'px,' + (i % 3 ? 180 : -160) + 'px) scale(1.18)' }], 0, 30, 'linear'));

// B1 builder: regras empilhando (0–3.8)
show('#bld', 0, 3.8);
an('#bld', [{ transform: 'translateY(420px) rotate(-7deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], 0.1, .7);
document.querySelectorAll('#bld .rules li').forEach((li, i) => an(li, [{ transform: 'translateX(760px)', opacity: 0 }, { transform: 'none', opacity: 1 }], .55 + i * .33, .42, back));
an('#ru5', [{ background: 'rgba(255,243,209,0)' }, { background: 'rgba(255,243,209,1)' }], 2.6, .3, 'linear');
an('#bld', [{ transform: 'none' }, { transform: 'scale(1.04) rotate(.6deg)' }], 2.4, 1.05, 'linear');
an('#bld', [{ transform: 'scale(1.04) rotate(.6deg)' }, { transform: 'translateX(-1250px) rotate(-12deg)' }], 3.45, .35, inq);
// B2 chat robótico (3.45–7.0)
show('#chat1', 3.45, 7.0); show('#stamp', 3.45, 7.0);
an('#chat1', [{ transform: 'translateX(1250px) rotate(10deg) scale(2)' }, { transform: 'scale(2)' }], 3.45, .55);
pop('#c1a', 3.95); pop('#c1b', 4.6); pop('#c1c', 5.2);
an('#chat1', [{ transform: 'scale(2)' }, { transform: 'scale(2.12) translateY(-20px)' }], 5.3, .5, ez2);
an('#chat1', [{ translate: '0 0' }, { translate: '-16px 0' }, { translate: '14px 0' }, { translate: '-10px 0' }, { translate: '6px 0' }, { translate: '0 0' }], 5.25, .3, 'linear');
an('#stamp', [{ opacity: 0, transform: 'translateX(-50%) scale(1.8) rotate(-12deg)' }, { opacity: 1, transform: 'translateX(-50%) scale(1) rotate(-4deg)' }], 5.65, .3, back);
// wipe diagonal ouro (6.55–7.4)
an('#wipe', [{ transform: 'skewX(-18deg) translateX(0)' }, { transform: 'skewX(-18deg) translateX(5000px)' }], 6.55, .85, ez2);
// B4 regras saem, papel do agente entra, guardrails ligam (6.95–10.7)
show('#bld2', 6.95, 10.7);
an('#bld2', [{ transform: 'scale(.96)' }, { transform: 'none' }], 6.95, .6);
document.querySelectorAll('#oldR li').forEach((li, i) => an(li, [{ transform: 'none', opacity: 1 }, { transform: 'translate(' + [-900, 900, -800, 850, -950][i] + 'px,' + [-500, -300, 200, 400, -100][i] + 'px) rotate(' + [-40, 35, -25, 45, -30][i] + 'deg)', opacity: 0 }], 7.55 + i * .1, .6, inq));
['#ro0', '#ro1', '#ro2'].forEach((s, i) => an(s, [{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 1, transform: 'none' }], 8.25 + i * .2, .45));
pop('#gsub', 8.85, .35, 16);
an('#newR .guards', [{ opacity: 0, transform: 'translateY(60px)' }, { opacity: 1, transform: 'none' }], 8.95, .4);
document.querySelectorAll('#newR .guards li').forEach((li, i) => {
  an(li, [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], 9.0 + i * .18, .4);
  an(li.querySelector('.tg'), [{ background: '#3A332B' }, { background: '#FDC348' }], 9.55 + i * .3, .2, 'linear');
  an(li.querySelector('.tg i'), [{ transform: 'translateX(0)' }, { transform: 'translateX(38px)' }], 9.55 + i * .3, .25, back);
  an(li.querySelector('.lk'), [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 9.55 + i * .3, .35, ez2);
});
an('#bld2', [{ transform: 'none' }, { transform: 'scale(1.05) translateY(-40px)' }], 9.2, 1.2, ez2);
an('#bld2', [{ transform: 'scale(1.05) translateY(-40px)', opacity: 1 }, { transform: 'scale(.7) translateY(-200px)', opacity: 0 }], 10.4, .3, inq);
// B5 personagem (10.45–13.7)
show('#kit', 10.45, 13.75); show('#persona', 10.45, 13.75);
an('#kit', [{ clipPath: 'inset(45% 45% 45% 45% round 40px)', transform: 'rotate(4deg)' }, { clipPath: 'inset(0% 0% 0% 0% round 40px)', transform: 'none' }], 10.45, .7, ez2);
an('#kit img', [{ transform: 'scale(1.35)' }, { transform: 'scale(1.05)' }], 10.45, 3.2, 'cubic-bezier(.2,.6,.3,1)');
an('#persona', [{ transform: 'translateX(-950px)' }, { transform: 'none' }], 11.25, .6);
an('#persona img', [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], 11.55, .45, back);
document.querySelectorAll('.pchips i').forEach((c, i) => pop(c, 11.9 + i * .2, .4, 14));
an('#kit', [{ transform: 'none' }, { transform: 'translateY(-50px) scale(1.03)' }], 12.3, 1.15, 'linear');
an('#kit', [{ transform: 'translateY(-50px) scale(1.03)' }, { transform: 'translateY(-1600px) rotate(-6deg)' }], 13.45, .3, inq);
an('#persona', [{ transform: 'none' }, { transform: 'translateX(1250px)' }], 13.45, .3, inq);
// B6 conversa em etapas (13.5–21.3)
show('#chat2', 13.5, 21.35); show('#conf', 19.5, 21.4);
an('#chat2', [{ transform: 'translateY(1500px) scale(2)' }, { transform: 'scale(2)' }], 13.5, .55);
${JSON.stringify(CHAT2.map((c) => c[3]))}.forEach((t, i) => pop('#cm' + i, t));
pop('#cm4', 17.45); pop('#cm5', 19.45);
an('#cm5 .react', [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], 19.8, .4, back);
an('#cm4 .mbtn', [{ transform: 'scale(1)', background: '#fff' }, { transform: 'scale(.94)', background: '#FFF3D1' }, { transform: 'scale(1)', background: '#fff' }], 18.75, .35, 'linear');
an('#chat2', [{ transform: 'scale(2)' }, { transform: 'scale(2.14) translateY(-12px)' }], 17.6, 1.4, ez2);
an('#chat2', [{ transform: 'scale(2.14) translateY(-12px)' }, { transform: 'scale(2)' }], 19.3, .5, ez2);
document.querySelectorAll('#conf i').forEach((c, i) => {
  const x = ((i * 37) % 21 - 10) * 46, y = (i % 7) * 120, r = (i % 2 ? 1 : -1) * (300 + i * 23);
  an(c, [{ transform: 'translate(0px,1900px) rotate(0deg)', opacity: 0 }, { transform: 'translate(' + x / 2 + 'px,' + (600 + y) + 'px) rotate(' + r / 2 + 'deg)', opacity: 1, offset: .35 }, { transform: 'translate(' + x + 'px,' + (1300 + y) + 'px) rotate(' + r + 'deg)', opacity: 1 }], 19.85 + (i % 6) * .03, 1.45, 'cubic-bezier(.2,.7,.4,1)');
});
an('#chat2', [{ transform: 'scale(2)', opacity: 1 }, { transform: 'scale(.5) translateY(300px)', opacity: 0 }], 20.95, .35, inq);
// B7 dashboard (21.0–24.15)
show('#dash', 21.0, 24.15);
an('#dash', [{ transform: 'scale(1.25)', opacity: 0, filter: 'blur(14px)' }, { transform: 'none', opacity: 1, filter: 'blur(0px)' }], 21.0, .55);
document.querySelectorAll('.bars i').forEach((b, i) => an(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], 21.5 + i * .12, .5, back));
['#dc0', '#dc1', '#dc2'].forEach((s, i) => pop(s, 22.4 + i * .22, .4, 16));
an('#dash', [{ transform: 'none' }, { transform: 'scale(1.04)' }], 21.6, 2.2, 'linear');
an('#dash', [{ transform: 'scale(1.04)' }, { transform: 'translateX(-1250px) rotate(-8deg)' }], 23.85, .3, inq);
// B8 páginas (23.9–26.75)
show('#pages', 23.9, 26.75);
[0, 1, 2].forEach((i) => an('#pg' + i, [{ transform: 'translateX(1300px) rotateY(-50deg) rotate(12deg)' }, { transform: 'translateY(' + (i * 80) + 'px) rotate(' + [-5, 3, -1][i] + 'deg)' }], 24.05 + i * .55, .65, ez));
an('#pages', [{ transform: 'none' }, { transform: 'scale(1.05)' }], 24.4, 2.1, 'linear');
an('#pages', [{ transform: 'scale(1.05)', opacity: 1 }, { transform: 'scale(.6) translateY(-200px)', opacity: 0 }], 26.45, .3, inq);
// B9 cartão final (26.55–30)
show('#endsub', 26.55, 31); show('#cover', 26.55, 31); show('#dl', 26.55, 31); show('#elogo', 26.55, 31);
pop('#endsub', 27.0, .4, 14);
an('#cover', [{ transform: 'translateY(200px) scale(.8) rotate(-4deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], 26.7, .7, back);
an('#cover', [{ transform: 'none' }, { transform: 'translateY(-14px)' }], 27.6, 2.4, 'ease-in-out');
an('#dl', [{ transform: 'translateY(160px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 27.05, .55, back);
pop('#elogo', 27.4, .4, 16);
an('#dl', [{ transform: 'none' }, { transform: 'scale(.96)' }, { transform: 'scale(1.03)' }, { transform: 'none' }], 28.55, .45, 'linear');
an('#rip', [{ transform: 'scale(0)', opacity: .9 }, { transform: 'scale(16)', opacity: 0 }], 28.6, .7, 'cubic-bezier(.2,.7,.4,1)');
// cursor
an('#cur', [{ visibility: 'hidden' }, { visibility: 'visible' }], 18.0, .001, 'step-start');
an('#cur', [{ visibility: 'visible' }, { visibility: 'hidden' }], 19.2, .001, 'step-start');
an('#cur', [{ visibility: 'hidden' }, { visibility: 'visible' }], 27.7, .001, 'step-start');
// rolagem do chat: mantém a última mensagem à vista (medida na carga)
function chatScroll() {
  const vp = E('#chat2 .w-chat'), kw = E('#kw'); const vh = vp.clientHeight - 30;
  const times = [13.9, 14.75, 15.65, 16.35, 17.45, 19.45]; let prev = 0;
  kw.querySelectorAll('.cm').forEach((c, i) => {
    const bottom = c.offsetTop + c.offsetHeight + (i === 5 ? 18 : 0); const target = Math.max(0, bottom - vh);
    if (target > prev + 1) { an(kw, [{ transform: 'translateY(' + -prev + 'px)' }, { transform: 'translateY(' + -target + 'px)' }], times[i] - .05, .4, ez2); prev = target; }
  });
  for (const a of A) a.pause();
}
// cursor: mira o centro dos botões medidos no próprio quadro
function cursorPath() {
  const st = E('.stage').getBoundingClientRect();
  const at = (t, sel) => { window.seek(t); const r = E(sel).getBoundingClientRect(); return [Math.round(r.left - st.left + r.width / 2 - 14), Math.round(r.top - st.top + r.height / 2 - 8)]; };
  const [x1, y1] = at(18.72, '#cm4 .mbtn'), [x2, y2] = at(28.5, '#dl b');
  const T = (x, y, s = 1) => 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  an('#cur', [{ transform: T(1100, 1700) }, { transform: T(x1, y1) }], 18.0, .7, ez2);
  an('#cur', [{ transform: T(x1, y1) }, { transform: T(x1, y1, .82) }, { transform: T(x1, y1) }], 18.72, .3, 'linear');
  an('#cur', [{ transform: T(x1, y1) }, { transform: T(1150, 1700) }], 18.95, .25, inq);
  an('#cur', [{ transform: T(1150, 1700) }, { transform: T(x2, y2) }], 27.7, .8, ez2);
  an('#cur', [{ transform: T(x2, y2) }, { transform: T(x2, y2, .82) }, { transform: T(x2, y2) }], 28.5, .3, 'linear');
  for (const a of A) a.pause();
}
const rc = E('#rcnt'), kv = E('#kv');
window.seek = (t) => {
  for (const a of A) a.currentTime = t * 1000;
  const n = [0, 1, 2, 3, 4, 5].filter((i) => t >= .6 + i * .33).length; rc.textContent = n + (n === 1 ? ' regra' : ' regras');
  const p = Math.min(1, Math.max(0, (t - 21.35) / 1.3)); kv.textContent = String(Math.round(150 * (1 - Math.pow(1 - p, 3))));
};
window.ready = document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => 0)))).then(chatScroll).then(cursorPath);
`;

const bok = [[-200, 300, 700], [600, -150, 760], [-150, 1350, 640], [700, 1500, 720]].map(([x, y, s]) => `<i class="bok" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px"></i>`).join('');
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}\n${RCSS}</style></head>
<body><div class="stage">${bok}${B1}${B2}${B4}${B5}${B6}${B7}${B8}${B9}${hlHtml}<div class="wipe" id="wipe"></div>${CURSOR}</div><script>${JS}</script></body></html>`;
const HTML = path.join(OUT, 'reel-a.html');
fs.writeFileSync(HTML, html);

// ---------- SRT (os títulos são a legenda) ----------
const ts = (s) => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const srt = [...HL.map(([, a, b, x, y]) => [a, Math.min(b, 30), `${x} ${y}`]), ...STEPS.map(([n, t, a, b]) => [a, b, `${n} ${t}`])].sort((p, q) => p[0] - q[0]);
fs.writeFileSync(path.join(OUT, 'reel-a.srt'), srt.map(([a, b, t], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${t}\n`).join('\n'));

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
const STILLS = [0.9, 2.9, 4.4, 5.9, 6.95, 8.0, 9.9, 11.0, 12.6, 14.4, 16.6, 18.1, 18.8, 20.2, 22.4, 23.4, 25.2, 26.2, 28.0, 29.4];
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
