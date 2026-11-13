// Reels A · "Menos regras, mais contexto" (30 s, 1080x1920, 30 fps)
// Gera a página de motion, renderiza frame a frame no Chromium e monta o MP4 com a trilha.
//   node reels/reel-a.mjs            -> dist/reels/reel-a.mp4 (+ .srt, stills)
//   node reels/reel-a.mjs --stills   -> só os stills de revisão
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { CSS, LOGO, ICON, lineIcon, wave, waScreen, m, aiTag } from '../src/deck.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'reels');
const FR = '/tmp/claude-0/-home-user-Testes/551c6292-4d0f-5c04-8cdf-68fafee92925/scratchpad/frames-a';
fs.mkdirSync(OUT, { recursive: true });
const FPS = 30, DUR = 30, W = 1080, H = 1920;
const page = (n) => pathToFileURL(path.join(ROOT, 'dist', 'previews', `slide-${String(n).padStart(2, '0')}.png`)).href;

// ---------- locução / legendas (texto da Opção A) ----------
const CAPS = [
  [0.25, 2.95, 'Mais regras deixam seu agente de IA mais seguro?'],
  [3.25, 5.6, 'Ou só mais robótico?'],
  [7.15, 9.6, 'A Viacredi fez o contrário: tirou o excesso de regras'],
  [9.6, 11.85, 'e explicou ao agente o papel dele.'],
  [12.25, 14.8, 'Dias depois, uma conversa sobre reforma de cozinha'],
  [14.8, 16.9, 'terminou em contratação de crédito.'],
  [17.25, 19.0, 'Nos primeiros dias de teste,'],
  [19.0, 20.9, 'mais de R$ 150 mil em crédito foram liberados.'],
  [21.25, 23.4, 'No playbook, você vê o caso e leva o método:'],
  [23.4, 25.9, 'papel do agente, guardrails e plano de teste.'],
  [26.35, 29.5, 'Baixe o playbook e desenhe o seu primeiro teste.'],
];
const capsHtml = CAPS.map(([a, b, t], i) => `<div class="cap" id="cap${i}" data-a="${a}" data-b="${b}"><span>${t.split(' ').map((w) => `<i>${w}</i>`).join(' ')}</span></div>`).join('');

// ---------- cenas ----------
const rules = ['Não fale sobre…', 'Não responda se…', 'Não ofereça…', 'Sempre use a frase…', 'Não saia do roteiro…'];
const S1 = `
<div class="sc dark" id="s1"><div class="cam" id="cam1">
  <h2 class="tt"><span class="ln"><b>Mais regras =</b></span><span class="ln"><b>agente <em>mais seguro?</em></b></span></h2>
  <div class="ed">
    <div class="ed-h"><span class="dots"><i></i><i></i><i></i></span><b>Instruções por regras</b><span class="badge" id="badge">+ 1 regra a cada ajuste</span></div>
    <ol class="rl">${rules.map((r, i) => `<li id="r${i}"><u>${i + 1}</u><span>${r}</span></li>`).join('')}</ol>
  </div>
</div></div>`;

const S2 = `
<div class="sc light" id="s2"><div class="cam" id="cam2">
  <h2 class="tt"><span class="ln"><b>Ou só mais</b></span><span class="ln"><b><em>robótico?</em></b></span></h2>
  <div class="ph2wrap" id="ph2"><div class="phone2 vp" style="width:400px;height:660px">
    ${waScreen({ status: true, date: false, input: true, body: `
      <div id="m1">${m('ag', 'Olá. Temos uma linha de crédito disponível para você. Deseja saber mais? Responda SIM ou NÃO.', '10:02', { btns: [{ t: 'SIM' }, { t: 'NÃO' }], cls: 'btn-row' })}</div>
      <div id="m2">${m('us', 'Depende, pra que serve?', '10:04')}</div>
      <div id="m3">${m('ag', 'Não entendi sua resposta. Responda SIM ou NÃO.', '10:04')}</div>` })}
  </div></div>
</div></div>`;

