// Gera o site estático (one page).
//   node build.mjs            → dist/          versão publicável: sem pendências visíveis
//   node build.mjs --revisao  → dist-revisao/  mesma página com as pendências marcadas no lugar
import { mkdir, rm, writeFile, cp, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from './config.mjs';
import { pagina } from './src/lib/layout.mjs';
import * as home from './src/paginas/home.mjs';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const revisao = process.argv.includes('--revisao');
const saida = path.join(raiz, revisao ? 'dist-revisao' : 'dist');

async function versaoDosAssets() {
  const h = createHash('sha256');
  for (const f of ['src/assets/css/site.css', 'src/assets/js/site.js']) h.update(await readFile(path.join(raiz, f)));
  return h.digest('hex').slice(0, 10);
}

async function main() {
  await rm(saida, { recursive: true, force: true });
  await mkdir(saida, { recursive: true });
  await cp(path.join(raiz, 'src/assets'), path.join(saida, 'assets'), { recursive: true });

  // Caminhos relativos à raiz do site: funcionam em domínio próprio, em subpasta e abrindo o arquivo direto.
  const ctx = { revisao, config, versao: await versaoDosAssets(), url: (p) => p };
  const html = pagina(ctx, { titulo: home.meta.titulo, descricao: home.meta.descricao, corpo: home.render(ctx) });
  await writeFile(path.join(saida, 'index.html'), html);
  await writeFile(path.join(saida, 'robots.txt'), config.indexavel ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n');

  console.log(`Página gerada em ${path.relative(raiz, saida)}/index.html${revisao ? ' (versão de revisão, com pendências marcadas)' : ''}`);
  const avisos = [];
  if (!config.indexavel) avisos.push('indexavel: false → noindex na página e robots.txt bloqueando rastreamento.');
  if (!config.formularios.conversa) avisos.push('formularios.conversa vazio → formulário em modo demonstração (NÃO envia dados).');
  if (!config.agendaUrl) avisos.push('agendaUrl vazio → CTAs dizem "Solicitar conversa" (regra da copy v2: "Agendar" só com agenda real).');
  else if (!config.formularios.conversa) avisos.push('agendaUrl definido sem formularios.conversa → a agenda abre, mas os dados do formulário não são enviados.');
  if (!config.privacidade.texto) avisos.push('privacidade.texto vazio → aviso de privacidade/LGPD ainda não publicado (obrigatório antes de publicar).');
  if (!config.casos.length) avisos.push('casos vazio → nenhum caso publicado (espaço reservado, sem nada visível).');
  if (!config.equipe.length) avisos.push('equipe vazio → equipe não publicada (espaço reservado, sem nada visível).');
  for (const a of avisos) console.warn(`  aviso: ${a}`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
