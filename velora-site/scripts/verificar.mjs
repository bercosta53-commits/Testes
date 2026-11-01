// Confere a página publicada contra a copy editorial v2.
//   node scripts/verificar.mjs <caminho/velora-copy-site-v2-editorial.md> [dist/index.html]
//
// 1. Copy → página: cada trecho do bloco de publicação (entre PUBLICACAO_INICIO e PUBLICACAO_FIM)
//    precisa aparecer na página, letra por letra (sem diferenciar maiúsculas, que o CSS controla).
// 2. Página → copy: lista todo texto visível que NÃO vem da copy, para revisão humana.
// 3. Regras editoriais da v2 (§C e §D) que dá para medir na página.
import { readFile } from 'node:fs/promises';
import config from '../config.mjs';

const [mdCaminho, htmlCaminho = 'dist/index.html'] = process.argv.slice(2);
if (!mdCaminho) {
  console.error('Uso: node scripts/verificar.mjs <velora-copy-site-v2-editorial.md> [dist/index.html]');
  process.exit(2);
}

const mdTodo = await readFile(mdCaminho, 'utf8');
const ini = mdTodo.indexOf('<!-- PUBLICACAO_INICIO -->');
const fim = mdTodo.indexOf('<!-- PUBLICACAO_FIM -->');
if (ini < 0 || fim < 0) throw new Error('Marcadores PUBLICACAO_INICIO / PUBLICACAO_FIM não encontrados no MD.');
const md = mdTodo.slice(ini, fim);
const pagina = await readFile(htmlCaminho, 'utf8');

const norm = (t) => t.replace(/\s+/g, ' ').trim().toLowerCase();
const entidades = (t) => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// ---------- Texto da página ----------
const corpo = pagina.slice(pagina.indexOf('<body'), pagina.indexOf('</body>'))
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<svg[\s\S]*?<\/svg>/g, ' ');
const INLINE = /^(span|strong|em|a|mark|b|i|abbr)$/i;
const semTags = (h) => entidades(h.replace(/<\/?([a-zA-Z0-9]+)[^>]*>/g, (m, tag) => (INLINE.test(tag) ? '' : '\n')));
// Mensagens de estado do formulário ficam em data-msg-* e só aparecem após o envio.
const mensagens = [...corpo.matchAll(/data-msg-[a-z]+="([^"]*)"/g)].map((m) => entidades(m[1]));
const linhasPagina = semTags(corpo).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
const textoPagina = norm(linhasPagina.join(' ') + ' ' + mensagens.join(' '));
const visivel = linhasPagina.join('\n');

// ---------- Copy esperada ----------
const ROTULOS_DE_CAMPO = new Set(['Eyebrow', 'H1', 'Subtítulo', 'CTA primário', 'CTA secundário', 'Faixa curta', 'H2', 'Abertura',
  'Faixa de evidências — título', 'Fechamento', 'Texto', 'CTA', 'Nota de confiança', 'Campos', 'Opções de “Principal desafio”',
  'Assinatura', 'Navegação']);
const LISTAS = new Set(['Campos', 'Opções de “Principal desafio”', 'Navegação']);
const CTA_V2 = 'Agendar conversa de diagnóstico';
const ctaEsperado = config.agendaUrl ? CTA_V2 : 'Solicitar conversa';

