import { config } from "./config";
import {
  aplicarTermos,
  dimensoes,
  niveis,
  nomePorDimensao,
  numeroDaResposta,
  ordemPrioridade,
  passoIntegracao,
  passosGerais,
  passosPorDimensao,
  perguntas,
  pontosDaResposta,
  pontosMax,
  pontosMaxDaPergunta,
  respondeuNaoSei,
} from "./dados";
import {
  duracao,
  faixaDuracao,
  faixaMoeda,
  faixaNumero,
  moeda,
  numero,
  numeroAprox,
} from "./formatar";

const CAMPOS_NUMERICOS = ["pessoas", "contratos", "ticket", "ritmo"];

/** Rótulo da opção escolhida em uma pergunta (ou o número formatado). */
export const rotuloResposta = (idPergunta, valor) =>
  perguntas.find((p) => p.id === idPergunta)?.opcoes.find((o) => o.value === valor)?.label ??
  (typeof valor === "number" ? numero(valor) : "");

/** Valores numéricos das 4 perguntas de operação (resolve faixas abertas e "Não sei"). */
export const numerica = (r) => ({
  pessoas: numeroDaResposta("pessoas", r.pessoas),
  contratos: numeroDaResposta("contratos", r.contratos),
  ticket: numeroDaResposta("ticket", r.ticket),
  ritmo: numeroDaResposta("ritmo", r.ritmo),
});

/** Cálculo numérico: pontuação, nível e capacidade com/sem IA. null se faltar resposta. */
export function calcular(resp) {
  if ([...CAMPOS_NUMERICOS, ...dimensoes.map((d) => d.id)].some((id) => resp[id] === undefined)) {
    return null;
  }
  const r = numerica(resp);
  const pontos = dimensoes.reduce((s, d) => s + pontosDaResposta(d.id, resp[d.id]), 0);
  const nivel = niveis.find((n) => pontos <= n.max) || niveis[niveis.length - 1];
  const atual = r.pessoas * r.ritmo * config.diasUteisMes;
  const ia = [atual * nivel.mult[0], atual * nivel.mult[1]];
  const limitar = (n) => Math.min(n, r.contratos);
  const valorHoje = limitar(atual) * r.ticket;
  const valorIA = [limitar(ia[0]) * r.ticket, limitar(ia[1]) * r.ticket];
  return {
    pontos,
    nivel,
    atual,
    ia,
    filaCoberta: atual >= r.contratos,
    mesesHoje: r.contratos / atual,
    mesesIA: [r.contratos / ia[1], r.contratos / ia[0]],
    valorHoje,
    valorIA,
    extra: [valorIA[0] - valorHoje, valorIA[1] - valorHoje],
  };
}

function juntarComE(itens) {
  return itens.map((i) => nomePorDimensao[i.id]).join(", ").replace(/, ([^,]*)$/, " e $1");
}

