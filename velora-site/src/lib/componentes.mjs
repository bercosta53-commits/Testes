// Componentes reutilizáveis (seção 9 do briefing de design).
import { html, raw, md } from './html.mjs';

export const seta = raw(
  '<svg class="seta" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
    '<path d="M1.5 8h12M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '</svg>'
);

export const setaBaixo = raw(
  '<svg class="seta seta--baixo" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
    '<path d="M8 1.5v12M3.5 9 8 13.5 12.5 9" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '</svg>'
);

// Botão primário: bloco Acid, texto Ink, canto reto, seta ao final.
export function botao(texto, href, { principal = false, classe = '' } = {}) {
  return html`<a class="botao botao--primario ${classe}" href="${href}"${principal ? raw(' data-cta-principal') : ''}><span>${texto}</span>${seta}</a>`;
}

// Botão secundário: texto com sublinhado fino e seta, sem caixa.
export function linkSeta(texto, href, { classe = '' } = {}) {
  return html`<a class="link-seta ${classe}" href="${href}"><span>${texto}</span>${seta}</a>`;
}

// Rótulo de seção: mono, caixa alta, "— 01 / O SISTEMA".
export function rotulo(texto, numero) {
  return html`<p class="rotulo-secao">${numero ? html`<span class="rotulo-secao__n">${numero}</span><span class="rotulo-secao__barra" aria-hidden="true">/</span>` : ''}<span>${texto}</span></p>`;
}

export function secao({ tema, id, classe = '', topo = false }, conteudo) {
  return html`<section class="secao tema-${tema}${topo ? ' secao--topo' : ''} ${classe}"${id ? html` id="${id}"` : ''}>
  <div class="wrap">${conteudo}</div>
</section>`;
}

// Frase-ponte: fecha a seção e puxa a próxima.
export function ponte(texto) {
  return html`<p class="ponte revelar">${setaBaixo}<span>${texto}</span></p>`;
}

// Marcação visível só na versão de revisão. Na versão publicável não gera nada.
export function pendente(ctx, texto, { classe = '' } = {}) {
  if (!ctx.revisao) return '';
  return html`<div class="pendente ${classe}" role="note"><p class="pendente__rotulo">Pendente</p><p class="pendente__texto">${texto}</p></div>`;
}

// Foto aprovada (config.fotos) ou marcação de pendência na revisão.
export function midia(ctx, chave, descricao, { classe = '', proporcao = '4 / 5' } = {}) {
  const foto = ctx.config.fotos[chave];
  if (foto) {
    return html`<figure class="foto ${classe}" style="aspect-ratio:${proporcao}">
      <img src="${ctx.url(foto.src)}" alt="${foto.alt}" width="${foto.largura}" height="${foto.altura}" loading="lazy" decoding="async">
    </figure>`;
  }
  return pendente(ctx, `Foto · ${descricao}`, { classe: `pendente--midia ${classe}` });
}

export const temMidia = (ctx, chave) => Boolean(ctx.config.fotos[chave]) || ctx.revisao;

// ---------- Formulários ----------

// A pergunta da copy aparece como dica visível sob o rótulo (não como placeholder):
// não some ao digitar, não é cortada em telas estreitas e é lida pelo leitor de tela.
function dicaHtml(id, dica) {
  return dica ? html`<p class="campo__dica" id="${id}-dica">${dica}</p>` : '';
}
const descricao = (id, dica) => (dica ? html` aria-describedby="${id}-dica"` : '');

function campoTexto({ id, nome, rotulo, dica, tipo = 'text', autocomplete }) {
  return html`<div class="campo">
    <label class="campo__rotulo" for="${id}">${rotulo}</label>
    ${dicaHtml(id, dica)}
    <input class="campo__entrada" id="${id}" name="${nome}" type="${tipo}" required${autocomplete ? html` autocomplete="${autocomplete}"` : ''}${descricao(id, dica)}>
  </div>`;
}

function campoSelecao({ id, nome, rotulo, dica, opcoes }) {
  return html`<div class="campo">
    <label class="campo__rotulo" for="${id}">${rotulo}</label>
    ${dicaHtml(id, dica)}
    <select class="campo__entrada campo__entrada--selecao" id="${id}" name="${nome}" required${descricao(id, dica)}>
      <option value="" disabled selected></option>
      ${opcoes.map((o) => html`<option value="${o}">${o}</option>`)}
    </select>
  </div>`;
}

