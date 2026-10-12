// "Criança apertando tudo": toques, arrastes, dois dedos e botões ao acaso.
// Nada pode quebrar, dar erro ou encher a tela de partículas.
//   node caos.cjs [segundos]
const { chromium } = require('playwright');
const { servir, checagens } = require('./servidor.cjs');

const SEGUNDOS = Number(process.argv[2] || 30);
const BOTOES = ['#bt-coberta', '#bt-dormir', '[data-melodia="0"]', '[data-melodia="1"]', '[data-melodia="2"]'];

(async () => {
  const servidor = await servir();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const c = checagens();
  for (const [L, A] of [[390, 844], [360, 800], [1024, 768]]) {
    const page = await browser.newPage({ viewport: { width: L, height: A }, hasTouch: true });
    const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
    await page.goto(servidor.url);
    await page.waitForTimeout(500);
    const r = (a, b) => a + Math.random() * (b - a);
    const modos = new Set();
    let maxParticulas = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < SEGUNDOS * 1000) {
      const sorte = Math.random();
      const x = r(5, L - 5), y = r(5, A - 5);
      if (sorte < .45) {
        await page.mouse.click(x, y);
      } else if (sorte < .7) {
        await page.mouse.move(x, y);
        await page.mouse.down();
        for (let i = 0; i < 8; i++) await page.mouse.move(x + r(-150, 150), y + r(-150, 150), { steps: 2 });
        await page.mouse.up();
      } else if (sorte < .8) {
        await page.evaluate(({ x, y }) => {
          const app = document.querySelector('#app');
          const ev = (tipo, id, px, py) => app.dispatchEvent(new PointerEvent(tipo,
            { bubbles: true, pointerId: id, clientX: px, clientY: py, pointerType: 'touch', isPrimary: id === 11 }));
          ev('pointerdown', 11, x, y); ev('pointerdown', 12, x + 80, y + 40);
          ev('pointermove', 11, x + 30, y); ev('pointermove', 12, x + 40, y + 60);
          ev('pointerup', 12, x + 40, y + 60); ev('pointerup', 11, x + 30, y);
        }, { x, y });
      } else if (sorte < .97) {
        await page.evaluate(sel => document.querySelector(sel).click(), BOTOES[Math.floor(r(0, BOTOES.length))]);
      } else {
        const sol = await page.evaluate(() => {
          const b = document.querySelector('#bt-acordar').getBoundingClientRect();
          return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
        });
        await page.mouse.move(sol.x, sol.y);
        await page.mouse.down();
        await page.waitForTimeout(2200);
        await page.mouse.up();
      }
      await page.waitForTimeout(r(20, 260));
      const e = await page.evaluate(() => ({ modo: window.Momon.app.estado().modo, particulas: document.querySelectorAll('.particula').length }));
      modos.add(e.modo);
      maxParticulas = Math.max(maxParticulas, e.particulas);
    }
    console.log(`\n— ${L} x ${A}: modos visitados ${[...modos].join(', ')}`);
    c.checar('nenhum erro', erros.length === 0, erros.slice(0, 3).join(' | '));
    c.checar('poucas partículas ao mesmo tempo', maxParticulas <= 18, `máximo ${maxParticulas}`);
    c.checar('continua respondendo', typeof (await page.evaluate(() => window.Momon.app.estado().modo)) === 'string');
    await page.close();
  }
  await browser.close();
  await servidor.fechar();
  process.exit(c.fim() ? 1 : 0);
})();
