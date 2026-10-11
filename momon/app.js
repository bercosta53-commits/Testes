/*
 * Momon — o app. Junta a cena, o gatinho, os sons e os modos:
 *
 *   inicio   ovinho de estrela (só na primeira vez) ou Momon dormindo; um toque acorda
 *   livre    carinho (arrastar), cutucar (toque rápido), ele pisca, respira, cochila
 *   amassar  cobertinha + metades da tela: a pata do lado tocado amassa no compasso
 *   dormir   escurece, a mantinha cobre o Momon, cantiga, e só sai com toque longo
 *
 * Nada na tela depende de leitura e nenhum toque dá errado: tudo vira reação.
 */
(function () {
  'use strict';

  const M = window.Momon;
  const som = M.audio;

  // ------------------------------------------------ utilidades

  const $ = sel => document.querySelector(sel);
  const aleatorio = (a, b) => a + Math.random() * (b - a);
  const sortear = lista => lista[Math.floor(Math.random() * lista.length)];
  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const agora = () => performance.now();
  const vibrar = padrao => {
    try { if (navigator.vibrate) navigator.vibrate(padrao); } catch (e) { /* sem vibração */ }
  };

  // ------------------------------------------------ memória (só neste aparelho)

  const memoria = (() => {
    const CHAVE = 'momon.v1';
    const dados = { nasceu: false, amizade: 0, visitas: 0, melodia: 0, segundosDeCarinho: 0 };
    try { Object.assign(dados, JSON.parse(localStorage.getItem(CHAVE) || '{}')); } catch (e) { /* sem memória */ }
    const salvar = () => {
      try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) { /* sem memória */ }
    };
    return { dados, salvar };
  })();

  // ------------------------------------------------ montar a tela

  const app = $('#app');
  document.body.insertAdjacentHTML('afterbegin', M.svg.texturas());
  $('#quarto').innerHTML = M.cena.quarto();
  $('#luzes').innerHTML = M.cena.luzes();
  $('#primeiro-plano').innerHTML = M.cena.primeiroPlano();
  $('#almofada').innerHTML = M.cena.almofada();
  $('#papel').style.backgroundImage = `url(${M.cena.papel()})`;
  const lugar = $('#momon');
  lugar.innerHTML = M.svg.criar({ humor: 'dormindo', pose: 'enroscado' });
  const gato = lugar.querySelector('.momon');
  const mantinha = gato.querySelector('.mantinha');
  $('#bt-coberta').innerHTML = M.icones.botao('coberta');
  $('#bt-dormir').innerHTML = M.icones.botao('dormir');
  $('#bt-acordar').insertAdjacentHTML('afterbegin', M.icones.botao('acordar'));
  document.querySelectorAll('[data-melodia]').forEach(b => {
    b.innerHTML = M.icones.botao(`melodia-${Number(b.dataset.melodia) + 1}`);
  });
  document.querySelectorAll('.zona').forEach(z => { z.innerHTML = M.icones.pata(); });
  const dica = $('#dica');
  dica.innerHTML = M.icones.maozinha();

  let modo = 'inicio';
  function mudarModo(novo) {
    modo = novo;
    app.dataset.modo = novo;
  }

  // ------------------------------------------------ o gatinho

  // Brilho da lua da testa (0 a 1). Só muda o estilo quando muda de verdade (em
  // degraus de .05): cada mudança repinta o gatinho inteiro.
  let luaAtual = null;
  function acenderLua(v) {
    const degrau = v === null ? null : (Math.round(v * 20) / 20).toFixed(2);
    if (degrau === luaAtual) return;
    luaAtual = degrau;
    if (degrau === null) gato.style.removeProperty('--lua');
    else gato.style.setProperty('--lua', degrau);
  }

  const OLHOS_FECHADOS = ['ronronando', 'dormindo', 'bocejo'];
  const FECHADO = 'matrix(1, 0, 0, 1, 0, 0)';

  const momon = {
    humor: 'dormindo',
    pose: 'enroscado',
    setHumor(h) {
      if (this.humor === h) return;
      this.humor = h;
      gato.dataset.humor = h;
    },
    setPose(p) {
      if (this.pose === p) return;
      this.pose = p;
      gato.dataset.pose = p;
    },
    olhosAbertos() {
      return this.pose === 'sentado' && !OLHOS_FECHADOS.includes(this.humor);
    },
    // Pisca descendo as pálpebras de onde estiverem (cada humor tem a sua altura).
    piscar(lento = false, duracao = lento ? 900 : 170) {
      if (!this.olhosAbertos()) return;
      gato.querySelectorAll('.palpebra-cima').forEach(el => {
        const aberto = getComputedStyle(el).transform;
        el.animate(lento
          ? [{ transform: aberto }, { transform: FECHADO, offset: .42 }, { transform: FECHADO, offset: .62 }, { transform: aberto }]
          : [{ transform: aberto }, { transform: FECHADO, offset: .45 }, { transform: aberto }],
        { duration: duracao, easing: 'ease-in-out' });
      });
    },
    mexerOrelha(lado = sortear(['esq', 'dir'])) {
      const el = gato.querySelector(`[data-parte="orelha-${lado}"] .orelha-mexe`);
      el.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-13deg)', offset: .3 },
        { transform: 'rotate(5deg)', offset: .65 },
        { transform: 'rotate(0deg)' },
      ], { duration: 420, easing: 'ease-out' });
    },
    pular(altura = 16, duracao = 440) {
      gato.querySelector('.pulo').animate([
        { transform: 'translateY(0px) scale(1, 1)' },
        { transform: 'translateY(0px) scale(1.05, .93)', offset: .18 },
        { transform: `translateY(${-altura}px) scale(.97, 1.04)`, offset: .48 },
        { transform: 'translateY(0px) scale(1.04, .95)', offset: .8 },
        { transform: 'translateY(0px) scale(1, 1)' },
      ], { duration: duracao, easing: 'ease-out' });
    },
    // Uma amassada: a pata sobe, afunda na cobertinha (amassadinho) e volta.
    amassar(lado, duracao = 380) {
      const giro = lado === 'esq' ? -8 : 8;
      gato.querySelector(`[data-parte="pata-${lado}"]`).animate([
        { transform: 'translateY(0px) rotate(0deg) scale(1, 1)' },
        { transform: `translateY(-22px) rotate(${giro}deg) scale(1, 1)`, offset: .4 },
        { transform: 'translateY(3px) rotate(0deg) scale(1.07, .88)', offset: .72 },
        { transform: 'translateY(0px) rotate(0deg) scale(1, 1)' },
      ], { duration: duracao, easing: 'ease-in-out' });
      gato.querySelector(`.amassado-${lado}`).animate([
        { opacity: 0, transform: 'scale(.6)' },
        { opacity: 0, transform: 'scale(.6)', offset: .62 },
        { opacity: 1, transform: 'scale(1.12)', offset: .76 },
        { opacity: 0, transform: 'scale(1)' },
      ], { duration: duracao + 220 });
    },
    // Ponto do desenho (viewBox 400 x 420) -> ponto na tela.
    naTela(x, y) {
      const p = new DOMPoint(x, y).matrixTransform(gato.getScreenCTM());
      return { x: p.x, y: p.y };
    },
    // O toque caiu no Momon? Elipses generosas: dedinho de 3 anos erra.
    toca(x, y) {
      const m = gato.getScreenCTM();
      if (!m) return false;
      const p = new DOMPoint(x, y).matrixTransform(m.inverse());
      const dentro = (cx, cy, rx, ry) => ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2 <= 1;
      return this.pose === 'enroscado'
        ? dentro(212, 345, 205, 95) || dentro(140, 300, 130, 120)
        : dentro(200, 172, 185, 135) || dentro(200, 335, 170, 105);
    },
  };

  // ------------------------------------------------ jeito: do emburrado ao feliz

  const NIVEIS = M.svg.PROGRESSAO;
  const jeito = {
    afeto: 0,
    comemorou: false,
    // quanto mais amizade guardada, mais rápido ele amolece (até 2x)
    velocidade: () => 1 + Math.min(memoria.dados.amizade, 10) * .1,
    humor() {
      return NIVEIS[Math.min(NIVEIS.length - 1, Math.floor(this.afeto * NIVEIS.length))];
    },
    ganhar(quanto) {
      const antes = this.humor();
      this.afeto = limitar(this.afeto + quanto * this.velocidade(), 0, 1);
      const depois = this.humor();
      if (depois !== antes) subiuDeNivel(depois);
    },
  };

  function subiuDeNivel(novo) {
    const c = momon.naTela(200, 110);
    if (novo === 'feliz' && !jeito.comemorou) {
      jeito.comemorou = true;
      memoria.dados.amizade++;
      memoria.salvar();
      for (let i = 0; i < 7; i++) {
        setTimeout(() => soltar('coracao', c.x + aleatorio(-110, 110), c.y + aleatorio(-10, 50), { tamanho: aleatorio(32, 56) }), i * 110);
      }
      [2, 4, 6, 9].forEach((nota, i) => som.sininho(som.PENTA[nota], .13, i * .12));
    } else {
      soltar('coracao', c.x, c.y, { tamanho: 42 });
      som.sininho(som.PENTA[4], .09);
    }
    if (!carinho.ativo) voltarAoHumor();
  }

  // O humor "de fundo" de cada momento; os passageiros (bocejo, susto) voltam para ele.
  function humorDeBase() {
    if (modo === 'dormir') return 'dormindo';
    if (modo === 'amassar') return amassar.enroscou ? 'ronronando' : 'amassando';
    if (modo === 'inicio') return momon.pose === 'enroscado' ? 'dormindo' : 'surpreso';
    if (carinho.ativo) return 'ronronando';
    if (cochilando) return 'dormindo';
    return jeito.humor();
  }
  let passageiro = null;
  function humorPassageiro(humor, ms) {
    clearTimeout(passageiro);
    momon.setHumor(humor);
    passageiro = setTimeout(() => {
      passageiro = null;
      momon.setHumor(humorDeBase());
    }, ms);
  }
  function voltarAoHumor() {
    if (!passageiro) momon.setHumor(humorDeBase());
  }

  // ------------------------------------------------ partículas

  const camadaParticulas = $('#particulas');
  let particulasVivas = 0;

  function soltar(tipo, x, y, { tamanho = 46, subir = 150, duracao = 2300, espalhar = 50 } = {}) {
    if (particulasVivas >= 18 || document.hidden) return;
    particulasVivas++;
    const el = document.createElement('div');
    el.className = 'particula';
    el.style.width = el.style.height = `${tamanho}px`;
    el.innerHTML = M.icones.particula(tipo);
    camadaParticulas.appendChild(el);
    const x0 = x - tamanho / 2, y0 = y - tamanho / 2;
    const dx = aleatorio(-espalhar, espalhar), giro = aleatorio(-50, 50);
    const anima = el.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(.2) rotate(0deg)`, opacity: 0 },
      { transform: `translate(${x0 + dx * .25}px, ${y0 - subir * .2}px) scale(1) rotate(${giro * .3}deg)`, opacity: 1, offset: .18 },
      { transform: `translate(${x0 + dx}px, ${y0 - subir}px) scale(.75) rotate(${giro}deg)`, opacity: 0 },
    ], { duration: duracao * aleatorio(.85, 1.15), easing: 'cubic-bezier(.2, .6, .35, 1)' });
    anima.onfinish = anima.oncancel = () => {
      el.remove();
      particulasVivas--;
    };
  }

  // Mágica do carinho: flores, estrelas e vaga-lumes brotando em volta dele.
  function soltarMagia() {
    const caixa = gato.getBoundingClientRect();
    const ang = aleatorio(Math.PI * .85, Math.PI * 2.15);
    const x = caixa.left + caixa.width / 2 + Math.cos(ang) * caixa.width * aleatorio(.42, .58);
    const y = caixa.top + caixa.height * .55 + Math.sin(ang) * caixa.height * aleatorio(.42, .58);
    soltar(sortear(['flor', 'flor', 'estrela', 'vagalume']), x, y, { tamanho: aleatorio(30, 54) });
    if (Math.random() < .3) som.sininho(undefined, .06);
  }

  // Toque fora do Momon: um brilhinho no lugar e ele mexe a orelha.
  function brilhinho(x, y) {
    soltar('brilho', x, y, { tamanho: 44, subir: 40, duracao: 900, espalhar: 10 });
    som.sininho(undefined, .07);
    if (momon.pose === 'sentado') momon.mexerOrelha(x < innerWidth / 2 ? 'esq' : 'dir');
  }

  // ------------------------------------------------ dica: a mãozinha mostra o que fazer

  let dicaTimer = null;
  function mostrarDica(tipo, x, y, atraso = 0) {
    esconderDica();
    dicaTimer = setTimeout(() => {
      dica.className = `dica ${tipo} visivel`;
      // a ponta do dedo fica em (x, y)
      dica.style.left = `${x - dica.offsetWidth * .45}px`;
      dica.style.top = `${y - dica.offsetWidth * .1}px`;
    }, atraso);
  }
  function esconderDica() {
    clearTimeout(dicaTimer);
    dica.classList.remove('visivel');
  }

  // ------------------------------------------------ livre: carinho e cutucada

  const carinho = { ativo: false, tempo: 0, magia: 0, vibraEm: 0 };
  let toque = null; // { id, x, y, t, dist }

  function comecarCarinho() {
    if (carinho.ativo) return;
    carinho.ativo = true;
    carinho.tempo = 0;
    carinho.magia = 0;
    clearTimeout(passageiro);
    passageiro = null;
    cochilando = false;
    esconderDica();
    acenderLua(.2);
    momon.setHumor('ronronando');
    som.ronronar.ligar(.35);
    vibrar([14, 60, 14, 60, 14]);
    carinho.vibraEm = agora() + 700;
  }

  function pararCarinho() {
    if (!carinho.ativo) return;
    carinho.ativo = false;
    som.ronronar.desligar(1.2);
    acenderLua(null);
    memoria.dados.segundosDeCarinho = Math.round(memoria.dados.segundosDeCarinho + carinho.tempo);
    memoria.salvar();
    voltarAoHumor();
  }

  function cutucar() {
    const emburrado = jeito.afeto < .4;
    jeito.ganhar(.03);
    humorPassageiro('surpreso', 480);
    momon.pular(10, 360);
    if (emburrado) som.mrrp(); else som.miau();
    setTimeout(() => momon.piscar(), 520);
    vibrar(12);
  }

  // ------------------------------------------------ cochilo e convite para dormir

  let cochilando = false;
  let ultimoToque = agora();
  let inicioDaSessao = agora();
  let ultimoBocejo = 0;
  const COCHILO = 50e3;        // sem toques por 50 s, ele cochila sentado
  const HORA_DE_DORMIR = 8 * 60e3;

  function cochilar() {
    cochilando = true;
    humorPassageiro('bocejo', 1300);
    som.bocejo();
  }
  function acordarDoCochilo() {
    if (!cochilando) return false;
    cochilando = false;
    humorPassageiro('surpreso', 500);
    som.mrrp();
    return true;
  }

  // ------------------------------------------------ amassar pãozinho

  const zonas = $('#zonas');
  const amassar = {
    enroscou: false,
    toques: [],
    ritmo: 0,
    amassadas: 0,
    ultimo: 0,
    fimTimer: null,
    entrar() {
      pararCarinho();
      cochilando = false;
      esconderDica();
      mudarModo('amassar');
      this.enroscou = false;
      this.toques = [];
      this.ritmo = 0;
      this.amassadas = 0;
      this.ultimo = 0;
      app.classList.remove('enroscou');
      momon.setPose('sentado');
      // a cobertinha aparece embaixo e ele dá um pulinho em cima dela
      gato.classList.add('com-cobertinha');
      som.fru();
      momon.pular(28, 560);
      acenderLua(.25);
      clearTimeout(passageiro);
      passageiro = null;
      momon.setHumor('amassando');
      som.ronronar.ligar(.2);
      zonas.classList.add('convite');
    },
    tocar(lado) {
      if (this.enroscou) return;
      const t = agora();
      zonas.classList.remove('convite');
      if (t - this.ultimo > 1600) this.toques = [];
      this.toques.push({ t, lado });
      if (this.toques.length > 7) this.toques.shift();
      this.ultimo = t;

      // Ritmo: intervalos parecidos, alternando os lados, nem rápido nem devagar demais.
      // Fora do ritmo não tem erro: ele só acompanha o compasso dela.
      let duracao = 380;
      const n = this.toques.length;
      if (n >= 3) {
        const intervalos = [];
        let alternou = 0;
        for (let i = 1; i < n; i++) {
          intervalos.push(this.toques[i].t - this.toques[i - 1].t);
          if (this.toques[i].lado !== this.toques[i - 1].lado) alternou++;
        }
        const media = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
        const desvio = Math.sqrt(intervalos.reduce((a, b) => a + (b - media) ** 2, 0) / intervalos.length);
        const regular = 1 - limitar(desvio / media * 2.2, 0, 1);
        const andamento = media < 200 ? media / 200 : media > 1200 ? limitar(1 - (media - 1200) / 800, 0, 1) : 1;
        const desteToque = regular * (.35 + .65 * alternou / (n - 1)) * andamento;
        this.ritmo = this.ritmo * .55 + desteToque * .45;
        duracao = limitar(media * .85, 220, 480);
      }

      momon.amassar(lado, duracao);
      som.pum(lado, this.ritmo);
      vibrar(16);
      const zona = zonas.querySelector(`[data-lado="${lado}"]`);
      zona.classList.remove('tocou');
      void zona.offsetWidth;
      zona.classList.add('tocou');

      this.amassadas++;
      jeito.ganhar(.03);
      this.aplicarRitmo();
      if (this.ritmo > .55 && Math.random() < this.ritmo * .5) soltarMagia();
      if (this.amassadas >= 20) this.enroscar();
      clearTimeout(this.fimTimer);
      // parou de tocar: com bastante amassada ele se enrosca; com pouca, as patinhas convidam de novo
      this.fimTimer = setTimeout(() => {
        if (this.amassadas >= 8) this.enroscar();
        else zonas.classList.add('convite');
      }, 4500);
    },
    // Mais ritmo: ronrona mais alto, a lua brilha mais (e as piscadas ficam mais lentas).
    aplicarRitmo() {
      som.ronronar.ajustar(.2 + .8 * this.ritmo);
      acenderLua(.2 + .8 * this.ritmo);
    },
    // Final: ele se enrosca em cima da cobertinha, ronronando.
    enroscar() {
      if (this.enroscou) return;
      clearTimeout(this.fimTimer);
      this.enroscou = true;
      app.classList.add('enroscou');
      momon.setPose('enroscado');
      momon.setHumor('ronronando');
      acenderLua(null);
      som.ronronar.ajustar(.7);
      const c = momon.naTela(200, 260);
      for (let i = 0; i < 5; i++) {
        setTimeout(() => soltar('coracao', c.x + aleatorio(-120, 120), c.y + aleatorio(-20, 40), { tamanho: aleatorio(30, 48) }), 300 + i * 160);
      }
    },
    sair() {
      clearTimeout(this.fimTimer);
      gato.classList.remove('com-cobertinha');
      app.classList.remove('enroscou');
      zonas.classList.remove('convite');
      acenderLua(null);
      som.ronronar.desligar(1);
      momon.setPose('sentado');
      momon.pular(16, 420);
      mudarModo('livre');
      ultimoToque = agora();
      voltarAoHumor();
    },
  };

  // ------------------------------------------------ dormir

  const btAcordar = $('#bt-acordar');
  const melodias = [...document.querySelectorAll('[data-melodia]')];

  const dormir = {
    cobriu: false,
    arraste: null,
    zzzTimer: null,
    juntoTimer: null,
    travaTela: null,
    // a mantinha começa dobradinha na frente dele (em unidades do desenho)
    COMECO: { x: 26, y: 78, escala: .78 },
    posicao: null,
    entrar() {
      pararCarinho();
      cochilando = false;
      esconderDica();
      if (modo === 'amassar') {
        clearTimeout(amassar.fimTimer);
        gato.classList.remove('com-cobertinha');
        app.classList.remove('enroscou');
        acenderLua(null);
      }
      som.ronronar.desligar(1);
      app.classList.remove('cobriu', 'junto');
      $('#bt-dormir').classList.remove('convite');
      mudarModo('dormir');
      this.cobriu = false;
      momon.setPose('sentado');
      humorPassageiro('bocejo', 1400);
      som.bocejo();
      this.posicionar(this.COMECO);
      gato.classList.add('com-mantinha');
      setTimeout(() => this.mostrarComoCobrir(), 2400);
    },
    posicionar(p) {
      this.posicao = p;
      mantinha.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.escala})`;
    },
    mostrarComoCobrir() {
      if (modo !== 'dormir' || this.cobriu || this.arraste) return;
      const r = mantinha.getBoundingClientRect();
      mostrarDica('arrastar', r.left + r.width * .5, r.top + r.height * .5);
    },
    tocaMantinha(x, y) {
      const r = mantinha.getBoundingClientRect();
      const folga = 30;
      return x > r.left - folga && x < r.right + folga && y > r.top - folga && y < r.bottom + folga;
    },
    // Toques no modo dormir.
    apertou(e) {
      if (!this.cobriu && this.tocaMantinha(e.clientX, e.clientY)) {
        esconderDica();
        this.arraste = { id: e.pointerId, x: e.clientX, y: e.clientY, de: { ...this.posicao } };
        return;
      }
      soltar('brilho', e.clientX, e.clientY, { tamanho: 38, subir: 30, duracao: 900, espalhar: 8 });
      if (!this.cobriu) this.mostrarComoCobrir();
    },
    moveu(e) {
      const a = this.arraste;
      if (!a || e.pointerId !== a.id || this.cobriu) return;
      const k = gato.getScreenCTM().a; // pixels por unidade do desenho
      const dx = (e.clientX - a.x) / k, dy = (e.clientY - a.y) / k;
      const y = limitar(a.de.y + dy, -20, this.COMECO.y + 40);
      const x = limitar(a.de.x + dx * .6, -60, 80);
      const quanto = limitar(y / this.COMECO.y, 0, 1);
      this.posicionar({ x: x * quanto, y, escala: 1 - (1 - this.COMECO.escala) * quanto });
      if (y < this.COMECO.y * .35) this.cobrir();
    },
    // Soltou a mantinha (ou só tocou nela): ela termina de cobrir. Nunca dá errado.
    largou(e) {
      const a = this.arraste;
      if (!a || e.pointerId !== a.id) return;
      this.arraste = null;
      this.cobrir();
    },
    cobrir() {
      if (this.cobriu) return;
      this.cobriu = true;
      this.arraste = null;
      esconderDica();
      app.classList.add('cobriu');
      const de = mantinha.style.transform;
      this.posicionar({ x: 0, y: 0, escala: 1 });
      mantinha.animate([{ transform: de }, { transform: mantinha.style.transform }],
        { duration: 650, easing: 'cubic-bezier(.3, 1.2, .5, 1)' });
      som.fru();
      momon.setPose('enroscado');
      clearTimeout(passageiro);
      passageiro = null;
      momon.setHumor('dormindo');
      marcarMelodia(memoria.dados.melodia);
      setTimeout(() => {
        if (modo !== 'dormir') return;
        som.ninar.tocar(memoria.dados.melodia);
        som.ronco.ligar();
      }, 900);
      this.zzzTimer = setInterval(() => this.zzz(), 2700);
      // depois de um tempinho, a tela fica bem escura e calma: dormir junto
      this.juntoTimer = setTimeout(() => {
        posicionarBrilhosDaNoite();
        app.classList.add('junto');
      }, 15e3);
      this.manterTelaAcesa(true);
    },
    zzz() {
      const p = momon.naTela(150, 236);
      soltar('z', p.x + aleatorio(-10, 25), p.y, { tamanho: aleatorio(34, 52), subir: 130, duracao: 3600, espalhar: 30 });
    },
    escolherMelodia(i) {
      memoria.dados.melodia = i;
      memoria.salvar();
      marcarMelodia(i);
      if (this.cobriu) som.ninar.tocar(i);
      const c = centro(melodias[i]);
      soltar('estrela', c.x, c.y, { tamanho: 36, subir: 60, duracao: 1200, espalhar: 20 });
    },
    // Acordar: só depois de 2 s segurando o sol.
    sair() {
      clearInterval(this.zzzTimer);
      clearTimeout(this.juntoTimer);
      som.ninar.parar(1.5);
      som.ronco.desligar();
      this.manterTelaAcesa(false);
      this.cobriu = false;
      this.arraste = null;
      app.classList.remove('junto', 'cobriu');
      esconderDica();
      gato.classList.remove('com-mantinha');
      momon.setPose('sentado');
      momon.pular(14, 420);
      mudarModo('livre');
      // dormiu e acordou: começa uma sessão nova
      inicioDaSessao = ultimoToque = agora();
      $('#bt-dormir').classList.remove('convite');
      humorPassageiro('bocejo', 1300);
      som.bocejo();
    },
    async manterTelaAcesa(sim) {
      try {
        if (sim && !this.travaTela && 'wakeLock' in navigator) {
          this.travaTela = await navigator.wakeLock.request('screen');
          this.travaTela.addEventListener('release', () => { this.travaTela = null; });
        } else if (!sim && this.travaTela) {
          await this.travaTela.release();
          this.travaTela = null;
        }
      } catch (e) { /* sem suporte: a tela apaga sozinha, tudo bem */ }
    },
  };
  // quando a cantiga acaba sozinha, a tela já pode apagar
  som.ninar.aoTerminar = () => dormir.manterTelaAcesa(false);

  // No escuro do dormir junto, o Momon também escurece; só a ponta do rabo
  // (o vaga-lume) e a lua da testa continuam brilhando, por cima de tudo.
  const brilhosDaNoite = [...document.querySelectorAll('.brilho-noite')];
  function posicionarBrilhosDaNoite() {
    const alvos = [gato.querySelector('.pose-enroscado .ponta-luz'), gato.querySelector('[data-parte="lua-testa"]')];
    alvos.forEach((alvo, i) => {
      const c = centro(alvo);
      brilhosDaNoite[i].style.left = `${c.x}px`;
      brilhosDaNoite[i].style.top = `${c.y}px`;
    });
  }
  window.addEventListener('resize', () => { if (app.classList.contains('junto')) posicionarBrilhosDaNoite(); });

  function centro(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function marcarMelodia(i) {
    melodias.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
  }

  // segurar o sol por 2 s
  let seguraTimer = null;
  btAcordar.addEventListener('pointerdown', e => {
    if (modo !== 'dormir') return;
    btAcordar.classList.add('segurando');
    clearTimeout(seguraTimer);
    seguraTimer = setTimeout(() => {
      btAcordar.classList.remove('segurando');
      dormir.sair();
    }, 2000);
    e.preventDefault();
  });
  const largarSol = () => {
    clearTimeout(seguraTimer);
    btAcordar.classList.remove('segurando');
  };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => btAcordar.addEventListener(t, largarSol));

  melodias.forEach((b, i) => b.addEventListener('click', () => {
    if (modo === 'dormir') dormir.escolherMelodia(i);
  }));

  $('#bt-coberta').addEventListener('click', () => {
    ultimoToque = agora();
    if (modo === 'amassar') amassar.sair();
    else if (modo === 'livre') amassar.entrar();
  });
  $('#bt-dormir').addEventListener('click', () => {
    ultimoToque = agora();
    if (modo === 'livre' || modo === 'amassar') dormir.entrar();
  });

  // ------------------------------------------------ início: ovinho ou Momon dormindo

  const ovo = $('#ovo');
  let zzzInicio = null;
  let comecou = false;

  function prepararInicio() {
    mudarModo('inicio');
    if (!memoria.dados.nasceu) {
      lugar.classList.add('escondido');
      momon.setPose('sentado');
      momon.setHumor('surpreso');
      ovo.innerHTML = M.icones.ovo();
      ovo.hidden = false;
      requestAnimationFrame(() => {
        const r = ovo.getBoundingClientRect();
        mostrarDica('tocar', r.left + r.width / 2, r.top + r.height * .5, 2500);
      });
    } else {
      app.classList.add('sono');
      momon.setPose('enroscado');
      momon.setHumor('dormindo');
      zzzInicio = setInterval(() => dormir.zzz(), 3200);
      requestAnimationFrame(() => {
        const p = momon.naTela(170, 300);
        mostrarDica('tocar', p.x, p.y, 3000);
      });
    }
  }

  async function comecar() {
    if (comecou) return;
    comecou = true;
    som.destravar();
    telaCheia();
    esconderDica();
    clearInterval(zzzInicio);
    memoria.dados.visitas++;
    memoria.salvar();
    if (!memoria.dados.nasceu) await chocarOvo();
    else await acordarDeManha();
    inicioDaSessao = ultimoToque = agora();
    mudarModo('livre');
    voltarAoHumor();
  }

  // O ovinho balança, racha, a casca voa e o Momon aparece (uma vez só na vida).
  async function chocarOvo() {
    const casca = ovo.querySelector('.ovo-svg');
    casca.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(8deg)' },
      { transform: 'rotate(-6deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 700, easing: 'ease-in-out' });
    [0, 2, 4].forEach((nota, i) => som.sininho(som.PENTA[nota], .13, i * .18));
    await esperar(720);
    ovo.classList.add('rachando');
    await esperar(380);
    ovo.classList.add('abriu');
    som.pop();
    const c = centro(ovo);
    for (let i = 0; i < 9; i++) {
      soltar(i % 2 ? 'estrela' : 'brilho', c.x + aleatorio(-40, 40), c.y + aleatorio(-30, 30), { tamanho: aleatorio(28, 48), subir: aleatorio(90, 180), espalhar: 120, duracao: 1600 });
    }
    momon.setPose('sentado');
    momon.setHumor('surpreso');
    lugar.classList.remove('escondido');
    setTimeout(() => som.miau(1.15), 250);
    await esperar(1400);
    ovo.hidden = true;
    memoria.dados.nasceu = true;
    memoria.salvar();
    jeito.afeto = .22; // recém-nascido: desconfiado, mas curioso
  }

  // Nas outras vezes ele acorda emburradinho: boceja, senta, resmunga.
  async function acordarDeManha() {
    app.classList.remove('sono');
    momon.setHumor('bocejo');
    som.bocejo();
    await esperar(1200);
    momon.setPose('sentado');
    momon.pular(16, 420);
    jeito.afeto = 0;
    momon.setHumor('emburrado');
    setTimeout(() => som.mrrp(), 350);
  }

  // Tela cheia no primeiro toque (só em telas de toque e se não estiver instalado).
  function telaCheia() {
    const el = document.documentElement;
    const instalado = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
    const pedir = el.requestFullscreen || el.webkitRequestFullscreen;
    if (instalado || !pedir || document.fullscreenElement || !matchMedia('(pointer: coarse)').matches) return;
    try {
      const p = pedir.call(el, { navigationUI: 'hide' });
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* sem tela cheia */ }
  }

  // ------------------------------------------------ toques: tudo passa por aqui

  app.addEventListener('pointerdown', e => {
    if (e.target.closest('.botao')) return; // botões cuidam de si
    ultimoToque = agora();
    if (modo === 'inicio') return; // começa ao soltar o dedo (ver pointerup)
    if (modo === 'dormir') { dormir.apertou(e); return; }
    if (modo === 'amassar') {
      if (!amassar.enroscou) amassar.tocar(e.clientX < innerWidth / 2 ? 'esq' : 'dir');
      else if (momon.toca(e.clientX, e.clientY)) amassar.sair();
      else brilhinho(e.clientX, e.clientY);
      return;
    }
    // livre
    if (acordarDoCochilo()) return;
    if (!toque) toque = { id: e.pointerId, x: e.clientX, y: e.clientY, t: agora(), dist: 0, noMomon: momon.toca(e.clientX, e.clientY) };
    if (!toque.noMomon) brilhinho(e.clientX, e.clientY);
  });

  app.addEventListener('pointermove', e => {
    if (modo === 'dormir') { dormir.moveu(e); return; }
    if (modo !== 'livre' || !toque || e.pointerId !== toque.id) return;
    toque.dist += Math.hypot(e.clientX - toque.x, e.clientY - toque.y);
    toque.x = e.clientX;
    toque.y = e.clientY;
    // arrastar o dedo em cima dele = carinho (mesmo que tenha começado fora)
    if (toque.dist > 10 && momon.toca(e.clientX, e.clientY)) {
      ultimoToque = agora();
      comecarCarinho();
    }
  });

  const fimDoToque = e => {
    // O navegador só libera som e tela cheia quando o dedo levanta.
    if (e.type === 'pointerup' && !som.pronto()) som.destravar();
    if (modo === 'inicio') { if (e.type === 'pointerup') comecar(); return; }
    if (modo === 'dormir') { dormir.largou(e); return; }
    if (!toque || e.pointerId !== toque.id) return;
    const rapido = agora() - toque.t < 320 && toque.dist < 14;
    if (carinho.ativo) pararCarinho();
    else if (rapido && toque.noMomon && modo === 'livre') cutucar();
    toque = null;
  };
  app.addEventListener('pointerup', fimDoToque);
  app.addEventListener('pointercancel', fimDoToque);

  // nada de menu, zoom, seleção ou duplo toque do navegador
  ['contextmenu', 'gesturestart', 'dblclick', 'selectstart'].forEach(tipo =>
    document.addEventListener(tipo, e => e.preventDefault(), { passive: false }));

  // ------------------------------------------------ relógio: carinho, ritmo, cochilo

  let anterior = agora();
  function relogio(t) {
    const dt = Math.min(.1, (t - anterior) / 1000);
    anterior = t;

    if (modo === 'livre') {
      // segurar o dedo parado em cima dele também é carinho
      if (toque && !carinho.ativo && toque.noMomon && t - toque.t > 450) comecarCarinho();
      if (carinho.ativo) {
        carinho.tempo += dt;
        jeito.ganhar(dt * .075);
        som.ronronar.ajustar(limitar(.35 + carinho.tempo * .16, 0, 1));
        acenderLua(limitar(.2 + carinho.tempo * .3, 0, 1));
        if (carinho.tempo > 2.2) {
          carinho.magia += dt;
          if (carinho.magia > .38) { carinho.magia = 0; soltarMagia(); }
        }
        if (t > carinho.vibraEm) {
          vibrar([12, 70, 12]);
          carinho.vibraEm = t + 650;
        }
      } else if (!cochilando && !toque && t - ultimoToque > COCHILO) {
        cochilar();
      }
      // depois de uns minutos, a lua do botão convida para dormir (e ele boceja)
      if (t - inicioDaSessao > HORA_DE_DORMIR) {
        $('#bt-dormir').classList.add('convite');
        if (!carinho.ativo && !cochilando && t - ultimoBocejo > 70e3) {
          ultimoBocejo = t;
          humorPassageiro('bocejo', 1300);
          som.bocejo();
        }
      }
    } else if (modo === 'amassar' && !amassar.enroscou && amassar.ritmo > .01 && t - amassar.ultimo > 1200) {
      // parou de tocar: o ritmo vai baixando devagar
      amassar.ritmo *= Math.pow(.5, dt);
      amassar.aplicarRitmo();
    }
    requestAnimationFrame(relogio);
  }
  requestAnimationFrame(relogio);

  // Piscadas a cada 3 a 6 s (amassando: lentas, e mais lentas quanto melhor o ritmo).
  (function piscadas() {
    const lento = modo === 'amassar' && !amassar.enroscou;
    setTimeout(() => {
      if (!document.hidden && modo !== 'inicio') {
        if (lento) momon.piscar(true, 700 + 1300 * amassar.ritmo);
        else {
          momon.piscar();
          if (Math.random() < .15) setTimeout(() => momon.piscar(), 260);
        }
      }
      piscadas();
    }, lento ? aleatorio(2400, 4200) : aleatorio(3000, 6000));
  })();

  // A orelha mexe de vez em quando.
  (function orelhas() {
    setTimeout(() => {
      if (!document.hidden && modo !== 'inicio') momon.mexerOrelha();
      orelhas();
    }, aleatorio(4500, 11000));
  })();

  // ------------------------------------------------ aba escondida, offline

  document.addEventListener('visibilitychange', () => {
    app.classList.toggle('pausado', document.hidden);
    if (document.hidden) {
      toque = null;
      pararCarinho();
      som.pausar();
    } else {
      som.retomar();
      ultimoToque = agora();
      if (modo === 'dormir' && dormir.cobriu && som.ninar.atual() >= 0) dormir.manterTelaAcesa(true);
    }
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  // Só leitura, para testes automáticos e para os pais curiosos no console.
  M.app = {
    estado: () => ({
      modo, humor: momon.humor, pose: momon.pose, afeto: +jeito.afeto.toFixed(3),
      carinho: carinho.ativo, cochilando, ritmo: +amassar.ritmo.toFixed(3), enroscou: amassar.enroscou,
      cobriu: dormir.cobriu, melodia: som.ninar.atual(), memoria: { ...memoria.dados },
    }),
  };

  prepararInicio();
})();
