import './style.css';
import { DEFAULTS, FAIXA_AJUSTE, FAIXA_P_FLAVIO, PREMISSAS_PRE_JOGO, RESULTADOS, calcPerfis } from './calc.js';
import { NOMES_MODO, NOMES_RESULTADO, casasPct, dataBR, formulaRebaixamento, paraCampo, pct } from './format.js';
import { atualizarDica, definirDica, iniciarDicas } from './dica.js';
import { marcarDesatualizado, montar, renderizar } from './render.js';
import { exportarRankingPng } from './exportar.js';

const CHAVE_TEMA = 'sofrimento-duplo:tema';
const TEMAS = ['auto', 'claro', 'escuro'];
const NOMES_TEMA = { auto: 'automático', claro: 'claro', escuro: 'escuro' };

const $ = (id) => document.getElementById(id);
const CLUBES_RISCO = ['gremio', 'inter'];

let estado = structuredClone(DEFAULTS);
/** Último cálculo válido e as premissas que o geraram. */
let ultimo = null;
let ultimoEstado = null;
/** Mesmo cálculo antes do Gre-Nal e sem o ajuste do Corinthians (coluna "vs. pré-jogo"). */
let ultimaBase = null;
/** Campos com valor inválido: id → rótulo legível. */
const invalidos = new Map();

// --- Campos ----------------------------------------------------------------

const slider = $('p-flavio');
const camposJogo = Object.fromEntries(RESULTADOS.map((r) => [r, $(`jogo-${r}`)]));
const camposRisco = Object.fromEntries(
  RESULTADOS.map((r) => [r, Object.fromEntries(CLUBES_RISCO.map((c) => [c, $(`risco-${r}-${c}`)]))]),
);
const campoAjuste = $('ajuste-corinthians');

function preencherControles() {
  slider.min = String(FAIXA_P_FLAVIO.min * 100);
  slider.max = String(FAIXA_P_FLAVIO.max * 100);
  slider.value = String(estado.pFlavio * 100);
  document.querySelector(`input[name="modo-jogo"][value="${estado.resultadoJogo}"]`).checked = true;
  for (const r of RESULTADOS) {
    camposJogo[r].value = String(paraCampo(estado.probJogo[r]));
    for (const c of CLUBES_RISCO) camposRisco[r][c].value = String(paraCampo(estado.riscoRebaixamento[r][c]));
  }
  campoAjuste.min = String(FAIXA_AJUSTE.min * 100);
  campoAjuste.max = String(FAIXA_AJUSTE.max * 100);
  campoAjuste.value = String(paraCampo(estado.ajusteCorinthians));
  for (const campo of document.querySelectorAll('#premissas input[type="number"]')) campo.removeAttribute('aria-invalid');
  invalidos.clear();
}

function montarEscalaSlider() {
  const min = FAIXA_P_FLAVIO.min * 100;
  const max = FAIXA_P_FLAVIO.max * 100;
  const marcas = [];
  for (let v = min; v <= max + 1e-9; v += 10) {
    const s = document.createElement('span');
    s.style.setProperty('--x', String((v - min) / (max - min)));
    s.textContent = `${Math.round(v)}%`;
    marcas.push(s);
  }
  $('p-flavio-escala').replaceChildren(...marcas);
}

/** Lê um campo em % (ou p.p.) e devolve o valor na escala 0–1, ou null se inválido. */
function lerPercentual(campo, rotulo) {
  const v = campo.valueAsNumber;
  const ok = campo.value.trim() !== '' && Number.isFinite(v) && v >= Number(campo.min) && v <= Number(campo.max);
  campo.toggleAttribute('aria-invalid', !ok);
  if (ok) invalidos.delete(campo.id);
  else invalidos.set(campo.id, rotulo);
  return ok ? v / 100 : null;
}

