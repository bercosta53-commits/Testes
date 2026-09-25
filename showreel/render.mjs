// Renders reel.html frame by frame in headless Chromium (parallel workers),
// then muxes the frames with the soundtrack into an H.264 MP4.
//
//   node render.mjs [--workers 4] [--samples 5] [--from 0] [--to 900] [--out showreel.mp4]
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean)
  .map(s => s.trim().split(/\s+/)).map(([k, v]) => [k, v ?? true]));
const WORKERS = Number(args.workers ?? 4);
const SAMPLES = Number(args.samples ?? 5);
const FROM = Number(args.from ?? 0);
const TO = Number(args.to ?? 900);
const OUT = path.resolve(here, args.out ?? 'showreel.mp4');
const FRAMES_DIR = path.resolve(args.frames ?? path.join(here, '.frames'));
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';

fs.mkdirSync(FRAMES_DIR, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.wav': 'audio/wav' };
const server = http.createServer((req, res) => {
  const p = path.join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(here) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/reel.html?render`;

const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
const queue = [];
for (let f = FROM; f < TO; f++) queue.push(f);
const total = queue.length;
let done = 0;
const t0 = Date.now();

async function worker() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e); process.exitCode = 1; });
  await page.goto(url);
  await page.evaluate(() => window.reelReady);
  while (queue.length) {
    const f = queue.shift();
    const png = await page.evaluate(([f, s]) => {
      window.REEL.renderFrame(f, s);
      return document.getElementById('c').toDataURL('image/png');
    }, [f, SAMPLES]);
    fs.writeFileSync(path.join(FRAMES_DIR, `f${String(f).padStart(4, '0')}.png`), Buffer.from(png.split(',')[1], 'base64'));
    done++;
    if (done % 30 === 0 || done === total) {
      const rate = done / ((Date.now() - t0) / 1000);
      process.stdout.write(`\r${done}/${total} frames  ${rate.toFixed(1)} fps  eta ${((total - done) / rate).toFixed(0)}s   `);
    }
  }
  await page.close();
}
await Promise.all(Array.from({ length: WORKERS }, worker));
await browser.close();
server.close();
console.log();

if (args['no-encode']) process.exit();
const wav = path.join(here, 'showreel.wav');
const ff = [
  '-y', '-framerate', '60', '-start_number', String(FROM), '-i', path.join(FRAMES_DIR, 'f%04d.png'),
  ...(fs.existsSync(wav) ? ['-i', wav] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '24M', '-bufsize', '48M',
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-tune', 'grain',
  ...(fs.existsSync(wav) ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
  '-movflags', '+faststart', OUT,
];
const r = spawnSync(FFMPEG, ff, { stdio: 'inherit' });
process.exit(r.status ?? 1);
