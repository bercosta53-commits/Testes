// Gera dist/assets/og.png (1200 x 630) com Playwright, se disponível.
import fs from 'node:fs';
import path from 'node:path';
import { loadPlaywright } from './pw.mjs';
export async function makeOg(dist, { nPaises, nEsportes }) {
  const { chromium } = await loadPlaywright();
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const font = (f) => `file://${path.resolve(dist, 'assets/fonts', f)}`;
  await p.setContent(`<style>
  @font-face{font-family:B;font-weight:800;src:url(${font('barlow-condensed-latin-800-normal.woff2')})}
  @font-face{font-family:B;font-weight:700;src:url(${font('barlow-condensed-latin-700-normal.woff2')})}
  body{margin:0;width:1200px;height:630px;background:#151A1F;color:#fff;font-family:B;position:relative;overflow:hidden}
  .g{position:absolute;right:-30px;bottom:-90px;font:800 520px/1 B;color:rgba(228,218,200,.07)}
  .t{position:absolute;left:70px;top:70px;font:800 150px/.88 B;text-transform:uppercase}
  .t em{font-style:normal;color:#B9893A}
  .r{position:absolute;left:70px;top:420px;width:90px;height:5px;background:#B9893A}
  .s{position:absolute;left:70px;top:450px;font:700 38px/1.2 B;letter-spacing:.08em;text-transform:uppercase;color:#B9893A}
  .s2{position:absolute;left:70px;top:510px;font:700 32px/1.2 B;letter-spacing:.04em;color:rgba(255,255,255,.85)}
  </style><div class="g">150</div><div class="t">Nomes que <em>rolam</em><br>na boca</div><div class="r"></div>
  <div class="s">${150} nomes · ${nPaises} países · ${nEsportes} esportes</div><div class="s2">Um estudo sobre os nomes mais sonoros do esporte</div>`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(dist, 'assets/og.png') });
  await b.close();
}
