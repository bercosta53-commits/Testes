// Componentes reutilizáveis (seção 9 do briefing de design).
import { html, raw, md } from './html.mjs';
import { FOTOS } from '../conteudo/fotos.mjs';

export const seta = raw(
  '<svg class="seta" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
    '<path d="M1.5 8h12M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
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

// Seção sem o .wrap automático: para composições que sangram até a borda da tela.
export function secaoLivre({ tema, id, classe = '', topo = false }, conteudo) {
  return html`<section class="secao tema-${tema}${topo ? ' secao--topo' : ''} ${classe}"${id ? html` id="${id}"` : ''}>${conteudo}</section>`;
}

// Foto editorial. Usa a foto aprovada em config.fotos[chave] se houver; senão, a provisória de FOTOS.
export function foto(ctx, chave, { sizes = '100vw', classe = '', prioridade = false } = {}) {
  const aprovada = ctx.config.fotos[chave];
  if (aprovada) {
    return html`<img class="${classe}" src="${aprovada.src}" alt="${aprovada.alt}" width="${aprovada.largura}" height="${aprovada.altura}"${prioridade ? raw(' fetchpriority="high"') : raw(' loading="lazy"')} decoding="async">`;
  }
  const f = FOTOS[chave];
  const srcset = f.larguras.map((w) => `assets/img/${f.arquivo}-${w}.webp ${w}w`).join(', ');
  return html`<img class="${classe}" src="assets/img/${f.arquivo}-${f.larguras.at(-1)}.webp" srcset="${srcset}" sizes="${sizes}" alt="${f.alt}" width="${f.proporcao[0]}" height="${f.proporcao[1]}"${prioridade ? raw(' fetchpriority="high"') : raw(' loading="lazy"')} decoding="async">`;
}

// Marcação visível só na versão de revisão. Na versão publicável não gera nada.
export function pendente(ctx, texto, { classe = '' } = {}) {
  if (!ctx.revisao) return '';
  return html`<div class="pendente ${classe}" role="note"><p class="pendente__rotulo">Pendente</p><p class="pendente__texto">${texto}</p></div>`;
}


// ---------- Formulários ----------

function campoTexto({ id, nome, rotulo, tipo = 'text', autocomplete, obrigatorio = true }) {
  return html`<div class="campo">
    <label class="campo__rotulo" for="${id}">${rotulo}</label>
    <input class="campo__entrada" id="${id}" name="${nome}" type="${tipo}"${obrigatorio ? raw(' required') : ''}${autocomplete ? html` autocomplete="${autocomplete}"` : ''}>
  </div>`;
}

function campoSelecao({ id, nome, rotulo, opcoes, obrigatorio = true }) {
  return html`<div class="campo">
    <label class="campo__rotulo" for="${id}">${rotulo}</label>
    <select class="campo__entrada campo__entrada--selecao" id="${id}" name="${nome}"${obrigatorio ? raw(' required') : ''}>
      <option value=""${obrigatorio ? raw(' disabled') : ''} selected></option>
      ${opcoes.map((o) => html`<option value="${o}">${o}</option>`)}
    </select>
  </div>`;
}

// Mensagens de estado do formulário (copy v1, §10 · Formulário — Mensagens de estado).
const MENSAGENS = {
  sucesso: 'Recebemos suas informações. O próximo passo é combinar a conversa inicial.',
  erro: 'Não foi possível enviar agora. Confira os campos e tente novamente.',
  validacao: 'Revise os campos destacados para continuar.',
};

// Regra da copy v2 (§C · Implementação de conversão): "Agendar" só quando o envio abre uma agenda real.
// Sem agenda configurada, o CTA promete o que a página faz: solicitar a conversa.
export function textoCta(ctx) {
  return ctx.config.agendaUrl ? 'Agendar conversa de diagnóstico' : 'Solicitar conversa';
}

export const DESAFIOS = [
  'Abrir novas contas ou mercados',
  'Conectar marketing e vendas',
  'Melhorar conversão comercial',
  'Medir aquisição e pipeline',
  'Expandir negócios na base',
  'Outro',
];

export function formConversa(ctx) {
  const p = 'form-conversa';
  const { formularios, agendaUrl, faixasFaturamento, faturamentoObrigatorio, privacidade } = ctx.config;
  return html`<form class="form" id="${p}" data-form novalidate${formularios.conversa ? html` data-endpoint="${formularios.conversa}"` : ''}${agendaUrl ? html` data-agenda="${agendaUrl}"` : ''}
    data-msg-sucesso="${MENSAGENS.sucesso}" data-msg-erro="${MENSAGENS.erro}" data-msg-validacao="${MENSAGENS.validacao}">
    <div class="form__campos">
      ${campoTexto({ id: `${p}-nome`, nome: 'nome', rotulo: 'Nome', autocomplete: 'name' })}
      ${campoTexto({ id: `${p}-email`, nome: 'email', rotulo: 'E-mail corporativo', tipo: 'email', autocomplete: 'email' })}
      ${campoTexto({ id: `${p}-empresa`, nome: 'empresa', rotulo: 'Empresa', autocomplete: 'organization' })}
      ${campoTexto({ id: `${p}-cargo`, nome: 'cargo', rotulo: 'Cargo', autocomplete: 'organization-title' })}
      ${campoSelecao({ id: `${p}-faturamento`, nome: 'faixa_faturamento', rotulo: 'Faixa de faturamento', opcoes: faixasFaturamento, obrigatorio: faturamentoObrigatorio })}
      ${campoSelecao({ id: `${p}-desafio`, nome: 'principal_desafio', rotulo: 'Principal desafio', opcoes: DESAFIOS })}
      ${campoTexto({ id: `${p}-whatsapp`, nome: 'whatsapp', rotulo: 'WhatsApp profissional (opcional)', tipo: 'tel', autocomplete: 'tel', obrigatorio: false })}
    </div>
    <div class="form__acoes">
      <button class="botao botao--primario" type="submit" data-cta-principal><span>${textoCta(ctx)}</span>${seta}</button>
      <p class="form__micro">Conversa inicial, sem compromisso de contratação.</p>
    </div>
    ${privacidade.texto ? html`<p class="form__privacidade">${privacidade.texto}${privacidade.url ? html` <a href="${privacidade.url}">${privacidade.rotuloLink || privacidade.url}</a>` : ''}</p>` : ''}
    <p class="form__status" data-status role="status" aria-live="polite" tabindex="-1"></p>
  </form>`;
}

// ---------- Casos (só aparecem quando houver casos validados em config.mjs) ----------
// Estrutura recomendada pela copy v2 (§C): contexto, obstáculo, ações, indicador e comparação.

export function exhibitCaso(caso, indice) {
  const n = String(indice + 1).padStart(2, '0');
  return html`<article class="exhibit revelar">
    <header class="exhibit__cabecalho"><span>Caso ${n}</span><span aria-hidden="true">·</span><span>${caso.segmento}</span></header>
    <h3 class="titulo-3 exhibit__nome">${caso.nome}</h3>
    <div class="exhibit__corpo">
      <div class="exhibit__bloco"><p class="exhibit__rotulo">Contexto</p><p>${caso.contexto}</p></div>
      <div class="exhibit__bloco"><p class="exhibit__rotulo">Obstáculo</p><p>${caso.obstaculo}</p></div>
      <div class="exhibit__bloco"><p class="exhibit__rotulo">Ações</p><p>${caso.acoes}</p></div>
      <div class="exhibit__bloco exhibit__bloco--resultado"><p class="exhibit__rotulo">Resultado</p>
        <p class="exhibit__numero">${caso.resultado.numero}</p><p class="exhibit__legenda">${caso.resultado.comparacao}</p></div>
    </div>
  </article>`;
}

export { md };