const S3 = `
<div class="sc gold" id="s3"><div class="cam" id="cam3">
  <h2 class="tt"><span class="ln"><b>Menos regras.</b></span><span class="ln"><b><em class="ul">Mais contexto.</em></b></span></h2>
  <div class="ed out" id="edOut">
    <ol class="rl">${rules.slice(0, 4).map((r, i) => `<li><u>${i + 1}</u><span>${r}</span><s id="st${i}"></s></li>`).join('')}</ol>
  </div>
  <div class="role" id="role">
    <div class="role-h"><span class="ri">${ICON.spark}</span><b>Papel do agente</b></div>
    <ul>${['O objetivo da conversa', 'O contexto do cooperado e da oferta', 'Liberdade para conversar'].map((t, i) => `<li id="ro${i}"><i></i>${t}</li>`).join('')}</ul>
  </div>
  <div class="guard" id="guard">
    <div class="g-h"><span class="gi">${lineIcon('shield', 2)}</span><b>Guardrails críticos</b></div>
    <ul>${['Transparência sobre juros e IOF', 'Contratação pelo canal seguro', 'Time humano quando faz sentido'].map((t, i) => `<li id="gu${i}"><span class="lk">${lineIcon('lock', 2.2)}</span>${t}</li>`).join('')}</ul>
  </div>
</div></div>`;

const kitchen = [
  ['us', 'Já tenho um crédito contratado, mas achei bom saber que tem outro disponível.', '14:21'],
  ['ag', 'Que bom! Posso perguntar o que você está planejando?', '14:21'],
  ['us', 'Estou reformando a cozinha.', '14:23'],
  ['ag', 'Que legal! Cozinha nova é um projeto e tanto: móveis, eletros e obra ao mesmo tempo.', '14:23'],
  ['ag', 'Essa linha de crédito pode ajudar com os gastos da reforma. Quer ver as condições?', '14:24', 'cont'],
  ['us', 'Quero! Vou contratar para terminar a obra.', '14:26', '', true],
];
const S4 = `
<div class="sc soft" id="s4"><div class="cam" id="cam4">
  <h2 class="tt sm"><span class="ln"><b>Uma conversa sobre</b></span><span class="ln"><b><em>reforma de cozinha</em></b></span><span class="ln"><b>virou contratação</b></span></h2>
  <div class="ph4wrap" id="ph4"><div class="phone2 vp" style="width:400px;height:720px">
    ${waScreen({ status: true, date: false, input: true, body: `<div class="kw" id="kw">${kitchen.map(([s, t, h, c, r], i) => `<div id="k${i}">${m(s, t, h, { cls: c || '', react: r ? `${lineIcon('check', 2.6)}Contratação` : undefined })}</div>`).join('')}</div>` })}
  </div></div>
</div></div>`;

const S5 = `
<div class="sc dark" id="s5"><div class="cam" id="cam5">
  ${Array.from({ length: 18 }, (_, i) => `<i class="pt" id="pt${i}" style="left:${(i * 137) % 1000 + 40}px;top:${1200 + ((i * 263) % 500)}px;width:${6 + (i % 4) * 3}px;height:${6 + (i % 4) * 3}px"></i>`).join('')}
  <div class="big">
    <span class="pill" id="pill">Primeiros dias de teste</span>
    <div class="num" id="num"><small>+R$</small> <b id="cnt">0</b> <small>mil</small></div>
    <p id="numL">em crédito liberado</p>
  </div>
</div></div>`;

const S6 = `
<div class="sc light" id="s6"><div class="cam" id="cam6">
  <p class="eyebrow" id="eb">No playbook</p>
  <div class="chips">${['Papel do agente', 'Guardrails', 'Plano de teste', 'Indicadores'].map((t, i) => `<span id="ch${i}">${t}</span>`).join('')}</div>
  <div class="car" id="car">
    <div class="pg side l" id="pgL"><img src="${page(7)}"></div>
    <div class="pg side r" id="pgR"><img src="${page(10)}"></div>
    <div class="pg main" id="pgA"><div class="zoom" id="zA"><img src="${page(8)}"></div></div>
    <div class="pg main" id="pgB"><div class="zoom" id="zB"><img src="${page(9)}"></div></div>
  </div>
</div></div>`;

