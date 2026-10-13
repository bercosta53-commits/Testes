import { ArrowRight, BarChart3, Check, ChevronRight, ClipboardCheck, Clock3, ShieldCheck, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { perguntas } from "../lib/dados";
import { usePageTitle } from "../lib/util";

const FOTO = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85";
const raiz = "mx-auto w-full max-w-[1120px] px-5 sm:px-8";
const destino = "/diagnostico?utm_content=lp-nova";
const tipos = perguntas[0].opcoes;

const entregas = [
  { icon: BarChart3, titulo: "Potencial de negociação", texto: "Capacidade atual x cenário estimado com IA." },
  { icon: Target, titulo: "Prontidão da operação", texto: "Avaliação em 5 dimensões, com prioridades." },
  { icon: ClipboardCheck, titulo: "Plano para avançar", texto: "Três próximos passos específicos para você." },
];

function OpcaoInicial({ opcao }) {
  return (
    <Link
      to={"/diagnostico?tipo=" + encodeURIComponent(opcao.value) + "&utm_content=lp-pergunta-1"}
      className="group flex min-h-[54px] items-center justify-between gap-4 rounded-xl border border-[#E7E4DD] bg-white px-4 py-3 text-left text-[14px] font-semibold leading-[1.4] text-[#202020] transition-all duration-150 hover:-translate-y-px hover:border-[#FFC800] hover:bg-[#FFFAEB] hover:shadow-[0_5px_16px_-12px_rgba(0,0,0,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] sm:text-[15px]"
    >
      <span>{opcao.label}</span>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#DEDAD0] text-[#867D6D] transition group-hover:border-[#FFC800] group-hover:bg-[#FFC800] group-hover:text-black">
        <ChevronRight size={15} strokeWidth={2.2} aria-hidden="true" />
      </span>
    </Link>
  );
}

export default function LandingPage() {
  usePageTitle("Diagnóstico de recuperação de crédito com IA | Ubots");

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#161616]">
      <header className="border-b border-[#EEEBE4] bg-white">
        <div className={raiz + " flex h-[68px] items-center justify-between gap-4"}>
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden h-5 w-px bg-[#E5E1D8] sm:block" aria-hidden="true" />
            <span className="hidden text-xs font-semibold text-[#736B60] sm:block">Diagnóstico de crédito com IA</span>
          </div>
          <a href="#iniciar" className="inline-flex min-h-[38px] items-center gap-2 rounded-full bg-[#FFC800] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#F1BA00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
            Fazer diagnóstico <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main>
        {/* A primeira pergunta fica SEMPRE acima da dobra no desktop e vem logo depois do título no celular. */}
        <section className={raiz + " grid items-center gap-8 py-9 sm:gap-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(385px,445px)] lg:gap-[72px] lg:py-[76px]"}>
          <div className="max-w-[550px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F2E4B6] bg-[#FFF3C9] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#615026]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#FFBE00]" aria-hidden="true" />
              Ferramenta gratuita para instituições financeiras
            </div>

            <h1 className="max-w-[560px] text-[clamp(2.15rem,4.15vw,3.45rem)] font-bold leading-[1.1] tracking-[-.043em] [text-wrap:balance]">
              Qual o potencial da <span className="bg-[linear-gradient(transparent_68%,#FFC800_68%,#FFC800_89%,transparent_89%)]">IA na sua recuperação de crédito?</span>
            </h1>
            <p className="mt-5 max-w-[470px] text-[16px] leading-[1.6] text-[#605B54] sm:text-[17px]">
              Descubra o que sua equipe consegue negociar hoje, onde a IA pode ajudar e o que falta para começar.
            </p>

            <div className="mt-7 grid max-w-[470px] grid-cols-3 gap-2.5 sm:gap-3">
              {[
                ["01", "Potencial"],
                ["02", "Prontidão"],
                ["03", "Próximos passos"],
              ].map(([num, texto]) => (
                <div key={num} className="rounded-xl border border-[#EBE6DA] bg-white px-3 py-3.5 sm:px-4">
                  <div className="text-[11px] font-bold tracking-wide text-[#B38C16]">{num}</div>
                  <p className="mt-1 text-xs font-bold leading-snug sm:text-sm">{texto}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-[#756E64] sm:text-[13px]">
              <span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden="true" /> Cerca de 2 minutos</span>
              <span className="inline-flex items-center gap-1.5"><Check size={15} aria-hidden="true" /> 10 perguntas</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} aria-hidden="true" /> Sem custo</span>
            </div>
          </div>

          <section
            id="iniciar"
            aria-labelledby="pergunta-inicial"
            className="scroll-mt-5 overflow-hidden rounded-[22px] border border-[#E7E2D7] bg-white shadow-[0_20px_56px_-28px_rgba(24,24,24,.32)]"
          >
            <div className="flex items-center justify-between gap-3 bg-[#FFC800] px-5 py-4 sm:px-6">
              <span className="text-xs font-extrabold uppercase tracking-[.065em]">Comece seu diagnóstico</span>
              <span className="rounded-full bg-[#141414] px-3 py-1 text-[11px] font-bold tracking-wide text-white">1 de 10</span>
            </div>
            <div className="px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
              <div className="mb-5 flex gap-[5px]" role="progressbar" aria-label="Progresso inicial do diagnóstico" aria-valuemin={0} aria-valuemax={10} aria-valuenow={1}>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={"h-[5px] flex-1 rounded-full " + (i === 0 ? "bg-[#161616]" : "bg-[#EAE7E0]")} />
                ))}
              </div>
              <h2 id="pergunta-inicial" className="max-w-[335px] text-[22px] font-bold leading-[1.24] tracking-[-.024em] [text-wrap:balance] sm:text-[23px]">
                Que tipo de instituição você representa?
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#7B746B]">Escolha uma opção para começar.</p>
              <div className="mt-5 grid gap-[9px]">
                {tipos.map((opcao) => <OpcaoInicial key={opcao.value} opcao={opcao} />)}
              </div>
              <div className="mt-5 flex items-start gap-2 border-t border-[#F0EDE6] pt-4 text-[11px] leading-relaxed text-[#777168]">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                Resultado disponível após as respostas e o preenchimento dos seus dados profissionais.
              </div>
            </div>
          </section>
        </section>

        {/* Resultado explicado em uma olhada. */}
        <section className="border-y border-[#EBE8E1] bg-white py-12 sm:py-14">
          <div className={raiz}>
            <div className="mb-6 max-w-[700px]">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#AA8314]">O que você recebe</p>
              <h2 className="text-[clamp(1.7rem,3vw,2.25rem)] font-bold leading-tight tracking-[-.03em]">
                Respostas práticas para decidir melhor.
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6C665C]">Uma análise adaptada à sua carteira — não apenas uma pontuação.</p>
            </div>
            <div className="grid gap-3.5 md:grid-cols-3">
              {entregas.map(({ icon: Icon, titulo, texto }) => (
                <article key={titulo} className="flex items-start gap-4 rounded-2xl border border-[#EBE8E1] bg-[#FCFBF8] p-5 sm:p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FFF0B4] text-[#161616]">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold leading-[1.4]">{titulo}</h3>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-[#6D665C]">{texto}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Uma foto editorial de pessoas, com prova do case sem tratar correlação como causalidade. */}
        <section className="bg-[#191919] py-12 text-white sm:py-16">
          <div className={raiz + " grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:gap-12"}>
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.12em] text-[#FFC800]">Aplicação real · Sicoob Crediauc</p>
              <h2 className="max-w-[510px] text-[clamp(1.7rem,2.9vw,2.35rem)] font-bold leading-[1.2] tracking-[-.033em] [text-wrap:balance]">
                IA apoia a equipe. Pessoas seguem no centro.
              </h2>
              <p className="mt-3 max-w-[520px] text-[14px] leading-[1.7] text-white/70">
                No Desenrola Brasil, um agente da Ubots apoiou negociações pelo WhatsApp com acompanhamento humano.
              </p>
              <div className="mt-6 grid max-w-[480px] grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-[#262626] px-4 py-4">
                  <p className="text-[clamp(1.45rem,2.4vw,1.9rem)] font-bold tracking-tight text-[#FFC800]">R$ 23,4 mil</p>
                  <p className="mt-1 text-xs leading-snug text-white/75">Renegociados em 5 dias</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#262626] px-4 py-4">
                  <p className="text-[clamp(1.45rem,2.4vw,1.9rem)] font-bold tracking-tight text-[#FFC800]">6 contratos</p>
                  <p className="mt-1 text-xs leading-snug text-white/75">Na campanha acompanhada</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-white/45">Resultado de um caso específico, não uma promessa de desempenho.</p>
            </div>
            <figure className="overflow-hidden rounded-2xl border border-white/10 bg-[#303030]">
              <img src={FOTO} alt="Profissionais colaborando em uma equipe" className="h-[220px] w-full object-cover sm:h-[305px]" loading="lazy" />
              <figcaption className="px-4 py-2 text-[10px] text-white/50">Fotografia ilustrativa, não um registro do case.</figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-[#FAF9F6] py-10 sm:py-12">
          <div className={raiz + " flex flex-col items-start gap-5 rounded-2xl border border-[#EAE4D8] bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-8"}>
            <div>
              <h2 className="text-[21px] font-bold leading-snug tracking-[-.02em] sm:text-[24px]">Pronto para conhecer sua operação?</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6B6558]">Dez respostas mostram por onde começar.</p>
            </div>
            <a href="#iniciar" className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFC800] px-6 py-3 text-[13px] font-bold text-[#141414] transition hover:bg-[#F2BF0C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#141414]">
              Iniciar diagnóstico <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className={raiz + " flex flex-wrap items-center justify-between gap-4 border-t border-[#E9E5DB] py-6"}>
        <Logo />
        <p className="max-w-xl text-[11px] leading-relaxed text-[#817A70]">
          Estimativas baseadas nas respostas, não garantias. Valor renegociado não equivale a valor recebido.
        </p>
      </footer>
    </div>
  );
}
