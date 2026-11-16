// Renderiza um vídeo quadro a quadro no Chromium headless e codifica com ffmpeg.
//   node render.mjs v1                      -> out/v1.mp4 (com áudio se v1/audio/*.wav existir)
//   node render.mjs v1 --stills 1.0,4.8,8.5 -> out/v1-still-*.png (style frames)
//   opções: --workers 4 --fps 30 --from 0 --to <seg>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [video, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i++) if (rest[i].startsWith('--')) args[rest[i].slice(2)] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true;
const WORKERS = Number(args.workers ?? 4), FPS = Number(args.fps ?? 30);
const OUT = path.join(here, 'out'); fs.mkdirSync(OUT, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav' };
const server = http.createServer((req, res) => {
  const p = path.join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(here) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/${video}/index.html?render${args.bg ? '&bg=' + args.bg : ''}`;
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(url);
  await page.waitForFunction(() => window.ready === true);
  return page;
}

if (args.stills) {
  const page = await openPage();
  for (const s of String(args.stills).split(',').map(Number)) {
    await page.evaluate(t => ENGINE.seek(t), s);
    const f = path.join(OUT, `${video}${args.bg ? '-' + args.bg : ''}-still-${s.toFixed(2)}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close(); server.close(); process.exit();
}

const dur = await (await openPage()).evaluate(() => ENGINE.dur);
const from = Number(args.from ?? 0), to = Number(args.to ?? dur);
const frames = path.join(here, '.frames', video);
fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });
const queue = []; for (let f = Math.round(from * FPS); f < Math.round(to * FPS); f++) queue.push(f);
const total = queue.length; let done = 0; const t0 = Date.now();
async function worker() {
  const page = await openPage();
  while (queue.length) {
    const f = queue.shift();
    await page.evaluate(t => ENGINE.seek(t), f / FPS);
    await page.screenshot({ path: path.join(frames, `f${String(f).padStart(5, '0')}.png`) });
    if (++done % 30 === 0 || done === total) process.stdout.write(`\r${done}/${total} quadros  ${(done / ((Date.now() - t0) / 1000)).toFixed(1)} q/s   `);
  }
}
await Promise.all(Array.from({ length: WORKERS }, worker));
await browser.close(); server.close(); console.log();

// áudio: trilha abaixa sob a locução (sidechain), tudo normalizado para -14 LUFS (Reels)
const mixed = path.join(here, video, 'audio/mix.wav');
const vo = path.join(here, video, 'audio/vo.wav'), mus = path.join(here, video, 'audio/trilha.wav');
const hasVo = fs.existsSync(vo), hasMus = fs.existsSync(mus);
const inputs = ['-framerate', String(FPS), '-start_number', String(Math.round(from * FPS)), '-i', path.join(frames, 'f%05d.png')];
let filter = [], map = ['-map', '0:v'];
const hasMix = fs.existsSync(mixed);
if (hasMix) inputs.push('-i', mixed);
else if (hasVo) inputs.push('-i', vo);
if (!hasMix && hasMus) inputs.push('-i', mus);
if (hasMix) { map.push('-map', '1:a'); }
else if (hasVo && hasMus) {
  filter = ['-filter_complex', '[1:a]asplit[v1][v2];[2:a]volume=0.5[m];[m][v1]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=400[d];[d][v2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1[a]'];
  map.push('-map', '[a]');
} else if (hasVo || hasMus) { filter = ['-filter_complex', '[1:a]loudnorm=I=-14:TP=-1[a]']; map.push('-map', '[a]'); }
const outFile = path.join(OUT, `${video}.mp4`);
const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...inputs, ...filter, ...map,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  ...(hasMix || hasVo || hasMus ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []), '-movflags', '+faststart', outFile], { stdio: 'inherit' });
console.log(r.status === 0 ? outFile : 'ffmpeg falhou');
process.exit(r.status ?? 1);
