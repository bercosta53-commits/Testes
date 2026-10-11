/*
 * Momon — ronronar e roncar, gerados com a Web Audio API.
 *
 *   Momon.audio.ronronar.ligar(intensidade)   intensidade de 0 a 1
 *   Momon.audio.ronronar.ajustar(intensidade) muda devagar, sem tranco
 *   Momon.audio.ronronar.desligar()
 *   Momon.audio.ronco.ligar() / desligar()    respiração de sono, bem baixinha
 *
 * Ronronar de gato: um ruído grave "picotado" umas 25 vezes por segundo, mais
 * um zumbido de corpo, subindo e descendo com a respiração (inspira e expira).
 */
(function () {
  'use strict';

  const A = window.Momon.audio;
  const QUASE_ZERO = .0001;

  // Curva que transforma o seno do pulso em batidinhas (0 a 1, com pico estreito).
  function curvaDePulso() {
    const tam = 1024, c = new Float32Array(tam);
    for (let i = 0; i < tam; i++) {
      const x = i / (tam - 1) * 2 - 1;
      c[i] = Math.pow((x + 1) / 2, 2.5);
    }
    return c;
  }

  let nos = null, desligando = null;

  function montar() {
    const ctx = A.contexto();
    const t = ctx.currentTime;

    const fonte = ctx.createBufferSource();
    fonte.buffer = A.ruido();
    fonte.loop = true;
    const corte = ctx.createBiquadFilter();
    corte.type = 'highpass';
    corte.frequency.value = 90;
    const abafa = ctx.createBiquadFilter();
    abafa.type = 'lowpass';
    abafa.frequency.value = 520;
    abafa.Q.value = .9;
    // o chiado filtrado é baixinho: reforça, porque é ele que o alto-falante pequeno toca
    const reforco = ctx.createGain();
    reforco.gain.value = 3.5;

    // zumbido do corpo: os harmônicos até ~400 Hz ainda aparecem em alto-falante pequeno
    const zumbido = ctx.createOscillator();
    zumbido.type = 'sawtooth';
    zumbido.frequency.value = 48;
    const zFiltro = ctx.createBiquadFilter();
    zFiltro.type = 'lowpass';
    zFiltro.frequency.value = 380;
    const zGanho = ctx.createGain();
    zGanho.gain.value = .3;

    // as batidinhas: o seno do pulso, moldado, controla o volume
    const pulso = ctx.createGain();
    pulso.gain.value = 0;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 25;
    const molde = ctx.createWaveShaper();
    molde.curve = curvaDePulso();
    lfo.connect(molde);
    molde.connect(pulso.gain);

    // respiração: o volume e o ritmo do pulso sobem e descem (≈ 2,6 s)
    const respiro = ctx.createGain();
    respiro.gain.value = .72;
    const lfoResp = ctx.createOscillator();
    lfoResp.frequency.value = 1 / 2.6;
    const profResp = ctx.createGain();
    profResp.gain.value = .28;
    const profRitmo = ctx.createGain();
    profRitmo.gain.value = 1.5;
    lfoResp.connect(profResp);
    profResp.connect(respiro.gain);
    lfoResp.connect(profRitmo);
    profRitmo.connect(lfo.frequency);

    const vol = ctx.createGain();
    vol.gain.value = QUASE_ZERO;

    fonte.connect(corte);
    corte.connect(abafa);
    abafa.connect(reforco);
    reforco.connect(pulso);
    zumbido.connect(zFiltro);
    zFiltro.connect(zGanho);
    zGanho.connect(pulso);
    pulso.connect(respiro);
    respiro.connect(vol);
    vol.connect(A.saida());

    fonte.start(t);
    zumbido.start(t);
    lfo.start(t);
    lfoResp.start(t);
    nos = { fonte, zumbido, lfo, lfoResp, vol, abafa, osciladores: [fonte, zumbido, lfo, lfoResp] };
  }

  const ronronar = {
    ligado: () => !!nos && !desligando,
    ligar(intensidade = .5) {
      if (!A.pronto()) return;
      if (desligando) { clearTimeout(desligando); desligando = null; }
      if (!nos) montar();
      this.ajustar(intensidade, .35);
    },
    ajustar(intensidade, suavidade = .25) {
      if (!nos || desligando) return;
      const t = A.contexto().currentTime;
      const i = Math.max(0, Math.min(1, intensidade));
      nos.vol.gain.setTargetAtTime(.05 + .33 * i, t, suavidade);
      nos.abafa.frequency.setTargetAtTime(420 + 700 * i, t, suavidade);
    },
    desligar(tempo = .9) {
      if (!nos || desligando) return;
      const t = A.contexto().currentTime;
      nos.vol.gain.cancelScheduledValues(t);
      nos.vol.gain.setTargetAtTime(QUASE_ZERO, t, tempo / 3);
      const atuais = nos;
      desligando = setTimeout(() => {
        atuais.osciladores.forEach(o => { try { o.stop(); } catch (e) { /* já parado */ } });
        atuais.vol.disconnect();
        if (nos === atuais) nos = null;
        desligando = null;
      }, tempo * 1000 + 300);
    },
  };

  // Ronco: uma puxada de ar bem suave a cada respiração de sono (5,4 s, como no CSS).
  let roncoTimer = null;
  const ronco = {
    ligar() {
      if (roncoTimer || !A.pronto()) return;
      const respirar = () => {
        const ctx = A.contexto();
        if (!ctx || ctx.state !== 'running') return;
        const t = ctx.currentTime + .05;
        const fonte = ctx.createBufferSource();
        fonte.buffer = A.ruido();
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'bandpass';
        filtro.frequency.setValueAtTime(380, t);
        filtro.frequency.linearRampToValueAtTime(520, t + 1.6);
        filtro.Q.value = 2.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(QUASE_ZERO, t);
        g.gain.exponentialRampToValueAtTime(.35, t + 1.4);
        g.gain.exponentialRampToValueAtTime(QUASE_ZERO, t + 2.2);
        fonte.connect(filtro);
        filtro.connect(g);
        g.connect(A.saida());
        fonte.start(t, Math.random());
        fonte.stop(t + 2.3);
      };
      respirar();
      roncoTimer = setInterval(respirar, 5400);
    },
    desligar() {
      clearInterval(roncoTimer);
      roncoTimer = null;
    },
  };

  A.ronronar = ronronar;
  A.ronco = ronco;
})();