/** Análise completa exibida no resultado (e reconstruída no painel). */
export function analisar(r) {
  const res = calcular(r);
  if (!res) return null;
  const nivel = res.nivel.nome;

  const num = numerica(r);
  const dims = dimensoes.map((d) => ({
    id: d.id,
    nome: d.dim,
    pontos: pontosDaResposta(d.id, r[d.id]),
    max: pontosMaxDaPergunta(d),
    resposta: rotuloResposta(d.id, r[d.id]),
    leitura: aplicarTermos(d.leituras[r[d.id]] ?? "", r.tipo),
  }));

  const fracas = dims
    .filter((d) => d.pontos < 2)
    .sort((a, b) => a.pontos - b.pontos || ordemPrioridade.indexOf(a.id) - ordemPrioridade.indexOf(b.id));
  const critico = fracas[0] || null;
  // Sem política, autorização e acesso aos dados (pontos 0 ou 1) o agente não negocia.
  const bloqueios = fracas.filter((d) => ["politica", "consentimento", "integracao"].includes(d.id));

  const resumo = aplicarTermos(
    {
      "Preparar a base": `Antes do agente, vale organizar ${juntarComE(fracas.slice(0, 2))}.`,
      "Pronta para piloto": bloqueios.length
        ? `{Inst} pode testar um agente numa campanha depois de resolver ${juntarComE(bloqueios)}.`
        : "{Inst} já tem o essencial para testar um agente em uma campanha.",
      "Pronta para escalar": critico
        ? `{Inst} tem quase toda a base pronta. Antes da operação contínua, resolva ${nomePorDimensao[critico.id]}.`
        : "Regras, canal e dados {daInst} estão maduros. O agente pode entrar na operação contínua.",
    }[nivel],
    r.tipo,
  );

  const gerais = nivel === "Pronta para escalar" ? [passoIntegracao, ...passosGerais.slice(1)] : passosGerais;
  const passos = [
    ...fracas.map((d) => ({
      rotulo: d.nome,
      texto: aplicarTermos(passosPorDimensao[d.id].texto, r.tipo),
      pronto: aplicarTermos(passosPorDimensao[d.id].pronto, r.tipo),
    })),
    ...gerais,
  ].slice(0, 3);

  const cta = {
    "Preparar a base": {
      titulo: "Quer organizar esses pontos com a Ubots?",
      texto: "O time da Ubots pode revisar o diagnóstico com você e indicar por onde começar antes de um piloto.",
    },
    "Pronta para piloto": {
      titulo: aplicarTermos("Quer desenhar o piloto {daInst}?", r.tipo),
      texto: "O time da Ubots pode revisar o diagnóstico com você e definir carteira, prazo e indicadores para um piloto de 5 a 15 dias.",
    },
    "Pronta para escalar": {
      titulo: "Quer levar o agente para a operação contínua?",
      texto: "O time da Ubots pode avaliar com você a integração e os critérios de transbordo para a equipe.",
    },
  }[nivel];

  return {
    res,
    nivel,
    pontos: res.pontos,
    pontosMax,
    resumo,
    dims,
    critico,
    passos,
    cta,
    capacidadeHoje: numeroAprox(res.atual),
    capacidadeIA: faixaNumero(res.ia[0], res.ia[1], numeroAprox),
    tempoHoje: duracao(res.mesesHoje),
    tempoIA: faixaDuracao(res.mesesIA),
    valorHoje: moeda(res.valorHoje),
    valorIA: faixaMoeda(res.valorIA),
    extra: res.extra[1] > 0 ? faixaMoeda(res.extra) : null,
    saldo: moeda(num.contratos * num.ticket),
    contratos: numeroAprox(num.contratos),
    aproximada: respondeuNaoSei(r),
  };
}

/** Frase de capacidade usada na transição entre as partes do quiz. */
export const capacidadeMensal = (r) => {
  const n = numerica(r);
  return numeroAprox(n.pessoas * n.ritmo * config.diasUteisMes);
};

// ---- Validação do formulário de captura ----
export const formularioVazio = { nome: "", email: "", fone: "", instituicao: "", area: "", aceite: false };

export function validarFormulario(form, campoInstituicao) {
  const erros = {};
  if (form.nome.trim().length < 2) erros.nome = "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    erros.email = "Informe um e-mail válido, como nome@instituicao.com.br.";
  }
  const digitos = form.fone.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11) erros.fone = "Informe o WhatsApp com DDD.";
  if (form.instituicao.trim().length < 2) {
    erros.instituicao = `Informe o ${campoInstituicao.charAt(0).toLowerCase()}${campoInstituicao.slice(1)}.`;
  }
  if (!form.area) erros.area = "Selecione a sua área de atuação.";
  if (!form.aceite) erros.aceite = "Marque a autorização para ver o diagnóstico.";
  return erros;
}

export const lerUtms = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const utms = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
      if (params.get(k)) utms[k] = params.get(k);
    });
    return utms;
  } catch {
    return {};
  }
};