/** Devolve um campo inválido ao valor em vigor no estado. Retorna true se mexeu. */
function restaurarSeInvalido(campo) {
  if (!invalidos.has(campo.id)) return false;
  if (campo === campoAjuste) {
    campo.value = String(paraCampo(estado.ajusteCorinthians));
  } else {
    const [, grupo, r, c] = campo.id.match(/^(jogo|risco)-(\w+?)(?:-(gremio|inter))?$/);
    campo.value = String(paraCampo(grupo === 'jogo' ? estado.probJogo[r] : estado.riscoRebaixamento[r][c]));
  }
  lerPercentual(campo, '');
  return true;
}

function ligarControles() {
  slider.addEventListener('input', () => {
    estado.pFlavio = slider.valueAsNumber / 100;
    atualizar();
  });

  $('modo-jogo').addEventListener('change', (e) => {
    estado.resultadoJogo = e.target.value;
    // Com o resultado fixado, os campos do jogo ficam desabilitados e fora do cálculo.
    if (estado.resultadoJogo !== 'probabilistico') Object.values(camposJogo).forEach(restaurarSeInvalido);
    atualizar();
  });

  for (const r of RESULTADOS) {
    const campo = camposJogo[r];
    campo.addEventListener('input', () => {
      const v = lerPercentual(campo, NOMES_RESULTADO[r]);
      if (v != null) estado.probJogo[r] = v;
      atualizar();
    });
    for (const c of CLUBES_RISCO) {
      const campoRisco = camposRisco[r][c];
      campoRisco.addEventListener('input', () => {
        const v = lerPercentual(campoRisco, `${c === 'gremio' ? 'Grêmio' : 'Inter'} cai se ${NOMES_RESULTADO[r].toLowerCase()}`);
        if (v != null) estado.riscoRebaixamento[r][c] = v;
        atualizar();
      });
    }
  }

  campoAjuste.addEventListener('input', () => {
    const v = lerPercentual(campoAjuste, 'Desconto do Corinthians');
    if (v != null) estado.ajusteCorinthians = v;
    atualizar();
  });

  // Ao sair de um campo inválido, volta ao último valor válido.
  $('premissas').addEventListener('focusout', (e) => {
    if (e.target instanceof HTMLInputElement && restaurarSeInvalido(e.target)) atualizar();
  });

  $('restaurar').addEventListener('click', () => carregar(DEFAULTS));
  $('pre-jogo').addEventListener('click', () => carregar(PREMISSAS_PRE_JOGO));

  $('exportar').addEventListener('click', () => {
    if (ultimo) exportarRankingPng(ultimo, ultimoEstado, ultimaBase);
  });

  for (const clube of CLUBES_RISCO) {
    definirDica($(`risco-final-${clube}`), () => ({
      valor: ultimo ? pct(ultimo.pRebaixa[clube], 1) : '—',
      titulo: `Risco final de o ${clube === 'gremio' ? 'Grêmio' : 'Inter'} cair`,
      formula: ultimo ? formulaRebaixamento(clube, ultimo, ultimoEstado) : '',
    }));
  }
}

// --- Recalcular ------------------------------------------------------------

function carregar(premissas) {
  estado = structuredClone(premissas);
  preencherControles();
  atualizar();
}

function atualizar() {
  sincronizarControles();

  let r;
  try {
    if (invalidos.size) throw new RangeError();
    r = calcPerfis(estado);
  } catch (erro) {
    mostrarErro(erro);
    marcarDesatualizado(true);
    return;
  }

  marcarDesatualizado(false);
  ultimo = r;
  ultimoEstado = structuredClone(estado);
  try {
    ultimaBase = calcPerfis({ ...ultimoEstado, resultadoJogo: 'probabilistico', ajusteCorinthians: 0 });
  } catch {
    ultimaBase = null; // probabilidades pré-jogo inválidas: a coluna "vs. pré-jogo" mostra "—"
  }
  renderizar(r, ultimoEstado, ultimaBase);
  mostrarStatus(r);
  atualizarDica();
}

