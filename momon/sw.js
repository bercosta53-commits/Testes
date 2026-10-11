/*
 * Momon — service worker: guarda o app no aparelho para funcionar sem internet.
 * Ao mudar qualquer arquivo do app, aumente VERSAO: o navegador baixa tudo de
 * novo na próxima visita com internet e apaga a versão antiga.
 */
const VERSAO = 'momon-v3';

const ARQUIVOS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'assets/momon.css',
  'assets/momon.svg.js',
  'assets/cena.svg.js',
  'assets/icones.svg.js',
  'audio/sons.js',
  'audio/purr.js',
  'audio/lullaby.js',
  'assets/icones/icone-180.png',
  'assets/icones/icone-192.png',
  'assets/icones/icone-512.png',
  'assets/icones/icone-mascara-512.png',
];

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(VERSAO)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(c => c !== VERSAO).map(c => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

// Primeiro o que está guardado; se não estiver, a rede.
self.addEventListener('fetch', evento => {
  if (evento.request.method !== 'GET') return;
  evento.respondWith(
    caches.match(evento.request, { ignoreSearch: true })
      .then(guardado => guardado || fetch(evento.request)),
  );
});
