// Uma criança usando o Momon do começo ao fim, conferindo os critérios da V1.
//   node fluxo.cjs [largura altura]   (sem tamanho: tablet deitado e celular em pé)
//   FOTOS=1 node fluxo.cjs            (guarda fotos de cada etapa em testes/fotos/)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { servir, checagens } = require('./servidor.cjs');

const TAMANHOS = process.argv[3] ? [[+process.argv[2], +process.argv[3]]] : [[390, 844], [360, 800], [375, 667], [1024, 768]];
const PASTA_FOTOS = path.join(__dirname, 'fotos');

async function rodar(browser, url, [L, A], c) {
  console.log(`\n— ${L} x ${A}`);
  const ctx = await browser.newContext({ viewport: { width: L, height: A }, hasTouch: true });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  const foto = async nome => {
    if (!process.env.FOTOS) return;
    fs.mkdirSync(PASTA_FOTOS, { recursive: true });
    await page.screenshot({ path: path.join(PASTA_FOTOS, `${L}x${A}-${nome}.png`) });
  };
  const estado = () => page.evaluate(() => window.Momon.app.estado());
  const esperar = ms => page.waitForTimeout(ms);
  const centroDe = sel => page.evaluate(s => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }, sel);

  await page.goto(url);
  await esperar(2800);
  await foto('1-ovo');
  c.checar('começa na tela inicial, com o ovinho', (await estado()).modo === 'inicio' && await page.isVisible('#ovo'));

  // ovinho de estrela
  const ovo = await centroDe('#ovo');
  await page.mouse.click(ovo.x, ovo.y);
  await esperar(4000);
  let e = await estado();
  c.checar('o ovinho choca e o Momon nasce', e.modo === 'livre' && e.pose === 'sentado', `${e.modo}/${e.humor}`);
  c.checar('o toque destravou o som', await page.evaluate(() => window.Momon.audio.pronto()));
  await foto('2-nasceu');

  // carinho: arrastar o dedo em cima dele
  const m = await centroDe('#momon .momon');
  const cx = m.x, cy = m.y - m.h * .08;
  await page.mouse.move(cx - 60, cy);
  await page.mouse.down();
  const reacao = await page.evaluate(({ x, y }) => new Promise(resolve => {
    const t0 = performance.now();
    const svg = document.querySelector('#momon .momon');
    const ob = new MutationObserver(() => {
      if (svg.dataset.humor !== 'ronronando') return;
      ob.disconnect();
      requestAnimationFrame(() => resolve(performance.now() - t0));
    });
    ob.observe(svg, { attributes: true, attributeFilter: ['data-humor'] });
    document.querySelector('#app').dispatchEvent(new PointerEvent('pointermove',
      { bubbles: true, pointerId: 1, clientX: x, clientY: y, isPrimary: true, pointerType: 'mouse' }));
  }), { x: cx - 30, y: cy });
  c.checar('carinho reage em menos de 100 ms', reacao < 100, `${reacao.toFixed(0)} ms`);
  for (let i = 0; i < 40; i++) {
    await page.mouse.move(cx + (i % 2 ? 70 : -70), cy + (i % 3) * 12, { steps: 4 });
    await esperar(60);
    if (i === 30) await foto('3-carinho');
  }
  e = await estado();
  c.checar('ronrona durante o carinho', e.humor === 'ronronando' && await page.evaluate(() => window.Momon.audio.ronronar.ligado()));
  c.checar('carinho longo solta flores, estrelas e vaga-lumes', await page.evaluate(() => document.querySelectorAll('.particula').length) > 0);
  await page.mouse.up();
  await esperar(900);
  e = await estado();
  c.checar('o carinho deixa ele menos emburrado', e.afeto > .4, `afeto ${e.afeto}, ${e.humor}`);

  // cutucar e tocar fora
  await esperar(500);
  await page.mouse.click(cx, cy);
  await esperar(80);
  c.checar('cutucar: curioso, sem susto', (await estado()).humor === 'surpreso');
  await esperar(800);
  await page.mouse.click(40, 100);
  await esperar(150);
  c.checar('toque fora dele vira brilhinho', await page.evaluate(() => document.querySelectorAll('.particula').length) > 0);
  await esperar(900);

  // amassar pãozinho
  await page.click('#bt-coberta');
  await esperar(900);
  e = await estado();
  c.checar('cobertinha: amassar pãozinho', e.modo === 'amassar' && e.humor === 'amassando');
  for (let i = 0; i < 14; i++) {
    await page.mouse.click(i % 2 ? L * .8 : L * .2, A * .5);
    await esperar(430);
    if (i === 9) await foto('4-amassando');
  }
  e = await estado();
  c.checar('alternando no compasso o ritmo sobe', e.ritmo > .5, `ritmo ${e.ritmo}`);
  for (const [x, ms] of [[.2, 120], [.2, 900], [.8, 200], [.8, 700], [.2, 300], [.8, 1100]]) {
    await page.mouse.click(L * x, A * .5);
    await esperar(ms);
  }
  c.checar('fora do ritmo ele só acompanha (sem erro)', (await estado()).modo === 'amassar');
  await esperar(5200);
  e = await estado();
  c.checar('no fim ele se enrosca na cobertinha, ronronando', e.enroscou && e.pose === 'enroscado' && e.humor === 'ronronando');
  await foto('5-enroscado');
  const m2 = await centroDe('#momon .momon');
  await page.mouse.click(m2.x, m2.y + m2.h * .25);
  await esperar(900);
  c.checar('tocar nele enroscado: levanta e volta a brincar', (await estado()).modo === 'livre');

  // dormir
  await page.click('#bt-dormir');
  await esperar(3000);
  e = await estado();
  c.checar('lua: a tela escurece e ele fica com sono', e.modo === 'dormir' && e.humor === 'dormindo');
  await foto('6-mantinha');
  const manta = await centroDe('.mantinha');
  await page.mouse.move(manta.x, manta.y);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) { await page.mouse.move(manta.x, manta.y - i * 12); await esperar(30); }
  await page.mouse.up();
  await esperar(2200);
  e = await estado();
  c.checar('arrastar a mantinha cobre o Momon e ele se enrosca', e.cobriu && e.pose === 'enroscado');
  c.checar('toca uma cantiga', e.melodia >= 0);
  await page.click('[data-melodia="2"]');
  await esperar(500);
  c.checar('dá para escolher outra cantiga', (await estado()).melodia === 2);
  await foto('7-dormindo');
  await page.click('#bt-acordar');
  await esperar(500);
  c.checar('toque rápido no sol não acorda', (await estado()).modo === 'dormir');
  await esperar(14500);
  c.checar('dormir junto: a tela fica bem escura', await page.evaluate(() => document.querySelector('#app').classList.contains('junto')));
  await foto('8-dormir-junto');
  const sol = await centroDe('#bt-acordar');
  await page.mouse.move(sol.x, sol.y);
  await page.mouse.down();
  await esperar(2200);
  await page.mouse.up();
  await esperar(1500);
  c.checar('segurar o sol 2 s acorda', (await estado()).modo === 'livre');

  c.checar('nenhum erro no console', erros.length === 0, erros.slice(0, 3).join(' | '));
  await ctx.close();
}

(async () => {
  const servidor = await servir();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const c = checagens();
  for (const tamanho of TAMANHOS) await rodar(browser, servidor.url, tamanho, c);
  await browser.close();
  await servidor.fechar();
  process.exit(c.fim() ? 1 : 0);
})();