const esperadas = []; // { t, secao, nota }
const rotulosSecao = [];
let secao = '';
let campo = '';
for (let linha of md.split('\n')) {
  linha = linha.replace(/\s+$/, '');
  if (!linha.trim() || linha.startsWith('<!--')) continue;
  const h = linha.match(/^### (\d\d) · (.+)$/) || linha.match(/^### (Rodapé)$/);
  if (h) { secao = linha.slice(4); if (h[2] && h[2] !== 'Hero') rotulosSecao.push(h[2]); campo = ''; continue; }
  const negrito = linha.match(/^\*\*(.+)\*\*$/);
  if (negrito && ROTULOS_DE_CAMPO.has(negrito[1])) { campo = negrito[1]; continue; }
  let partes;
  if (negrito) {
    // Título de bloco: "Card 1 — X", "Destaque integrado · X", "01 · X", "R · Review — Entender", "~80%"…
    campo = '';
    let t = negrito[1].replace(/^Card \d+ — /, '').replace(/^Destaque( integrado)? · /, '');
    partes = t.split(' · ');
  } else {
    let t = linha.replace(/^- /, '').replace(/^\*(.+)\*$/, '$1');
    if (/^(CTA primário|CTA)$/.test(campo) && t === CTA_V2) {
      esperadas.push({ t: ctaEsperado, secao, nota: ctaEsperado === CTA_V2 ? '' : `copy diz "${CTA_V2}"; sem agenda real configurada, a regra da copy v2 (§C) pede "Solicitar conversa"` });
      continue;
    }
    partes = LISTAS.has(campo) ? t.split(' · ') : [t];
  }
  for (const p of partes) if (p.trim()) esperadas.push({ t: p.trim(), secao, nota: '' });
}

// ---------- 1. Copy → página ----------
let ok = 0;
const faltando = [];
const substituidas = [];
for (const e of esperadas) {
  if (textoPagina.includes(norm(e.t))) { ok++; if (e.nota) substituidas.push(e); }
  else faltando.push(e);
}
console.log(`\n1. Copy → página: ${ok}/${esperadas.length} trechos presentes.`);
for (const e of substituidas) console.log(`   decisão  [${e.secao}] "${e.t}" — ${e.nota}`);
for (const e of faltando) console.log(`   FALTANDO [${e.secao}] "${e.t}"`);
const rotulosAusentes = rotulosSecao.filter((r) => !textoPagina.includes(norm(r)));
console.log(`   rótulos de seção (títulos 01–07 da copy) usados na tela: ${rotulosSecao.length - rotulosAusentes.length}/${rotulosSecao.length}`);

// ---------- 2. Página → copy ----------
const copyTudo = norm(esperadas.map((e) => e.t).join(' | ') + ' | ' + rotulosSecao.join(' | ') + ' | ' + CTA_V2);
const EXTRAS = new Map([
  ['velora', 'marca'],
  ['velora growth & beyond', 'marca com assinatura'],
  ['© 2026 velora · growth & beyond', 'linha de direitos do rodapé'],
  ['menu', 'botão do menu no celular'],
  ['pular para o conteúdo', 'atalho de acessibilidade'],
  ['01', 'numeração'], ['02', 'numeração'], ['03', 'numeração'], ['04', 'numeração'], ['05', 'numeração'], ['06', 'numeração'], ['07', 'numeração'],
  ['/', 'separador do rótulo de seção'],
  ['o', 'letra do RHOI'], ['h', 'letra do RHOI'], ['i', 'letra do RHOI'], ['r', 'letra do RHOI'],
]);
// Linhas compostas na tela: "01/O sistema" (rótulo de seção), "VeloraGrowth & Beyond" (marca + assinatura),
// "Liderança de crescimento · Growth Leader as a Service" (título em duas linhas).
const pedacos = (l) => l.replace(/^(\d\d)\/(?=\S)/, '$1 / ').replace(/^Velora(?=Growth)/, 'Velora ').split(/ [·/] /);
const naCopy = (t) => copyTudo.includes(norm(t)) || EXTRAS.has(norm(t));
const faixas = new Set(config.faixasFaturamento.map(norm));
const foraDaCopy = new Map();
const aValidar = [];
for (const l of linhasPagina) {
  if (naCopy(l) || pedacos(l).every(naCopy)) continue;
  if (faixas.has(norm(l))) { aValidar.push(l); continue; }
  foraDaCopy.set(l, (foraDaCopy.get(l) || 0) + 1);
}
const extrasUsados = linhasPagina.flatMap(pedacos).filter((l) => EXTRAS.has(norm(l)) && !copyTudo.includes(norm(l)));
console.log(`\n2. Página → copy: ${foraDaCopy.size} texto(s) visível(is) fora da copy.`);
for (const [t, n] of foraDaCopy) console.log(`   fora da copy (${n}×): "${t}"`);
const resumoExtras = [...new Set(extrasUsados.map((l) => `${l} (${EXTRAS.get(norm(l))})`))];
console.log(`   permitidos (estrutura/marca): ${resumoExtras.join('; ')}`);
console.log(`   mensagens de estado do formulário (copy v1, §10): ${mensagens.length}`);
console.log(`   a validar (config.faixasFaturamento, sugestão de trabalho): ${aValidar.join(' | ')}`);

// ---------- 3. Regras editoriais ----------
const falhas = [];
const avisos = [];
const regra = (cond, texto) => { (cond ? [] : falhas).push(texto); console.log(`   ${cond ? 'ok   ' : 'FALHA'} ${texto}`); };
console.log('\n3. Regras editoriais (copy v2, §C e §D):');

// Seções da página (por id) para regras de localização.
const blocos = [...corpo.matchAll(/<(section|footer|header)\b([^>]*)>([\s\S]*?)<\/\1>/g)]
  .map((m) => ({ id: m[2].match(/id="([^"]+)"/)?.[1] || m[1], texto: semTags(m[3]).replace(/\s+/g, ' ') }));
const ETAPAS = ['Inteligência', 'Acesso', 'Demanda', 'Conversão', 'Medição'];
const comEtapas = blocos.filter((b) => ETAPAS.filter((e) => new RegExp(`(^|[^\\p{L}])${e}([^\\p{L}]|$)`, 'u').test(b.texto)).length >= 2).map((b) => b.id);
regra(comEtapas.every((id) => ['inicio', 'sistema'].includes(id)) && comEtapas.includes('inicio') && comEtapas.includes('sistema'),
  `os cinco nomes do sistema aparecem só no hero e na seção do sistema (blocos com os nomes: ${comEtapas.join(', ')})`);

const DADOS = ['~80%', '5–16', '49%', '28%'];
const contar = (t, s) => t.split(s).length - 1;
regra(DADOS.every((d) => contar(visivel, d) === 1), `quatro dados, cada um uma única vez (${DADOS.map((d) => `${d}: ${contar(visivel, d)}×`).join(', ')})`);
regra(contar(visivel, '%') === 3, `nenhum outro percentual na página (${contar(visivel, '%')} sinais de % visíveis, esperados 3)`);
const blocoEvid = corpo.match(/<div class="evidencias[\s\S]*?<\/ul>/)?.[0] || '';
regra(DADOS.every((d) => blocoEvid.includes(d)) && (blocoEvid.match(/class="dado__fonte"/g) || []).length === 4 && (blocoEvid.match(/, 20\d\d</g) || []).length === 4,
  'os quatro dados estão na mesma faixa, todos com fonte e ano');
regra(contar(visivel, 'Velora Radar') === 1, `Velora Radar descrito uma única vez (${contar(visivel, 'Velora Radar')}×)`);
const radarEmInteligencia = /frente--01[\s\S]*?<\/article>\s*<aside class="radar-painel/.test(corpo);
regra(radarEmInteligencia, 'o Radar está junto de Inteligência comercial (sem seção própria)');
const sub = norm(esperadas.find((e) => e.secao.startsWith('00') && e.t.startsWith('Conectamos'))?.t || '');
regra(sub.split(' ').length <= 25, `subtítulo do hero com até 25 palavras (${sub.split(' ').length})`);
const proibidas = ['solução completa', 'máquina de receita', '360°', 'disruptivo', 'alavancar'];
regra(proibidas.every((p) => !textoPagina.includes(p)), 'sem "solução completa", "máquina de receita", "360°", "disruptivo" ou "alavancar"');
regra(config.agendaUrl || !/agendar/i.test(visivel), `CTA coerente com a ação: ${config.agendaUrl ? 'agenda configurada → "Agendar…"' : 'sem agenda → nenhum "Agendar" visível'}`);
regra(!/id="(casos|equipe)"/.test(corpo) || (config.casos.length && config.equipe.length), 'nenhuma seção visível de caso ou equipe sem conteúdo validado');
regra(!/<div class="pendente/.test(corpo) || /modo-revisao/.test(pagina), 'nenhuma pendência visível na versão publicável');
const formOk = /id="form-conversa"/.test(corpo) && /name="email" type="email" required/.test(corpo) && /name="whatsapp" type="tel"(?! required)/.test(corpo);
regra(formOk, 'formulário com e-mail corporativo obrigatório e WhatsApp opcional');
for (const nome of ['nome', 'email', 'empresa', 'cargo', 'principal_desafio']) {
  if (!new RegExp(`name="${nome}"[^>]*required`).test(corpo)) falhas.push(`campo obrigatório sem required: ${nome}`);
}
if (falhas.some((f) => f.startsWith('campo'))) console.log(`   FALHA ${falhas.filter((f) => f.startsWith('campo')).join('; ')}`);
else console.log('   ok    obrigatórios: nome, e-mail corporativo, empresa, cargo, principal desafio');

// Situação de publicação (não reprova; lista o que falta para ir ao ar).
if (/name="robots" content="noindex/.test(pagina)) avisos.push('noindex ativo (config.indexavel = false): remover na publicação');
if (!config.formularios.conversa) avisos.push('formulário sem destino (config.formularios.conversa): envio simulado');
if (!config.privacidade.texto) avisos.push('aviso de privacidade/LGPD não preenchido (config.privacidade)');
if (!config.urlBase) avisos.push('urlBase vazio: sem canonical, og:url e og:image');
console.log('\n   Para publicar:');
for (const a of avisos) console.log(`   · ${a}`);

const erro = faltando.length || falhas.length;
console.log(`\n${erro ? 'FALHOU' : 'OK'}: ${faltando.length} trecho(s) faltando, ${falhas.length} regra(s) com falha, ${foraDaCopy.size} texto(s) fora da copy para revisar.`);
process.exit(erro ? 1 : 0);
