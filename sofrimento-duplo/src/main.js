import './style.css';
import { CLUBES, DEFAULTS, FAIXA_P_FLAVIO, calcPerfis } from './calc.js';
import { casasPct, dataBR, paraCampo, pct } from './format.js';
import { atualizarDica, iniciarDicas } from './dica.js';
import { marcarDesatualizado, montar, renderizar } from './render.js';
import { downloadsDoVisualizador, exportarRankingPng } from './exportar.js';

const CHAVE_TEMA = 'sofrimento-duplo:tema';
const TEMAS = ['auto', 'claro', 'escuro'];
const NOMES_TEMA = { auto: 'automático', claro: 'claro', escuro: 'escuro' };

const $ = (id) => document.getElementById(id);

let estado = structuredClone(DEFAULTS);
/** Último cálculo válido. */
let ultimo = null;
/** Campos com valor inválido: id → rótulo legível. */
const invalidos = new Map();

// --- Controles ---------------------------------------------------------------

const slider = $('p-flavio');
const camposRisco = Object.fromEntries(Object.keys(CLUBES).map((c) => [c, $(`risco-${c}`)]));

function preencherControles() {
  slider.min = String(FAIXA_P_FLAVIO.min * 100);
  slider.max = String(FAIXA_P_FLAVIO.max * 100);
  slider.value = String(estado.pFlavio * 100);
  for (const [clube, campo] of Object.entries(camposRisco)) {
    campo.value = String(paraCampo(estado.riscoRebaixamento[clube]));
    campo.removeAttribute('aria-invalid');
  }
  invalidos.clear();
}

/** Lê um campo em % e devolve a probabilidade (0–1), ou null se inválido. */
function lerPercentual(campo, rotulo) {
  const v = campo.valueAsNumber;
  const ok = campo.value.trim() !== '' && Number.isFinite(v) && v >= 0 && v <= 100;
  campo.toggleAttribute('aria-invalid', !ok);
  if (ok) invalidos.delete(campo.id);
  else invalidos.set(campo.id, rotulo);
  return ok ? v / 100 : null;
}

function ligarControles() {
  slider.addEventListener('input', () => {
    estado.pFlavio = slider.valueAsNumber / 100;
    atualizar();
  });

  for (const [clube, campo] of Object.entries(camposRisco)) {
    campo.addEventListener('input', () => {
      const v = lerPercentual(campo, `${CLUBES[clube]} cai`);
      if (v != null) estado.riscoRebaixamento[clube] = v;
      atualizar();
    });
    // Ao sair de um campo inválido, volta ao último valor válido.
    campo.addEventListener('blur', () => {
      if (!invalidos.has(campo.id)) return;
      campo.value = String(paraCampo(estado.riscoRebaixamento[clube]));
      lerPercentual(campo, '');
      atualizar();
    });
  }

  $('restaurar').addEventListener('click', () => {
    estado = structuredClone(DEFAULTS);
    preencherControles();
    atualizar();
  });

  $('exportar').addEventListener('click', () => {
    if (ultimo) exportarRankingPng(ultimo);
  });
  // No visualizador de artefatos, só mostra o botão se ele puder oferecer o arquivo.
  if (window.claude?.use) {
    $('exportar').hidden = true;
    downloadsDoVisualizador().then((d) => {
      $('exportar').hidden = !d;
    });
  }
}

// --- Recalcular --------------------------------------------------------------

function atualizar() {
  const pf = estado.pFlavio;
  const casas = casasPct(pf);
  slider.style.setProperty('--preenchimento', `${((pf - FAIXA_P_FLAVIO.min) / (FAIXA_P_FLAVIO.max - FAIXA_P_FLAVIO.min)) * 100}%`);
  slider.setAttribute('aria-valuetext', `Flávio ${pct(pf, casas)}, Lula ${pct(1 - pf, casas)}`);
  $('leitura-flavio').textContent = pct(pf, casas);
  $('leitura-lula').textContent = pct(1 - pf, casas);

  const status = $('status');
  if (invalidos.size) {
    const nomes = [...invalidos.values()].map((n) => `“${n}”`).join(', ');
    status.textContent = `Valor inválido em ${nomes}: use um número de 0 a 100.`;
    marcarDesatualizado(true);
    return;
  }

  status.textContent = '';
  marcarDesatualizado(false);
  ultimo = calcPerfis(estado);
  renderizar(ultimo);
  atualizarDica();
}

// --- Tema --------------------------------------------------------------------

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
  if (ultimo) renderizar(ultimo); // as cores das matrizes vêm dos tokens do tema
}

function ligarTema() {
  let tema = temaSalvo();
  aplicarTema(tema);
  $('tema').addEventListener('click', () => {
    tema = TEMAS[(TEMAS.indexOf(tema) + 1) % TEMAS.length];
    aplicarTema(tema);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (ultimo) renderizar(ultimo);
  });
}

// --- Início ------------------------------------------------------------------

const dataRef = $('data-referencia');
dataRef.dateTime = DEFAULTS.dataReferencia;
dataRef.textContent = dataBR(DEFAULTS.dataReferencia);

iniciarDicas($('dica'));
montar();
preencherControles();
ligarControles();
ligarTema();
atualizar();
