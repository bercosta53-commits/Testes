// Confere o texto publicado contra o MD da copy.
//   node scripts/verificar.mjs <caminho/velora-copy-site-v1.md> [dist/index.html]
//
// 1. Copy → página: cada frase da Home (§2), da navegação (§1) e dos componentes usados (§10)
//    precisa aparecer na página, letra por letra (sem diferenciar maiúsculas, que o CSS controla).
// 2. Página → copy: lista todo texto visível que NÃO vem da copy, para revisão humana.
import { readFile } from 'node:fs/promises';

const [mdCaminho, htmlCaminho = 'dist/index.html'] = process.argv.slice(2);
if (!mdCaminho) {
  console.error('Uso: node scripts/verificar.mjs <velora-copy-site-v1.md> [dist/index.html]');
  process.exit(2);
}

const md = (await readFile(mdCaminho, 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
const pagina = await readFile(htmlCaminho, 'utf8');

const norm = (t) => t.replace(/\s+/g, ' ').trim().toLowerCase();
const entidades = (t) => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// ---------- Texto da página ----------
const corpo = pagina.slice(pagina.indexOf('<body'), pagina.indexOf('</body>')).replace(/<script[\s\S]*?<\/script>/g, '');
const INLINE = /^(span|strong|em|a|mark|b|i|tspan)$/;
// Mensagens de estado do formulário ficam em data-msg-* e só aparecem após o envio.
const mensagens = [...corpo.matchAll(/data-msg-[a-z]+="([^"]*)"/g)].map((m) => m[1]).join(' ');
const textoPagina = norm(entidades(corpo.replace(/<\/?([a-zA-Z0-9]+)[^>]*>/g, (m, tag) => (INLINE.test(tag.toLowerCase()) && tag !== 'tspan' ? '' : ' ')) + ' ' + mensagens));
const head = pagina.slice(0, pagina.indexOf('</head>'));
const titulo = entidades(head.match(/<title>([^<]*)<\/title>/)[1]);
const descricao = entidades(head.match(/<meta name="description" content="([^"]*)"/)[1]);

// ---------- Copy esperada ----------
function trecho(inicio, fim) {
  const a = md.indexOf(inicio);
  const b = fim ? md.indexOf(fim, a + 1) : md.length;
  if (a < 0) throw new Error(`Trecho não encontrado no MD: ${inicio}`);
  return md.slice(a, b);
}
const home = trecho('# 2. Home', '# 3. Página interna');
const nav = trecho('# 1. Navegação global', '# 2. Home');
const comps = trecho('## Formulário — Origem de novos clientes', '## FAQ');

const ROTULOS = /^\*\*(Rótulo|CTA principal|CTA secundário|Microcopy|Frase-ponte|Linha de apoio|CTA de apoio|Texto de apoio|Botão|Menu principal|Botão fixo|Destino do botão|Marca \/ assinatura curta|Opções sugeridas|Sucesso|Erro|Validação):\*\*\s*/;

function frases(bloco) {
  const out = [];
  let emCaso = false;
  for (let linha of bloco.split('\n')) {
    linha = linha.trim();
    if (!linha || linha === '---') continue;
    if (/^\*\*\[CASE VALIDADO/.test(linha)) { emCaso = true; continue; }
    if (emCaso) { if (/^\*\*Link:\*\*/.test(linha)) emCaso = false; continue; }
    if (/^#{1,2} /.test(linha)) continue; // títulos internos do documento ("## 01 · Hero")
    if (/^\*\*(SEO title|Meta description|Campos do formulário|Destino do botão):\*\*/.test(linha)) continue;
    if (/^\*\*(Rótulo|Rótulo:)\*\*/.test(linha) && bloco === comps) continue;
    linha = linha.replace(/^### /, '').replace(/^- /, '');
    const rotulo = linha.match(ROTULOS)?.[1];
    linha = linha.replace(ROTULOS, '');
    linha = linha.replace(/\s*→\s*`[^`]*`/g, ''); // destino técnico do link
    linha = linha.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\s{2,}$/, '');
    // campos do formulário: "Nome — *Como podemos chamar você?*"
    const partes = linha.split(/ — (?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])| · /);
    for (const p of partes.length > 1 && /( · )|( — [A-Z])/.test(linha) ? partes : [linha]) {
      for (const f of p.split(/(?<=[.?!])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9])/)) {
        const t = f.trim();
        if (t.length > 1) out.push({ t, rotulo });
      }
    }
  }
  return out;
}

const esperadas = [...frases(nav), ...frases(home), ...frases(comps)];

// Ausências decididas para a v1 one page (não são erro; ficam listadas para conferência).
const OMISSOES = new Map([
  ['insights', 'item de menu sem seção na página única'],
  ['sobre', 'item de menu sem seção na página única'],
  ['conheça as cinco etapas', 'CTA de apoio apontava para página interna'],
  ['entenda o nosso método', 'CTA de apoio apontava para página interna'],
  ['conheça o velora radar', 'CTA de apoio apontava para página interna'],
  ['veja onde podemos atuar', 'CTA de apoio apontava para página interna'],
  ['/diagnostico', 'destino técnico'],
]);

let faltando = 0;
const omitidas = [];
for (const { t } of esperadas) {
  const n = norm(t);
  if (textoPagina.includes(n)) continue;
  if (OMISSOES.has(n)) { omitidas.push(`${t}  (${OMISSOES.get(n)})`); continue; }
  faltando++;
  console.log(`FALTA  ${t}`);
}

const homeMeta = {
  titulo: home.match(/\*\*SEO title:\*\* (.+?)\s*$/m)[1].trim(),
  descricao: home.match(/\*\*Meta description:\*\* (.+?)\s*$/m)[1].trim(),
};
if (titulo !== homeMeta.titulo) { faltando++; console.log(`TÍTULO difere:\n  página: ${titulo}\n  copy:   ${homeMeta.titulo}`); }
if (descricao !== homeMeta.descricao) { faltando++; console.log(`DESCRIPTION difere:\n  página: ${descricao}\n  copy:   ${homeMeta.descricao}`); }

console.log(`\nCopy → página: ${esperadas.length} trechos conferidos, ${faltando} com problema.`);
if (omitidas.length) console.log(`Omitidos de propósito (one page):\n  - ${omitidas.join('\n  - ')}`);

// ---------- Página → copy: texto que não vem da copy ----------
const copyInteira = norm(md.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, ''));
const nos = corpo
  .replace(/<(svg|style)[\s\S]*?<\/\1>/g, (m) => m.replace(/<tspan[^>]*>/g, ' ')) // mantém textos do SVG
  .split(/<[^>]+>/)
  .map((t) => entidades(t).replace(/\s+/g, ' ').trim())
  .filter((t) => t && !/^[\s·/:—.\-]+$/.test(t));
const fora = [...new Set(nos.filter((t) => !copyInteira.includes(norm(t))))];
console.log(`\nPágina → copy: ${fora.length} textos visíveis que não estão na copy (revisar):`);
for (const t of fora) console.log(`  · ${t}`);

process.exit(faltando ? 1 : 0);