const S7 = `
<div class="sc dark cta" id="s7"><div class="cam" id="cam7">
  <img class="lg" src="${LOGO.ubotsDark}" alt="Ubots">
  <h2 class="tt"><span class="ln"><b><em>Baixe o playbook</em></b></span><span class="ln"><b>e desenhe o seu</b></span><span class="ln"><b>primeiro teste</b></span></h2>
  <div class="fan">
    <div class="fp" id="f1"><img src="${page(5)}"></div>
    <div class="fp" id="f2"><img src="${page(8)}"></div>
    <div class="fp cover" id="f0"><img src="${page(1)}"></div>
  </div>
  <div class="btn-w"><span class="cbtn" id="cbtn">Baixe o playbook <b>→</b></span></div>
  <div class="arrow" id="arr">${lineIcon('back', 2.6)}</div>
</div></div>`;

const RCSS = `
html,body{margin:0;background:#000}
.stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:'Nunito',sans-serif}
.sc{position:absolute;inset:0;overflow:hidden}
.cam{position:absolute;inset:0;transform-origin:50% 45%}
.dark{background:radial-gradient(900px 700px at 80% 10%,rgba(253,195,72,.16),rgba(253,195,72,0) 70%),#070401;color:#FFFDF9}
.light{background:radial-gradient(900px 800px at 100% 0%,#FFF3D1,rgba(255,243,209,0) 70%),#FFFDF9;color:#070401}
.soft{background:linear-gradient(180deg,#FFFDF9 0%,#FFF3D1 100%);color:#070401}
.gold{background:linear-gradient(160deg,#FFDB80 0%,#FDC348 45%,#F6B42E 100%);color:#070401}
.tt{position:absolute;left:84px;right:84px;top:250px;margin:0;font:700 82px/1.06 'Poppins';letter-spacing:-.035em}
.tt.sm{font-size:70px}
.tt .ln{display:block;overflow:hidden;padding-bottom:6px}
.tt .ln b{display:block;font-weight:700}
.tt em{font-style:normal;color:#FDC348}
.gold .tt em{color:#070401}
.tt em.ul{background:linear-gradient(transparent 78%,rgba(255,253,249,.75) 78%)}
/* legendas */
.cap{position:absolute;left:70px;right:70px;top:1340px;text-align:center;opacity:0;z-index:20}
.cap span{display:inline;background:rgba(7,4,1,.86);color:#fff;font:800 46px/1.42 'Nunito';padding:8px 18px;border-radius:14px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.cap i{font-style:normal;opacity:.38}
/* S1 */
.ed{position:absolute;left:84px;right:84px;top:560px;background:#141009;border:1px solid #2A241C;border-radius:34px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.5)}
.ed-h{display:flex;align-items:center;gap:18px;padding:24px 30px;border-bottom:1px solid #2A241C;color:#FFFDF9;font:600 30px/1 'Poppins'}
.ed-h .dots{display:flex;gap:9px}.ed-h .dots i{width:16px;height:16px;border-radius:50%;background:#3A332A}
.badge{margin-left:auto;background:#FDC348;color:#070401;font:600 22px/1 'Poppins';padding:11px 18px;border-radius:999px}
.rl{list-style:none;margin:0;padding:28px 34px 34px;display:flex;flex-direction:column;gap:22px}
.rl li{position:relative;display:flex;align-items:center;gap:26px;font:700 44px/1.2 'Nunito';color:#FFFDF9}
.rl u{text-decoration:none;font:500 26px/1 'Poppins';color:#AFAFB4;width:26px;text-align:right}
.rl li span{background:linear-gradient(transparent 52%,rgba(253,195,72,.38) 52%,rgba(253,195,72,.38) 94%,transparent 94%);padding:0 6px}
/* S2/S4 telefones */
.ph2wrap{position:absolute;left:50%;top:500px;width:400px;height:660px;margin-left:-200px;transform-origin:50% 0}
.ph4wrap{position:absolute;left:50%;top:525px;width:400px;height:720px;margin-left:-200px;transform-origin:50% 0}
.kw{display:flex;flex-direction:column;gap:4px}
.vp > .wa2{height:100%;border-radius:42px}
.phone2.vp{box-shadow:0 40px 80px rgba(107,77,0,.30), inset 0 0 0 2px #2A2520}
/* S3 */
.ed.out{top:560px;right:auto;width:760px}
.ed.out .rl{padding:30px 34px}
.ed.out s{position:absolute;left:46px;top:50%;height:5px;width:0;background:#FDC348;border-radius:3px}
.role{position:absolute;left:84px;right:84px;top:560px;background:#fff;border-radius:34px;padding:34px 40px 30px;box-shadow:0 30px 60px rgba(107,77,0,.25)}
.role-h,.g-h{display:flex;align-items:center;gap:18px;font:700 42px/1 'Poppins'}
.ri,.gi{width:64px;height:64px;border-radius:18px;background:#070401;color:#FDC348;display:grid;place-items:center}
.ri svg,.gi svg{width:30px;height:30px}
.role ul,.guard ul{list-style:none;margin:24px 0 0;padding:0;display:flex;flex-direction:column;gap:16px}
.role li{display:flex;align-items:center;gap:18px;font:600 36px/1.25 'Nunito'}
.role li i{width:16px;height:16px;border-radius:50%;background:#FDC348;flex:none}
.guard{position:absolute;left:84px;right:84px;top:955px;background:#070401;color:#FFFDF9;border-radius:34px;padding:30px 40px 30px;box-shadow:0 30px 60px rgba(7,4,1,.3)}
.gi{background:#FDC348;color:#070401}
.guard li{display:flex;align-items:center;gap:18px;font:600 34px/1.25 'Nunito'}
.lk{width:46px;height:46px;border-radius:12px;background:rgba(253,195,72,.16);color:#FDC348;display:grid;place-items:center;flex:none}
.lk svg{width:24px;height:24px}
/* S5 */
.big{position:absolute;left:0;right:0;top:560px;text-align:center}
.pill{display:inline-block;background:#FDC348;color:#070401;font:600 32px/1 'Poppins';padding:16px 28px;border-radius:999px}
.num{margin-top:44px;font:700 170px/1 'Poppins';letter-spacing:-.04em;color:#FDC348;white-space:nowrap}
.num small{font-size:84px;letter-spacing:-.02em}
.big p{margin:30px 0 0;font:600 52px/1.2 'Poppins';color:#FFFDF9}
.pt{position:absolute;border-radius:50%;background:#FDC348;opacity:.0}
/* S6 */
.eyebrow{position:absolute;left:84px;top:250px;margin:0;font:700 34px/1 'Poppins';letter-spacing:.08em;text-transform:uppercase;color:#6B4D00}
.chips{position:absolute;left:84px;right:84px;top:310px;display:flex;flex-wrap:wrap;gap:16px}
.chips span{font:700 46px/1 'Poppins';padding:20px 30px;border-radius:999px;background:#070401;color:#FFFDF9}
.chips span:nth-child(2n){background:#FDC348;color:#070401}
.car{position:absolute;left:0;right:0;top:620px;height:600px;perspective:1800px}
.pg{position:absolute;top:0;left:50%;width:1000px;height:563px;margin-left:-500px;border-radius:22px;overflow:hidden;box-shadow:0 30px 70px rgba(107,77,0,.28);background:#fff}
.pg img{width:100%;height:100%;display:block}
.pg .zoom{width:100%;height:100%}
.side{opacity:.55;filter:blur(1px)}
/* S7 */
.cta .lg{position:absolute;left:84px;top:250px;height:46px}
.cta .tt{top:340px}
.fan{position:absolute;left:0;right:0;top:720px;height:540px}
.fp{position:absolute;left:50%;top:0;width:820px;height:461px;margin-left:-410px;border-radius:22px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.55)}
.fp img{width:100%;height:100%;display:block}
.btn-w{position:absolute;left:0;right:0;top:1220px;text-align:center}
.cbtn{display:inline-flex;align-items:center;gap:20px;background:#FDC348;color:#070401;font:700 48px/1 'Poppins';padding:30px 52px;border-radius:999px;box-shadow:0 20px 50px rgba(253,195,72,.35)}
.arrow{position:absolute;left:50%;top:1640px;width:70px;height:70px;margin-left:-35px;color:#FDC348;transform:rotate(-90deg)}
.arrow svg{width:70px;height:70px}
`;

