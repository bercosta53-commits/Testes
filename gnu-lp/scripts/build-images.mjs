#!/usr/bin/env node
/*
 * Gera as versões responsivas (AVIF, WebP e JPG de fallback) a partir dos masters aprovados.
 *
 *   1. Salve o master em assets/img/originais/<ID>.jpg  (ex.: GNU_02_AP_SEDE.jpg)
 *      — já recortado na proporção pedida no manifest (o script não recorta).
 *   2. npm install   (uma vez; instala o sharp)
 *   3. npm run imagens
 *
 * Saída em assets/img/<ID>-<largura>.<ext>. Metadados EXIF/GPS são removidos.
 */
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG = path.join(ROOT, 'assets', 'img');
const SRC = path.join(IMG, 'originais');
const EXTS = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'];

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('✖ O pacote "sharp" não está instalado. Rode `npm install` dentro de gnu-lp/ e tente de novo.');
  process.exit(1);
}

const manifest = JSON.parse(await readFile(path.join(IMG, 'manifest.json'), 'utf8'));
await mkdir(SRC, { recursive: true });
const available = new Map(
  (await readdir(SRC))
    .filter((f) => EXTS.includes(path.extname(f).toLowerCase()))
    .map((f) => [path.basename(f, path.extname(f)), path.join(SRC, f)])
);

let done = 0;
const pending = [];

for (const foto of manifest.fotos) {
  const src = available.get(foto.id);
  if (!src) { pending.push(foto); continue; }

  const preset = manifest.presets[foto.preset];
  const meta = await sharp(src).rotate().metadata();
  const largest = Math.max(...preset.larguras);
  if ((meta.width || 0) < largest) {
    console.warn(`! ${foto.id}: master com ${meta.width}px de largura; o ideal é ≥ ${largest}px. As versões maiores não serão ampliadas.`);
  }

  for (const w of preset.larguras) {
    const base = sharp(src).rotate().resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 52, effort: 5 }).toFile(path.join(IMG, `${foto.id}-${w}.avif`));
    await base.clone().webp({ quality: 74 }).toFile(path.join(IMG, `${foto.id}-${w}.webp`));
  }
  await sharp(src).rotate()
    .resize({ width: preset.fallbackJpg, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(path.join(IMG, `${foto.id}-${preset.fallbackJpg}.jpg`));

  if (foto.og) {
    await sharp(src).rotate()
      .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(IMG, `${foto.id}-og.jpg`));
  }

  done++;
  console.log(`✔ ${foto.id} (${meta.width}×${meta.height}) → ${preset.larguras.join(', ')} px`);
}

console.log(`\n${done} foto(s) geradas.`);
const missingRequired = pending.filter((f) => f.obrigatoria);
if (missingRequired.length) {
  console.log(`\nAinda sem master em assets/img/originais/ (${missingRequired.length} obrigatória(s)):`);
  missingRequired.forEach((f) => console.log(`  · ${f.id} — ${f.proporcao} — ${f.briefing}`));
}
if (!existsSync(path.join(IMG, 'GNU_01_HERO_AP-og.jpg'))) {
  console.log('\n! A imagem de compartilhamento (og:image) é gerada a partir de GNU_01_HERO_AP.');
}
