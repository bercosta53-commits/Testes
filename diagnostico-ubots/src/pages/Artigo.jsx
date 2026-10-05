import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, X } from "lucide-react";
import MarcaUbots from "../components/MarcaUbots.jsx";
import useTitulo from "../components/useTitulo.js";
import { movimentoReduzido } from "../lib/movimento.js";

const CONTATO_URL = "https://ubots.com.br/contato";
const LIMIAR_BARRA = 0.4;

const SECOES = [
  { id: "resumo", titulo: "Resumo" },
  { id: "o-desafio", titulo: "O desafio" },
  { id: "como-o-agente-atuou", titulo: "Como o agente atuou" },
  { id: "resultados", titulo: "Resultados" },
  { id: "o-que-podemos-observar", titulo: "O que podemos observar" },
];

const RESULTADOS = [
  ["Período", "75 dias", "5 dias"],
  ["Equipe", "135 gerentes", "1 colaborador"],
  ["Contratos renegociados", "13", "6"],
  ["Valor renegociado", "R$ 46.228,00", "R$ 23.402,22"],
  ["Valor quitado", "R$ 23.566,20", "R$ 3.546,30"],
];

const destino = (ponto) => `/diagnostico?utm_content=${ponto}`;

const BOTAO =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-amarelo px-6 py-3 text-base font-semibold text-tinta transition-transform duration-150 hover:-translate-y-px";

/* Contorno pontilhado e etiqueta de cada ponto de entrada (modo apresentação). */
function Destaque({ ativo, rotulo, compacto, children }) {
  return (
    <div className="relative">
      <span
        aria-hidden={!ativo}
        className={`absolute -top-[19px] left-5 z-10 rounded-full bg-amarelo px-3 py-1 text-xs font-semibold text-tinta shadow-sm transition-opacity duration-200 ${ativo ? "opacity-100" : "invisible opacity-0"}`}
      >
        {rotulo}
      </span>
      <div
        className={`outline-dotted outline-[3px] ${compacto ? "rounded-[22px] outline-offset-[3px]" : "rounded-[26px] outline-offset-[7px]"}`}
        style={{ outlineColor: ativo ? "#E0A800" : "transparent", transition: "outline-color .2s ease" }}
      >
        {children}
      </div>
    </div>
  );
}

function Titulo({ id, children }) {
  return (
    <h2 id={id} tabIndex={-1} className="mb-4 mt-14 scroll-mt-6 text-[1.6rem] font-bold leading-tight tracking-[-0.02em] outline-none sm:text-[1.8rem]">
      {children}
    </h2>
  );
}

function Paragrafo({ children }) {
  return <p className="mb-5 text-[1.0625rem] leading-[1.75] text-[#2B2822]">{children}</p>;
}