const JS = `
const E = (s) => document.querySelector(s);
const A = [];
const ez = 'cubic-bezier(.22,.9,.24,1)', ez2 = 'cubic-bezier(.65,0,.35,1)', back = 'cubic-bezier(.34,1.56,.64,1)';
const USED = new Map();
// a primeira animação de uma propriedade num elemento preenche para trás; as seguintes só para frente,
// assim cada etapa segura o estado final da anterior até começar
function an(sel, kf, t0, d, easing = ez) {
  const el = typeof sel === 'string' ? E(sel) : sel; if (!el) throw new Error('no ' + sel);
  const props = Object.keys(kf[0]).filter((k) => k !== 'offset' && k !== 'easing');
  const used = USED.get(el) || new Set(); const later = props.some((k) => used.has(k)); props.forEach((k) => used.add(k)); USED.set(el, used);
  const a = el.animate(kf, { delay: t0 * 1000, duration: d * 1000, fill: later ? 'forwards' : 'both', easing }); a.pause(); A.push(a); return a;
}
// janela de visibilidade de uma cena
function win(sel, t0, t1) { an(sel, [{ visibility: 'hidden' }, { visibility: 'visible' }], t0, 0.001, 'step-start'); if (t1 < 30) an(sel, [{ visibility: 'visible' }, { visibility: 'hidden' }], t1, 0.001, 'step-start'); }
const reveal = (sel, t0, step = 0.12) => document.querySelectorAll(sel + ' .ln b').forEach((b, i) => an(b, [{ transform: 'translateY(110%)' }, { transform: 'none' }], t0 + i * step, 0.55));
const pop = (sel, t0, d = .45) => an(sel, [{ opacity: 0, transform: 'translateY(26px) scale(.94)' }, { opacity: 1, transform: 'none' }], t0, d, back);

// --- S1 (0–3.35)
win('#s1', 0, 3.4);
reveal('#s1', 0.05);
an('#cam1', [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], 0, 3.2, 'linear');
document.querySelectorAll('#s1 .rl li').forEach((li, i) => an(li, [{ opacity: 0, transform: 'translateY(-70px)' }, { opacity: 1, transform: 'none' }], 0.35 + i * 0.36, 0.4, back));
pop('#badge', 2.2, .4);
an('#s1', [{ transform: 'none', filter: 'blur(0)' }, { transform: 'translateX(-1080px)', filter: 'blur(14px)' }], 3.0, 0.35, ez2);
// --- S2 (3.0–7.25)
win('#s2', 3.0, 7.3);
an('#s2', [{ transform: 'translateX(1080px)', filter: 'blur(14px)' }, { transform: 'none', filter: 'blur(0)' }], 3.0, 0.35, ez2);
reveal('#s2', 3.2);
an('#ph2', [{ transform: 'translateY(120px) scale(1.55)', opacity: 0 }, { transform: 'scale(1.55)', opacity: 1 }], 3.1, 0.6);
pop('#m1', 3.6); pop('#m2', 4.35); pop('#m3', 5.05);
an('#ph2', [{ transform: 'scale(1.55)' }, { transform: 'translateY(-300px) scale(2.1)' }], 5.55, 0.7, ez2);
an('#s2 .tt', [{ opacity: 1 }, { opacity: 0 }], 5.55, 0.35, 'linear');
an('#cam2', [{ translate: '0 0' }, { translate: '-14px 6px' }, { translate: '12px -4px' }, { translate: '-6px 2px' }, { translate: '0 0' }], 6.3, 0.2, 'steps(4)');
an('#s2', [{ filter: 'none' }, { filter: 'saturate(0) contrast(1.4)' }, { filter: 'none' }], 6.3, 0.18, 'steps(2)');
// --- S3 (6.85–12.3) wipe
win('#s3', 6.85, 12.35);
an('#s3', [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 6.85, 0.4, ez2);
reveal('#s3', 7.1);
[0, 1, 2, 3].forEach((i) => an('#st' + i, [{ width: '0' }, { width: '82%' }], 7.35 + i * 0.12, 0.3, ez2));
an('#edOut', [{ transform: 'none', opacity: 1 }, { transform: 'translateX(-1100px) rotate(-6deg)', opacity: 1 }], 8.05, 0.5, ez2);
an('#role', [{ transform: 'translateX(1100px)' }, { transform: 'none' }], 8.25, 0.6);
[0, 1, 2].forEach((i) => pop('#ro' + i, 8.75 + i * 0.22, .35));
an('#guard', [{ transform: 'translateY(1100px)' }, { transform: 'none' }], 9.35, 0.6);
[0, 1, 2].forEach((i) => an('#gu' + i + ' .lk', [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], 9.85 + i * 0.3, .4, back));
an('#cam3', [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }], 9.0, 3.0, 'linear');
an('#s3', [{ transform: 'none' }, { transform: 'translateY(-1920px)' }], 11.9, 0.4, ez2);
// --- S4 (11.9–17.25)
win('#s4', 11.9, 17.3);
an('#s4', [{ transform: 'translateY(1920px)' }, { transform: 'none' }], 11.9, 0.4, ez2);
reveal('#s4', 12.15);
an('#ph4', [{ transform: 'translateY(500px) scale(1.55)' }, { transform: 'scale(1.55)' }], 12.0, 0.6);
an('#kw', [{ transform: 'none' }, { transform: 'translateY(-96px)' }], 14.55, 0.45, ez2);
an('#kw', [{ transform: 'translateY(-96px)' }, { transform: 'translateY(-200px)' }], 15.8, 0.45, ez2);
[0, 1, 2, 3, 4, 5].forEach((i) => pop('#k' + i, 12.75 + i * 0.62));
an('#k5 .react', [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], 16.25, .4, back);
an('#cam4', [{ transform: 'scale(1)' }, { transform: 'scale(.97)' }], 16.3, 0.7, ez2);
an('#s4', [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], 16.9, 0.38, 'cubic-bezier(.55,0,.9,.4)');
// --- S5 (16.95–21.25)
win('#s5', 16.95, 21.3);
an('#s5', [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], 16.95, 0.45);
pop('#pill', 17.3, .45);
an('#num', [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], 17.45, .5);
pop('#numL', 18.6, .45);
document.querySelectorAll('#s5 .pt').forEach((p, i) => an(p, [{ opacity: 0, transform: 'translateY(0)' }, { opacity: .55, transform: 'translateY(-300px)', offset: .5 }, { opacity: 0, transform: 'translateY(-600px)' }], 17.0 + (i % 6) * 0.25, 3.6, 'linear'));
an('#cam5', [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], 17, 4, 'linear');
an('#s5', [{ transform: 'none', filter: 'blur(0)' }, { transform: 'translateX(-1080px)', filter: 'blur(12px)' }], 20.9, 0.35, ez2);
// --- S6 (20.9–26.3)
win('#s6', 20.9, 26.35);
an('#s6', [{ transform: 'translateX(1080px)', filter: 'blur(12px)' }, { transform: 'none', filter: 'blur(0)' }], 20.9, 0.35, ez2);
pop('#eb', 21.2, .4);
[0, 1, 2, 3].forEach((i) => pop('#ch' + i, 21.4 + i * 0.32, .4));
an('#pgL', [{ transform: 'translateX(-760px) rotateY(28deg) scale(.82)' }], 0, .01);
an('#pgR', [{ transform: 'translateX(760px) rotateY(-28deg) scale(.82)' }], 0, .01);
an('#pgA', [{ transform: 'translateY(160px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 21.2, .55);
an('#zA', [{ transform: 'scale(1)', transformOrigin: '30% 70%' }, { transform: 'scale(2.1)', transformOrigin: '30% 70%' }], 22.0, 0.9, ez2);
an('#zA', [{ transform: 'scale(2.1)', transformOrigin: '30% 70%' }, { transform: 'scale(2.1) translateX(-300px)', transformOrigin: '30% 70%' }], 22.95, 0.55, ez2);
an('#pgA', [{ transform: 'none' }, { transform: 'translateX(-1100px) rotateY(30deg)' }], 23.55, 0.5, ez2);
an('#pgB', [{ transform: 'translateX(1100px) rotateY(-30deg)' }, { transform: 'none' }], 23.55, 0.5, ez2);
an('#zB', [{ transform: 'scale(1)', transformOrigin: '50% 72%' }, { transform: 'scale(2.1)', transformOrigin: '50% 72%' }], 24.2, 0.9, ez2);
an('#zB', [{ transform: 'scale(2.1)', transformOrigin: '50% 72%' }, { transform: 'scale(1)', transformOrigin: '50% 72%' }], 25.3, 0.6, ez2);
an('#cam6', [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.55)', opacity: 0 }], 25.9, 0.42, 'cubic-bezier(.55,0,.9,.4)');
// --- S7 (25.95–30)
win('#s7', 25.95, 31);
an('#s7', [{ opacity: 0 }, { opacity: 1 }], 25.95, 0.3, 'linear');
an('#cam7', [{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 25.95, 1.1, ez);
reveal('#s7', 26.2);
pop('#f0', 26.25, .5);
an('#f1', [{ transform: 'rotate(0) translate(0,0)' }, { transform: 'rotate(-9deg) translate(-90px,30px)' }], 26.6, 0.6, back);
an('#f2', [{ transform: 'rotate(0) translate(0,0)' }, { transform: 'rotate(8deg) translate(90px,30px)' }], 26.7, 0.6, back);
pop('#cbtn', 27.1, .5);
an('#cbtn', [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], 27.9, 0.5, ez2);
an('#cbtn', [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], 28.8, 0.5, ez2);
an('#arr', [{ opacity: 0, transform: 'rotate(-90deg) translateX(0)' }, { opacity: 1, transform: 'rotate(-90deg) translateX(-24px)' }, { opacity: 1, transform: 'rotate(-90deg) translateX(0)' }], 27.8, 0.8, ez2);
an('#arr', [{ transform: 'rotate(-90deg) translateX(0)' }, { transform: 'rotate(-90deg) translateX(-24px)' }, { transform: 'rotate(-90deg) translateX(0)' }], 28.6, 0.8, ez2);
// --- legendas: frase + palavra a palavra
document.querySelectorAll('.cap').forEach((c) => {
  const a = +c.dataset.a, b = +c.dataset.b, ws = c.querySelectorAll('i');
  an(c, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none', offset: .12 / (b - a) }, { opacity: 1, transform: 'none', offset: 1 - .1 / (b - a) }, { opacity: 0, transform: 'none' }], a, b - a, 'linear');
  const span = (b - a - 0.25) / ws.length;
  ws.forEach((w, i) => an(w, [{ opacity: .38 }, { opacity: 1 }], a + 0.05 + i * span, 0.12, 'linear'));
});
const cnt = E('#cnt');
window.seek = (t) => {
  for (const a of A) a.currentTime = t * 1000;
  const p = Math.min(1, Math.max(0, (t - 17.5) / 1.4)); const e = 1 - Math.pow(1 - p, 3);
  cnt.textContent = String(Math.round(150 * e));
};
window.ready = document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => 0))));
`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}\n${RCSS}</style></head>
<body><div class="stage">${S1}${S2}${S3}${S4}${S5}${S6}${S7}${capsHtml}</div><script>${JS}</script></body></html>`;
const HTML = path.join(OUT, 'reel-a.html');
fs.writeFileSync(HTML, html);

// ---------- SRT ----------
const ts = (s) => { const ms = Math.round(s * 1000); const h = String(Math.floor(ms / 3600000)).padStart(2, '0'); const mi = String(Math.floor(ms / 60000) % 60).padStart(2, '0'); const se = String(Math.floor(ms / 1000) % 60).padStart(2, '0'); return `${h}:${mi}:${se},${String(ms % 1000).padStart(3, '0')}`; };
fs.writeFileSync(path.join(OUT, 'reel-a.srt'), CAPS.map(([a, b, t], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${t}\n`).join('\n'));

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
const STILLS = [1.5, 4.6, 6.5, 10.6, 13.8, 15.2, 16.6, 18.9, 22.6, 23.4, 24.9, 29.3];
{
  const p = await open();
  for (const t of STILLS) {
    await p.evaluate((t) => window.seek(t), t);
    await p.screenshot({ path: path.join(OUT, `still-a-${String(t.toFixed(1)).padStart(4, '0')}s.jpg`), type: 'jpeg', quality: 85 });
  }
  await p.close();
  console.log('stills', STILLS.length);
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
      if (++done % 90 === 0) console.log(`${done}/${N} frames · ${(done / ((Date.now() - t0) / 1000)).toFixed(1)} fps`);
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
