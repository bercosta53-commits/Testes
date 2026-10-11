// Uma única dica (tooltip) para a página. No mouse, mostra a dica do elemento
// mais interno sob o ponteiro; no teclado, a do elemento focado; no toque, a do
// elemento tocado até o próximo toque fora. Conteúdo sempre via textContent.

const geradores = new WeakMap();
let caixa = null;
let alvo = null;

/**
 * Associa uma dica a um elemento. `gerar` é chamado a cada exibição e devolve
 * { valor, titulo, linhas: [{ cor, rotulo, valor }], formula, nota }.
 */
export function definirDica(elemento, gerar) {
  geradores.set(elemento, gerar);
  elemento.dataset.dica = '';
}

export function iniciarDicas(elementoCaixa) {
  caixa = elementoCaixa;
  const comDica = (no) => no?.closest?.('[data-dica]') ?? null;

  document.addEventListener('pointerover', (e) => {
    const t = comDica(e.target);
    if (!t) return;
    mostrar(t);
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') posicionarNoPonteiro(e.clientX, e.clientY);
    else posicionarNoElemento(t);
  });

  document.addEventListener('pointermove', (e) => {
    if (!alvo || e.pointerType === 'touch') return;
    const t = comDica(e.target);
    if (!t) return;
    if (t !== alvo) mostrar(t);
    posicionarNoPonteiro(e.clientX, e.clientY);
  });

  document.addEventListener('pointerout', (e) => {
    if (e.pointerType === 'touch' || !alvo) return;
    if (!comDica(e.relatedTarget)) esconder();
  });

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' && !comDica(e.target)) esconder();
  });

  document.addEventListener('focusin', (e) => {
    const t = e.target;
    if (t instanceof Element && t.matches('[data-dica]:focus-visible')) {
      mostrar(t);
      posicionarNoElemento(t);
    }
  });

  document.addEventListener('focusout', esconder);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') esconder();
  });
  window.addEventListener('scroll', esconder, { passive: true });
}

/** Refaz o conteúdo da dica aberta (depois de um recálculo). */
export function atualizarDica() {
  if (alvo) preencher(alvo);
}

function mostrar(t) {
  alvo = t;
  preencher(t);
  caixa.hidden = false;
}

function esconder() {
  alvo = null;
  if (caixa) caixa.hidden = true;
}

function div(classe, texto) {
  const el = document.createElement('div');
  el.className = classe;
  if (texto != null) el.textContent = texto;
  return el;
}

function preencher(t) {
  const d = geradores.get(t)?.();
  if (!d) return;
  const filhos = [];
  if (d.valor) filhos.push(div('dica-valor', d.valor));
  if (d.titulo) filhos.push(div('dica-titulo', d.titulo));
  for (const linha of d.linhas ?? []) {
    const el = div('dica-linha');
    const chave = document.createElement('span');
    chave.className = 'dica-chave';
    if (linha.cor) chave.style.background = `var(${linha.cor})`;
    const rotulo = document.createElement('span');
    rotulo.textContent = linha.rotulo;
    const valor = document.createElement('strong');
    valor.textContent = linha.valor;
    el.append(chave, rotulo, valor);
    filhos.push(el);
  }
  if (d.formula) filhos.push(div('dica-formula', d.formula));
  if (d.nota) filhos.push(div('dica-nota', d.nota));
  caixa.replaceChildren(...filhos);
}

const MARGEM = 8;

function posicionarNoPonteiro(x, y) {
  const { width, height } = caixa.getBoundingClientRect();
  let left = x + 14;
  let top = y + 14;
  if (left + width > innerWidth - MARGEM) left = x - 14 - width;
  if (top + height > innerHeight - MARGEM) top = y - 14 - height;
  aplicar(left, top, width, height);
}

function posicionarNoElemento(t) {
  const r = t.getBoundingClientRect();
  const { width, height } = caixa.getBoundingClientRect();
  let top = r.top - height - 8;
  if (top < MARGEM) top = r.bottom + 8;
  aplicar(r.left + r.width / 2 - width / 2, top, width, height);
}

function aplicar(left, top, width, height) {
  const x = Math.min(Math.max(left, MARGEM), innerWidth - width - MARGEM);
  const y = Math.min(Math.max(top, MARGEM), innerHeight - height - MARGEM);
  caixa.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}
