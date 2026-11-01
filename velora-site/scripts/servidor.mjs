// Servidor estático mínimo para pré-visualização local.
//   node scripts/servidor.mjs dist [porta]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const raiz = path.resolve(process.argv[2] || 'dist');
const porta = Number(process.argv[3] || process.env.PORT || 4173);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let arquivo = path.join(raiz, caminho);
    if (!arquivo.startsWith(raiz)) throw new Error('fora da raiz');
    const info = await stat(arquivo).catch(() => null);
    if (info?.isDirectory()) {
      if (!caminho.endsWith('/')) {
        res.writeHead(301, { Location: caminho + '/' });
        return res.end();
      }
      arquivo = path.join(arquivo, 'index.html');
    }
    const corpo = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
    res.end(corpo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
}).listen(porta, () => console.log(`Servindo ${path.relative(process.cwd(), raiz) || '.'} em http://localhost:${porta}`));
