// Servidor estático mínimo para os testes (o service worker precisa de http).
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/manifest+json',
  '.png': 'image/png',
};

async function servir() {
  const servidor = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const arquivo = path.join(RAIZ, p);
    if (!arquivo.startsWith(RAIZ) || !fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'content-type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
    fs.createReadStream(arquivo).pipe(res);
  });
  await new Promise(r => servidor.listen(0, '127.0.0.1', r));
  return {
    url: `http://127.0.0.1:${servidor.address().port}/`,
    fechar: () => new Promise(r => { servidor.close(r); if (servidor.closeAllConnections) servidor.closeAllConnections(); }),
  };
}

// Junta as checagens e mostra o resultado.
function checagens() {
  const lista = [];
  return {
    checar(nome, ok, extra = '') {
      lista.push(ok);
      console.log(`${ok ? 'ok    ' : 'FALHOU'} ${nome}${extra ? ` (${extra})` : ''}`);
    },
    fim() {
      const falhas = lista.filter(ok => !ok).length;
      console.log(`\n${lista.length - falhas}/${lista.length} checagens ok\n`);
      return falhas;
    },
  };
}

module.exports = { servir, checagens };
