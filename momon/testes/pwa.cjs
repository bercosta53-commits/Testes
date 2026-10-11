// Confere se o app é instalável (critérios do Chromium) e se abre sem internet.
const { chromium } = require('playwright');
const { servir, checagens } = require('./servidor.cjs');

(async () => {
  const servidor = await servir();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  const c = checagens();
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));

  await page.goto(servidor.url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  c.checar('instalável na tela inicial', installabilityErrors.length === 0, JSON.stringify(installabilityErrors));
  const manifesto = await cdp.send('Page.getAppManifest');
  c.checar('manifesto sem erros', manifesto.errors.length === 0, JSON.stringify(manifesto.errors));

  // sem internet: servidor desligado e aparelho offline
  await servidor.fechar();
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForTimeout(1500);
  const abriu = await page.evaluate(() => !!document.querySelector('#momon .momon') && !!document.querySelector('.cena-quarto')
    && typeof window.Momon.app.estado === 'function');
  c.checar('abre sem internet depois da primeira vez', abriu);
  c.checar('nenhum erro', erros.length === 0, erros.join(' | '));

  await browser.close();
  process.exit(c.fim() ? 1 : 0);
})();
