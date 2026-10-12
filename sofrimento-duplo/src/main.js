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
  $('imp-eleicao').textContent = `Flávio ${pct(pf, casas)} × Lula ${pct(1 - pf, casas)}`;
  $('imp-risco').textContent =
    `Grêmio ${pct(estado.riscoRebaixamento.gremio, 1)} · Inter ${pct(estado.riscoRebaixamento.inter, 1)}`;
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

// Tema que a página encontrou ao abrir (por exemplo, o escolhido no visualizador
// do claude.ai). O modo automático volta a ele em vez de apagá-lo.
const temaOriginal = temaSalvo() === 'auto' ? document.documentElement.dataset.theme : undefined;

function aplicarTema(tema) {
  const raiz = document.documentElement;
  if (tema === 'claro') raiz.dataset.theme = 'light';
  else if (tema === 'escuro') raiz.dataset.theme = 'dark';
  else if (temaOriginal) raiz.dataset.theme = temaOriginal;
  else delete raiz.dataset.theme;
  $('tema').textContent = `Tema: ${NOMES_TEMA[tema]}`;
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {}
}

function ligarTema() {
  let tema = temaSalvo();
  aplicarTema(tema);
  $('tema').addEventListener('click', () => {
    tema = TEMAS[(TEMAS.indexOf(tema) + 1) % TEMAS.length];
    aplicarTema(tema);
  });
  const redesenhar = () => {
    if (ultimo) renderizar(ultimo);
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redesenhar);
  // O visualizador pode trocar o tema por fora, mudando o atributo data-theme.
  new MutationObserver(redesenhar).observe(document.documentElement, { attributeFilter: ['data-theme'] });
}

// --- Impressão ---------------------------------------------------------------

/** Para imprimir (ou salvar como PDF): tema claro e tabela do anexo aberta. */
export function prepararImpressao() {
  const raiz = document.documentElement;
  const tabela = document.querySelector('.anexo details');
  const antes = { tema: raiz.dataset.theme, aberta: tabela.open };
  raiz.dataset.theme = 'light';
  tabela.open = true;
  return () => {
    if (antes.tema) raiz.dataset.theme = antes.tema;
    else delete raiz.dataset.theme;
    tabela.open = antes.aberta;
  };
}

let desfazerImpressao = null;
window.addEventListener('beforeprint', () => {
  desfazerImpressao = prepararImpressao();
});
window.addEventListener('afterprint', () => {
  desfazerImpressao?.();
  desfazerImpressao = null;
});

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
