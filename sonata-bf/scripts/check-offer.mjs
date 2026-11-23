// Falha o render final se sobrar [A CONFIRMAR] ou se as contas não fecharem.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

// Valores pendentes: o marcador só pode existir como constante PENDING em offer.ts.
// Aqui contamos os campos de offer.ts que ainda usam PENDING.
const offerSrc = readFileSync("src/data/offer.ts", "utf8");
const pendentes = [...offerSrc.matchAll(/^\s*(\w+):[^\n]*(PENDING|\[A CONFIRMAR\])[^\n]*$/gm)]
  .map((m) => m[1])
  .filter((k) => k !== "PENDING");

// Contas por código
const de = Number(/const precoDe = (\d+)/.exec(offerSrc)[1]);
const por = Number(/const precoPor = (\d+)/.exec(offerSrc)[1]);
const n = Number(/const parcelas = (\d+)/.exec(offerSrc)[1]);
const v = Number(/const valorParcela = (\d+)/.exec(offerSrc)[1]);
const erros = [];
if (de - por !== 3110) erros.push(`9600 - 6490 deveria ser 3110, deu ${de - por}`);
if (n * v !== 7200) erros.push(`18 x 400 deveria ser 7200, deu ${n * v}`);

// Palavras proibidas no código de tela
const proibidas = [/sem juros/i, /imbat[ií]vel/i, /50\s?%\s*(de desconto|off)/i, /—|–/];
for (const f of walk("src").filter((p) => /\.(ts|tsx)$/.test(p))) {
  if (f.endsWith("check-offer.mjs")) continue;
  const t = readFileSync(f, "utf8");
  for (const re of proibidas) {
    // permite o travessão em comentários de código? Não: o texto de tela não pode ter.
    const m = t.split("\n").filter((l) => re.test(l) && !l.trim().startsWith("//") && !l.trim().startsWith("*"));
    if (m.length) erros.push(`${f}: padrão proibido ${re} em "${m[0].trim().slice(0, 60)}"`);
  }
}

if (pendentes.length) {
  erros.push(`Pendências com a Sonata em offer.ts: ${pendentes.join(", ")}`);
}

if (erros.length) {
  console.error("check:offer FALHOU\n - " + erros.join("\n - "));
  process.exit(1);
}
console.log("check:offer ok: nenhum [A CONFIRMAR], contas conferidas.");
