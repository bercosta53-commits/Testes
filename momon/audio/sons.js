/*
 * Momon — sons curtos, todos gerados com a Web Audio API (nenhum arquivo de áudio).
 *
 *   Momon.audio.destravar()   precisa ser chamado dentro de um toque: o navegador
 *                             só libera o som depois de um gesto da criança.
 *   Momon.audio.miau() | mrrp() | sininho(nota) | pum(lado) | bocejo() | pop() | fru()
 *   Momon.audio.pausar() / retomar()   quando a aba some e volta.
 *
 * O ronronar (purr.js) e as cantigas (lullaby.js) usam a mesma saída e o mesmo eco.
 */
(function () {
  'use strict';

  const A = {};
  let ctx = null, saida = null, eco = null, ruido = null;

  const aleatorio = (a, b) => a + Math.random() * (b - a);
  const QUASE_ZERO = .0001;

  // Notas da escala pentatônica (soam bem juntas, em qualquer ordem).
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

  function bufferDeRuido(segundos) {
    const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * segundos), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  // "Sala" para o eco: ruído que vai sumindo, um pouco abafado.
  function respostaDeSala(segundos) {
    const tam = Math.floor(ctx.sampleRate * segundos);
    const b = ctx.createBuffer(2, tam, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      let anterior = 0;
      for (let i = 0; i < tam; i++) {
        const branco = (Math.random() * 2 - 1) * Math.pow(1 - i / tam, 2.6);
        anterior = anterior * .6 + branco * .4; // abafa os agudos
        d[i] = anterior;
      }
    }
    return b;
  }

  function iniciar() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
    const limite = ctx.createDynamicsCompressor();
    limite.threshold.value = -16;
    limite.knee.value = 12;
    limite.ratio.value = 4;
    limite.attack.value = .004;
    limite.release.value = .25;
    saida = ctx.createGain();
    saida.gain.value = .9;
    saida.connect(limite);
    limite.connect(ctx.destination);
    const sala = ctx.createConvolver();
    sala.buffer = respostaDeSala(2.4);
    eco = ctx.createGain();
    eco.gain.value = .45;
    eco.connect(sala);
    sala.connect(saida);
    ruido = bufferDeRuido(2);
    return ctx;
  }

  A.destravar = () => {
    const c = iniciar();
    if (!c) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* sem suporte */ }
    if (c.state !== 'running') c.resume().catch(() => {});
    // No iOS, tocar um som vazio dentro do toque é o que destrava de vez.
    const vazio = c.createBufferSource();
    vazio.buffer = c.createBuffer(1, 1, c.sampleRate);
    vazio.connect(c.destination);
    vazio.start(0);
  };

  A.pronto = () => !!ctx && ctx.state === 'running';
  A.contexto = () => ctx;
  A.saida = () => saida;
  A.eco = () => eco;
  A.ruido = () => ruido;
  A.pausar = () => { if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); };
  A.retomar = () => { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); };

  // Envelope: sobe até o pico e cai devagar (exponencial, como som de verdade).
  function envelope(param, t, pico, ataque, duracao) {
    param.setValueAtTime(QUASE_ZERO, t);
    param.exponentialRampToValueAtTime(pico, t + ataque);
    param.exponentialRampToValueAtTime(QUASE_ZERO, t + duracao);
  }

  // Liga um som a um volume e, se pedido, um pouco no eco.
  function volume(no, g, comEco = 0) {
    const ganho = ctx.createGain();
    ganho.gain.value = g;
    no.connect(ganho);
    ganho.connect(saida);
    if (comEco) {
      const e = ctx.createGain();
      e.gain.value = comEco;
      ganho.connect(e);
      e.connect(eco);
    }
    return ganho;
  }

  function sopro(t, duracao, frequencia, q, pico) {
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruido;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.value = frequencia;
    filtro.Q.value = q;
    const g = ctx.createGain();
    envelope(g.gain, t, pico, duracao * .3, duracao);
    fonte.connect(filtro);
    filtro.connect(g);
    fonte.start(t, Math.random());
    fonte.stop(t + duracao + .05);
    return g;
  }

  // Miadinho: dente-de-serra passando por dois "formantes" (mi... au).
  A.miau = (altura = 1) => {
    if (!A.pronto()) return;
    const t = ctx.currentTime + .01;
    const dur = .48 * aleatorio(.85, 1.1);
    const f = 680 * altura * aleatorio(.92, 1.08);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f * .88, t);
    osc.frequency.linearRampToValueAtTime(f * 1.3, t + dur * .32);
    osc.frequency.exponentialRampToValueAtTime(f * .76, t + dur);
    const vib = ctx.createOscillator();
    vib.frequency.value = 6.5;
    const vibG = ctx.createGain();
    vibG.gain.value = f * .018;
    vib.connect(vibG);
    vibG.connect(osc.frequency);

    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.Q.value = 4;
    f1.frequency.setValueAtTime(760, t);
    f1.frequency.linearRampToValueAtTime(1150, t + dur * .35);
    f1.frequency.linearRampToValueAtTime(680, t + dur);
    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.Q.value = 6;
    f2.frequency.setValueAtTime(2500, t);
    f2.frequency.linearRampToValueAtTime(1600, t + dur * .45);
    f2.frequency.linearRampToValueAtTime(1000, t + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(QUASE_ZERO, t);
    g.gain.exponentialRampToValueAtTime(1, t + .04);
    g.gain.setValueAtTime(1, t + dur * .7);
    g.gain.exponentialRampToValueAtTime(QUASE_ZERO, t + dur);
    osc.connect(f1);
    osc.connect(f2);
    const g2 = ctx.createGain();
    g2.gain.value = .45;
    f1.connect(g);
    f2.connect(g2);
    g2.connect(g);
    volume(g, .5, .12);
    osc.start(t);
    vib.start(t);
    osc.stop(t + dur + .05);
    vib.stop(t + dur + .05);
  };

  // "Mrrp": o resmunguinho do emburrado (um trinado curto e grave).
  A.mrrp = () => {
    if (!A.pronto()) return;
    const t = ctx.currentTime + .01;
    const dur = .32;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(290, t);
    osc.frequency.linearRampToValueAtTime(400, t + dur * .7);
    osc.frequency.linearRampToValueAtTime(360, t + dur);
    const trem = ctx.createOscillator();
    trem.frequency.value = 28;
    const tremG = ctx.createGain();
    tremG.gain.value = .45;
    const am = ctx.createGain();
    am.gain.value = .55;
    trem.connect(tremG);
    tremG.connect(am.gain);
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 1800;
    const g = ctx.createGain();
    envelope(g.gain, t, 1, .03, dur);
    osc.connect(am);
    am.connect(filtro);
    filtro.connect(g);
    volume(g, .55, .08);
    osc.start(t);
    trem.start(t);
    osc.stop(t + dur + .05);
    trem.stop(t + dur + .05);
  };

  // Sininho: um tom de sino (parciais não inteiras) com eco. Sem nota = uma da pentatônica.
  A.sininho = (nota, vol = .16, atraso = 0) => {
    if (!A.pronto()) return;
    const t = ctx.currentTime + .01 + atraso;
    const f = nota || PENTA[Math.floor(Math.random() * PENTA.length)];
    [[1, 1, 1.4], [2.76, .35, .7], [5.4, .12, .25]].forEach(([mult, amp, dur]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f * mult;
      const g = ctx.createGain();
      envelope(g.gain, t, amp, .004, dur);
      osc.connect(g);
      volume(g, vol, .6);
      osc.start(t);
      osc.stop(t + dur + .05);
    });
  };
  A.PENTA = PENTA;

  // Pum: a patinha afundando na cobertinha (um baque fofo + uma nota de marimba).
  A.pum = (lado, brilho = 0) => {
    if (!A.pronto()) return;
    const t = ctx.currentTime + .005;
    volume(sopro(t, .13, 260, 1.2, 1), .5);
    const f = lado === 'esq' ? 392 : 523.25;
    [[1, 1, .45], [4, .25, .06]].forEach(([mult, amp, dur]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f * mult;
      const g = ctx.createGain();
      envelope(g.gain, t, amp, .005, dur);
      osc.connect(g);
      volume(g, .14 + brilho * .08, .25);
      osc.start(t);
      osc.stop(t + dur + .05);
    });
  };

  // Bocejo: "aaaahm" baixinho, com a puxada de ar antes.
  A.bocejo = () => {
    if (!A.pronto()) return;
    const t = ctx.currentTime + .01;
    volume(sopro(t, .45, 900, .8, 1), .06);
    const t2 = t + .35, dur = 1.1;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(470, t2);
    osc.frequency.exponentialRampToValueAtTime(250, t2 + dur);
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.Q.value = 3;
    f1.frequency.setValueAtTime(850, t2);
    f1.frequency.linearRampToValueAtTime(480, t2 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(QUASE_ZERO, t2);
    g.gain.exponentialRampToValueAtTime(1, t2 + .15);
    g.gain.exponentialRampToValueAtTime(QUASE_ZERO, t2 + dur);
    osc.connect(f1);
    f1.connect(g);
    volume(g, .32, .15);
    osc.start(t2);
    osc.stop(t2 + dur + .05);
  };

  // Pop: a casca do ovinho saindo.
  A.pop = () => {
    if (!A.pronto()) return;
    const t = ctx.currentTime + .005;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + .09);
    const g = ctx.createGain();
    envelope(g.gain, t, 1, .004, .12);
    osc.connect(g);
    volume(g, .4, .2);
    osc.start(t);
    osc.stop(t + .15);
  };

  // Fru: o vento da coberta abrindo.
  A.fru = () => {
    if (!A.pronto()) return;
    const t = ctx.currentTime + .005;
    const fonte = ctx.createBufferSource();
    fonte.buffer = ruido;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.Q.value = 1.4;
    filtro.frequency.setValueAtTime(300, t);
    filtro.frequency.exponentialRampToValueAtTime(1400, t + .35);
    const g = ctx.createGain();
    envelope(g.gain, t, 1, .12, .45);
    fonte.connect(filtro);
    filtro.connect(g);
    volume(g, .4);
    fonte.start(t, Math.random());
    fonte.stop(t + .5);
  };

  window.Momon = window.Momon || {};
  window.Momon.audio = A;
})();
