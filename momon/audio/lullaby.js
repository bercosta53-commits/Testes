/*
 * Momon — cantigas de ninar originais, tocadas com a Web Audio API.
 *
 *   Momon.audio.ninar.tocar(indice)   0, 1 ou 2 (troca suave se outra estiver tocando)
 *   Momon.audio.ninar.parar(segundos) some devagar
 *   Momon.audio.ninar.aoTerminar = fn chamada quando a cantiga acaba sozinha
 *
 * Timbre de caixinha de música, com acordes bem baixinhos e um baixo macio.
 * Cada cantiga toca VOLTAS vezes e depois vai sumindo, para a hora de dormir.
 */
(function () {
  'use strict';

  const A = window.Momon.audio;
  const QUASE_ZERO = .0001;
  const VOLTAS = 3;

  // As três melodias: "nota:tempos", e um acorde por compasso.
  const CANTIGAS = [
    { // Lua: valsinha em Fá
      bpm: 63, compasso: 3,
      notas: 'A4:2 G4:1 F4:2 C4:1 D4:1 F4:1 A4:1 G4:3 A4:2 Bb4:1 C5:2 A4:1 G4:1 F4:1 D4:1 E4:3 ' +
             'C5:2 D5:1 C5:2 A4:1 Bb4:1 A4:1 G4:1 A4:3 F4:2 G4:1 A4:2 C5:1 G4:1 E4:1 G4:1 F4:3',
      acordes: 'F F Dm C F F Gm C F F Gm F Dm F C F',
    },
    { // Estrela: pisca-pisca em Dó
      bpm: 72, compasso: 4,
      notas: 'E5:1 G5:1 E5:1 C5:1 D5:2 G4:2 A4:1 C5:1 E5:1 D5:1 D5:4 E5:1 G5:1 A5:1 G5:1 E5:2 C5:2 D5:1 E5:1 D5:1 B4:1 C5:4 ' +
             'A4:1 C5:1 F5:2 E5:1 D5:1 C5:2 D5:1 E5:1 F5:1 D5:1 E5:2 G4:2 A4:1 C5:1 E5:1 G5:1 F5:2 D5:2 E5:1 D5:1 B4:1 D5:1 C5:4',
      acordes: 'C G Am G C Am G C F C Dm C Am Dm G C',
    },
    { // Nuvem: bem devagar, em Sol
      bpm: 58, compasso: 3,
      notas: 'B4:2 A4:1 G4:3 A4:1 B4:1 D5:1 B4:3 C5:2 B4:1 A4:2 G4:1 E4:1 G4:1 A4:1 D4:3 ' +
             'D5:2 E5:1 D5:2 B4:1 C5:1 B4:1 A4:1 B4:3 G4:2 A4:1 B4:2 D5:1 A4:1 F#4:1 A4:1 G4:3',
      acordes: 'G Em D G C D Am D G G Am Em C G D G',
    },
  ];

  const ACORDES = {
    F: ['F3', 'A3', 'C4'], Dm: ['D3', 'F3', 'A3'], C: ['C3', 'E3', 'G3'], Gm: ['G3', 'Bb3', 'D4'],
    G: ['G3', 'B3', 'D4'], Am: ['A3', 'C4', 'E4'], Em: ['E3', 'G3', 'B3'], D: ['D3', 'F#3', 'A3'],
  };
  const SEMITONS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  // "F#4" -> frequência em Hz.
  function freq(nota) {
    const [, letra, acidente, oitava] = nota.match(/^([A-G])(#|b)?(\d)$/);
    const midi = 12 * (Number(oitava) + 1) + SEMITONS[letra] + (acidente === '#' ? 1 : acidente === 'b' ? -1 : 0);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Transforma a cantiga numa lista de eventos (em tempos, a partir do começo).
  function eventos(c) {
    const lista = [];
    let tempo = 0;
    c.notas.trim().split(/\s+/).forEach(item => {
      const [nota, dur] = item.split(':');
      lista.push({ tempo, tipo: 'nota', f: freq(nota), dur: Number(dur) });
      tempo += Number(dur);
    });
    c.acordes.trim().split(/\s+/).forEach((nome, compasso) => {
      const notas = ACORDES[nome];
      lista.push({ tempo: compasso * c.compasso, tipo: 'acorde', fs: notas.map(freq), dur: c.compasso });
      lista.push({ tempo: compasso * c.compasso, tipo: 'baixo', f: freq(notas[0]) / 2, dur: c.compasso });
    });
    lista.sort((a, b) => a.tempo - b.tempo);
    return { lista, duracao: tempo };
  }
  const PRONTAS = CANTIGAS.map(eventos);

  // ------------------------------------------------ instrumentos

  function caixinha(ctx, destino, t, f, vol) {
    [[1, 1, 1.9], [2, .32, .9], [3, .1, .35], [4.2, .05, .12]].forEach(([mult, amp, dur]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(QUASE_ZERO, t);
      g.gain.exponentialRampToValueAtTime(amp * vol, t + .006);
      g.gain.exponentialRampToValueAtTime(QUASE_ZERO, t + dur);
      osc.connect(g);
      g.connect(destino);
      osc.start(t);
      osc.stop(t + dur + .05);
    });
  }

  function acorde(ctx, destino, t, fs, dur) {
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 850;
    filtro.connect(destino);
    fs.forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(QUASE_ZERO, t);
      g.gain.exponentialRampToValueAtTime(.022, t + .7);
      g.gain.setValueAtTime(.022, t + dur - .2);
      g.gain.exponentialRampToValueAtTime(QUASE_ZERO, t + dur + 1);
      osc.connect(g);
      g.connect(filtro);
      osc.start(t);
      osc.stop(t + dur + 1.05);
    });
  }

  function baixo(ctx, destino, t, f) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(QUASE_ZERO, t);
    g.gain.exponentialRampToValueAtTime(.07, t + .03);
    g.gain.exponentialRampToValueAtTime(QUASE_ZERO, t + 1.7);
    osc.connect(g);
    g.connect(destino);
    osc.start(t);
    osc.stop(t + 1.75);
  }

  // ------------------------------------------------ quem está tocando

  let atual = null; // { indice, bus, inicio, proximo, volta, timer }

  function agendar(toca) {
    const ctx = A.contexto();
    const { lista, duracao } = PRONTAS[toca.indice];
    const seg = 60 / CANTIGAS[toca.indice].bpm;
    const limite = ctx.currentTime + .3;
    while (toca.volta < VOLTAS) {
      const ev = lista[toca.proximo];
      const t = toca.inicio + (toca.volta * duracao + ev.tempo) * seg;
      if (t > limite) break;
      if (ev.tipo === 'nota') caixinha(ctx, toca.bus, t, ev.f, .16);
      else if (ev.tipo === 'acorde') acorde(ctx, toca.bus, t, ev.fs, ev.dur * seg);
      else baixo(ctx, toca.bus, t, ev.f);
      toca.proximo++;
      if (toca.proximo >= lista.length) { toca.proximo = 0; toca.volta++; }
    }
    if (toca.volta >= VOLTAS && !toca.acabando) {
      // depois da última volta, deixa as notas soarem e some devagar
      toca.acabando = true;
      const fim = toca.inicio + VOLTAS * duracao * seg;
      toca.bus.gain.setValueAtTime(1, fim);
      toca.bus.gain.exponentialRampToValueAtTime(QUASE_ZERO, fim + 6);
      setTimeout(() => {
        if (atual !== toca) return;
        encerrar(toca);
        atual = null;
        if (ninar.aoTerminar) ninar.aoTerminar();
      }, (fim + 6.2 - ctx.currentTime) * 1000);
    }
  }

  function encerrar(toca) {
    clearInterval(toca.timer);
    setTimeout(() => toca.bus.disconnect(), 4000);
  }

  const ninar = {
    quantas: CANTIGAS.length,
    aoTerminar: null,
    atual: () => (atual ? atual.indice : -1),
    tocar(indice) {
      if (!A.pronto()) return;
      const ctx = A.contexto();
      this.parar(1.2);
      const bus = ctx.createGain();
      bus.gain.value = 1;
      bus.connect(A.saida());
      const ecoEnvio = ctx.createGain();
      ecoEnvio.gain.value = .7;
      bus.connect(ecoEnvio);
      ecoEnvio.connect(A.eco());
      const toca = { indice: indice % CANTIGAS.length, bus, inicio: ctx.currentTime + .4, proximo: 0, volta: 0, acabando: false };
      toca.timer = setInterval(() => agendar(toca), 90);
      agendar(toca);
      atual = toca;
    },
    parar(segundos = 3) {
      if (!atual) return;
      const ctx = A.contexto();
      const toca = atual;
      atual = null;
      const t = ctx.currentTime;
      toca.bus.gain.cancelScheduledValues(t);
      toca.bus.gain.setValueAtTime(toca.bus.gain.value || 1, t);
      toca.bus.gain.exponentialRampToValueAtTime(QUASE_ZERO, t + segundos);
      clearInterval(toca.timer);
      setTimeout(() => toca.bus.disconnect(), segundos * 1000 + 2500);
    },
  };

  A.ninar = ninar;
})();