/* Arte de capa: composição abstrata com as formas da marca. */
function Capa() {
  const gota = (x, y, s) =>
    `M ${x} ${y + s} L ${x} ${y + s / 2} A ${s / 2} ${s / 2} 0 0 1 ${x + s / 2} ${y} A ${s / 2} ${s / 2} 0 0 1 ${x + s} ${y + s / 2} A ${s / 2} ${s / 2} 0 0 1 ${x + s / 2} ${y + s} Z`;
  const barras = [70, 96, 84, 120, 236];
  return (
    <svg viewBox="0 0 1200 560" aria-hidden="true" className="block h-auto w-full">
      <rect width="1200" height="560" fill="#FFC800" />
      <path d={gota(760, 120, 520)} fill="#141414" />
      <path d={gota(-60, -150, 340)} fill="#FFF4C7" />
      <circle cx="1040" cy="96" r="34" fill="#FFFBEF" />
      <g transform="translate(140 150)">
        <rect width="560" height="300" rx="28" fill="#FFFFFF" />
        <rect x="40" y="248" width="480" height="3" rx="1.5" fill="#ECE4CF" />
        {barras.map((h, i) => (
          <rect key={i} x={56 + i * 96} y={248 - h} width="56" height={h} rx="12" fill={i === barras.length - 1 ? "#FFC800" : "#141414"} />
        ))}
        <path d={gota(436, -36, 72)} fill="#141414" />
        <path d="M 456 0 l 12 12 l 22 -26" stroke="#FFC800" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default function Artigo() {
  useTitulo("IA na recuperação de crédito: a experiência do Sicoob Crediauc | Ubots");
  const [mostrar, setMostrar] = useState(false);
  const [barraVisivel, setBarraVisivel] = useState(false);
  const [barraFechada, setBarraFechada] = useState(false);
  const [ativa, setAtiva] = useState(SECOES[0].id);

  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total >= LIMIAR_BARRA) setBarraVisivel(true);
      let atual = SECOES[0].id;
      for (const s of SECOES) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.3) atual = s.id;
      }
      setAtiva(atual);
    };
    const aoRolar = () => { if (!quadro) quadro = requestAnimationFrame(medir); };
    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  const irPara = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: movimentoReduzido() ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
  };

  const exibirBarra = barraVisivel && !barraFechada;

  return (
    <div className={exibirBarra ? "pb-44 sm:pb-28" : ""}>
      {/* Controle da apresentação (fora do layout do blog) */}
      <div className="bg-tinta text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2.5 sm:px-8">
          <Link to="/" className="foco-claro whitespace-nowrap rounded-md py-1 text-xs text-white/70 hover:text-white sm:text-sm">
            Protótipo On Nest
          </Link>
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            className={`foco-claro inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${mostrar ? "border-amarelo bg-amarelo text-tinta" : "border-white/30 text-white hover:border-amarelo"}`}
          >
            {mostrar ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            {mostrar ? "Ocultar pontos de entrada" : "Mostrar pontos de entrada"}
          </button>
        </div>
      </div>

      <header className="border-b border-linha">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-5 sm:px-8">
          <MarcaUbots />
          <span aria-hidden="true" className="h-5 w-px bg-linha" />
          <span className="text-sm font-semibold text-apagado">Blog</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:grid lg:grid-cols-[200px_minmax(0,680px)] lg:justify-center lg:gap-16">
        <nav aria-label="Índice" className="hidden lg:block">
          <div className="sticky top-8 pt-2">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-apagado">Índice</p>
            <ol className="flex flex-col gap-1 border-l-2 border-linha">
              {SECOES.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => irPara(e, s.id)}
                    aria-current={ativa === s.id ? "location" : undefined}
                    className={`-ml-[2px] block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors ${ativa === s.id ? "border-amarelo font-semibold text-tinta" : "border-transparent text-apagado hover:text-tinta"}`}
                  >
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <main>
          <article>
            <span className="inline-block rounded-full bg-amarelo-suave px-3 py-1 text-xs font-semibold text-tinta ring-1 ring-amarelo">
              Recuperação de crédito
            </span>
            <h1 className="mt-5 text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[2.6rem]">
              IA na recuperação de crédito: a experiência do Sicoob Crediauc na renegociação de dívidas complexas
            </h1>
            <p className="mt-5 text-sm text-apagado">Por Ubots. 6 min de leitura.</p>

            <figure className="mt-8 overflow-hidden rounded-3xl">
              <Capa />
            </figure>

            <section id="resumo" tabIndex={-1} aria-label="Resumo" className="mt-10 scroll-mt-6 rounded-2xl bg-amarelo-suave p-6 outline-none ring-1 ring-amarelo sm:p-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-tinta">Resumo</p>
              <p className="text-[1.0625rem] leading-[1.7] text-tinta">
                Nos últimos 5 dias da campanha Desenrola Brasil, o Sicoob Crediauc colocou um agente de IA da Ubots para conduzir negociações pelo WhatsApp. Com um colaborador acompanhando a operação, foram renegociados R$ 23,4 mil. Nos 75 dias anteriores, 135 gerentes haviam renegociado R$ 46,2 mil.
              </p>
            </section>

            <section aria-labelledby="o-desafio">
              <Titulo id="o-desafio">O desafio</Titulo>
              <Paragrafo>
                A Crediauc tem mais de 92 mil cooperados e oferecia diferentes condições de renegociação durante a campanha. Parte das dívidas, porém, exigia uma análise mais detalhada: havia clientes com vários produtos em atraso e necessidade de ajustar parcelas e prazos caso a caso.
              </Paragrafo>
              <Paragrafo>
                Esse tipo de negociação exigia bastante tempo dos gerentes. Como a equipe também precisava atender outras demandas das agências e da operação, a capacidade de avançar sobre essa carteira era limitada.
              </Paragrafo>
            </section>

            <section aria-labelledby="como-o-agente-atuou">
              <Titulo id="como-o-agente-atuou">Como o agente atuou</Titulo>
              <Paragrafo>
                O agente iniciava a conversa pelo WhatsApp, entendia a capacidade de pagamento do cooperado e estruturava uma proposta dentro das políticas definidas pela cooperativa.
              </Paragrafo>
              <Paragrafo>
                Quando a negociação precisava de uma avaliação específica, o colaborador recebia a conversa com o histórico já organizado e podia assumir o atendimento a partir dali.
              </Paragrafo>
              <Paragrafo>
                O WhatsApp também permitia que o cooperado respondesse no momento mais conveniente, mantendo a negociação em andamento sem depender de uma ligação em horário comercial.
              </Paragrafo>
            </section>

            <section aria-labelledby="resultados">
              <Titulo id="resultados">Resultados</Titulo>
              <div className="overflow-x-auto rounded-2xl border border-linha bg-white">
                <table className="w-full border-collapse text-left text-sm sm:text-[0.95rem]">
                  <thead>
                    <tr className="border-b border-linha">
                      <th scope="col" className="px-3 py-3 font-semibold text-apagado sm:px-5">Indicador</th>
                      <th scope="col" className="px-3 py-3 font-semibold text-apagado sm:px-5">Operação humana</th>
                      <th scope="col" className="bg-amarelo-suave px-3 py-3 font-semibold sm:px-5">Agente de IA + 1 colaborador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RESULTADOS.map(([indicador, humano, ia], i) => (
                      <tr key={indicador} className={i < RESULTADOS.length - 1 ? "border-b border-linha" : ""}>
                        <th scope="row" className="px-3 py-3 font-semibold sm:px-5">{indicador}</th>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums sm:px-5">{humano}</td>
                        <td className="whitespace-nowrap bg-amarelo-suave/60 px-3 py-3 font-semibold tabular-nums sm:px-5">{ia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-apagado">Fonte: Sicoob Crediauc e Ubots.</p>

              {/* Ponto de entrada 1 · variante A */}
              <div className="mt-12">
                <Destaque ativo={mostrar} rotulo="Ponto de entrada 1 · Após os resultados">
                  <aside aria-labelledby="pe1-titulo" className="relative overflow-hidden rounded-[20px] border border-linha bg-white p-6 sm:p-8">
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-amarelo" />
                    <h2 id="pe1-titulo" className="text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">
                      Qual seria o potencial da IA na sua operação de recuperação?
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-apagado">
                      Responda 10 perguntas sobre a sua operação e receba uma estimativa aplicada à sua carteira.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                      <Link to={destino("pos-tabela")} className={BOTAO}>
                        Fazer o diagnóstico <ArrowRight size={18} aria-hidden="true" />
                      </Link>
                      <span className="text-center text-sm text-apagado sm:text-left">Cerca de 2 minutos. Sem custo.</span>
                    </div>
                  </aside>
                </Destaque>
              </div>
            </section>

            <section aria-labelledby="o-que-podemos-observar">
              <Titulo id="o-que-podemos-observar">O que podemos observar</Titulo>
              <Paragrafo>
                A experiência mostra um uso bastante prático da IA na recuperação de crédito: o agente pode assumir etapas operacionais da negociação, organizar informações e manter as conversas em andamento.
              </Paragrafo>
              <Paragrafo>
                Com isso, a equipe consegue dedicar mais atenção aos casos que exigem análise, decisão ou negociação personalizada.
              </Paragrafo>
              <Paragrafo>
                Outro ponto relevante é a possibilidade de construir a proposta a partir da capacidade de pagamento informada pelo próprio cooperado, dentro das regras definidas pela instituição.
              </Paragrafo>
            </section>

            {/* Ponto de entrada 2 · fim do artigo */}
            <div className="mt-12">
              <Destaque ativo={mostrar} rotulo="Ponto de entrada 2 · Fim do artigo">
                <aside aria-labelledby="pe2-titulo" className="relative overflow-hidden rounded-[20px] bg-tinta p-7 text-white sm:p-10">
                  <span aria-hidden="true" className="absolute -bottom-20 -right-20 hidden h-44 w-44 bg-amarelo opacity-90 sm:block"
                    style={{ borderRadius: "50% 50% 50% 0" }} />
                  <div className="relative">
                    <h2 id="pe2-titulo" className="max-w-md text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[1.9rem]">
                      Veja como esse cenário se aplicaria à sua carteira
                    </h2>
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">
                      Em cerca de 2 minutos, o diagnóstico estima o potencial da IA na sua operação e indica os principais pontos para estruturar um piloto.
                    </p>
                    <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                      <Link to={destino("cta-final")} className={`${BOTAO} foco-claro`}>
                        Fazer o diagnóstico <ArrowRight size={18} aria-hidden="true" />
                      </Link>
                      <a href={CONTATO_URL} target="_blank" rel="noopener noreferrer"
                        className="foco-claro self-center rounded-md px-1 py-2 text-sm font-semibold text-white underline decoration-amarelo decoration-2 underline-offset-4 hover:text-amarelo sm:self-auto">
                        Prefiro falar com um especialista
                      </a>
                    </div>
                  </div>
                </aside>
              </Destaque>
            </div>
          </article>
        </main>
      </div>

      <footer className="border-t border-linha">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <MarcaUbots />
        </div>
      </footer>

      {/* Ponto de entrada 3 · barra fixa após 40% de rolagem */}
      {exibirBarra && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-4 sm:pb-4 motion-safe:animate-[sobe_.35s_cubic-bezier(.2,.8,.2,1)]">
          <div className="relative mx-auto max-w-[1000px]">
            <Destaque ativo={mostrar} rotulo="Ponto de entrada 3 · Barra fixa" compacto>
              <aside aria-labelledby="pe3-texto"
                className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 rounded-[20px] bg-tinta py-3 pl-5 pr-3 text-white shadow-[0_16px_40px_-12px_rgba(20,20,20,0.5)] sm:flex sm:gap-4">
                <p id="pe3-texto" className="text-sm font-semibold leading-snug sm:flex-1 sm:text-[0.95rem]">
                  <span className="md:hidden">Qual seria o potencial da IA na sua operação?</span>
                  <span className="hidden md:inline">Qual seria o potencial da IA na sua operação? Faça o diagnóstico em 2 minutos.</span>
                </p>
                <button type="button" onClick={() => setBarraFechada(true)} aria-label="Fechar convite"
                  className="foco-claro col-start-2 row-start-1 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white sm:order-last">
                  <X size={20} aria-hidden="true" />
                </button>
                <Link to={destino("barra-fixa")} className={`${BOTAO} foco-claro col-span-2 min-h-[44px] py-2.5 text-[0.95rem] sm:col-span-1`}>
                  Fazer o diagnóstico <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </aside>
            </Destaque>
          </div>
        </div>
      )}
    </div>
  );
}
