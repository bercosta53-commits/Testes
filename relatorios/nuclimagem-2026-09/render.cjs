const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.resolve(__dirname, 'painel.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // report pages whose content overflows
  const over = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => {
    const c = pg.querySelector('.content'); const kids = [...c.children]; const last = kids[kids.length-1].getBoundingClientRect(); const cr = c.getBoundingClientRect(); const f = pg.querySelector('.foot').getBoundingClientRect(); const r = pg.getBoundingClientRect();
    return { page: i + 1, slackPx: Math.round(cr.bottom - last.bottom), footBottom: Math.round(f.bottom - r.top) };
  }));
  console.log(JSON.stringify(over));
  await p.pdf({ path: path.resolve(__dirname, 'Nuclimagem_Painel_Setembro2026.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
