import { ArrowRight, ArrowUpRight, BarChart3, Check, ClipboardCheck, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { perguntas } from "../lib/dados";
import { usePageTitle } from "../lib/util";

const urlDiagnostico = "/diagnostico?utm_content=lp-direto";
const fotoEquipe = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85";

const beneficios = [
  {
    icon: BarChart3,
    nome: "Capacidade e potencial",
    descricao: "Renegociações por mês, prazo da carteira e projeção de valor negociado.",
  },
  {
    icon: ClipboardCheck,
    nome: "Prontidão para IA",
    descricao: "Sua operação avaliada em 5 dimensões, com pontos de atenção.",
  },
  {
    icon: Sparkles,
    nome: "Próximos passos",
    descricao: "O que priorizar para preparar a base, testar ou escalar.",
  },
];

function LinkParaPergunta({ opcao }) {
  const destino = "/diagnostico?tipo=" + encodeURIComponent(opcao.value) + "&utm_content=lp-inicio";
  return (
    <Link
      to={destino}
      className="group flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-[#E8E5DB] bg-white px-4 py-3 text-left text-[15px] font-semibold leading-snug text-[#242424] transition-colors duration-150 hover:border-[#141414] hover:bg-[#FFF8DF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"
    >
      <span>{opcao.label}</span>
      <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#DEDACF] transition-colors group-hover:border-[#141414] group-hover:bg-[#FFC800]">
        <ArrowRight size={15} />
      </span>
    </Link>
  );
}

export default function LandingPage() {
  usePageTitle("Diagnóstico de recuperação de crédito com IA | Ubots");

  return (
    <div className="min-h-screen bg-[#FFFBEF] text-[#141414]">
      <header className="border-b border-[#EEE7D6] bg-[#FFFBEF]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5">
          <Logo />
          <div className="flex items-center gap-5">
            <a href="#o-que-voce-recebe" className="hidden text-sm font-semibold text-[#605B52] hover:text-[#141414] sm:block">O que você recebe</a>
            <a href="#iniciar" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#141414] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#383838] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]">
              Começar <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-start gap-9 px-5 pb-12 pt-9 sm:px-8 sm:pb-16 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.9fr)] lg:items-center lg:gap-16 lg:pb-20 lg:pt-16">
          <div className="max-w-[590px]">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.11em] text-[#615B4F]">
              <span className="h-2 w-2 rounded-full bg-[#FFC800]" aria-hidden="true" />
              Diagnóstico gratuito de recuperação de crédito
            </p>
            <h1 className="max-w-xl text-[clamp(2.1rem,4.1vw,3.5rem)] font-bold leading-[1.13] tracking-[-.042em] [text-wrap:balance]">
              Sua operação está pronta para <span className="bg-[linear-gradient(transparent_65%,#FFC800_65%,#FFC800_88%,transparent_88%)]">negociar mais com IA?</span>
            </h1>
            <p className="mt-5 max-w-[510px] text-[16px] leading-[1.65] text-[#555047] sm:text-[18px]">
              Descubra o potencial da sua carteira, os gargalos da operação e por onde começar. Um diagnóstico feito para a realidade da sua instituição.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#49453E]">
              <span className="inline-flex items-center gap-2"><Check size={16} strokeWidth={3} className="text-[#987300]"/> Potencial estimado</span>
              <span className="inline-flex items-center gap-2"><Check size={16} strokeWidth={3} className="text-[#987300]"/> Prontidão para IA</span>
              <span className="inline-flex items-center gap-2"><Check size={16} strokeWidth={3} className="text-[#987300]"/> Plano de ação</span>
            </div>
            <div className="mt-7 flex items-center gap-2 text-sm text-[#6B6558]">
              <Clock3 size={17} aria-hidden="true"/> 10 perguntas · Cerca de 2 minutos · Sem custo
            </div>
          </div>

          <section id="iniciar" aria-labelledby="inicio-titulo" className="scroll-mt-5 overflow-hidden rounded-[22px] border border-[#E5DDC9] bg-white shadow-[0_18px_55px_-28px_rgba(20,20,20,.25)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#EEEAE0] bg-[#FFF7DA] px-5 py-4 sm:px-6">
              <span className="text-xs font-bold uppercase tracking-[.1em] text-[#514736]">Seu diagnóstico começa aqui</span>
              <span className="rounded-full bg-[#141414] px-3 py-1 text-xs font-bold text-white">01 / 10</span>
            </div>
            <div className="px-5 pb-6 pt-6 sm:px-6 sm:pb-7">
              <div className="mb-5 flex gap-1" aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => <span key={i} className={"h-1.5 flex-1 rounded-full " + (i === 0 ? "bg-[#141414]" : "bg-[#EFEDE5]")} />)}
              </div>
              <h2 id="inicio-titulo" className="max-w-[360px] text-[22px] font-bold leading-tight tracking-[-.025em] sm:text-2xl">
                Para começar, qual instituição você representa?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6B6558]">Escolha uma opção para iniciar o diagnóstico.</p>
              <div className="mt-5 grid gap-2.5">
                {perguntas[0].opcoes.map((opcao) => <LinkParaPergunta key={opcao.value} opcao={opcao} />)}
              </div>
              <p className="mt-5 flex items-center gap-2 border-t border-[#F0EDE6] pt-4 text-xs text-[#736E64]">
                <ShieldCheck size={15} aria-hidden="true" /> Respostas usadas para personalizar sua análise.
              </p>
            </div>
          </section>
        </section>

        <section id="o-que-voce-recebe" className="scroll-mt-5 border-y border-[#EEEAE0] bg-white py-12 sm:py-14">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.11em] text-[#857B64]">O resultado</p>
                <h2 className="text-[clamp(1.65rem,3vw,2.3rem)] font-bold leading-tight tracking-[-.025em]">O que você vai descobrir</h2>
              </div>
              <span className="text-sm text-[#736E64]">Uma análise prática, não apenas uma pontuação.</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {beneficios.map(({ icon: Icon, nome, descricao }) => (
                <article key={nome} className="flex gap-4 rounded-2xl border border-[#EDE9DE] bg-[#FFFEFA] p-5 sm:p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1B7]"><Icon size={20} aria-hidden="true"/></span>
                  <div>
                    <h3 className="text-base font-bold leading-snug">{nome}</h3>
                    <p className="mt-1.5 text-sm leading-[1.6] text-[#635E55]">{descricao}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
          <figure className="overflow-hidden rounded-[20px] bg-[#EAE5DB]">
            <img src={fotoEquipe} alt="Profissionais colaborando em uma mesa de trabalho" loading="lazy" className="h-[220px] w-full object-cover sm:h-[270px]" />
            <figcaption className="px-3 py-2 text-xs text-[#6B6558]">Imagem ilustrativa · Tecnologia a serviço de conversas mais humanas.</figcaption>
          </figure>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.11em] text-[#756C59]">Aplicação real · Sicoob Crediauc</p>
            <h2 className="max-w-lg text-[clamp(1.65rem,2.8vw,2.2rem)] font-bold leading-tight tracking-[-.025em]">
              IA no apoio à equipe. Pessoas no centro da negociação.
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-[1.7] text-[#5C564C]">
              Na campanha Desenrola Brasil, um agente da Ubots apoiou negociações pelo WhatsApp, com acompanhamento humano.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E9E1CF] bg-white p-4">
                <p className="text-[clamp(1.4rem,2.6vw,2rem)] font-bold tracking-tight">R$ 23,4 mil</p>
                <p className="mt-1 text-xs text-[#635E55]">Renegociados em 5 dias</p>
              </div>
              <div className="rounded-xl border border-[#E9E1CF] bg-white p-4">
                <p className="text-[clamp(1.4rem,2.6vw,2rem)] font-bold tracking-tight">6 contratos</p>
                <p className="mt-1 text-xs text-[#635E55]">Na campanha acompanhada</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#817B70]">Resultado de um caso específico; não representa garantia para outras instituições.</p>
          </div>
        </section>

        <section className="bg-[#141414] py-11 text-white sm:py-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-10">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#FFC800]">Próximo passo</p>
              <h2 className="max-w-xl text-2xl font-bold leading-tight tracking-[-.025em] sm:text-[28px]">Seu diagnóstico começa com uma resposta.</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Entenda a capacidade da sua operação e o caminho para avançar.</p>
            </div>
            <a href="#iniciar" className="inline-flex min-h-[50px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#FFC800] px-6 py-3 text-sm font-bold text-[#141414] transition hover:bg-[#FFDF5F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Iniciar diagnóstico <ArrowRight size={17} aria-hidden="true"/>
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs leading-relaxed text-[#79736A] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo />
        <p>Estimativas, não promessas de resultado. Valor renegociado não equivale a valor recebido.</p>
      </footer>
    </div>
  );
}
