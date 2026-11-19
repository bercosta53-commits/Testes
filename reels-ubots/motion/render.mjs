// Renderiza reel.html quadro a quadro no Chromium headless (workers em paralelo)
// e junta os quadros com o áudio do monstro num MP4 H.264 1080×1920.
//
//   node render.mjs [--workers 4] [--from 0] [--to 1379] [--out monstro.mp4] [--no-encode]
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');   // usa o Playwright instalado no sistema
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean)
  .map(s => s.trim().split(/\s+/)).map(([k, v]) => [k, v ?? true]));
const WORKERS = Number(args.workers ?? 4);
const FROM = Number(args.from ?? 0);
const TO = Number(args.to ?? 1379);
const OUT = path.resolve(here, args.out ?? 'monstro.mp4');
const FRAMES_DIR = path.resolve(args.frames ?? path.join(here, '.frames'));
const AUDIO = path.join(root, 'audio', args.audio ?? 'mix_monstro_-14LUFS.wav');   // --audio arquivo.wav

fs.mkdirSync(FRAMES_DIR, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/motion/reel.html?render${args.variant ? '&variant=' + args.variant : ''}`;

const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
const queue = [];
if (args.list) queue.push(...String(args.list).split(',').map(Number));   // --list 10,200,450 (quadros de teste)
else for (let f = FROM; f < TO; f++) queue.push(f);
const total = queue.length;
let done = 0;
const t0 = Date.now();

async function worker() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e); process.exitCode = 1; });
  await page.goto(url);
  await page.evaluate(() => window.reelReady);
  while (queue.length) {
    const f = queue.shift();
    const jpg = await page.evaluate(async (f) => {
      await window.REEL.renderFrame(f);
      return document.getElementById('c').toDataURL('image/jpeg', 0.97);
    }, f);
    fs.writeFileSync(path.join(FRAMES_DIR, `f${String(f).padStart(4, '0')}.jpg`), Buffer.from(jpg.split(',')[1], 'base64'));
    done++;
    if (done % 30 === 0 || done === total) {
      const rate = done / ((Date.now() - t0) / 1000);
      process.stdout.write(`\r${done}/${total} quadros  ${rate.toFixed(1)} fps  faltam ${((total - done) / rate).toFixed(0)}s   `);
    }
  }
  await page.close();
}
await Promise.all(Array.from({ length: WORKERS }, worker));
await browser.close();
server.close();
console.log();

if (args['no-encode']) process.exit();
const ff = [
  '-y', '-framerate', '30', '-start_number', String(FROM), '-i', path.join(FRAMES_DIR, 'f%04d.jpg'),
  ...(fs.existsSync(AUDIO) ? ['-i', AUDIO] : []),
  // JPEG (JFIF, BT.601, full range) -> BT.709 limited range, com as tags de cor corretas para Reels/Instagram
  '-vf', 'scale=in_range=pc:in_color_matrix=bt601:out_range=tv:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv420p',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-level', '4.2',
  '-g', '60', '-keyint_min', '30', '-bf', '3', '-maxrate', '12M', '-bufsize', '24M',
  ...(fs.existsSync(AUDIO) ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
  '-movflags', '+faststart', OUT,
];
const r = spawnSync('ffmpeg', ff, { stdio: 'inherit' });
process.exit(r.status ?? 1);