const MENSAGENS = {
  sucesso: 'Recebemos suas informações. O próximo passo é combinar a conversa inicial.',
  erro: 'Não foi possível enviar agora. Confira os campos e tente novamente.',
  validacao: 'Revise os campos destacados para continuar.',
};

function formulario({ id, endpoint, campos, botaoTexto, micro }) {
  return html`<form class="form" id="${id}" data-form novalidate${endpoint ? html` data-endpoint="${endpoint}"` : ''}
    data-msg-sucesso="${MENSAGENS.sucesso}" data-msg-erro="${MENSAGENS.erro}" data-msg-validacao="${MENSAGENS.validacao}">
    <div class="form__campos">${campos}</div>
    <div class="form__acoes">
      <button class="botao botao--primario" type="submit"><span>${botaoTexto}</span>${seta}</button>
      ${micro ? html`<p class="form__micro">${micro}</p>` : ''}
    </div>
    <p class="form__status" data-status role="status" aria-live="polite" tabindex="-1"></p>
  </form>`;
}

export const ORIGENS = [
  'Indicação e relacionamento',
  'Base de clientes atual',
  'Prospecção ativa',
  'Conteúdo e mídia',
  'Parcerias',
  'Outros / Não sei informar',
];

export function formDiagnostico(ctx, { id = 'form-diagnostico', botaoTexto = 'Agendar Diagnóstico de Aquisição' } = {}) {
  const p = id;
  return formulario({
    id,
    endpoint: ctx.config.formularios.diagnostico,
    botaoTexto,
    micro: 'Conversa inicial de 45 minutos. Sem compromisso de contratar um programa.',
    campos: [
      campoTexto({ id: `${p}-nome`, nome: 'nome', rotulo: 'Nome', dica: 'Como podemos chamar você?', autocomplete: 'name' }),
      campoTexto({ id: `${p}-empresa`, nome: 'empresa', rotulo: 'Empresa', dica: 'Em qual empresa você atua?', autocomplete: 'organization' }),
      campoTexto({ id: `${p}-cargo`, nome: 'cargo', rotulo: 'Cargo', dica: 'Qual é a sua função?', autocomplete: 'organization-title' }),
      campoSelecao({ id: `${p}-faturamento`, nome: 'faixa_faturamento', rotulo: 'Faixa de faturamento', dica: 'Qual é a faixa de faturamento anual da empresa?', opcoes: ctx.config.faixasFaturamento }),
      campoSelecao({ id: `${p}-origem`, nome: 'origem_clientes', rotulo: 'Principal origem dos clientes', dica: 'Hoje, de onde vem a maior parte dos novos negócios?', opcoes: ORIGENS }),
    ],
  });
}

// ---------- Exhibit de caso ----------

export function exhibitCaso(caso, indice) {
  const n = String(indice + 1).padStart(2, '0');
  return html`<article class="exhibit revelar">
    <header class="exhibit__cabecalho"><span>Caso ${n}</span><span aria-hidden="true">·</span><span>${caso.segmento}</span></header>
    <h3 class="titulo-3 exhibit__nome">${caso.nome}</h3>
    <div class="exhibit__corpo">
      <div class="exhibit__bloco"><p class="exhibit__rotulo">Contexto</p><p>${caso.contexto}</p></div>
      <div class="exhibit__bloco"><p class="exhibit__rotulo">Trava</p><p>${caso.trava}</p></div>
      <div class="exhibit__bloco"><p class="exhibit__rotulo">O que conectamos</p><p>${caso.conectamos}</p></div>
      <div class="exhibit__bloco exhibit__bloco--resultado"><p class="exhibit__rotulo">Resultado</p>
        <p class="exhibit__numero">${caso.resultado.numero}</p><p class="exhibit__legenda">${caso.resultado.legenda}</p></div>
    </div>
    ${caso.link ? html`<footer class="exhibit__rodape">${linkSeta('Ver caso completo', caso.link)}</footer>` : ''}
  </article>`;
}

export { md };
