// Renderiza film.html quadro a quadro no Chromium headless (workers em paralelo)
// e codifica em H.264 + AAC com o áudio de build/mix.wav.
//
//   node render.mjs                          -> build/uniao-verao-30s.mp4
//   node render.mjs --stills 1,5,9.5,27      -> build/stills/t*.png (conferência)
//   node render.mjs --workers 4 --out build/x.mp4
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean)
  .map(s => s.trim().split(/\s+/)).map(([k, v]) => [k, v ?? true]));
const WORKERS = Number(args.workers ?? 4);
const FPS = 30, DUR = 30;
const OUT = path.resolve(here, args.out ?? 'build/uniao-verao-30s.mp4');
const FRAMES = path.join(here, 'build/.frames');

const types = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav' };
const server = http.createServer((req, res) => {
  const p = path.join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(here) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/film.html?render`;
const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e); process.exitCode = 1; });
  page.on('console', m => m.type() === 'error' && console.error('console:', m.text()));
  await page.goto(url);
  await page.evaluate(() => window.filmReady);
  return page;
}
const grab = (page, f) => page.evaluate(f => { window.FILM.renderFrame(f); return document.getElementById('c').toDataURL('image/png'); }, f)
  .then(d => Buffer.from(d.split(',')[1], 'base64'));

if (args.stills) {
  const dir = path.join(here, 'build/stills'); fs.mkdirSync(dir, { recursive: true });
  const page = await openPage();
  for (const s of String(args.stills).split(',')) {
    const f = Math.round(Number(s) * FPS);
    fs.writeFileSync(path.join(dir, `t${Number(s).toFixed(2).padStart(5, '0')}.png`), await grab(page, f));
  }
  await browser.close(); server.close(); console.log('stills ->', dir); process.exit();
}

fs.rmSync(FRAMES, { recursive: true, force: true }); fs.mkdirSync(FRAMES, { recursive: true });
const queue = Array.from({ length: FPS * DUR }, (_, i) => i);
const total = queue.length; let done = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: WORKERS }, async () => {
  const page = await openPage();
  while (queue.length) {
    const f = queue.shift();
    fs.writeFileSync(path.join(FRAMES, `f${String(f).padStart(4, '0')}.png`), await grab(page, f));
    if (++done % 30 === 0) process.stdout.write(`\r${done}/${total} quadros  ${(done / ((Date.now() - t0) / 1000)).toFixed(1)} q/s   `);
  }
  await page.close();
}));
await browser.close(); server.close(); console.log();

const wav = path.join(here, 'build/mix.wav');
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(FRAMES, 'f%04d.png'),
  ...(fs.existsSync(wav) ? ['-i', wav, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000'] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-r', String(FPS), '-t', String(DUR), '-movflags', '+faststart', OUT], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status);
console.log('->', OUT);