function sincronizarControles() {
  const pf = estado.pFlavio;
  const min = FAIXA_P_FLAVIO.min;
  const max = FAIXA_P_FLAVIO.max;
  slider.style.setProperty('--preenchimento', `${((pf - min) / (max - min)) * 100}%`);
  const casas = casasPct(pf);
  $('p-flavio-saida').textContent = pct(pf, casas);
  $('leitura-flavio').textContent = pct(pf, casas);
  $('leitura-lula').textContent = pct(1 - pf, casas);

  const fixado = estado.resultadoJogo !== 'probabilistico';
  for (const campo of Object.values(camposJogo)) campo.disabled = fixado;
  for (const tr of document.querySelectorAll('.tabela-risco tbody tr')) {
    tr.classList.toggle('ativo', tr.dataset.resultado === estado.resultadoJogo);
  }
}

function mostrarStatus(r) {
  const status = $('jogo-status');
  status.classList.remove('erro');
  if (estado.resultadoJogo !== 'probabilistico') {
    status.textContent = `Resultado fixado: ${NOMES_MODO[estado.resultadoJogo]} (100%). Só a linha correspondente da tabela de risco entra no cálculo.`;
  } else if (r.jogo.normalizado) {
    const e = r.jogo.efetiva;
    status.textContent =
      `As três somam ${pct(r.jogo.somaInformada, 1)}. O cálculo usa os valores ajustados para 100%: ` +
      `Grêmio ${pct(e.gremioVence, 1)} · Empate ${pct(e.empate, 1)} · Inter ${pct(e.interVence, 1)}.`;
  } else {
    status.textContent = 'Soma: 100%.';
  }
  $('risco-final-gremio').textContent = pct(r.pRebaixa.gremio, 1);
  $('risco-final-inter').textContent = pct(r.pRebaixa.inter, 1);
}

function mostrarErro(erro) {
  const status = $('jogo-status');
  status.classList.add('erro');
  if (invalidos.size) {
    const nomes = [...invalidos.values()].map((n) => `“${n}”`).join(', ');
    status.textContent = `Valor inválido em ${nomes}: use um número dentro da faixa do campo. Os gráficos mostram o último cálculo válido.`;
  } else if (/todas zero/.test(erro.message)) {
    status.textContent = 'As três probabilidades do jogo estão em zero. Coloque um valor acima de zero em pelo menos uma.';
  } else {
    status.textContent = erro.message;
  }
}

// --- Tema ------------------------------------------------------------------

function temaSalvo() {
  try {
    const t = localStorage.getItem(CHAVE_TEMA);
    return TEMAS.includes(t) ? t : 'auto';
  } catch {
    return 'auto';
  }
}

function aplicarTema(tema) {
  const raiz = document.documentElement;
  if (tema === 'claro') raiz.dataset.theme = 'light';
  else if (tema === 'escuro') raiz.dataset.theme = 'dark';
  else delete raiz.dataset.theme;
  $('tema').textContent = `Tema: ${NOMES_TEMA[tema]}`;
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {}
  if (ultimo) renderizar(ultimo, ultimoEstado, ultimaBase); // cores das matrizes vêm dos tokens do tema
}

function ligarTema() {
  let tema = temaSalvo();
  aplicarTema(tema);
  $('tema').addEventListener('click', () => {
    tema = TEMAS[(TEMAS.indexOf(tema) + 1) % TEMAS.length];
    aplicarTema(tema);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (ultimo) renderizar(ultimo, ultimoEstado, ultimaBase);
  });
}

// --- Início ----------------------------------------------------------------

const dataRef = $('data-referencia');
dataRef.dateTime = DEFAULTS.dataReferencia;
dataRef.textContent = dataBR(DEFAULTS.dataReferencia);

iniciarDicas($('dica'));
montar();
montarEscalaSlider();
preencherControles();
ligarControles();
ligarTema();
atualizar();
