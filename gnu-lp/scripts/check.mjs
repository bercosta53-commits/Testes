#!/usr/bin/env node
/*
 * Checklist técnico de publicação (briefing §8). Não substitui a aprovação do GNU.
 *   npm run verificar
 * Sai com código 1 se houver algum item bloqueante (✖).
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (...p) => path.join(ROOT, ...p);

const results = [];
const ok = (msg) => results.push(['✔', msg]);
const fail = (msg) => results.push(['✖', msg]);
const warn = (msg) => results.push(['!', msg]);

const html = await readFile(rel('index.html'), 'utf8');
const manifest = JSON.parse(await readFile(rel('assets/img/manifest.json'), 'utf8'));
const sandbox = { window: {} };
vm.runInNewContext(await readFile(rel('assets/js/config.js'), 'utf8'), sandbox);
const C = sandbox.window.GNU_LP_CONFIG;

// ---- Fotografias -------------------------------------------------------
const filesFor = (foto) => {
  const p = manifest.presets[foto.preset];
  return [
    ...p.larguras.flatMap((w) => [`${foto.id}-${w}.avif`, `${foto.id}-${w}.webp`]),
    `${foto.id}-${p.fallbackJpg}.jpg`,
    ...(foto.og ? [`${foto.id}-og.jpg`] : [])
  ];
};
const galleryIds = new Set(Object.values(C.sedes || {}).flatMap((s) => s.fotos.map((f) => f.id)));

for (const foto of manifest.fotos) {
  const missing = filesFor(foto).filter((f) => !existsSync(rel('assets/img', f)));
  const usedInHtml = html.includes(`assets/img/${foto.id}-`);
  const usedInGallery = galleryIds.has(foto.id);
  if (!usedInHtml && !usedInGallery) continue;
  if (!missing.length) { ok(`Foto ${foto.id}`); continue; }
  const msg = `Foto ${foto.id}: faltam ${missing.length} arquivo(s) (ex.: ${missing[0]}). Rode \`npm run imagens\` com o master em assets/img/originais/.`;
  if (foto.obrigatoria || usedInHtml) fail(msg);
  else warn(`${msg} Ou remova a foto da galeria em config.js.`);
}
for (const id of galleryIds) {
  if (!manifest.fotos.some((f) => f.id === id)) warn(`config.js usa ${id}, que não está em assets/img/manifest.json.`);
}
if (manifest.fotos.some((f) => f.menores)) warn('Fotos com crianças (GNU_09, GNU_10): confirmar autorização de uso de imagem antes de publicar.');

// ---- Marca ------------------------------------------------------------
for (const f of ['logo-gnu.svg', 'logo-gnu-negativo.svg']) {
  existsSync(rel('assets/brand', f)) ? ok(`Logo ${f}`) : fail(`Logo oficial ausente: assets/brand/${f}`);
}

// ---- Configuração -----------------------------------------------------
const numero = String(C.whatsapp?.numero || '');
/^55\d{10,11}$/.test(numero) ? ok(`WhatsApp ${numero} (confirmar com o GNU)`) : fail('WhatsApp: número ausente ou fora do formato 55 + DDD + número.');
const hrefNumbers = [...html.matchAll(/https:\/\/wa\.me\/(\d+)/g)].map((m) => m[1]);
hrefNumbers.every((n) => n === numero)
  ? ok('Links wa.me do HTML usam o mesmo número de config.js')
  : fail('Há links wa.me no HTML com número diferente de config.js.');

C.formulario?.modoDemonstracao ? fail('Formulário em modo demonstração (formulario.modoDemonstracao = true).') : ok('Formulário fora do modo demonstração');
C.formulario?.endpoint ? ok(`Formulário envia para ${C.formulario.endpoint}`) : fail('Formulário sem endpoint (formulario.endpoint).');
C.mostrarSlotsPendentes ? fail('Slots de homologação visíveis (mostrarSlotsPendentes = true).') : ok('Slots de homologação ocultos');
C.analytics?.gtmId ? ok(`GTM ${C.analytics.gtmId}`) : warn('Sem GTM configurado (analytics.gtmId): eventos ficam apenas no dataLayer.');

// ---- HTML / SEO -------------------------------------------------------
/<meta name="robots" content="noindex/.test(html) ? fail('index.html ainda tem noindex (página de homologação).') : ok('Página indexável');
/<link rel="canonical"/.test(html.replace(/<!--[\s\S]*?-->/g, '')) ? ok('URL canônica definida') : warn('URL canônica não definida.');
/property="og:image" content="https?:\/\//.test(html) ? ok('og:image com URL absoluta') : warn('og:image deve usar URL absoluta na publicação.');

// ---- Saída ------------------------------------------------------------
for (const [icon, msg] of results) console.log(`${icon} ${msg}`);
const blocking = results.filter(([i]) => i === '✖').length;
const warnings = results.filter(([i]) => i === '!').length;
console.log(`\n${blocking} bloqueante(s), ${warnings} aviso(s).`);
console.log('Lembrete: validações de conteúdo (modalidades, FAQ, horários, LGPD, endereços) são feitas com o GNU — ver README.');
process.exit(blocking ? 1 : 0);
